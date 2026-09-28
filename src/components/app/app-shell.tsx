"use client";

import { useEffect, useState } from "react";
import type { ServiceNodeTree, RepoRef } from "../../lib/types";
import { pruneTree } from "../../lib/tree";
import { BottomNavigation, type AppTab } from "../ui/bottom-navigation";
import { BottomSheet } from "../ui/bottom-sheet";
import { ToastHost, showToast } from "../ui/toast";
import { TreeBrowser } from "./tree-browser";
import { NodeForm } from "./node-form";
import { RepoForm } from "./repo-form";
import { RepoList } from "./repo-list";
import { SettingsView } from "./settings-view";
import { Button } from "../ui/button";

/**
 * Shell de /app — las 4 pestañas (Público/Privado/Proyectos/Ajustes) son
 * ESTADO DE REACT, no rutas. Dos razones, ambas necesarias:
 *
 *  1. Astro's ClientRouter no restaura el scroll de contenedores
 *     internos (solo el del document) — con rutas reales, volver de
 *     "Proyectos" a "Privado" perdería la posición de scroll del árbol
 *     cada vez. https://github.com/withastro/roadmap/discussions/952
 *  2. El árbol completo se carga UNA vez al montar (ya pasó por
 *     Cloudflare Access para llegar aquí) y Público/Privado son dos
 *     filtros en memoria sobre el mismo dato — no dos fetches.
 *
 * Esta página entera vive tras /app, protegida por Cloudflare Access en
 * el edge (pool "Access 0") + verificación de firma del JWT en cada
 * llamada a /api/nodes y /api/repos (ver src/lib/access.ts). El único
 * dato "de confianza" recibido del servidor al montar es `email`, para
 * mostrarlo en Ajustes — todo lo demás se pide a la API con
 * `credentials: same-origin`, así que el navegador reenvía la cookie de
 * Access y el servidor vuelve a verificar el JWT en cada request.
 */
