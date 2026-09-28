"use client";

import { useCallback, useEffect, useState } from "react";

// Mismo nombre de key que usaba el índice anterior (index.astro),
// para que la preferencia ya guardada de un usuario recurrente no se
// pierda con el rediseño.
const STORAGE_KEY = "homeserver-theme";
type Theme = "light" | "dark";

/**
 * Tema claro/oscuro persistido en localStorage, aplicado como
 * `data-theme` en <html> — mismo mecanismo que el índice anterior
 * (Layout.astro no lo tocaba; el <script> inline del index.astro viejo
 * lo hacía). Aquí vive como hook de React porque el toggle está dentro
 * de un island, pero el atributo en <html> es compartido con las
 * páginas Cypht (que ya lo leían) y con el script anti-FOUC de
 * Layout.astro.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    setTheme(stored ?? "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  return [theme, toggleTheme];
}
