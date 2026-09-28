"use client";

import clsx from "clsx";

/** Chip de filtro — portado de Kloset/src/components/ui/chip.tsx. */
export function Chip({
  selected = false,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex h-9 shrink-0 items-center rounded-xs px-3.5 text-caption transition-colors",
        selected
          ? "bg-surface-muted text-text-primary font-medium"
          : "border border-border-soft bg-surface text-text-secondary hover:text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
