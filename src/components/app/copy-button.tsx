"use client";

import { useState } from "react";
import clsx from "clsx";
import { CopyIcon, CheckIcon } from "../ui/icons";
import { IconButton } from "../ui/icon-button";

/**
 * Copiar al portapapeles — reemplaza la delegación de eventos con
 * feedback por estilos inline del index.astro anterior. `navigator.
 * clipboard` requiere secure context; en LAN por HTTP cae al fallback
 * de `document.execCommand`, igual que antes.
 */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Sin feedback visual si falla; el usuario puede seleccionar el texto a mano.
    }
  }

  return (
    <IconButton
      aria-label={copied ? "Copiado" : `Copiar ${label}`}
      onClick={handleCopy}
      className={clsx(copied && "text-cyan")}
    >
      {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
    </IconButton>
  );
}
