// src/pages/api/catalogo.ts
// Catálogo digital: todos los productos sin importar el stock, sin precios
export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  const proveedor = url.searchParams.get("proveedor");
  const q         = url.searchParams.get("q")?.trim();

  try {
    let query = supabase
      .from("articulos")
      .select("codigo, descripcion, proveedor, rubro, familiaNombre, orden", { count: "exact" })
      .order("proveedor", { ascending: true })
      .order("orden",     { ascending: true });

    if (proveedor) query = query.ilike("proveedor", proveedor);
    if (q)         query = query.ilike("descripcion", `%${q}%`);

    const { data, error, count } = await query;

    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });

    // Lista única de proveedores (para el filtro)
    const proveedores = Array.from(
      new Set((data ?? []).map((a) => a.proveedor).filter(Boolean))
    ).sort() as string[];

    return new Response(
      JSON.stringify({ data, proveedores, total: count ?? 0 }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120",
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
