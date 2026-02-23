// src/pages/api/descuentos.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  const limit = parseInt(url.searchParams.get("limit") ?? "10");
  const q     = url.searchParams.get("q")?.trim();

  let query = supabase
    .from("articulos")
    .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
    .gt("stock", 0)       // ← solo con stock
    .gt("descuento", 0)
    .order("descuento", { ascending: false })
    .limit(limit);

  if (q) query = query.ilike("descripcion", `%${q}%`);

  const { data, error } = await query;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
};