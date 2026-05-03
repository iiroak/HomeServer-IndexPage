import type { APIRoute } from "astro";

const PRIVATE_URL = process.env.PRIVATE_INDEX_URL || "http://index-private:3000";

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(`${PRIVATE_URL}/projects`);

    if (!res.ok) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
