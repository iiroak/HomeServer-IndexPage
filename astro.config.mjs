import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://index.iroak.dev",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [sitemap(), react()],
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  security: {
    // Sin esta lista, Astro (desde el fix de CVE-2025-61925/GHSA-hr2q-hp5q-x767)
    // IGNORA el Host real de la petición y usa "localhost" fijo internamente
    // — lo cual hace que security.checkOrigin (protección CSRF nativa) compare
    // el Origin del navegador contra "http://localhost" y rechace con 403
    // los POST/PATCH/DELETE en producción, sin importar qué dominio sirva
    // la app. Verificado en dev: sin esto, un DELETE con
    // `Origin: http://127.0.0.1:4322` fallaba porque Astro veía
    // `url.origin === "http://localhost"`.
    //
    // index.iroak.dev es el hostname real detrás del túnel cloudflared de
    // CT102 (ver Proxmox/VMs/CT102_Docker.md) — cloudflared reenvía el Host
    // original, así que no hace falta cubrir wildcards. localhost/127.0.0.1
    // son para `pnpm dev` y pruebas manuales.
    allowedDomains: [
      { hostname: "index.iroak.dev", protocol: "https" },
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
    ],
  },
});
