// src/pages/api/auth-vencimientos.ts
// Valida el código contra la tabla "vendedores" en el servidor.
// Nunca se exponen los códigos válidos al cliente.
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const headers = { "Content-Type": "application/json" };

  let body: { codigo?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers });
  }

  const codigo = String(body.codigo ?? "").trim();
  if (!codigo) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers });
  }

  const codigoNum = Number(codigo);
  if (isNaN(codigoNum)) {
    return new Response(JSON.stringify({ ok: false }), { status: 401, headers });
  }

  const { data, error } = await supabase
    .from("vendedores")
    .select("nombre")
    .eq("codigoVendedor", codigoNum)
    .maybeSingle();

  if (error || !data) {
    return new Response(JSON.stringify({ ok: false }), { status: 401, headers });
  }

  return new Response(JSON.stringify({ ok: true, nombre: data.nombre }), {
    status: 200,
    headers,
  });
};
