import "server-only";
import { query, withTransaction } from "@/lib/server/db";
import { QS_MIGRATION_SQL, QS_SEED_SQL, QS_SCHEMA_VERSION } from "@/lib/server/qsSql";

let installed: Promise<void> | null = null;

/**
 * Installs additive, idempotent QS tables only after an authorized studio request.
 * Advisory lock prevents races between Vercel instances; transaction ensures atomicity.
 * Preview is strictly read-only unless an isolated QS preview database is explicitly configured.
 */
export async function ensureQsReady(): Promise<void> {
 if (installed) return installed;
 installed = install().catch((error) => {installed = null;throw error;});
 return installed;
}
async function install() {
 if (process.env.VERCEL_ENV === "preview" && process.env.QS_ISOLATED_PREVIEW_DB !== "true") {
   const existing = await query<{name:string|null}>("SELECT to_regclass('public.qs_materials')::text AS name");
   if (!existing.rows[0]?.name) throw new Error("QS_SCHEMA_NOT_INSTALLED_ON_PREVIEW");
   return;
 }
 await withTransaction(async (client) => {
   await client.query("SELECT pg_advisory_xact_lock($1::bigint)", ["202611091614"]);
   await client.query(`CREATE TABLE IF NOT EXISTS qs_schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`);
   const before = await client.query<{version:string}>("SELECT version FROM qs_schema_migrations WHERE version=$1", [QS_SCHEMA_VERSION]);
   if(before.rowCount) return;
   await client.query(QS_MIGRATION_SQL);
   await client.query(QS_SEED_SQL);
   const [m,a,r] = await Promise.all([
    client.query("SELECT count(*)::int AS n FROM qs_materials"),
    client.query("SELECT count(*)::int AS n FROM qs_activities"),
    client.query("SELECT count(*)::int AS n FROM qs_consumption_recipes")
   ]);
   if (Number(m.rows[0].n)<61 || Number(a.rows[0].n)<64 || Number(r.rows[0].n)<100) throw new Error("QS_CATALOG_VERIFICATION_FAILED");
   await client.query("INSERT INTO qs_schema_migrations(version) VALUES($1)",[QS_SCHEMA_VERSION]);
 });
}
