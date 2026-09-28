"use client";

import type { ServiceNodeTree } from "../../lib/types";
import { TreeBrowser } from "./tree-browser";

/**
 * Shell público — sin BottomNavigation (no hay 4 pestañas para un
 * visitante anónimo), sin FAB, sin edición. Solo el navegador de árbol
 * sobre el subconjunto ya filtrado por listPublicTree() en SSR.
 *
 * `tree` llega como prop desde index.astro, NUNCA se refetchea desde
 * /api/nodes (esa ruta exige Cloudflare Access y devolvería 401/503
 * aquí de todos modos).
 */
export function PublicShell({ tree }: { tree: ServiceNodeTree[] }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="flex items-center justify-between px-[18px] pt-4 pb-2">
        <h1 className="text-title-lg font-bold text-text-primary">Index</h1>
        <a href="/app" className="text-caption font-medium text-accent">
          Acceder
        </a>
      </div>
      <main className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
        <TreeBrowser tree={tree} editable={false} />
      </main>
    </div>
  );
}
