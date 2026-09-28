"use client";

import type { ServiceNodeTree } from "../../lib/types";
import { NodeIcon } from "./node-icon";
import { CopyButton } from "./copy-button";
import { ChevronRightIcon, ExternalLinkIcon, PencilIcon, TrashIcon, TerminalIcon } from "../ui/icons";
import { IconButton } from "../ui/icon-button";

/**
 * Una fila del árbol: carpeta (navega adentro) o enlace (abre URL +
 * comandos copiables). `editable` controla si se muestran los botones
 * de editar/borrar — la vista pública (/) siempre pasa `editable=false`.
 */
export function NodeRow({
  node,
  editable,
  onOpenFolder,
  onEdit,
  onDelete,
}: {
  node: ServiceNodeTree;
  editable: boolean;
  onOpenFolder?: (node: ServiceNodeTree) => void;
  onEdit?: (node: ServiceNodeTree) => void;
  onDelete?: (node: ServiceNodeTree) => void;
}) {
  if (node.kind === "folder") {
    return (
      <button
        type="button"
        onClick={() => onOpenFolder?.(node)}
        className="flex min-h-[62px] w-full items-center gap-3 px-[18px] text-left transition-opacity active:opacity-[0.78]"
      >
        <NodeIcon name={node.name} iconKind={node.iconKind} iconRef={node.iconRef} pageUrl={null} accent={node.accent} size={36} />
        <span className="flex-1 min-w-0">
          <span className="block truncate text-body-medium text-text-primary">{node.name}</span>
          {node.description && <span className="block truncate text-caption text-text-secondary">{node.description}</span>}
        </span>
        <ChevronRightIcon size={18} className="shrink-0 text-icon-secondary" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-[18px] py-3">
      <div className="flex items-center gap-3">
        <NodeIcon name={node.name} iconKind={node.iconKind} iconRef={node.iconRef} pageUrl={node.url} accent={node.accent} size={36} />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-body-medium text-text-primary">{node.name}</span>
          {node.description && <span className="block truncate text-caption text-text-secondary">{node.description}</span>}
        </div>
        {node.url && (
          <a href={node.url} target="_blank" rel="noreferrer noopener">
            <IconButton aria-label={`Abrir ${node.name}`}>
              <ExternalLinkIcon size={18} />
            </IconButton>
          </a>
        )}
        {editable && (
          <>
            <IconButton aria-label={`Editar ${node.name}`} onClick={() => onEdit?.(node)}>
              <PencilIcon size={18} />
            </IconButton>
            <IconButton aria-label={`Eliminar ${node.name}`} onClick={() => onDelete?.(node)} className="text-danger">
              <TrashIcon size={18} />
            </IconButton>
          </>
        )}
      </div>

      {node.commands.length > 0 && (
        <div className="flex flex-col gap-1.5 pl-[48px]">
          {node.commands.map((cmd, i) => (
            <div key={i} className="flex items-center gap-2 rounded-sm border border-border-soft bg-surface-soft px-3 py-2">
              <TerminalIcon size={16} className="shrink-0 text-icon-secondary" />
              <div className="min-w-0 flex-1">
                <span className="block text-micro text-text-tertiary">{cmd.label}</span>
                <code className="block truncate font-mono text-caption text-text-primary">{cmd.command}</code>
              </div>
              <CopyButton text={cmd.command} label={cmd.label} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
