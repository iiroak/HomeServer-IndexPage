import type { APIRoute } from "astro";
import { verifyAccessRequest, accessErrorResponse } from "../../../lib/access";
import { reorderNodes } from "../../../lib/nodes";
import { reorderNodesSchema } from "../../../lib/schemas";
import { jsonResponse, corsHeaders } from "../../../lib/http";

export const OPTIONS: APIRoute = ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
};

/** POST /api/nodes/reorder — recibe la lista completa de IDs hermanos en el nuevo orden. */
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

  const parsed = reorderNodesSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "validacion", issues: parsed.error.issues }, { request, status: 422 });
  }

  await reorderNodes(parsed.data.orderedIds);
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};
