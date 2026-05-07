import { s as supabase } from '../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ url }) => {
  const limit = parseInt(url.searchParams.get("limit") ?? "10");
  try {
    const { data, error } = await supabase.from("combos").select("cod_combo, nombre, precio, descripcion, imagen, activo").eq("activo", true).order("created_at", { ascending: false }).limit(limit);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
