import { f as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { $ as $$Layout247 } from '../../chunks/Layout247_DHfWtw7f.mjs';
/* empty css                                      */
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout247", $$Layout247, { "title": "Combo | Alzo 24/7" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ComboDetalle", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/workspace/alzologistica/src/components/247/ComboDetalle", "client:component-export": "default" })} ` })}`;
}, "C:/workspace/alzologistica/src/pages/247/combo/index.astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/247/combo/index.astro";
const $$url = "/247/combo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
