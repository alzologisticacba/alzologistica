import { s as supabase } from '../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  const familia = url.searchParams.get("familia");
  const rubro = url.searchParams.get("rubro");
  const q = url.searchParams.get("q")?.trim();
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "40");
  const offset = (page - 1) * limit;
  try {
    let query = supabase.from("articulos").select(
      "codigo, descripcion, proveedor, rubro, precioFinal, descuento, multiplo, familiaNombre, stock",
      { count: "exact" }
    ).gt("stock", 0).order("orden", { ascending: true });
    if (familia) query = query.ilike("familiaNombre", familia);
    if (rubro) query = query.ilike("rubro", rubro);
    if (q) query = query.ilike("descripcion", `%${q}%`);
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    return new Response(
      JSON.stringify({
        data,
        meta: { total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
