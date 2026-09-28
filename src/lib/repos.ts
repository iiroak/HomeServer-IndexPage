import { getPool } from "../db/pool";
import type { RepoRef } from "./types";

interface RepoRow {
  id: string;
  name: string;
  description: string | null;
  icon_kind: "favicon" | "url" | "initials";
  icon_ref: string | null;
  github_url: string;
  pinned: boolean;
  position: number;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: RepoRow): RepoRef {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    iconKind: row.icon_kind,
    iconRef: row.icon_ref,
    githubUrl: row.github_url,
    pinned: row.pinned,
    position: row.position,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

/** Solo accesible tras /app — no hay vista pública de repos. */
export async function listRepos(): Promise<RepoRef[]> {
  const { rows } = await getPool().query<RepoRow>(
    `SELECT * FROM repos ORDER BY pinned DESC, position ASC, name ASC`,
  );
  return rows.map(mapRow);
}

export async function getRepo(id: string): Promise<RepoRef | null> {
  const { rows } = await getPool().query<RepoRow>(`SELECT * FROM repos WHERE id = $1`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

export interface CreateRepoInput {
  name: string;
  description: string | null;
  iconKind: "favicon" | "url" | "initials";
  iconRef: string | null;
  githubUrl: string;
  pinned: boolean;
}

async function nextPosition(): Promise<number> {
  const { rows } = await getPool().query<{ next: number }>(
    `SELECT coalesce(max(position), -1) + 1 AS next FROM repos`,
  );
  return rows[0].next;
}

export async function createRepo(input: CreateRepoInput): Promise<RepoRef> {
  const position = await nextPosition();
  const { rows } = await getPool().query<RepoRow>(
    `INSERT INTO repos (name, description, icon_kind, icon_ref, github_url, pinned, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [input.name, input.description, input.iconKind, input.iconRef, input.githubUrl, input.pinned, position],
  );
  return mapRow(rows[0]);
}

export type UpdateRepoInput = Partial<CreateRepoInput>;

export async function updateRepo(id: string, input: UpdateRepoInput): Promise<RepoRef | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  const set = (column: string, value: unknown) => {
    fields.push(`${column} = $${i++}`);
    values.push(value);
  };

  if (input.name !== undefined) set("name", input.name);
  if (input.description !== undefined) set("description", input.description);
  if (input.iconKind !== undefined) set("icon_kind", input.iconKind);
  if (input.iconRef !== undefined) set("icon_ref", input.iconRef);
  if (input.githubUrl !== undefined) set("github_url", input.githubUrl);
  if (input.pinned !== undefined) set("pinned", input.pinned);

  if (fields.length === 0) return getRepo(id);

  fields.push(`updated_at = now()`);
  values.push(id);

  const { rows } = await getPool().query<RepoRow>(
    `UPDATE repos SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values,
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteRepo(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query(`DELETE FROM repos WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}
