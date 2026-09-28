"use client";

import { useEffect } from "react";
import clsx from "clsx";

/**
 * Bottom sheet genérico — portado de Kloset/src/components/ui/bottom-sheet.tsx,
 * con dos añadidos que Kloset no tenía y aquí sí hacen falta (formularios
 * de alta/edición más largos que un ActionSheet de una sola acción):
 *
 *  1. Bloqueo de scroll del body mientras está abierto.
 *  2. Focus trap básico: el foco entra al primer elemento focuseable al
 *     abrir y Tab no se escapa del sheet.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const root = document.getElementById("bottom-sheet-panel");
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const root = document.getElementById("bottom-sheet-panel");
    root?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={clsx(
        "fixed inset-0 z-40 flex items-end justify-center transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out)]",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />
      <div
        id="bottom-sheet-panel"
        className={clsx(
          "relative max-h-[85vh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-2xl bg-surface px-[18px] pt-3 pb-[calc(26px+env(safe-area-inset-bottom))] shadow-sheet transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)]",
          open ? "translate-y-0" : "translate-y-full",
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto mb-4 h-1 w-[30px] rounded-full bg-border-soft" />
        {title && <h2 className="mb-3 text-title-lg font-bold text-text-primary">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
