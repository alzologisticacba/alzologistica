import { f as createComponent, r as renderTemplate, h as addAttribute, m as maybeRenderHead, k as renderComponent } from '../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BM4j09F7.mjs';
import 'clsx';
/* empty css                                       */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$ClientLookup = createComponent(($$result, $$props, $$slots) => {
  const base = "/";
  return renderTemplate(_a || (_a = __template(["", '<header class="top-nav"> <div class="top-nav-inner"> <nav class="top-nav-links"> <a', ">Alzo</a> <a", ">Clientes</a> <a", ">Conecta</a> <a", '>Contacto</a> </nav> </div> </header> <div class="login-box"> <div class="icon"></div> <h2>¿Cuándo Llegamos?</h2> <img', ' alt="Cuando llegamos" class="client-card-img"> <div class="input-group"> <input type="text" id="codigo" placeholder="Código de Cliente"> </div> <div class="ayuda-cliente"> <i class="fas fa-circle-info"></i> <a', ' target="_blank">¿Cómo conocer mi número de cliente?</a> </div> <button id="btn-consultar" type="button">Consultar</button> <div id="resultado"></div> </div> <script type="module"', "></script>"])), maybeRenderHead(), addAttribute(`${"/"}`, "href"), addAttribute(`${"/"}#clientes`, "href"), addAttribute(`${"/"}#conecta`, "href"), addAttribute(`${"/"}#contacto`, "href"), addAttribute(`${base}img/cuandollegamos.png`, "src"), addAttribute(`${base}img/nrocliente.jpg`, "href"), addAttribute(`${base}js/consultarDatos.js`, "src"));
}, "C:/workspace/alzologistica/src/components/ClientLookup.astro", void 0);

const $$SoyCliente = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Alzo \xB7 Soy cliente" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="soy-cliente-page"> ${renderComponent($$result2, "ClientLookup", $$ClientLookup, {})} </section> ` })}`;
}, "C:/workspace/alzologistica/src/pages/soy-cliente.astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/soy-cliente.astro";
const $$url = "/soy-cliente";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SoyCliente,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
