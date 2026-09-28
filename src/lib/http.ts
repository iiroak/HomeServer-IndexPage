/**
 * Allowlist de CORS. El código anterior (private-projects.ts) reflejaba
 * el `Origin` de la petición sin validar, combinado con
 * `Access-Control-Allow-Credentials: true` — cualquier origen podía leer
 * la respuesta con credenciales. Aquí solo se permite el propio dominio
 * más `localhost` en dev.
 */
function allowedOrigins(): string[] {
  const site = process.env.SITE || "https://index.iroak.dev";
  return [site, "http://localhost:4321"];
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins();
  const headers: Record<string, string> = {};
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

export function jsonResponse(data: unknown, init: ResponseInit & { request: Request }): Response {
  const { request, ...rest } = init;
  return new Response(JSON.stringify(data), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
      ...rest.headers,
    },
  });
}
