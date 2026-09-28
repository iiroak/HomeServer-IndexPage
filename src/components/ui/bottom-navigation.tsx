"use client";

import clsx from "clsx";
import { GlobeIcon, LockIcon, CodeIcon, SettingsIcon, PlusIcon } from "./icons";

/**
 * Bottom navigation + FAB — adaptado de Kloset/src/components/ui/bottom-navigation.tsx.
 *
 * Dos diferencias deliberadas frente al original:
 *
 *  1. Las 4 pestañas NO son rutas de Astro. Astro's ClientRouter no
 *     restaura el scroll de contenedores internos (solo el del
 *     document), así que cambiar de pestaña con navegación real perdería
 *     la posición de scroll de este AppScaffold en cada vuelta — ver
 *     app-shell.tsx. Son estado de React (`activeTab`), sin
 *     `usePathname` ni `<Link>`.
 *
 *  2. Pestañas del dominio: Público / Privado | FAB | Proyectos /
 *     Ajustes, en vez de Armario/Looks/Hoy/Estilista. La distinción
 *     pública/privada es de VISIBILIDAD DE FILA, no de ruta — ambas
 *     pestañas leen del mismo árbol ya cargado en memoria (ver
 *     app-shell.tsx), filtrando client-side. El fetch a /api/nodes con
 *     todo el árbol solo ocurre una vez porque quien ve /app ya pasó
 *     por Cloudflare Access.
 */
export type AppTab = "public" | "private" | "repos" | "settings";

const LEFT_TABS = [
  { id: "public" as const, label: "Público", icon: GlobeIcon },
  { id: "private" as const, label: "Privado", icon: LockIcon },
];

const RIGHT_TABS = [
  { id: "repos" as const, label: "Proyectos", icon: CodeIcon },
  { id: "settings" as const, label: "Ajustes", icon: SettingsIcon },
];

function TabButton({
  id,
  label,
  icon: Icon,
  isActive,
  onSelect,
}: {
  id: AppTab;
  label: string;
  icon: typeof GlobeIcon;
  isActive: boolean;
  onSelect: (tab: AppTab) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="flex flex-1 flex-col items-center gap-1 py-2 text-micro transition-colors"
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={25} strokeWidth={isActive ? 2.1 : 1.8} className={isActive ? "text-icon-primary" : "text-text-tertiary"} />
      <span className={isActive ? "font-medium text-icon-primary" : "text-text-tertiary"}>{label}</span>
    </button>
  );
}

export function BottomNavigation({
  activeTab,
  onSelectTab,
  fabOpen = false,
  onFabClick,
}: {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  fabOpen?: boolean;
  onFabClick?: () => void;
}) {
  return (
    <nav className="shrink-0 border-t border-divider bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto flex h-[61px] max-w-3xl items-stretch">
        {LEFT_TABS.map((tab) => (
          <TabButton key={tab.id} {...tab} isActive={activeTab === tab.id} onSelect={onSelectTab} />
        ))}

        {/* Espaciador central: reserva el ancho del FAB (62px) en el flujo. */}
        <div className="w-[62px] shrink-0" />

        {RIGHT_TABS.map((tab) => (
          <TabButton key={tab.id} {...tab} isActive={activeTab === tab.id} onSelect={onSelectTab} />
        ))}

        <button
          type="button"
          onClick={onFabClick}
          aria-label={fabOpen ? "Cerrar menú" : "Abrir menú de acciones"}
          aria-expanded={fabOpen}
          className={clsx(
            "absolute left-1/2 flex size-[62px] -translate-x-1/2 items-center justify-center rounded-full bg-fab text-fab-content shadow-floating transition-transform duration-[var(--duration-fast)] active:scale-[0.96]",
            "-top-[19px]",
          )}
        >
          <PlusIcon
            size={30}
            strokeWidth={2}
            className={clsx("transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)]", fabOpen && "rotate-45")}
          />
        </button>
      </div>
    </nav>
  );
}
