// src/pages/api/buscar.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  const q     = url.searchParams.get("q")?.trim();
  const limit = parseInt(url.searchParams.get("limit") ?? "20");

  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ articulos: [], combos: [] }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }

  const [artRes, comboRes] = await Promise.all([
    supabase
      .from("articulos")
      .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
      .gt("stock", 0)                          // ← solo con stock
      .ilike("descripcion", `%${q}%`)
      .order("orden", { ascending: true })
      .limit(limit),
    supabase
      .from("combos")
      .select("cod_combo, nombre, precio, descripcion, imagen")
      .eq("activo", true)
      .ilike("nombre", `%${q}%`)
      .limit(5),
  ]);

  return new Response(
    JSON.stringify({ articulos: artRes.data ?? [], combos: comboRes.data ?? [] }),
    { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
  );
};