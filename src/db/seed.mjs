import { Pool } from "pg";

const seedId = "0001_legacy_public_catalog";
const seedLockId = 494955444479n;
const catalog = [
  {
    name: "Index",
    description: "Directorio de servicios del homeserver.",
    accent: "lavender",
    tags: ["infra", "index"],
    links: [{ name: "Index", url: "https://index.iroak.dev", description: "Pagina principal del directorio." }],
  },
  {
    name: "Cliente",
    description: "Proyectos de software para clientes.",
    accent: "pink",
    tags: ["cliente", "produccion"],
    links: [
      { name: "Boty Web", url: "https://boty.cl", description: "Pagina principal de Boty." },
      { name: "Boty Empresas", url: "https://empresa.boty.cl", description: "Portal de gestion de empresas." },
      { name: "Boty Docs", url: "https://docs.boty.cl", description: "Documentacion de la API y guias." },
    ],
  },
  {
    name: "Transporte",
    description: "Servicios del proyecto RedTransporte.",
    accent: "lavender",
    tags: ["transporte", "transantiago"],
    links: [{ name: "RedTransporte", url: "https://red.iroak.dev", description: "Frontend principal del proyecto." }],
  },
  {
    name: "DaMapArts",
    description: "Herramienta para map arts de Minecraft.",
    accent: "cream",
    tags: ["minecraft", "mapart", "web"],
    links: [
      {
        name: "DaMapArts",
        url: "https://damaparts.iroak.dev",
        description: "Catalogo de map arts de Minecraft (GitHub Pages).",
      },
    ],
  },
];

async function main() {
  const databaseUrl = process.env.INDEX_PAGE_DATABASE_URL;
  if (!databaseUrl) throw new Error("INDEX_PAGE_DATABASE_URL no está configurado");

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1::bigint)", [seedLockId.toString()]);
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_seeds (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const applied = await client.query("SELECT 1 FROM app_seeds WHERE id = $1", [seedId]);
    if (applied.rowCount) {
      console.log(`Seed ${seedId} ya aplicado, se omite.`);
      await client.query("COMMIT");
      return;
    }

    const existing = await client.query("SELECT EXISTS (SELECT 1 FROM nodes) AS has_nodes");
    if (existing.rows[0].has_nodes) {
      throw new Error("La tabla nodes ya contiene datos; se omite el seed inicial para preservar el catálogo existente.");
    }

    for (const [folderPosition, folder] of catalog.entries()) {
      const insertedFolder = await client.query(
        `INSERT INTO nodes (kind, name, description, visibility, icon_kind, accent, tags, position)
         VALUES ('folder', $1, $2, 'public', 'favicon', $3, $4, $5)
         RETURNING id`,
        [folder.name, folder.description, folder.accent, folder.tags, folderPosition],
      );
      const parentId = insertedFolder.rows[0].id;

      for (const [linkPosition, link] of folder.links.entries()) {
        await client.query(
          `INSERT INTO nodes (parent_id, kind, name, description, visibility, url, icon_kind, position)
           VALUES ($1, 'link', $2, $3, 'public', $4, 'favicon', $5)`,
          [parentId, link.name, link.description, link.url, linkPosition],
        );
      }
    }

    await client.query("INSERT INTO app_seeds (id) VALUES ($1)", [seedId]);
    await client.query("COMMIT");
    console.log(`Seed ${seedId} aplicado: ${catalog.length} carpetas y ${catalog.reduce((n, f) => n + f.links.length, 0)} enlaces públicos.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1::bigint)", [seedLockId.toString()]).catch(() => undefined);
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Falló el seed:", error);
  process.exitCode = 1;
});
