import { Pool } from "pg";

const legacySeedId = "0001_legacy_public_catalog";
const inventorySeedId = "0002_documented_service_inventory";
const seedLockId = 494955444479n;
const legacyCatalog = [
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

// Inventario de UIs documentadas en Proxmox. Visibilidad del directorio no
// implica exposición del servicio: los medios personales y paneles siguen
// privados aunque el hostname responda públicamente. APIs y webhooks se omiten.
const documentedInventory = [
  {
    name: "Iroak Mail",
    description: "Páginas públicas de información, privacidad y términos de Iroak Mail.",
    visibility: "public",
    accent: "lavender",
    tags: ["iroak-mail", "legal"],
    links: [
      { name: "Información de Iroak Mail", url: "https://iroak.dev/cypht", description: "Presentación pública del servicio." },
      { name: "Privacidad de Iroak Mail", url: "https://iroak.dev/cypht/privacy", description: "Política de privacidad." },
      { name: "Términos de Iroak Mail", url: "https://iroak.dev/cypht/terms", description: "Condiciones del servicio." },
    ],
  },
  {
    name: "Herramientas públicas",
    description: "Aplicaciones web públicas del homelab.",
    visibility: "public",
    accent: "cream",
    tags: ["herramientas", "publico"],
    links: [
      { name: "QR IRK", url: "https://qr.iroak.dev", description: "Aplicación web pública de QR IRK." },
      { name: "LabMotion", url: "https://labmotion.iroak.dev", description: "Aplicación web pública LabMotion." },
    ],
  },
  {
    name: "Infraestructura",
    description: "Paneles de administración del homelab; algunas URLs solo responden desde LAN o WireGuard.",
    visibility: "private",
    accent: "pink",
    tags: ["homelab", "infraestructura", "admin"],
    links: [
      { name: "OPNsense", url: "https://router.iroak.dev", description: "GUI protegida por Cloudflare Access." },
      { name: "OPNsense LAN", url: "https://10.10.10.1", description: "GUI desde la red interna o WireGuard." },
      { name: "OPNsense casa", url: "https://192.168.1.203", description: "GUI desde la LAN de casa." },
      { name: "Proxmox", url: "https://proxmox.iroak.dev", description: "UI de administración protegida por Cloudflare Access." },
      { name: "Proxmox iroak.cl", url: "https://proxmox.iroak.cl", description: "Alias de la UI de Proxmox, protegido por Cloudflare Access." },
      { name: "Coolify", url: "https://coolify.iroak.dev", description: "Panel protegido por Cloudflare Access." },
      { name: "Coolify LAN", url: "http://10.10.10.245:8000", description: "Panel desde la red interna." },
      { name: "Nginx Proxy Manager", url: "https://ngix.iroak.dev", description: "Panel protegido por Cloudflare Access." },
      { name: "Grafana", url: "https://grafana.iroak.dev", description: "Cloudflare Access más el login propio de Grafana." },
      { name: "Grafana LAN", url: "http://10.10.10.107:3000", description: "Panel desde la red interna." },
      { name: "Gitea interno", url: "http://10.10.10.66:3000", description: "Standby local de repositorios; solo LAN." },
      { name: "SFTPGo Admin", url: "http://10.10.10.119:8080/web/admin", description: "Panel de administración desde LAN." },
      { name: "SFTPGo Web Client", url: "http://10.10.10.119:8080/web/client", description: "Cliente web desde LAN." },
      { name: "Universidad Mayor Admin", url: "http://10.10.10.30:8766/admin", description: "Panel interno; requiere LAN o WireGuard." },
    ],
  },
  {
    name: "Medios personales",
    description: "Interfaces de música y vídeo; el listado se mantiene privado aunque tengan hostname público.",
    visibility: "private",
    accent: "lavender",
    tags: ["medios", "personal"],
    links: [
      { name: "Navidrome iroak.dev", url: "https://navidrome.iroak.dev", description: "Acceso al servidor de música." },
      { name: "Navidrome iroak.cl", url: "https://navidrome.iroak.cl", description: "Alias del servidor de música." },
      { name: "Navidrome LAN", url: "http://10.10.10.46:4533", description: "Acceso directo desde LAN." },
      { name: "Jellyfin", url: "https://jellyfin.iroak.dev", description: "Servidor de vídeo publicado por Nginx Proxy Manager." },
      { name: "Jellyfin LAN", url: "http://10.10.10.95:8096", description: "Acceso directo desde LAN." },
    ],
  },
  {
    name: "Aplicaciones privadas",
    description: "Dashboards y servicios protegidos por Cloudflare Access o por autenticación propia.",
    visibility: "private",
    accent: "cream",
    tags: ["apps", "admin"],
    links: [
      { name: "Index Admin", url: "https://index.iroak.dev/app", description: "Administración del directorio; Cloudflare Access." },
      { name: "Iroak Mail", url: "https://mail.iroak.dev", description: "Webmail; Cloudflare Access." },
      { name: "Grammy", url: "https://grammy.iroak.dev", description: "Dashboard; Cloudflare Access." },
      { name: "WhatsApp Hub", url: "https://waha.iroak.dev/admin", description: "Dashboard; Cloudflare Access." },
      { name: "WhatsApp Hub LAN", url: "http://10.10.10.211:3000/admin", description: "Dashboard desde LAN." },
      { name: "Koi Dashboard", url: "https://koi.iroak.dev", description: "La raíz redirige al panel; Cloudflare Access." },
      { name: "MCP Gateway Admin", url: "https://mcp.iroak.dev/admin", description: "Panel protegido por Cloudflare Access." },
      { name: "Raphael Admin", url: "https://raphael.iroak.dev/admin", description: "Dashboard protegido por Cloudflare Access." },
      { name: "Amapola", url: "https://amapola.iroak.dev", description: "Aplicación protegida por Cloudflare Access y levantada bajo demanda." },
      { name: "Fit", url: "https://fit.iroak.dev/app", description: "PWA protegida por Cloudflare Access." },
      { name: "Kloset", url: "https://kloset.iroak.dev", description: "Aplicación visual protegida por Cloudflare Access." },
      { name: "Docker Ports", url: "https://docker-ports.iroak.dev", description: "Port Scanner; Cloudflare Access." },
      { name: "AI Prices", url: "https://ai-prices.iroak.dev", description: "Panel protegido por Cloudflare Access." },
      { name: "Locanto", url: "https://locanto.iroak.dev", description: "Aplicación protegida por Cloudflare Access." },
      { name: "Marketplace", url: "https://marketplace.iroak.dev", description: "Gateway protegido por Cloudflare Access." },
    ],
  },
  {
    parentName: "Cliente",
    links: [
      { name: "Boty Admin", url: "https://admin.boty.cl", description: "Panel administrativo de Boty." },
    ],
  },
];

async function insertCatalog(client, catalog) {
  const roots = await client.query("SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM nodes WHERE parent_id IS NULL");
  const firstRootPosition = roots.rows[0].next_position;

  for (const [folderIndex, folder] of catalog.entries()) {
    let parentId;
    let linkPosition = 0;
    const folderVisibility = folder.visibility ?? (folder.parentName ? "private" : "public");

    if (folder.parentName) {
      const parent = await client.query(
        "SELECT id FROM nodes WHERE parent_id IS NULL AND kind = 'folder' AND name = $1",
        [folder.parentName],
      );
      if (parent.rowCount !== 1) {
        throw new Error(`No se encontró una carpeta raíz única llamada ${folder.parentName}`);
      }
      parentId = parent.rows[0].id;
      const positions = await client.query("SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM nodes WHERE parent_id = $1", [parentId]);
      linkPosition = positions.rows[0].next_position;
    } else {
      const insertedFolder = await client.query(
        `INSERT INTO nodes (kind, name, description, visibility, icon_kind, accent, tags, position)
         VALUES ('folder', $1, $2, $3, 'favicon', $4, $5, $6)
         RETURNING id`,
        [folder.name, folder.description, folderVisibility, folder.accent, folder.tags, firstRootPosition + folderIndex],
      );
      parentId = insertedFolder.rows[0].id;
    }

    for (const link of folder.links) {
      await client.query(
        `INSERT INTO nodes (parent_id, kind, name, description, visibility, url, icon_kind, position)
         VALUES ($1, 'link', $2, $3, $4, $5, 'favicon', $6)`,
        [parentId, link.name, link.description, link.visibility ?? folderVisibility, link.url, linkPosition++],
      );
    }
  }
}

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

    const steps = [
      { id: legacySeedId, catalog: legacyCatalog, requiresEmptyNodes: true },
      { id: inventorySeedId, catalog: documentedInventory, requiresEmptyNodes: false },
    ];
    const appliedSteps = [];
    const skippedSteps = [];

    for (const step of steps) {
      const applied = await client.query("SELECT 1 FROM app_seeds WHERE id = $1", [step.id]);
      if (applied.rowCount) {
        skippedSteps.push(step.id);
        continue;
      }

      if (step.requiresEmptyNodes) {
        const existing = await client.query("SELECT EXISTS (SELECT 1 FROM nodes) AS has_nodes");
        if (existing.rows[0].has_nodes) {
          throw new Error("La tabla nodes ya contiene datos; se omite el seed inicial para preservar el catálogo existente.");
        }
      }

      await insertCatalog(client, step.catalog);
      await client.query("INSERT INTO app_seeds (id) VALUES ($1)", [step.id]);
      appliedSteps.push(step);
    }

    await client.query("COMMIT");
    for (const id of skippedSteps) console.log(`Seed ${id} ya aplicado, se omite.`);
    for (const step of appliedSteps) {
      const folderCount = step.catalog.filter((folder) => !folder.parentName).length;
      const linkCount = step.catalog.reduce((count, folder) => count + folder.links.length, 0);
      console.log(`Seed ${step.id} aplicado: ${folderCount} carpetas y ${linkCount} enlaces.`);
    }
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
