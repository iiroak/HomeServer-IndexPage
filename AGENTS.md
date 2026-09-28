# AGENTS.md - HomeServer Index Page

## Quickstart

```bash
pnpm install
docker compose up -d          # Postgres local de desarrollo
pnpm db:migrate                # Aplica src/db/schema.sql (requiere INDEX_PAGE_DATABASE_URL)
pnpm db:seed                   # Catálogo heredado + UIs verificadas en Proxmox; idempotente
pnpm dev                       # http://localhost:4321
pnpm build                     # Build de producción (Astro server mode)
pnpm astro check                # Type-check
```

Package manager: **pnpm** (lockfile `pnpm-lock.yaml`). Copia `.env.example` a `.env.local` y ajusta `INDEX_PAGE_DATABASE_URL` antes de `pnpm dev`.

## Arquitectura

- **Astro 5**, SSR (`@astrojs/node` standalone) + **React 19 islands** (`@astrojs/react`) para todo lo interactivo.
- **Tailwind CSS 4**, config CSS-first (`@theme inline` en `src/styles/global.css`, sin `tailwind.config.*`).
- **Postgres** (CT110 en producción, `10.10.10.232:5432`; contenedor local en dev) — reemplaza al `src/data/projects.json` plano. Sin ORM: `pg` crudo + runner de migraciones propio, copiado del patrón de Fit-API.
- **Sistema de diseño portado de Kloset** (`~/projects/Kloset`): tokens, bottom nav + FAB, bottom sheet, componentes de `src/components/ui/`. Con modo oscuro añadido (Kloset no lo tiene) y namespace `--app-*` en las variables para no colisionar con la paleta legacy de `/cypht/*`.

```
src/
  db/
    schema.sql              # Tablas nodes + repos, funciones IMMUTABLE para índices GIN
    migrate.mjs             # Runner de migraciones, ejecutable dentro del contenedor
    seed.mjs                # Seeds idempotentes: catálogo heredado + inventario de UIs documentadas
    pool.ts                 # Pool de conexión compartido
  lib/
    types.ts                # ServiceNode, ServiceNodeTree, RepoRef
    nodes.ts                # Queries de árbol: listPublicTree, listAllTree, CRUD
    repos.ts                # Queries de repos de referencia (CRUD)
    tree.ts                 # pruneTree (poda por visibilidad), searchTree, findNode
    access.ts               # Verificación de JWT de Cloudflare Access + allowlist de emails
    schemas.ts              # Validación Zod de servidor (nodes, repos)
    http.ts                 # CORS con allowlist real (reemplaza el Origin-reflejado del código viejo)
  components/
    ui/                     # Kit portado de Kloset: Button, Card, Chip, BottomSheet,
                             # BottomNavigation, IconButton, ListRow, TopBar, Toast, icons
    app/                    # Específico del dominio: TreeBrowser, NodeRow, NodeForm,
                             # RepoForm, RepoList, AppShell, PublicShell, NodeIcon,
                             # CopyButton, SettingsView, use-theme
  pages/
    index.astro              # Público — SSR con listPublicTree(), sin fetch de cliente
    app.astro                 # Privado — verifica Access server-side antes de renderizar AppShell
    api/nodes/{index,[id],reorder}.ts
    api/repos/{index,[id]}.ts
    cypht/*                  # Microsite legal de Iroak Mail, independiente, NO tocar
                              # su sistema de diseño (usa las vars legacy de global.css)
  layouts/Layout.astro        # HTML shell, SEO, anti-FOUC de tema, soporta noindex
  styles/global.css           # Vars legacy (Cypht) + vars --app-* (Kloset-derivadas) + @theme inline
```

## Modelo de datos

Un solo árbol autorreferenciado (`nodes.parent_id`). El esquema soporta cualquier profundidad; la UI solo navega 2 niveles (raíz → dentro de una carpeta).

