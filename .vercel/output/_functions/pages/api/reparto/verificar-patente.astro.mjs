import { s as supabase } from '../../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const patente = searchParams.get("patente")?.trim().replace(/\s+/g, "").toUpperCase();
  if (!patente) {
    return new Response(JSON.stringify({ encontrada: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { data, error } = await supabase.from("patentes").select("*");
  return new Response(JSON.stringify({ patente, data, error }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
