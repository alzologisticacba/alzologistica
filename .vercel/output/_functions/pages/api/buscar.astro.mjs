import { s as supabase } from '../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ url }) => {
  const q = url.searchParams.get("q")?.trim();
  const limit = parseInt(url.searchParams.get("limit") ?? "20");
  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ articulos: [], combos: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const [artRes, comboRes] = await Promise.all([
    supabase.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).ilike("descripcion", `%${q}%`).order("orden", { ascending: true }).limit(limit),
    supabase.from("combos").select("cod_combo, nombre, precio, descripcion, imagen").eq("activo", true).ilike("nombre", `%${q}%`).limit(5)
  ]);
  return new Response(
    JSON.stringify({ articulos: artRes.data ?? [], combos: comboRes.data ?? [] }),
    { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