```sql
nodes(id, parent_id, kind['folder'|'link'], name, description, visibility['public'|'private'],
      url, commands jsonb, icon_kind['favicon'|'url'|'initials'], icon_ref, accent, tags[], position)
repos(id, name, description, icon_kind, icon_ref, github_url, pinned, position)
```

**Regla de visibilidad — no negociable**: la visibilidad es del NODO, nunca heredada. El filtro SQL (`WHERE visibility = 'public'`) ocurre en `listPublicTree()`, nunca en el cliente ni en un componente. Una carpeta con hijos públicos y privados (ej. "Boty": web+docs públicos, admin privado) aparece en ambas vistas, mostrando solo los hijos que correspondan — ver `pruneTree()` en `src/lib/tree.ts`.

**`repos` no se sincroniza con la API de GitHub.** Es una lista pegada a mano por el usuario (nombre, descripción, icono, URL) — deliberado, no un descuido.

## Autenticación

- `/` es pública, sin auth, SSR puro. Nunca hace `fetch` a `/api/nodes`.
- `/app` y todo `/api/*` (excepto los `OPTIONS` de CORS) exigen un JWT válido de Cloudflare Access, verificado contra el JWKS remoto (`src/lib/access.ts`, mismo patrón que `Fit-API/src/middleware/accessAuth.ts`). Además requieren una allowlist no vacía de emails (`INDEX_PAGE_ALLOWED_EMAILS`): si falta, producción falla cerrado con 503; si el email no está listado, devuelve 403.
- **`INDEX_PAGE_DEV_EMAIL`**: solo para `pnpm dev` local (bloqueado si `NODE_ENV=production`). Simula una identidad sin pasar por el túnel de Cloudflare. **Nunca debe estar definida en Coolify/producción.**
- Cloudflare Access debe cubrir `index.iroak.dev/app*` y `index.iroak.dev/api/*`; el JWT de `Access 0` se valida de nuevo en origen.

## Gotcha crítico de Astro: `security.allowedDomains`

Sin `security.allowedDomains` configurado en `astro.config.mjs`, Astro **ignora el `Host` real de cada petición y usa `"localhost"` fijo internamente** (mitigación de CVE-2025-61925 / GHSA-hr2q-hp5q-x767). Esto rompe la protección CSRF nativa (`security.checkOrigin`, activada por defecto): compara el `Origin` real del navegador contra `http://localhost` y **todo POST/PATCH/DELETE devuelve 403** sin importar qué dominio sirva la app.

El fix está en `astro.config.mjs` → `security.allowedDomains`, listando `index.iroak.dev` (producción) más `localhost`/`127.0.0.1` (dev). **Si se cambia el dominio de producción o se añade un alias, hay que actualizar esta lista o el CRUD entero deja de funcionar en silencio con 403.**

## Configuración

| Variable | Default | Descripción |
|----------|---------|-------------|
| `INDEX_PAGE_DATABASE_URL` | — (requerida) | DSN de Postgres. En CT110: `sslmode=no-verify` (cert autofirmado) |
| `CF_ACCESS_TEAM_DOMAIN` | — | `iroak.cloudflareaccess.com` |
| `CF_ACCESS_AUD` | — | Audience de la app de Access que protege `/app*` |
| `INDEX_PAGE_ALLOWED_EMAILS` | vacío (= denegado en producción) | Allowlist obligatoria para producción; emails separados por coma |
| `INDEX_PAGE_DEV_EMAIL` | — | Solo dev local, nunca en producción |
| Canonical site | `https://index.iroak.dev` | Configurado en `astro.config.mjs` para el build |
| `PORT` / `HOST` | `4321` / `0.0.0.0` | Adapter Node |

## Docker

`docker-compose.yaml` levanta **solo Postgres para desarrollo local** (`pnpm dev` corre fuera de Docker contra él). En producción (Coolify/CT102) la app se conecta directo a CT110 — este compose nunca se usa ahí. Reemplaza al compose anterior de 2 servicios (`index-public` + `index-private`), que dependía de un repo `HomeServer-IndexPrivate` que nunca existió en disco.

