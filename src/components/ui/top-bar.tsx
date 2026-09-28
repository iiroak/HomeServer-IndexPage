import clsx from "clsx";
import { ChevronLeftIcon } from "./icons";
import { IconButton } from "./icon-button";

/**
 * Headers — portado de Kloset/src/components/ui/top-bar.tsx. `onBack` en
 * vez de `backHref` como único modo: aquí no hay páginas de router para
 * las pestañas de /app, así que "volver" siempre es un callback que
 * cambia el estado de navegación local, nunca una URL.
 */
export function LargeTitleHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={clsx("flex items-start justify-between gap-3 px-[18px] pt-3 pb-4", className)}>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-display font-bold text-text-primary">{title}</h1>
        {subtitle && <div className="text-caption text-text-secondary">{subtitle}</div>}
      </div>
      {action}
    </header>
  );
}

export function TopBar({
  title,
  onBack,
  action,
  className,
}: {
  title?: string;
  onBack?: () => void;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={clsx(
        "sticky top-0 z-10 grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-divider bg-surface/95 px-2 backdrop-blur",
        className,
      )}
    >
      {onBack ? (
        <IconButton aria-label="Volver" onClick={onBack}>
          <ChevronLeftIcon size={26} />
        </IconButton>
      ) : (
        <span className="size-11" />
      )}
      {title && <h1 className="truncate text-center text-title font-semibold text-text-primary">{title}</h1>}
      <div className="flex justify-end">{action ?? <span className="size-11" />}</div>
    </header>
  );
}
