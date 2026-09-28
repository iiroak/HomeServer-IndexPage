import { getPool } from "../db/pool";
import type { NodeCommand, ServiceNode, ServiceNodeTree, Visibility } from "./types";

/** Fila cruda tal como la devuelve `pg` (snake_case, tipos nativos). */
interface NodeRow {
  id: string;
  parent_id: string | null;
  kind: "folder" | "link";
  name: string;
  description: string | null;
  visibility: Visibility;
  url: string | null;
  commands: NodeCommand[];
  icon_kind: "favicon" | "url" | "initials";
  icon_ref: string | null;
  accent: string | null;
  tags: string[];
  position: number;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: NodeRow): ServiceNode {
  return {
    id: row.id,
    parentId: row.parent_id,
    kind: row.kind,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    url: row.url,
    commands: row.commands ?? [],
    iconKind: row.icon_kind,
    iconRef: row.icon_ref,
    accent: row.accent,
    tags: row.tags ?? [],
    position: row.position,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

/**
 * Arma el árbol a partir de una lista plana de nodos.
 *
 * IMPORTANTE: el filtro de visibilidad se aplica en el SQL (WHERE) antes
 * de llegar aquí, nunca en este helper ni en el cliente. Ver
 * listPublicTree / listAllTree — son las dos únicas puertas de entrada
 * y cada una decide su propio WHERE.
 */
function buildTree(rows: ServiceNode[]): ServiceNodeTree[] {
  const byId = new Map<string, ServiceNodeTree>();
  for (const row of rows) {
    byId.set(row.id, { ...row, children: [] });
  }

  const roots: ServiceNodeTree[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (list: ServiceNodeTree[]) => {
    list.sort((a, b) => a.position - b.position);
    for (const node of list) sortTree(node.children);
  };
  sortTree(roots);

  return roots;
}

/**
 * Árbol público: solo nodos con visibility='public'. Una carpeta privada
 * con hijos públicos NO aparece aquí porque el filtro es por fila, no por
 * herencia — si se necesitara mostrar la carpeta contenedora, tendría que
 * marcarse pública ella misma (con hijos privados y públicos mezclados,
 * ver listAllTree para ese caso).
 *
 * Usado por GET / — página anónima. Nunca debe recibir un parámetro que
 * cambie este WHERE.
 */
export async function listPublicTree(): Promise<ServiceNodeTree[]> {
  const { rows } = await getPool().query<NodeRow>(
    `SELECT * FROM nodes WHERE visibility = 'public' ORDER BY position`,
  );
  return buildTree(rows.map(mapRow));
}

/**
 * Árbol completo, sin filtrar. Usado por /app tras verificar el JWT de
 * Cloudflare Access — ver src/lib/access.ts. Nunca expuesto a la página
 * pública.
 */
export async function listAllTree(): Promise<ServiceNodeTree[]> {
  const { rows } = await getPool().query<NodeRow>(`SELECT * FROM nodes ORDER BY position`);
  return buildTree(rows.map(mapRow));
}

export async function getNode(id: string): Promise<ServiceNode | null> {
  const { rows } = await getPool().query<NodeRow>(`SELECT * FROM nodes WHERE id = $1`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

export interface CreateNodeInput {
  parentId: string | null;
  kind: "folder" | "link";
  name: string;
  description: string | null;
  visibility: Visibility;
  url: string | null;
  commands: NodeCommand[];
  iconKind: "favicon" | "url" | "initials";
  iconRef: string | null;
  accent: string | null;
  tags: string[];
}

async function nextPosition(parentId: string | null): Promise<number> {
  const { rows } = await getPool().query<{ next: number }>(
    `SELECT coalesce(max(position), -1) + 1 AS next FROM nodes WHERE parent_id IS NOT DISTINCT FROM $1`,
    [parentId],
  );
  return rows[0].next;
}

export async function createNode(input: CreateNodeInput): Promise<ServiceNode> {
  const position = await nextPosition(input.parentId);
  const { rows } = await getPool().query<NodeRow>(
    `INSERT INTO nodes (parent_id, kind, name, description, visibility, url, commands, icon_kind, icon_ref, accent, tags, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      input.parentId,
      input.kind,
      input.name,
      input.description,
      input.visibility,
      input.url,
      JSON.stringify(input.commands),
      input.iconKind,
      input.iconRef,
      input.accent,
      input.tags,
      position,
    ],
  );
  return mapRow(rows[0]);
}

export type UpdateNodeInput = Partial<Omit<CreateNodeInput, "parentId">> & { parentId?: string | null };

export async function updateNode(id: string, input: UpdateNodeInput): Promise<ServiceNode | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  const set = (column: string, value: unknown) => {
    fields.push(`${column} = $${i++}`);
    values.push(value);
  };

  if (input.parentId !== undefined) set("parent_id", input.parentId);
  if (input.kind !== undefined) set("kind", input.kind);
  if (input.name !== undefined) set("name", input.name);
  if (input.description !== undefined) set("description", input.description);
  if (input.visibility !== undefined) set("visibility", input.visibility);
  if (input.url !== undefined) set("url", input.url);
  if (input.commands !== undefined) {
    fields.push(`commands = $${i++}::jsonb`);
    values.push(JSON.stringify(input.commands));
  }
  if (input.iconKind !== undefined) set("icon_kind", input.iconKind);
  if (input.iconRef !== undefined) set("icon_ref", input.iconRef);
  if (input.accent !== undefined) set("accent", input.accent);
  if (input.tags !== undefined) set("tags", input.tags);

  if (fields.length === 0) return getNode(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const { rows } = await getPool().query<NodeRow>(
    `UPDATE nodes SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values,
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteNode(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query(`DELETE FROM nodes WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

export async function reorderNodes(orderedIds: string[]): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let position = 0; position < orderedIds.length; position++) {
      await client.query(`UPDATE nodes SET position = $1, updated_at = now() WHERE id = $2`, [
        position,
        orderedIds[position],
      ]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
