import { Pool } from "pg";

let pool: Pool | undefined;

/**
 * Pool único de Postgres. CT110 fuerza TLS con certificado autofirmado:
 * el DSN debe llevar `sslmode=no-verify` (ver VMs/CT110_Postgres.md — cifra,
 * no valida la CA). No se configura `ssl` aquí explícitamente porque `pg`
 * respeta el `sslmode` de la connection string. Patrón copiado de
 * Fit-API/src/db/pool.ts.
 */
export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.INDEX_PAGE_DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("INDEX_PAGE_DATABASE_URL no está configurado");
    }
    pool = new Pool({ connectionString: databaseUrl, max: 10 });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
