import { s as supabase } from '../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ url }) => {
  const familia = url.searchParams.get("familia");
  try {
    let query = supabase.from("articulos").select("rubro").gt("stock", 0).order("rubro", { ascending: true });
    if (familia) query = query.ilike("familiaNombre", familia);
    const { data, error } = await query;
    if (error) {
      return new Response(
        JSON.stringify({ error: "Error al obtener rubros" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const unicos = [...new Set(data.map((r) => r.rubro))].filter(Boolean).sort();
    return new Response(JSON.stringify({ data: unicos }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" }
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
