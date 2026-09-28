import type { ServiceNodeTree, Visibility } from "./types";

/**
 * Poda el árbol para una pestaña de visibilidad dada.
 *
 * Regla (ver conversación de diseño): la visibilidad es del NODO, nunca
 * heredada. Una carpeta aparece en una pestaña si:
 *   (a) ella misma está marcada con esa visibilidad, o
 *   (b) tiene al menos un descendiente (a cualquier profundidad) visible
 *       en esa pestaña.
 *
 * Esto permite que "Boty" (folder, visibility='public' porque tiene web
 * y docs públicos) aparezca en ambas pestañas: en Público solo con los
 * hijos públicos, en Privado con el árbol completo. El caso (a) además
 * deja que una carpeta vacía recién creada aparezca en la pestaña donde
 * el usuario la creó, antes de tener hijos.
 */
export function pruneTree(nodes: ServiceNodeTree[], visibility: Visibility): ServiceNodeTree[] {
  const result: ServiceNodeTree[] = [];
  for (const node of nodes) {
    if (node.kind === "link") {
      if (node.visibility === visibility) result.push(node);
      continue;
    }
    const children = pruneTree(node.children, visibility);
    if (children.length > 0 || node.visibility === visibility) {
      result.push({ ...node, children });
    }
  }
  return result;
}

/** Cuenta los links (no carpetas) visibles recursivamente, para stats. */
export function countLinks(nodes: ServiceNodeTree[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.kind === "link") count++;
    else count += countLinks(node.children);
  }
  return count;
}

export function findNode(nodes: ServiceNodeTree[], id: string): ServiceNodeTree | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

/** Búsqueda por substring en nombre/descripción/tags, recursiva sobre todo el árbol (no solo la carpeta abierta). */
export function searchTree(nodes: ServiceNodeTree[], query: string): ServiceNodeTree[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matches: ServiceNodeTree[] = [];
  const walk = (list: ServiceNodeTree[]) => {
    for (const node of list) {
      const haystack = `${node.name} ${node.description ?? ""} ${node.tags.join(" ")}`.toLowerCase();
      if (haystack.includes(q)) matches.push(node);
      walk(node.children);
    }
  };
  walk(nodes);
  return matches;
}
