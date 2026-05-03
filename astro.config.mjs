import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://iroak.cl",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [sitemap()],
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
