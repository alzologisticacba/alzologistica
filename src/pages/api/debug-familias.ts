// src/pages/api/debug-familias.ts — TEMPORAL
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  const familia = url.searchParams.get("familia");

  // Sin limit, trae los familiaNombre únicos reales
  const { data: todos } = await supabase
    .from("articulos")
    .select("familiaNombre")
    .gt("stock", 0);

  const familias = [...new Set(todos?.map((r) => r.familiaNombre as string) ?? [])]
    .filter(Boolean)
    .sort();

  // Si se pasa ?familia=X, muestra cuántos registros matchean
  let matchCount = null;
  if (familia) {
    const { count } = await supabase
      .from("articulos")
      .select("*", { count: "exact", head: true })
      .ilike("familiaNombre", familia);
    matchCount = count;
  }

  return new Response(
    JSON.stringify({ familias_en_bd: familias, match_con_filtro: matchCount }, null, 2),
    { headers: { "Content-Type": "application/json" } }
  );
};