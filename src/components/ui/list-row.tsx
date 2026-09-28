import clsx from "clsx";
import { ChevronRightIcon } from "./icons";

/**
 * Fila de lista tipo settings — portado de Kloset/src/components/ui/list-row.tsx.
 * Sin next/link: aquí no hay router de páginas para las pestañas de /app
 * (ver nota en app-shell.tsx sobre por qué), así que `href` es un <a>
 * normal y `onClick` es el camino recomendado para navegación interna.
 */
export function ListRow({
  label,
  value,
  onClick,
  href,
  disabled,
  chevron = Boolean(onClick || href),
  className,
}: {
  label: React.ReactNode;
  value?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  chevron?: boolean;
  className?: string;
}) {
  const classes = clsx(
    "flex min-h-[62px] w-full items-center justify-between gap-3 px-[18px] text-left transition-opacity",
    (onClick || href) && "active:opacity-[0.78]",
    disabled && "opacity-40",
    className,
  );

  const content = (
    <>
      <span className="text-body text-text-tertiary">{label}</span>
      <span className="flex min-w-0 items-center gap-2 text-body-medium text-text-primary">
        {value}
        {chevron && <ChevronRightIcon size={18} className="shrink-0 text-icon-secondary" />}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={classes}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
