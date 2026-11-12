import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { query, withTransaction } from "./db";
import { sendGoogleMail } from "./googleMail";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export function passwordResetDeliveryAddress(accountEmail: string) {
  return accountEmail;
}

export async function allowAuthAttempt(key: string, limit: number) {
  const result = await query<{ attempts: number }>(
    `INSERT INTO auth_rate_limits (key_hash, attempts, expires_at)
     VALUES ($1, 1, NOW() + INTERVAL '15 minutes')
     ON CONFLICT (key_hash) DO UPDATE SET
       attempts = CASE WHEN auth_rate_limits.expires_at < NOW() THEN 1 ELSE auth_rate_limits.attempts + 1 END,
       expires_at = CASE WHEN auth_rate_limits.expires_at < NOW() THEN NOW() + INTERVAL '15 minutes' ELSE auth_rate_limits.expires_at END
     RETURNING attempts`, [hash(key)],
  );
  return result.rows[0].attempts <= limit;
}

export async function requestPasswordReset(email: string) {
  const result = await query<{ id: string; email: string }>(
    `SELECT u.id,u.email FROM users u
     LEFT JOIN user_login_aliases a ON a.user_id=u.id
     WHERE (lower(u.email)=lower($1) OR lower(a.email)=lower($1)) AND u.active=true
     LIMIT 1`, [email],
  );
  const user = result.rows[0];
  if (!user) return;
  const token = randomBytes(32).toString("hex");
  const tokenHash = hash(token);
  await query("INSERT INTO password_reset_tokens (token_hash,user_id,expires_at) VALUES ($1,$2,NOW()+INTERVAL '30 minutes')", [tokenHash, user.id]);
  const origin = process.env.APP_URL || "https://www.masonandarc.com";
  const link = new URL("/app/reset-password", origin);
  // Fragments do not enter server access logs or Referer headers.
  link.hash = new URLSearchParams({ token }).toString();
  try {
    await sendGoogleMail({
      to: passwordResetDeliveryAddress(user.email),
      subject: "Reset your Mason & Arc Studio password",
      text: `A password reset was requested for your Mason & Arc Studio account.\n\nOpen this link within 30 minutes to choose a new password:\n${link.toString()}\n\nThe link can be used once. If you did not request this, ignore this email. Your password has not changed.\n\nMason & Arc Studio`,
    });
  } catch (error) {
    await query("DELETE FROM password_reset_tokens WHERE token_hash=$1", [tokenHash]);
    throw error;
  }
}

export function validResetPassword(password: string) {
  return password.length >= 12 && Buffer.byteLength(password, "utf8") <= 72;
}

export async function resetPassword(token: string, password: string) {
  if (!/^[a-f0-9]{64}$/.test(token) || !validResetPassword(password)) return false;
  const tokenHash = hash(token);
  const passwordHash = await bcrypt.hash(password, 12);
  return withTransaction(async (client) => {
    // Lock the account before consuming any of its tokens to serialize concurrent resets.
    const account = await client.query<{ id: string }>(
      `SELECT u.id FROM users u JOIN password_reset_tokens t ON t.user_id=u.id
       WHERE t.token_hash=$1 AND t.used_at IS NULL AND t.expires_at>NOW() AND u.active=true
       FOR UPDATE OF u`, [tokenHash],
    );
    if (!account.rows[0]) return false;
    const consumed = await client.query(
      "UPDATE password_reset_tokens SET used_at=NOW() WHERE token_hash=$1 AND used_at IS NULL AND expires_at>NOW() RETURNING user_id", [tokenHash],
    );
    if (!consumed.rows[0]) return false;
    const userId = account.rows[0].id;
    await client.query("UPDATE users SET password_hash=$1,updated_at=NOW() WHERE id=$2", [passwordHash, userId]);
    await client.query("UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=$1 AND used_at IS NULL", [userId]);
    await client.query("DELETE FROM sessions WHERE user_id=$1", [userId]);
    await client.query("INSERT INTO audit_logs (actor_user_id,action,entity_type,entity_id) VALUES ($1,'auth.password_reset','User',$1)", [userId]);
    return true;
  });
}
