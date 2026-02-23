// src/pages/api/familias.ts
// Devuelve los familiaNombre únicos con stock disponible
// Uso: GET /api/familias

import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from("articulos")
      .select("familiaNombre")
      .gt("stock", 0)
      .order("familiaNombre", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({ error: "Error al obtener familias" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener valores únicos en el servidor
    const unicas = [...new Set(data.map((r) => r.familiaNombre as string))]
      .filter(Boolean)
      .sort();

    return new Response(JSON.stringify({ data: unicas }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};