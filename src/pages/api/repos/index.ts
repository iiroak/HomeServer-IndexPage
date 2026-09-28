import type { APIRoute } from "astro";
import { verifyAccessRequest, accessErrorResponse } from "../../../lib/access";
import { listRepos, createRepo } from "../../../lib/repos";
import { createRepoSchema } from "../../../lib/schemas";
import { jsonResponse, corsHeaders } from "../../../lib/http";

/**
 * Repos de referencia a GitHub — pegados a mano por el usuario (nombre,
 * descripción, icono, URL). NO hay sincronización automática con la API
 * de GitHub: es deliberado, cada entrada es una decisión manual de qué
 * repo vale la pena tener a mano.
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

  const repos = await listRepos();
  return jsonResponse(repos, { request, status: 200 });
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

  const parsed = createRepoSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "validacion", issues: parsed.error.issues }, { request, status: 422 });
  }

  const repo = await createRepo({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    iconKind: parsed.data.iconKind,
    iconRef: parsed.data.iconRef ?? null,
    githubUrl: parsed.data.githubUrl,
    pinned: parsed.data.pinned,
  });

  return jsonResponse(repo, { request, status: 201 });
};