## Theme

`data-theme` en `<html>`, persistido en `localStorage("homeserver-theme")`, default `dark`. Aplicado con un script inline sin defer en `Layout.astro` (antes del primer paint, evita el FOUC que tenía el índice anterior). El toggle vive en Ajustes (`/app`, pestaña Ajustes) — ver `src/components/app/use-theme.tsx`.

## PWA

Solo la portada pública opta por `pwa` en `Layout.astro`: enlaza `public/manifest.webmanifest` y registra `public/sw.js`. El service worker tiene scope `/`, pero solo cachea assets con hash de `/_astro/`; navegaciones SSR y todas las rutas `/app` y `/api` siguen siendo network-only para no persistir datos privados ni respuestas de usuario.

## Las 4 pestañas de /app — por qué NO son rutas

`AppShell` (`src/components/app/app-shell.tsx`) mantiene Público/Privado/Proyectos/Ajustes como estado de React, no como rutas de Astro. Razón: `ClientRouter` de Astro no restaura el scroll de contenedores internos (solo el del `document`) — con rutas reales, cambiar de pestaña perdería la posición de scroll del árbol en cada vuelta ([withastro/roadmap#952](https://github.com/withastro/roadmap/discussions/952)). El árbol completo y los repos se cargan una vez al montar `/app` (ya pasó por Access) y las pestañas Público/Privado filtran en memoria sobre el mismo dato con `pruneTree()`.

## Cómo agregar un servicio

Ya no se edita un JSON. Desde `/app`, tocar el FAB → "Nuevo enlace o carpeta", completar el formulario (nombre, URL, visibilidad, tags, comandos copiables opcionales). El logo se resuelve solo por favicon del propio dominio — sin campo de subida.

## Cómo agregar un repo de referencia

Desde `/app` → pestaña Proyectos → FAB → "Nuevo repo de referencia". Solo nombre, descripción, URL de GitHub (debe ser `github.com`) e icono opcional. Sin sincronización automática — es intencional.

## Microsite `/cypht/*`

4 archivos (`src/pages/cypht/{index,privacy,terms}.astro` + `src/components/CyphtPublicPage.astro`) para el OAuth/legal de Iroak Mail. **Independiente del índice**, comparte `Layout.astro` y las variables legacy de `global.css` (`--ink`, `--accent`, `.prose-iroak`, `.card`). No tocar su sistema de diseño al iterar sobre `/` o `/app`.

## Infra Inventory Source

`/home/kaori/projects/Proxmox/` — `AGENTS.md`, `PROXMOX.md`, `VMs/*.md`, `CLOUDFLARE.md`. Fuente de verdad de IPs, puertos, dominios y políticas de Access del homelab.

## Gotchas

- Sin test framework — verificación manual (build + `astro check` + smoke test con `curl`).
- `docker-compose.yaml` es solo para Postgres de dev; no confundir con un stack de producción.
- El `Dockerfile` corre `pnpm install --frozen-lockfile` (dos veces: build completo, luego `--prod` para el runtime) — un lockfile desincronizado rompe el build, a propósito.
- `pnpm db:seed` aplica marcadores idempotentes: `0001` importa el catálogo público legado solo si `nodes` está vacío; `0002` añade 5 carpetas y 40 UIs explícitas de Proxmox (5 públicas, 35 privadas), incluyendo un enlace privado en `Cliente`. El catálogo privado puede contener hostnames accesibles desde Internet, pero no se devuelve en la raíz pública. APIs y webhooks no se seedearon.
- `CopyButton` usa `document.execCommand` como fallback fuera de secure context (LAN por HTTP) — API deprecada pero sin alternativa estándar para ese caso.
- Los repos de `/api/repos` no validan que la URL de GitHub exista de verdad, solo que el hostname sea `github.com`.
