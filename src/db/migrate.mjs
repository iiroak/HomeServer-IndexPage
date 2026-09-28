import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrations = [
  {
    id: "0001_initial_schema",
    path: join(__dirname, "schema.sql"),
  },
];
const migrationLockId = 494955444478n;

async function main() {
  const databaseUrl = process.env.INDEX_PAGE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("INDEX_PAGE_DATABASE_URL no está configurado");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const lockClient = await pool.connect();
  try {
    await lockClient.query("SELECT pg_advisory_lock($1::bigint)", [migrationLockId.toString()]);
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);

      for (const migration of migrations) {
        const { rows } = await pool.query("SELECT id FROM schema_migrations WHERE id = $1", [migration.id]);
        if (rows.length > 0) {
          console.log(`Migración ${migration.id} ya aplicada, se omite.`);
          continue;
        }

        const sql = readFileSync(migration.path, "utf8");
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query(sql);
          await client.query("INSERT INTO schema_migrations (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [
            migration.id,
          ]);
          await client.query("COMMIT");
          console.log(`Migración ${migration.id} aplicada.`);
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      }
    } finally {
      await lockClient.query("SELECT pg_advisory_unlock($1::bigint)").catch(() => undefined);
    }
  } finally {
    lockClient.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Falló la migración:", error);
  process.exitCode = 1;
});
