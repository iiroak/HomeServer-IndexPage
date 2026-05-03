import type { APIRoute } from "astro";

const PRIVATE_URL = (process.env.PRIVATE_INDEX_URL || "http://index-private:3000").replace(/\/$/, "");

export const GET: APIRoute = async () => {
  const started = Date.now();

  try {
    const res = await fetch(`${PRIVATE_URL}/projects`);
    const body = await res.text();

    return new Response(
      JSON.stringify({
        ok: res.ok,
        privateUrl: PRIVATE_URL,
        status: res.status,
        bytes: body.length,
        elapsedMs: Date.now() - started,
      }),
      {
        status: res.ok ? 200 : 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        privateUrl: PRIVATE_URL,
        error: error instanceof Error ? error.message : String(error),
        elapsedMs: Date.now() - started,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
