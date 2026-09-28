import type { APIRoute } from "astro";
import { verifyAccessRequest, accessErrorResponse } from "../../../lib/access";
import { listAllTree, createNode } from "../../../lib/nodes";
import { createNodeSchema } from "../../../lib/schemas";
import { jsonResponse, corsHeaders } from "../../../lib/http";

/**
 * GET  /api/nodes  → árbol completo (requiere Cloudflare Access).
 * POST /api/nodes  → crea un nodo (requiere Cloudflare Access).
 *
 * La vista pública NUNCA llama a este endpoint — consume el árbol ya
 * filtrado que Astro renderiza en SSR desde listPublicTree(). Ver
 * src/pages/index.astro.
 */

export const OPTIONS: APIRoute = ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
};

export const GET: APIRoute = async ({ request }) => {
  const access = await verifyAccessRequest(request);
  const denied = accessErrorResponse(access);
  if (denied) return denied;

  const tree = await listAllTree();
  return jsonResponse(tree, { request, status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  const access = await verifyAccessRequest(request);
  const denied = accessErrorResponse(access);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "json_invalido" }, { request, status: 400 });
  }

  const parsed = createNodeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "validacion", issues: parsed.error.issues }, { request, status: 422 });
  }

  const node = await createNode({
    parentId: parsed.data.parentId,
    kind: parsed.data.kind,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    visibility: parsed.data.visibility,
    url: parsed.data.url ?? null,
    commands: parsed.data.commands,
    iconKind: parsed.data.iconKind,
    iconRef: parsed.data.iconRef ?? null,
    accent: parsed.data.accent ?? null,
    tags: parsed.data.tags,
  });

  return jsonResponse(node, { request, status: 201 });
};
