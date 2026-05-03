import type { APIRoute } from "astro";

const PRIVATE_URL = (process.env.PRIVATE_INDEX_URL || "http://index-private:3000").replace(/\/$/, "");

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(`${PRIVATE_URL}/projects`);

    if (!res.ok) {
      console.error(`[private-projects] upstream returned ${res.status} from ${PRIVATE_URL}/projects`);
      return new Response(JSON.stringify({ error: "private_upstream_bad_status", status: res.status }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const raw = await res.text();
    const data = JSON.parse(raw);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[private-projects] ${message}`);
    return new Response(JSON.stringify({ error: "private_upstream_unreachable", message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};
