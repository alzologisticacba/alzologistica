// src/pages/api/combo/[cod_combo].ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ params }) => {
  const cod_combo = params.cod_combo;
  if (!cod_combo) return new Response(JSON.stringify({ error: "Código inválido" }), { status: 400, headers: { "Content-Type": "application/json" } });

  const [comboRes, detallesRes] = await Promise.all([
    supabase.from("combos").select("cod_combo, nombre, precio, descripcion, imagen, activo").eq("cod_combo", cod_combo).single(),
    supabase.from("detalles_combos").select("id, productos, cantidad, descuentos, grupo").eq("detalle_combo", cod_combo).order("grupo", { ascending: true }),
  ]);

  if (comboRes.error || !comboRes.data) return new Response(JSON.stringify({ error: "Combo no encontrado" }), { status: 404, headers: { "Content-Type": "application/json" } });

  const detalles = detallesRes.data ?? [];

  // Obtener los codigos únicos para buscar nombres en articulos
  const codigos = [...new Set(detalles.map(d => d.productos).filter(Boolean))];

  let articulosMap: Record<string, string> = {};
  if (codigos.length > 0) {
    const { data: arts } = await supabase
      .from("articulos")
      .select("codigo, descripcion")
      .in("codigo", codigos.map(c => parseInt(c)));

    if (arts) {
      articulosMap = Object.fromEntries(arts.map(a => [String(a.codigo), a.descripcion]));
    }
  }

  // Enriquecer detalles con el nombre
  const detallesEnriquecidos = detalles.map(d => ({
    ...d,
    nombre: articulosMap[String(d.productos)] ?? null,
  }));

  return new Response(
    JSON.stringify({ data: { ...comboRes.data, detalles: detallesEnriquecidos } }),
    { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } }
  );
};