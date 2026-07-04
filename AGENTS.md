# AGENTS.md - HomeServer Index Page

## Quickstart

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # Production build (Astro server mode)
pnpm preview      # Preview production build
pnpm astro check  # TypeScript type-check
```

Package manager: **pnpm** (lockfile is `pnpm-lock.yaml`).

## Architecture

- **Astro 5**, SSR mode via `@astrojs/node` (standalone)
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- TypeScript strict, single-page app with client-side JS
- **No database** — public data lives in `src/data/projects.json` (flat file in repo)

```
src/
  data/projects.json          # Public projects (source of truth)
  pages/index.astro           # Main page (SSR + client-side JS for filters/private)
  pages/api/login.ts          # GET /api/login → redirect to /?unlock=1
  pages/api/private-projects.ts  # GET /api/private-projects → proxy to private service
  pages/api/private-health.ts    # GET /api/private-health → health check
  layouts/Layout.astro        # HTML shell, SEO, JSON-LD
  styles/global.css           # Theme tokens (light/dark), Tailwind utilities
```

## Data Flow

```
Browser
  │
  ├── GET /                    → Astro SSR renders projects.json
  │
  ├── Click 🔒 button         → GET /api/login → 302 redirect to /?unlock=1
  │                               (triggers CF Access auth if needed)
  │
  └── GET /api/private-projects → Proxy to PRIVATE_INDEX_URL(s)
                                   → GET {upstream}/projects
                                   → Returns JSON array of private projects
                                   → Frontend merges into existing grid
```

## API Reference

### GET /

SSR page. Renders `projects.json` as a searchable/filterable grid.

### GET /api/login

Redirects to `/?unlock=1`. This triggers the client-side JS to load private projects.

**Response:** `302 Found` → `Location: /?unlock=1`

### GET /api/private-projects

Proxies to the private index service. Returns an array of projects in the same format as `projects.json`.

**Response (200):**
```json
[
  {
    "name": "ProjectName",
    "description": "...",
    "icon": "/icons/name.svg",
    "accent": "pink",
    "tags": ["tag1"],
    "links": [...]
  }
]
```

**Response (401):** `{ "error": "cloudflare_access_required" }` — when `REQUIRE_CF_ACCESS=true` and no CF Access headers present.

**Response (502):** `{ "error": "private_upstream_unreachable", "attempts": [...] }` — when all upstreams fail.

**CORS:** Supports `OPTIONS` preflight with `Access-Control-Allow-Credentials: true`.

### GET /api/private-health

Health check for the private upstream service.

**Response (200):**
```json
{
  "ok": true,
  "selectedPrivateUrl": "http://index-private:3000",
  "attempts": [
    { "ok": true, "privateUrl": "http://index-private:3000", "status": 200, "bytes": 1234 }
  ],
  "elapsedMs": 45
}
```

**Response (502):**
```json
{
  "ok": false,
  "attempts": [
    { "ok": false, "privateUrl": "http://index-private:3000", "error": "fetch failed" }
  ],
  "elapsedMs": 120
}
```

## projects.json Schema

```typescript
interface Project {
  name: string;           // Project name (unique key for merge with private)
  description: string;    // Short description
  icon?: string;          // Path in public/icons/ (SVG, PNG, etc.)
  accent?: string;        // pink | crimson | lavender | cream | peach
  accentDark?: string;    // Optional different accent for dark theme
  tags: string[];         // Tags for filtering
  links: Link[];
}

interface Link {
  name: string;           // Service name (e.g., "Web", "API")
  url?: string;           // Single URL (clickable + copiable)
  urls?: LinkUrl[];       // Multiple URLs with labels (mutually exclusive with url)
  command?: string;       // Copiable command (e.g., CF tunnel command)
  type: string;           // Type badge (e.g., "web", "api", "docs")
  description: string;    // Service description
}

interface LinkUrl {
  label: string;          // Label (e.g., "Publica", "Interna", "Local")
  url: string;            // URL string
}
```

**Rules:**
- `url` and `urls` are mutually exclusive. If `urls` is present, `url` is ignored.
- If neither `url` nor `urls` is set, the link has no clickable URL (only `command` if present).
- URLs not starting with `http` or `rdp` get `https://` prepended automatically.
- `accent` defaults to `pink` if not set. Valid values: `pink`, `crimson`, `lavender`, `cream`, `peach`.

## Private Projects & Merge Logic

Private projects are served from a separate service (`HomeServer-IndexPrivate`). When loaded:

1. Frontend fetches `/api/private-projects`
2. Response is an array of projects in the same `Project` format
3. For each private project:
   - If a public project has the **same `name`**, private links are **appended** to that project's link grid
   - If no match exists, a **new project card** is created at the end of the grid
4. Private links get a "Privado" badge appended to their name

## Authentication Flow (Cloudflare Access)

```
1. User clicks 🔒 button
2. → GET /api/login → 302 to /?unlock=1
3. Browser loads /?unlock=1
4. Client JS detects ?unlock param → calls loadPrivateProjects(false)
5. → GET /api/private-projects (with credentials: same-origin)
6. If CF Access is required and no session:
   - Cloudflare intercepts → shows login page
   - After auth → redirects back → retry fetch
7. If CF Access not required:
   - Proxy directly to upstream → return JSON
8. Frontend renders private projects
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PRIVATE_INDEX_URL` | `http://index-private:3000` | URL of the private index service (single) |
| `PRIVATE_INDEX_URLS` | Falls back to `PRIVATE_INDEX_URL` | Comma-separated list of upstream URLs (tried in order) |
| `REQUIRE_CF_ACCESS` | `false` | If `true`, requires Cloudflare Access headers on private endpoints |
| `PORT` | `4321` | Server port |
| `HOST` | `0.0.0.0` | Bind address |

**`PRIVATE_INDEX_URLS`** accepts multiple URLs separated by comma. The proxy tries each in order and returns the first successful response. Example: `http://10.10.10.245:50834,http://index-private:3000`

## Docker

### Public only

```bash
docker build -t index-public .
docker run --rm -p 4321:4321 index-public
```

### Full stack (public + private)

Requires `HomeServer-IndexPrivate` at `../HomeServer-IndexPrivate`.

```bash
docker compose up -d --build
```

Services:
- `index-public` on `:4321` (Astro SSR)
- `index-private` on Docker internal network (API, port 3000)

## Theme

Light/dark theme via `data-theme` attribute on `<html>`. User preference stored in `localStorage("homeserver-theme")`. Defaults to `dark`.

Theme tokens in `styles/global.css` use CSS custom properties (`--ink`, `--ink-soft`, `--card-bg`, etc.).

## Gotchas

- No test framework configured — manual verification only
- Private projects require the `HomeServer-IndexPrivate` repo to be present
- `PRIVATE_INDEX_URLS` overrides `PRIVATE_INDEX_URL` (not additive)
- CORS is handled per-endpoint, not globally
- The `?unlock=1` query param triggers private project loading on page load
- Icons must be placed in `public/icons/` before referencing in `projects.json`
