# Index · paginas de iroak

Indice web para encontrar rapidamente URLs y comandos de proyectos, con soporte publico/privado via Cloudflare Access.

**Stack:** Astro SSR + TailwindCSS v4 + pnpm + Docker

---

## Desarrollo

```bash
pnpm install
pnpm dev
```

Disponible en `http://localhost:4321`.

## Build

```bash
pnpm build
pnpm preview
```

## API

| Endpoint | Metodo | Descripcion |
|---|---|---|
| `/` | GET | Pagina principal (SSR render de projects.json) |
| `/api/login` | GET | Redirect 302 a `/?unlock=1` (dispara carga de privados) |
| `/api/private-projects` | GET | Proxy al servicio privado, retorna JSON array de proyectos |
| `/api/private-health` | GET | Health check del upstream privado |

### Ejemplo: GET /api/private-projects

```json
[
  {
    "name": "ProyectoPrivado",
    "description": "...",
    "icon": "/icons/name.svg",
    "accent": "pink",
    "tags": ["privado"],
    "links": [
      {
        "name": "API",
        "url": "https://internal.example.com",
        "type": "api",
        "description": "API interna."
      }
    ]
  }
]
```

### Ejemplo: GET /api/private-health

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

## Agregar URLs publicas

Edita `src/data/projects.json`:

```json
{
  "name": "RedTransporte",
  "description": "Servicios del proyecto.",
  "icon": "/icons/redtransporte.svg",
  "accent": "pink",
  "tags": ["transporte"],
  "links": [
    {
      "name": "Web App",
      "url": "https://redtransporte.example.com",
      "type": "web",
      "description": "Frontend principal."
    },
    {
      "name": "API",
      "urls": [
        { "label": "Publica", "url": "https://api.example.com" },
        { "label": "Interna", "url": "192.168.1.200:8080" }
      ],
      "type": "api",
      "description": "Backend HTTP."
    },
    {
      "name": "Tunnel",
      "command": "cloudflared tunnel run redtransporte",
      "type": "tunnel",
      "description": "Comando para iniciar el tunnel."
    }
  ]
}
```

### Campos del schema

| Campo | Requerido | Descripcion |
|---|---|---|
| `name` | Si | Nombre del proyecto (clave para merge con privados) |
| `description` | Si | Descripcion corta |
| `icon` | No | Ruta en `public/icons/` (SVG, PNG, etc.) |
| `accent` | No | `pink` \| `crimson` \| `lavender` \| `cream` \| `peach` (default: `pink`) |
| `accentDark` | No | Accent alternario para tema oscuro |
| `tags` | Si | Array de tags para filtrado |
| `links` | Si | Array de servicios/URLs |

### Link fields

| Campo | Descripcion |
|---|---|
| `name` | Nombre del servicio |
| `url` | Una sola URL (clickable + copiable) |
| `urls` | Varias URLs con label (mutuamente exclusivo con `url`) |
| `command` | Comando copiable (ej: tunnel CF) |
| `type` | Tipo para badge y filtrado (web, api, docs, etc.) |
| `description` | Descripcion del servicio |

- `url` y `urls` son mutuamente exclusivos. Si hay `urls`, se ignora `url`.
- URLs que no empiezan con `http` ni `rdp` reciben `https://` automaticamente.
- Los iconos van en `public/icons/`.

## Arquitectura

```
Browser
  │
  ├── GET /                    → SSR render de projects.json
  │
  ├── Click boton              → GET /api/login → 302 a /?unlock=1
  │                               (dispara CF Access auth si REQUIRE_CF_ACCESS=true)
  │
  └── GET /api/private-projects → Proxy a PRIVATE_INDEX_URL(s)
                                   → GET {upstream}/projects
                                   → Retorna JSON array de proyectos privados
                                   → Frontend mergea en la grilla existente
```

### Merge de proyectos privados

- Si un proyecto privado tiene el mismo `name` que uno publico, los links se **agregan** a la card existente.
- Si no hay match, se crea una **nueva card** al final de la grilla.
- Los links privados reciben un badge "Privado".

## Docker

### Solo el servicio publico

```bash
docker build -t index-public .
docker run --rm -p 4321:4321 index-public
```

### Stack completo (publico + privado)

Requiere el repo privado `HomeServer-IndexPrivate` en `../HomeServer-IndexPrivate`.

```bash
docker compose up -d --build
```

Esto levanta:
- `index-public` en `:4321` (Astro SSR)
- `index-private` en red interna (API privada, puerto 3000)

```yaml
# docker-compose.yaml
services:
  index-public:
    build: .
    ports: ["4321:4321"]
    environment:
      PRIVATE_INDEX_URL: http://index-private:3000

  index-private:
    build: ../HomeServer-IndexPrivate
    expose: ["3000"]
```

## Cloudflare Access

Proteger `index.iroak.dev/api/*` con Cloudflare Access (OTP email / Google login).

El boton en la UI llama a `/api/private-projects` que:
- Redirige a login Cloudflare si no hay sesion.
- Responde JSON privado si esta autenticado.
- El frontend renderiza los proyectos privados en la misma grilla.

## Variables de entorno

| Variable | Default | Descripcion |
|---|---|---|
| `PRIVATE_INDEX_URL` | `http://index-private:3000` | URL del servicio privado (single) |
| `PRIVATE_INDEX_URLS` | (fallback a PRIVATE_INDEX_URL) | URLs separadas por coma (tried in order) |
| `REQUIRE_CF_ACCESS` | `false` | Si `true`, exige headers CF Access en endpoints privados |
| `PORT` | `4321` | Puerto del servidor |
| `HOST` | `0.0.0.0` | Host bind |

`PRIVATE_INDEX_URLS` acepta multiples URLs separadas por coma. El proxy intenta cada una en orden y retorna la primera respuesta exitosa. Ejemplo: `http://10.10.10.245:50834,http://index-private:3000`

## Licencia

CC BY-NC 4.0 — No comercial, requiere atribucion al proyecto original.
