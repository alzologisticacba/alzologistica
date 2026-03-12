// src/pages/api/vencimientos.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const q    = url.searchParams.get("q")?.trim();
  const area = url.searchParams.get("area")?.trim();

  try {
    let query = supabase
      .from("vencimientos")
      .select(`CodigoArticulo, Area, Ubicacion, FechaVencimiento, "Dias para vencer", Cantidad, Descripcion`)
      .order("Dias para vencer", { ascending: true });

    if (area)  query = query.ilike("Area", area);
    if (q)     query = query.or(
      `Descripcion.ilike.%${q}%,CodigoArticulo::text.ilike.%${q}%,Ubicacion.ilike.%${q}%`
    );

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
