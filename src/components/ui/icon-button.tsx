"use client";

import clsx from "clsx";

/** Target táctil >= 44×44 — portado de Kloset/src/components/ui/icon-button.tsx. */
export function IconButton({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex size-11 items-center justify-center rounded-full text-icon-primary transition-[opacity,transform] duration-[var(--duration-fast)] active:scale-[0.98] active:opacity-[0.78] disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
