/**
 * Tipos compartidos del árbol de servicios y de la lista de repos de
 * referencia. Fuente única — antes vivían duplicados dentro de
 * index.astro (interfaces) y de nuevo a mano en el <script> cliente.
 */

export type Visibility = "public" | "private";
export type NodeKind = "folder" | "link";
export type IconKind = "favicon" | "url" | "initials";

export interface NodeCommand {
  label: string;
  command: string;
}

export interface ServiceNode {
  id: string;
  parentId: string | null;
  kind: NodeKind;
  name: string;
  description: string | null;
  visibility: Visibility;
  url: string | null;
  commands: NodeCommand[];
  iconKind: IconKind;
  iconRef: string | null;
  accent: string | null;
  tags: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

/** Nodo con sus hijos ya anidados, para el render del árbol. */
export interface ServiceNodeTree extends ServiceNode {
  children: ServiceNodeTree[];
}

export interface RepoRef {
  id: string;
  name: string;
  description: string | null;
  iconKind: IconKind;
  iconRef: string | null;
  githubUrl: string;
  pinned: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}
