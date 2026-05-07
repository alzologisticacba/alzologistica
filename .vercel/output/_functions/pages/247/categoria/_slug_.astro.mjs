import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { $ as $$Layout247 } from '../../../chunks/Layout247_DHfWtw7f.mjs';
/* empty css                                         */
/* empty css                                        */
import { s as supabase } from '../../../chunks/supabase_Vzda_zB7.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://alzologistica.com");
async function getStaticPaths() {
  const { data } = await supabase.from("articulos").select("familiaNombre").gt("stock", 0);
  const familias = [...new Set(data?.map((r) => r.familiaNombre) ?? [])].filter(Boolean);
  return familias.map((familia) => ({
    params: { slug: familia.toLowerCase().replace(/\s+/g, "-") },
    props: { familia, titulo: familia }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { familia, titulo } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Layout247", $$Layout247, { "title": `${titulo} | Alzo 24/7` }, { "default": async ($$result2) => renderTemplate`  ${renderComponent($$result2, "CategoryPage", null, { "familia": familia, "titulo": titulo, "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/workspace/alzologistica/src/components/247/CategoryPage", "client:component-export": "default" })} ` })}`;
}, "C:/workspace/alzologistica/src/pages/247/categoria/[slug].astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/247/categoria/[slug].astro";
const $$url = "/247/categoria/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
