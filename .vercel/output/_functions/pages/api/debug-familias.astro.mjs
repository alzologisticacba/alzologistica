import { s as supabase } from '../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  const familia = url.searchParams.get("familia");
  const { data: todos } = await supabase.from("articulos").select("familiaNombre").gt("stock", 0);
  const familias = [...new Set(todos?.map((r) => r.familiaNombre) ?? [])].filter(Boolean).sort();
  let matchCount = null;
  if (familia) {
    const { count } = await supabase.from("articulos").select("*", { count: "exact", head: true }).ilike("familiaNombre", familia);
    matchCount = count;
  }
  return new Response(
    JSON.stringify({ familias_en_bd: familias, match_con_filtro: matchCount }, null, 2),
    { headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
