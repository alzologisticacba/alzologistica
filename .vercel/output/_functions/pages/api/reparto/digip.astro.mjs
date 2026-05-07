import { s as supabase } from '../../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const WMS_BASE = "http://api.patagoniawms.com/v1";
const API_KEY = "a98791c3-9a27-42d4-bd6a-334ad864a708";
function wmsHeaders() {
  return {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
  };
}
function errorResponse(msg, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const ALLOWED = [
  /^\/Pedidos\/PorContenedor\/[^/]+$/,
  /^\/Pedidos\/[^/]+\/Contenedores$/,
  /^\/Clientes\/[^/]+$/
];
const GET = async ({ request }) => {
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
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return errorResponse("Error al conectar con el WMS");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
