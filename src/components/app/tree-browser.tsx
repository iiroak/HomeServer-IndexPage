"use client";

import { useMemo, useState } from "react";
import type { ServiceNodeTree } from "../../lib/types";
import { pruneTree, searchTree } from "../../lib/tree";
import { NodeRow } from "./node-row";
import { EmptyStateCard } from "../ui/empty-state-card";
import { IconButton } from "../ui/icon-button";
import { Input } from "../ui/form-row";
import { SearchIcon, XIcon, ChevronLeftIcon, FolderIcon } from "../ui/icons";

/**
 * Navegador de árbol de servicios, compartido por la vista pública (/) y
 * la pestaña Privado de /app. Solo 2 niveles de navegación en la UI
 * (raíz → dentro de una carpeta), aunque el esquema soporta cualquier
 * profundidad — ver nota en schema.sql.
 *
 * El buscador es global sobre TODO el árbol ya cargado (no solo la
 * carpeta abierta), porque el caso de uso declarado es "para cuando lo
 * busco" — encontrar algo sin recordar en qué carpeta vive.
 */
export function TreeBrowser({
  tree,
  editable,
  onEdit,
  onDelete,
}: {
  tree: ServiceNodeTree[];
  editable: boolean;
  onEdit?: (node: ServiceNodeTree) => void;
  onDelete?: (node: ServiceNodeTree) => void;
}) {
  const [openFolder, setOpenFolder] = useState<ServiceNodeTree | null>(null);
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => (query.trim() ? searchTree(tree, query) : null), [tree, query]);

  const currentList = searchResults ?? (openFolder ? openFolder.children : tree);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-divider bg-surface/95 px-[18px] py-2.5 backdrop-blur">
        {openFolder && !searchResults && (
          <IconButton aria-label="Volver" onClick={() => setOpenFolder(null)}>
            <ChevronLeftIcon size={24} />
          </IconButton>
        )}
        <div className="relative flex-1">
          <SearchIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-icon-secondary" />
          <Input
            type="search"
            placeholder="Buscar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {query && (
          <IconButton aria-label="Limpiar búsqueda" onClick={() => setQuery("")}>
            <XIcon size={20} />
          </IconButton>
        )}
      </div>

      {openFolder && !searchResults && (
        <div className="border-b border-divider px-[18px] py-3">
          <p className="text-title font-semibold text-text-primary">{openFolder.name}</p>
          {openFolder.description && <p className="text-caption text-text-secondary">{openFolder.description}</p>}
        </div>
      )}

      {currentList.length === 0 ? (
        <EmptyStateCard
          icon={<FolderIcon size={40} className="text-icon-secondary" />}
          title={searchResults ? "Sin resultados" : "Vacío"}
          description={searchResults ? "Prueba con otra búsqueda." : "Todavía no hay nada aquí."}
        />
      ) : (
        <div className="flex flex-1 flex-col divide-y divide-divider pb-8">
          {currentList.map((node) => (
            <NodeRow
              key={node.id}
              node={node}
              editable={editable}
              onOpenFolder={(n) => {
                setQuery("");
                setOpenFolder(n);
              }}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { pruneTree };
