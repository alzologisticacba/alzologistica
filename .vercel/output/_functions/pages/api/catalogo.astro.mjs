import { s as supabase } from '../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ url }) => {
  const proveedor = url.searchParams.get("proveedor");
  const q = url.searchParams.get("q")?.trim();
  try {
    let query = supabase.from("articulos").select("codigo, descripcion, proveedor, rubro, familiaNombre, orden", { count: "exact" }).order("proveedor", { ascending: true }).order("orden", { ascending: true });
    if (proveedor) query = query.ilike("proveedor", proveedor);
    if (q) query = query.ilike("descripcion", `%${q}%`);
    const { data, error, count } = await query;
    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    const proveedores = Array.from(
      new Set((data ?? []).map((a) => a.proveedor).filter(Boolean))
    ).sort();
    return new Response(
      JSON.stringify({ data, proveedores, total: count ?? 0 }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120"
        }
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
