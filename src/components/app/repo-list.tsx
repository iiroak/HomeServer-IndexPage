"use client";

import { useMemo, useState } from "react";
import type { RepoRef } from "../../lib/types";
import { NodeIcon } from "./node-icon";
import { EmptyStateCard } from "../ui/empty-state-card";
import { IconButton } from "../ui/icon-button";
import { Input } from "../ui/form-row";
import { SearchIcon, XIcon, StarIcon, PencilIcon, TrashIcon, ExternalLinkIcon, CodeIcon } from "../ui/icons";

export function RepoList({
  repos,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  repos: RepoRef[];
  onEdit: (repo: RepoRef) => void;
  onDelete: (repo: RepoRef) => void;
  onTogglePin: (repo: RepoRef) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter((r) => `${r.name} ${r.description ?? ""}`.toLowerCase().includes(q));
  }, [repos, query]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-divider bg-surface/95 px-[18px] py-2.5 backdrop-blur">
        <div className="relative flex-1">
          <SearchIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-icon-secondary" />
          <Input
            type="search"
            placeholder="Buscar repos…"
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

      {filtered.length === 0 ? (
        <EmptyStateCard
          icon={<CodeIcon size={40} className="text-icon-secondary" />}
          title={repos.length === 0 ? "Sin repos" : "Sin resultados"}
          description={repos.length === 0 ? "Agrega el primero con el botón +." : "Prueba con otra búsqueda."}
        />
      ) : (
        <div className="flex flex-1 flex-col divide-y divide-divider pb-8">
          {filtered.map((repo) => (
            <div key={repo.id} className="flex items-center gap-3 px-[18px] py-3">
              <NodeIcon name={repo.name} iconKind={repo.iconKind} iconRef={repo.iconRef} pageUrl={repo.githubUrl} size={36} />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-body-medium text-text-primary">{repo.name}</span>
                {repo.description && <span className="block truncate text-caption text-text-secondary">{repo.description}</span>}
              </div>
              <IconButton
                aria-label={repo.pinned ? "Quitar de fijados" : "Fijar"}
                onClick={() => onTogglePin(repo)}
                className={repo.pinned ? "text-accent" : undefined}
              >
                <StarIcon size={18} filled={repo.pinned} />
              </IconButton>
              <a href={repo.githubUrl} target="_blank" rel="noreferrer noopener">
                <IconButton aria-label={`Abrir ${repo.name} en GitHub`}>
                  <ExternalLinkIcon size={18} />
                </IconButton>
              </a>
              <IconButton aria-label={`Editar ${repo.name}`} onClick={() => onEdit(repo)}>
                <PencilIcon size={18} />
              </IconButton>
              <IconButton aria-label={`Eliminar ${repo.name}`} onClick={() => onDelete(repo)} className="text-danger">
                <TrashIcon size={18} />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
