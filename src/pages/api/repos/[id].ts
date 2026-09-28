import type { APIRoute } from "astro";
import { verifyAccessRequest, accessErrorResponse } from "../../../lib/access";
import { getRepo, updateRepo, deleteRepo } from "../../../lib/repos";
import { updateRepoSchema } from "../../../lib/schemas";
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

  const repo = await getRepo(params.id!);
  if (!repo) return jsonResponse({ error: "no_encontrado" }, { request, status: 404 });
  return jsonResponse(repo, { request, status: 200 });
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

  const parsed = updateRepoSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "validacion", issues: parsed.error.issues }, { request, status: 422 });
  }

  const repo = await updateRepo(params.id!, parsed.data);
  if (!repo) return jsonResponse({ error: "no_encontrado" }, { request, status: 404 });
  return jsonResponse(repo, { request, status: 200 });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const access = await verifyAccessRequest(request);
  const denied = accessErrorResponse(access);
  if (denied) return denied;

  const deleted = await deleteRepo(params.id!);
  if (!deleted) return jsonResponse({ error: "no_encontrado" }, { request, status: 404 });
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};
