import { s as supabase } from '../../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async () => {
  const { data, error } = await supabase.from("repartidores").select("repartidor").order("repartidor", { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
