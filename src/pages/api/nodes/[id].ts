import type { APIRoute } from "astro";
import { verifyAccessRequest, accessErrorResponse } from "../../../lib/access";
import { getNode, updateNode, deleteNode } from "../../../lib/nodes";
import { updateNodeSchema } from "../../../lib/schemas";
import { jsonResponse, corsHeaders } from "../../../lib/http";

export const OPTIONS: APIRoute = ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
};

export const GET: APIRoute = async ({ request, params }) => {
  const access = await verifyAccessRequest(request);
  const denied = accessErrorResponse(access);
  if (denied) return denied;

  const node = await getNode(params.id!);
  if (!node) return jsonResponse({ error: "no_encontrado" }, { request, status: 404 });
  return jsonResponse(node, { request, status: 200 });
};

export const PATCH: APIRoute = async ({ request, params }) => {
  const access = await verifyAccessRequest(request);
  const denied = accessErrorResponse(access);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "json_invalido" }, { request, status: 400 });
  }

  const parsed = updateNodeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "validacion", issues: parsed.error.issues }, { request, status: 422 });
  }

  const node = await updateNode(params.id!, parsed.data);
  if (!node) return jsonResponse({ error: "no_encontrado" }, { request, status: 404 });
  return jsonResponse(node, { request, status: 200 });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const access = await verifyAccessRequest(request);
  const denied = accessErrorResponse(access);
  if (denied) return denied;

  const deleted = await deleteNode(params.id!);
  if (!deleted) return jsonResponse({ error: "no_encontrado" }, { request, status: 404 });
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};
