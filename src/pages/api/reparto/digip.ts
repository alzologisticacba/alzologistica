import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const prerender = false;

const WMS_BASE = "http://api.patagoniawms.com/v1";
const API_KEY = import.meta.env.DIGIP_API_KEY;

function wmsHeaders() {
  return {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json",
  };
}

function errorResponse(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Whitelist de endpoints permitidos
const ALLOWED = [
  /^\/Pedidos\/PorContenedor\/[^/]+$/,
  /^\/Pedidos\/[^/]+\/Contenedores$/,
];

export const GET: APIRoute = async ({ request }) => {
  if (!API_KEY) return errorResponse("API key no configurada", 500);

  // Verificar sesión de Supabase
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return errorResponse("Sin token", 401);

  const { error: authError } = await supabase.auth.getUser(token);
  if (authError) return errorResponse(`Token inválido: ${authError.message}`, 401);

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  if (!endpoint) return errorResponse("Falta parámetro endpoint", 400);

  if (!ALLOWED.some((re) => re.test(endpoint))) {
    return errorResponse("Endpoint no permitido", 403);
  }

  try {
    const res = await fetch(`${WMS_BASE}${endpoint}`, { headers: wmsHeaders() });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return errorResponse("Error al conectar con el WMS");
  }
};
