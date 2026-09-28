"use client";

import { useState } from "react";
import clsx from "clsx";

/**
 * Logo de un nodo o repo — resuelve favicon automático con fallback a
 * iniciales, sin almacenamiento propio (decisión del usuario: nada de
 * pipeline de subida de imágenes).
 *
 * iconKind:
 *  - "favicon": pide `${origin}/favicon.ico` del propio servicio. Para
 *    hosts tras Cloudflare Access, el navegador del usuario ya tiene la
 *    cookie de sesión, así que carga igual que cualquier otro asset del
 *    sitio; un visitante anónimo en la vista pública simplemente no la
 *    tendrá y caerá al fallback.
 *  - "url": el usuario pegó una URL de imagen a mano (útil cuando el
 *    favicon es feo o no existe).
 *  - "initials": sin red, solo las 2 primeras letras del nombre sobre un
 *    color de acento.
 *
 * El fallback a iniciales también se activa en runtime si la imagen
 * falla al cargar (onError), independientemente de iconKind.
 */
function faviconUrl(pageUrl: string): string | null {
  try {
    const u = new URL(pageUrl);
    return `${u.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function NodeIcon({
  name,
  iconKind,
  iconRef,
  pageUrl,
  accent,
  size = 40,
  className,
}: {
  name: string;
  iconKind: "favicon" | "url" | "initials";
  iconRef: string | null;
  pageUrl: string | null;
  accent?: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const src =
    !failed && iconKind === "url" && iconRef
      ? iconRef
      : !failed && iconKind === "favicon" && pageUrl
        ? faviconUrl(pageUrl)
        : null;

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={clsx("shrink-0 rounded-sm object-contain", className)}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={clsx("flex shrink-0 items-center justify-center rounded-sm bg-surface-muted text-text-secondary font-medium", className)}
      style={{ width: size, height: size, fontSize: size * 0.36, backgroundColor: accent ? `${accent}22` : undefined, color: accent ?? undefined }}
    >
      {initials(name)}
    </div>
  );
}
