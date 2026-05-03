# HomeServer Index Page

Indice web para encontrar rapidamente URLs de proyectos y servicios del homeserver.

## Desarrollo

```bash
pnpm install
pnpm dev
```

La app queda disponible en `http://localhost:4321`.

## Agregar URLs

Edita `src/data/projects.json` y agrega proyectos o enlaces:

```json
{
  "name": "RedTransporte",
  "description": "Servicios principales del proyecto.",
  "icon": "/icons/redtransporte.svg",
  "accent": "cyan",
  "tags": ["transporte", "produccion"],
  "links": [
    {
      "name": "API",
      "url": "https://api.example.com",
      "type": "api",
      "description": "Backend HTTP del proyecto."
    }
  ]
}
```

Los iconos locales van en `public/icons`. Pueden ser SVG, PNG o cualquier asset servido por Astro.

## Build

```bash
pnpm build
pnpm preview
```

## Docker

```bash
docker build -t homeserver-index .
docker run --rm -p 8080:80 homeserver-index
```

Con compose:

```bash
docker compose up -d --build
```

Luego puedes apuntar Cloudflared a `http://localhost:8080`.