export function AppShell({ email }: { email: string | null }) {
  const [tab, setTab] = useState<AppTab>("private");
  const [tree, setTree] = useState<ServiceNodeTree[] | null>(null);
  const [repos, setRepos] = useState<RepoRef[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fabOpen, setFabOpen] = useState(false);
  const [sheet, setSheet] = useState<
    | { kind: "new-node"; parentId: string | null }
    | { kind: "edit-node"; node: ServiceNodeTree }
    | { kind: "new-repo" }
    | { kind: "edit-repo"; repo: RepoRef }
    | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [treeRes, reposRes] = await Promise.all([
          fetch("/api/nodes", { credentials: "same-origin" }),
          fetch("/api/repos", { credentials: "same-origin" }),
        ]);
        if (!treeRes.ok || !reposRes.ok) throw new Error("upstream_error");
        const [treeData, reposData] = await Promise.all([treeRes.json(), reposRes.json()]);
        if (cancelled) return;
        setTree(treeData);
        setRepos(reposData);
      } catch {
        if (!cancelled) setLoadError("No se pudo cargar. Reintenta.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function reload() {
    setTree(null);
    setRepos(null);
    setLoadError(null);
    // Fuerza el efecto de arriba a correr de nuevo cambiando de pestaña y
    // volviendo no es necesario: basta con re-disparar el fetch aquí.
    (async () => {
      try {
        const [treeRes, reposRes] = await Promise.all([
          fetch("/api/nodes", { credentials: "same-origin" }),
          fetch("/api/repos", { credentials: "same-origin" }),
        ]);
        if (!treeRes.ok || !reposRes.ok) throw new Error("upstream_error");
        setTree(await treeRes.json());
        setRepos(await reposRes.json());
      } catch {
        setLoadError("No se pudo cargar. Reintenta.");
      }
    })();
  }

  async function handleDeleteNode(node: ServiceNodeTree) {
    if (!confirm(`¿Eliminar "${node.name}"? Esto también borra sus hijos.`)) return;
    const res = await fetch(`/api/nodes/${node.id}`, { method: "DELETE", credentials: "same-origin" });
    if (res.ok) {
      showToast("Eliminado");
      reload();
    } else {
      showToast("No se pudo eliminar");
    }
  }

  async function handleDeleteRepo(repo: RepoRef) {
    if (!confirm(`¿Eliminar "${repo.name}" de la lista?`)) return;
    const res = await fetch(`/api/repos/${repo.id}`, { method: "DELETE", credentials: "same-origin" });
    if (res.ok) {
      showToast("Eliminado");
      reload();
    } else {
      showToast("No se pudo eliminar");
    }
  }

  async function handleTogglePin(repo: RepoRef) {
    const res = await fetch(`/api/repos/${repo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ pinned: !repo.pinned }),
    });
    if (res.ok) reload();
  }

  const loading = tree === null || repos === null;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main id="app-scroll-area" className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
        {loadError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-body text-text-secondary">{loadError}</p>
            <Button onClick={reload}>Reintentar</Button>
          </div>
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-body text-text-tertiary">Cargando…</p>
          </div>
        ) : tab === "public" ? (
          <TreeBrowser tree={pruneTree(tree, "public")} editable={false} />
        ) : tab === "private" ? (
          <TreeBrowser
            tree={tree}
            editable
            onEdit={(node) => setSheet({ kind: "edit-node", node })}
            onDelete={handleDeleteNode}
          />
        ) : tab === "repos" ? (
          <RepoList
            repos={repos}
            onEdit={(repo) => setSheet({ kind: "edit-repo", repo })}
            onDelete={handleDeleteRepo}
            onTogglePin={handleTogglePin}
          />
        ) : (
          <SettingsView email={email} />
        )}
      </main>

      <BottomNavigation
        activeTab={tab}
        onSelectTab={(t) => {
          setTab(t);
          setFabOpen(false);
        }}
        fabOpen={fabOpen}
        onFabClick={() => setFabOpen((v) => !v)}
      />

      <BottomSheet
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        title="Agregar"
      >
        <div className="flex flex-col divide-y divide-divider">
          <button
            type="button"
            className="flex min-h-[56px] items-center text-left text-body-medium text-text-primary"
            onClick={() => {
              setFabOpen(false);
              setSheet({ kind: "new-node", parentId: null });
            }}
          >
            Nuevo enlace o carpeta
          </button>
          <button
            type="button"
            className="flex min-h-[56px] items-center text-left text-body-medium text-text-primary"
            onClick={() => {
              setFabOpen(false);
              setSheet({ kind: "new-repo" });
            }}
          >
            Nuevo repo de referencia
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={
          sheet?.kind === "new-node"
            ? "Nuevo nodo"
            : sheet?.kind === "edit-node"
              ? "Editar nodo"
              : sheet?.kind === "new-repo"
                ? "Nuevo repo"
                : sheet?.kind === "edit-repo"
                  ? "Editar repo"
                  : undefined
        }
      >
        {sheet?.kind === "new-node" && (
          <NodeForm
            parentId={sheet.parentId}
            onSaved={() => {
              setSheet(null);
              reload();
            }}
            onCancel={() => setSheet(null)}
          />
        )}
        {sheet?.kind === "edit-node" && (
          <NodeForm
            parentId={sheet.node.parentId}
            initial={sheet.node}
            onSaved={() => {
              setSheet(null);
              reload();
            }}
            onCancel={() => setSheet(null)}
          />
        )}
        {sheet?.kind === "new-repo" && (
          <RepoForm
            onSaved={() => {
              setSheet(null);
              reload();
            }}
            onCancel={() => setSheet(null)}
          />
        )}
        {sheet?.kind === "edit-repo" && (
          <RepoForm
            initial={sheet.repo}
            onSaved={() => {
              setSheet(null);
              reload();
            }}
            onCancel={() => setSheet(null)}
          />
        )}
      </BottomSheet>

      <ToastHost />
    </div>
  );
}
