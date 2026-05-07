import { f as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { $ as $$Layout247 } from '../../chunks/Layout247_DHfWtw7f.mjs';
/* empty css                                      */
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Descuentos = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout247", $$Layout247, { "title": "Descuentos Exclusivos | Alzo 24/7" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "DescuentosPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/workspace/alzologistica/src/components/247/DescuentosPage", "client:component-export": "default" })} ` })}`;
}, "C:/workspace/alzologistica/src/pages/247/descuentos.astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/247/descuentos.astro";
const $$url = "/247/descuentos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Descuentos,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
