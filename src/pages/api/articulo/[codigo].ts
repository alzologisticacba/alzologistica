// src/pages/api/articulo/[codigo].ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ params }) => {
  const codigo = parseInt(params.codigo ?? "0");
  if (!codigo) return new Response(JSON.stringify({ error: "Código inválido" }), { status: 400, headers: { "Content-Type": "application/json" } });

  const { data, error } = await supabase
    .from("articulos")
    .select("codigo, descripcion, proveedor, rubro, precioFinal, descuento, multiplo, familiaNombre, stock, uxb")
    .eq("codigo", codigo)
    .gt("stock", 0)   // ← sin stock = no existe para la app
    .single();

  if (error || !data) return new Response(JSON.stringify({ error: "Producto no encontrado o sin stock" }), { status: 404, headers: { "Content-Type": "application/json" } });

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
};