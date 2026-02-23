// src/pages/api/rubros.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  const familia = url.searchParams.get("familia");

  try {
    let query = supabase
      .from("articulos")
      .select("rubro")
      .gt("stock", 0)
      .order("rubro", { ascending: true });

    if (familia) query = query.ilike("familiaNombre", familia);

    const { data, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: "Error al obtener rubros" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const unicos = [...new Set(data.map((r) => r.rubro as string))]
      .filter(Boolean)
      .sort();

    return new Response(JSON.stringify({ data: unicos }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};