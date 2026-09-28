"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

/**
 * Toast global — portado de Kloset/src/components/ui/toast.tsx. Store
 * mínimo en módulo (sin dependencia externa), auto-cierre 3200ms.
 */
interface ToastState {
  id: number;
  message: string;
}

let listeners: ((toast: ToastState) => void)[] = [];
let nextId = 0;

export function showToast(message: string) {
  const toast = { id: nextId++, message };
  listeners.forEach((listener) => listener(toast));
}

export function ToastHost() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const listener = (t: ToastState) => setToast(t);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <div
      className={clsx(
        "pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+16px)] z-50 flex justify-center px-[18px] transition-opacity duration-[var(--duration-base)] ease-[var(--ease-out)]",
        toast ? "opacity-100" : "opacity-0",
      )}
    >
      {toast && (
        <div className="flex min-h-12 max-w-full items-center gap-3 rounded-[3px] bg-toast-bg px-3.5 text-caption text-white shadow-floating">
          {toast.message}
        </div>
      )}
    </div>
  );
}
