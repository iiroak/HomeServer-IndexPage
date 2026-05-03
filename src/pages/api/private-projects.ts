import type { APIRoute } from "astro";

const PRIVATE_URLS = (process.env.PRIVATE_INDEX_URLS || process.env.PRIVATE_INDEX_URL || "http://10.10.10.245:50834,http://index-private:3000")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const REQUIRE_CF_ACCESS = (process.env.REQUIRE_CF_ACCESS || "false") === "true";

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

  const errors: Array<{ privateUrl: string; message: string; status?: number }> = [];

  for (const privateUrl of PRIVATE_URLS) {
    try {
      const res = await fetch(`${privateUrl}/projects`);

      if (!res.ok) {
        errors.push({ privateUrl, message: `upstream returned ${res.status}`, status: res.status });
        continue;
      }

      const raw = await res.text();
      const data = JSON.parse(raw);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      errors.push({ privateUrl, message: error instanceof Error ? error.message : String(error) });
    }
  }

  console.error("[private-projects] all upstreams failed", errors);
  return new Response(JSON.stringify({ error: "private_upstream_unreachable", attempts: errors }), {
    status: 502,
    headers: { "Content-Type": "application/json" },
  });
};
