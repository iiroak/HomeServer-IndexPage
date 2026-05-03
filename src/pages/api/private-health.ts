import type { APIRoute } from "astro";

const PRIVATE_URLS = (process.env.PRIVATE_INDEX_URLS || process.env.PRIVATE_INDEX_URL || "http://index-private:3000")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const REQUIRE_CF_ACCESS = process.env.REQUIRE_CF_ACCESS === "true";

function hasCloudflareAccessHeaders(request: Request) {
  return Boolean(
    request.headers.get("cf-access-jwt-assertion") ||
      request.headers.get("cf-access-authenticated-user-email"),
  );
}

export const GET: APIRoute = async ({ request }) => {
  if (REQUIRE_CF_ACCESS && !hasCloudflareAccessHeaders(request)) {
    return new Response(JSON.stringify({ error: "cloudflare_access_required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const started = Date.now();
  const attempts = [];

  for (const privateUrl of PRIVATE_URLS) {
    try {
      const res = await fetch(`${privateUrl}/projects`);
      const body = await res.text();

      attempts.push({
        ok: res.ok,
        privateUrl,
        status: res.status,
        bytes: body.length,
      });

      if (res.ok) {
        return new Response(
          JSON.stringify({
            ok: true,
            selectedPrivateUrl: privateUrl,
            attempts,
            elapsedMs: Date.now() - started,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } catch (error) {
      attempts.push({
        ok: false,
        privateUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return new Response(
    JSON.stringify({
      ok: false,
      attempts,
      elapsedMs: Date.now() - started,
    }),
    {
      status: 502,
      headers: { "Content-Type": "application/json" },
    },
  );
};
