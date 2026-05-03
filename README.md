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
    }
  ]
}
```

Campos:
- `url` — una sola URL (clickable + copiable).
- `urls` — varias URLs con label (ej: Publica, Interna, Local).
- `command` — comando copiable (ej: tunnel Cloudflare).
- `icon` — ruta en `public/icons/`. SVG, PNG, etc.
- `accent` — pink | crimson | lavender | cream | peach. Define `accentDark` para tema oscuro.

Los iconos van en `public/icons/`.

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
- `index-private` en red interna (API privada)

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

El boton 🔒 en la UI llama a `/api/private-projects` que:
- Redirige a login Cloudflare si no hay sesion.
- Responde JSON privado si esta autenticado.
- El frontend renderiza los proyectos privados en la misma grilla.

## Variables de entorno

| Variable | Default | Descripcion |
|---|---|---|
| `PRIVATE_INDEX_URL` | `http://index-private:3000` | URL del servicio privado |
| `PORT` | `4321` | Puerto del servidor |
| `HOST` | `0.0.0.0` | Host bind |

## Licencia

CC BY-NC 4.0 — No comercial, requiere atribucion al proyecto original.
