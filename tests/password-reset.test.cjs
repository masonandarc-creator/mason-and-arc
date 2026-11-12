const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes, createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { loadTs } = require("./load-ts.cjs");
const hash = value => createHash("sha256").update(value).digest("hex");
const helper = loadTs("lib/server/passwordReset.ts", { "./db": {}, "./googleMail": {} });

test("password validation rejects short passwords and bcrypt byte truncation", () => {
  assert.equal(helper.validResetPassword("short"), false);
  assert.equal(helper.validResetPassword("long-enough-password"), true);
  assert.equal(helper.validResetPassword("a".repeat(73)), false);
  assert.equal(helper.validResetPassword("ع".repeat(37)), false);
});

test("password recovery is delivered to each account's real email", () => {
  assert.equal(helper.passwordResetDeliveryAddress("Masonandarc@gmail.com"), "Masonandarc@gmail.com");
  assert.equal(helper.passwordResetDeliveryAddress("omar@example.com"), "omar@example.com");
  assert.equal(helper.passwordResetDeliveryAddress("client@example.com"), "client@example.com");
});

test("password recovery integration in an isolated, disposable database schema", { skip: !process.env.DATABASE_URL }, async (t) => {
  const schema = `codex_auth_test_${randomBytes(6).toString("hex")}`;
  assert.match(schema, /^codex_auth_test_[a-f0-9]{12}$/);
  const control = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  let pool;
  let created = false;
  try {
    await control.query(`CREATE SCHEMA ${schema}`);
    created = true;
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
    // Transaction-local search_path also works through Neon/PgBouncer pooling.
    pool.query = async (sql, values) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(`SET LOCAL search_path TO ${schema}`);
        const result = await client.query(sql, values);
        await client.query("COMMIT");
        return result;
      } catch (error) { await client.query("ROLLBACK"); throw error; }
      finally { client.release(); }
    };
    await pool.query(`CREATE TABLE users(id TEXT PRIMARY KEY, email TEXT, password_hash TEXT, active BOOLEAN DEFAULT true, updated_at TIMESTAMPTZ);
      CREATE TABLE sessions(id TEXT PRIMARY KEY, user_id TEXT);
      CREATE TABLE audit_logs(actor_user_id TEXT, action TEXT, entity_type TEXT, entity_id TEXT);`);
    await pool.query(readFileSync(path.join(__dirname, "../db/migrations/20260921-password-reset.sql"), "utf8"));
    const sent = [];
    let failDelivery = false;
    const db = {
      query: (sql, values) => pool.query(sql, values),
      withTransaction: async (fn) => {
        const client = await pool.connect();
        try { await client.query("BEGIN"); await client.query(`SET LOCAL search_path TO ${schema}`); const result = await fn(client); await client.query("COMMIT"); return result; }
        catch (error) { await client.query("ROLLBACK"); throw error; }
        finally { client.release(); }
      },
    };
    const api = loadTs("lib/server/passwordReset.ts", { "./db": db, "./googleMail": { sendGoogleMail: async (mail) => {
      if (failDelivery) throw new Error("Simulated delivery failure");
      sent.push(mail);
    } } });
    await pool.query("INSERT INTO users(id,email,password_hash) VALUES ('test-user','test@example.invalid','old-test-hash')");
    await pool.query("INSERT INTO users(id,email,password_hash) VALUES ('owner-user','Masonandarc@gmail.com','owner-test-hash')");
    const tokenFromMail = () => new URLSearchParams(new URL(sent.at(-1).text.match(/https?:\/\/\S+/)[0]).hash.slice(1)).get("token");
    await t.test("unknown email has no token and no delivery", async () => {
      await api.requestPasswordReset("missing@example.invalid");
      assert.equal(sent.length, 0);
      assert.equal((await pool.query("SELECT * FROM password_reset_tokens")).rowCount, 0);
    });
    await t.test("request stores only a hash and sends a time-limited fragment link", async () => {
      await api.requestPasswordReset("TEST@example.invalid");
      const token = tokenFromMail();
      assert.match(token, /^[a-f0-9]{64}$/);
      const row = (await pool.query("SELECT * FROM password_reset_tokens")).rows[0];
      assert.equal(row.token_hash, hash(token));
      assert.notEqual(row.token_hash, token);
      assert.ok(row.expires_at > new Date());
    });
    await t.test("a concurrent reset succeeds once, changes password and invalidates sessions", async () => {
      await pool.query("INSERT INTO sessions VALUES('test-session','test-user')");
      const token = tokenFromMail();
      const results = await Promise.all([api.resetPassword(token, "new-test-password-123"), api.resetPassword(token, "new-test-password-123")]);
      assert.deepEqual(results.sort(), [false, true]);
      assert.equal(await api.resetPassword(token, "another-test-password"), false);
      const user = (await pool.query("SELECT * FROM users WHERE id='test-user'")).rows[0];
      assert.equal(await bcrypt.compare("new-test-password-123", user.password_hash), true);
      assert.equal((await pool.query("SELECT * FROM sessions")).rowCount, 0);
      assert.equal((await pool.query("SELECT * FROM audit_logs")).rowCount, 1);
    });
    await t.test("expired and inactive-account tokens cannot change passwords", async () => {
      await api.requestPasswordReset("test@example.invalid");
      const token = tokenFromMail();
      await pool.query("UPDATE password_reset_tokens SET expires_at=NOW()-INTERVAL '1 minute' WHERE token_hash=$1", [hash(token)]);
      assert.equal(await api.resetPassword(token, "another-test-password"), false);
      await api.requestPasswordReset("test@example.invalid");
      const next = tokenFromMail();
      await pool.query("UPDATE users SET active=false");
      assert.equal(await api.resetPassword(next, "another-test-password"), false);
      await pool.query("UPDATE users SET active=true");
    });
    await t.test("delivery failure removes the unsent token", async () => {
      const count = (await pool.query("SELECT * FROM password_reset_tokens")).rowCount;
      failDelivery = true;
      await assert.rejects(api.requestPasswordReset("test@example.invalid"), /Simulated/);
      assert.equal((await pool.query("SELECT * FROM password_reset_tokens")).rowCount, count);
    });
    await t.test("owner reset is delivered to the owner's real email", async () => {
      failDelivery = false;
      await api.requestPasswordReset("Masonandarc@gmail.com");
      assert.equal(sent.at(-1).to, "Masonandarc@gmail.com");
    });
    await t.test("rate limits are atomic across concurrent requests", async () => {
      const results = await Promise.all(Array.from({ length: 6 }, () => api.allowAuthAttempt("test-key", 3)));
      assert.equal(results.filter(Boolean).length, 3);
      await pool.query("UPDATE auth_rate_limits SET expires_at=NOW()-INTERVAL '1 minute'");
      assert.equal(await api.allowAuthAttempt("test-key", 3), true);
    });
  } finally {
    if (pool) await pool.end();
    // Only this test's exact, validated schema; never public or application data.
    if (created) await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
  }
});
