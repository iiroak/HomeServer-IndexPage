import { jwtVerify, createRemoteJWKSet } from "jose";

/**
 * Verificación del JWT de Cloudflare Access. Defensa en profundidad:
 * `/app*` ya está (o debe estar) en el pool "Access 0" de Cloudflare, pero
 * esta capa exige un token válido en el origen — si el ingress cambiara o
 * alguien alcanzara el puerto sin pasar por Cloudflare, sigue bloqueado.
 *
 * Copiado de Fit-API/src/middleware/accessAuth.ts, con dos añadidos:
 *   1. Allowlist de emails, porque el JWT prueba identidad pero no
 *      autorización — cualquier cuenta que pase la policy de Access
 *      igual necesita estar en ALLOWED_EMAILS.
 *   2. Sin bypass de desarrollo: index-page no tiene un entorno "detrás
 *      de VPN" seguro por defecto, así que aquí NO existe el equivalente
 *      a AUTH_DISABLE_ACCESS_CHECK. En dev local, usa
 *      INDEX_PAGE_DEV_EMAIL para simular una identidad sin pasar por
 *      Cloudflare — ver verifyAccessRequest().
 *
 * IMPORTANTE: `hasCloudflareAccessHeaders` del código viejo
 * (private-projects.ts) solo comprobaba la PRESENCIA de la cabecera, sin
 * verificar la firma — falsificable por cualquiera que alcance el puerto
 * directamente. Esta función es el reemplazo real.
 */

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJwks(teamDomain: string) {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
  }
  return jwks;
}

export interface AccessIdentity {
  email: string;
}

export type AccessCheckResult =
  | { ok: true; identity: AccessIdentity }
  | { ok: false; status: 401 | 403 | 503; error: string };

function allowedEmails(): string[] {
  return (process.env.INDEX_PAGE_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function verifyAccessRequest(request: Request): Promise<AccessCheckResult> {
  // Solo para `pnpm dev` local, nunca en producción: simula una identidad
  // ya autorizada sin necesitar el túnel de Cloudflare. Si esta variable
  // está definida en Coolify, el auth real queda inutilizado — por eso
  // no debe formar parte de ninguna plantilla de env de producción.
  const devEmail = process.env.INDEX_PAGE_DEV_EMAIL;
  if (devEmail && process.env.NODE_ENV !== "production") {
    return { ok: true, identity: { email: devEmail.toLowerCase() } };
  }

  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN;
  const audience = process.env.CF_ACCESS_AUD;
  if (!teamDomain || !audience) {
    return {
      ok: false,
      status: 503,
      error: "access_no_configurado",
    };
  }

  const allowed = allowedEmails();
  if (allowed.length === 0) {
    return {
      ok: false,
      status: 503,
      error: "allowlist_no_configurada",
    };
  }

  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) {
    return { ok: false, status: 401, error: "sin_token_access" };
  }

  let email: string | undefined;
  try {
    const { payload } = await jwtVerify(token, getJwks(teamDomain), {
      audience,
      issuer: `https://${teamDomain}`,
    });
    email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
  } catch {
    return { ok: false, status: 403, error: "token_access_invalido" };
  }

  if (!email) {
    return { ok: false, status: 403, error: "token_sin_email" };
  }

  if (!allowed.includes(email)) {
    return { ok: false, status: 403, error: "email_no_autorizado" };
  }

  return { ok: true, identity: { email } };
}

/** Helper para endpoints API: devuelve la Response de error lista para retornar, o null si pasó. */
export function accessErrorResponse(result: AccessCheckResult): Response | null {
  if (result.ok) return null;
  return new Response(JSON.stringify({ error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
}
