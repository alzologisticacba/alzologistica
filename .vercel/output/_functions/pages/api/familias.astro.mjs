import { s as supabase } from '../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async () => {
  try {
    const { data, error } = await supabase.from("articulos").select("familiaNombre").gt("stock", 0).order("familiaNombre", { ascending: true });
    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({ error: "Error al obtener familias" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const unicas = [...new Set(data.map((r) => r.familiaNombre))].filter(Boolean).sort();
    return new Response(JSON.stringify({ data: unicas }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600"
      }
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
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
