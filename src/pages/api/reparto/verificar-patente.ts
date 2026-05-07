export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const patente = searchParams.get("patente")?.trim().replace(/\s+/g, "").toUpperCase();

  if (!patente) {
    return new Response(JSON.stringify({ encontrada: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("patentes")
    .select("*");

  return new Response(JSON.stringify({ patente, data, error }), {
    headers: { "Content-Type": "application/json" },
  });
};
