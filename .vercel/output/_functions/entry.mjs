import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_djD4UBHv.mjs';
import { manifest } from './manifest_CQbUJ-gf.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/247/carrito.astro.mjs');
const _page2 = () => import('./pages/247/categoria/_slug_.astro.mjs');
const _page3 = () => import('./pages/247/combo.astro.mjs');
const _page4 = () => import('./pages/247/combos.astro.mjs');
const _page5 = () => import('./pages/247/descuentos.astro.mjs');
const _page6 = () => import('./pages/247/mayorista.astro.mjs');
const _page7 = () => import('./pages/247/pedidos.astro.mjs');
const _page8 = () => import('./pages/247/producto.astro.mjs');
const _page9 = () => import('./pages/247/seccion.astro.mjs');
const _page10 = () => import('./pages/247/todos.astro.mjs');
const _page11 = () => import('./pages/247/ultimo-pedido.astro.mjs');
const _page12 = () => import('./pages/247/vistos.astro.mjs');
const _page13 = () => import('./pages/247.astro.mjs');
const _page14 = () => import('./pages/api/articulos.astro.mjs');
const _page15 = () => import('./pages/api/buscar.astro.mjs');
const _page16 = () => import('./pages/api/catalogo.astro.mjs');
const _page17 = () => import('./pages/api/combos.astro.mjs');
const _page18 = () => import('./pages/api/debug-familias.astro.mjs');
const _page19 = () => import('./pages/api/descuentos.astro.mjs');
const _page20 = () => import('./pages/api/familias.astro.mjs');
const _page21 = () => import('./pages/api/reparto/digip.astro.mjs');
const _page22 = () => import('./pages/api/reparto/repartidores.astro.mjs');
const _page23 = () => import('./pages/api/reparto/verificar-patente.astro.mjs');
const _page24 = () => import('./pages/api/rubros.astro.mjs');
const _page25 = () => import('./pages/api/vencimientos/digip.astro.mjs');
const _page26 = () => import('./pages/catalogo.astro.mjs');
const _page27 = () => import('./pages/condiciones-del-servicio.astro.mjs');
const _page28 = () => import('./pages/politicas-de-privacidad.astro.mjs');
const _page29 = () => import('./pages/reparto.astro.mjs');
const _page30 = () => import('./pages/soy-cliente.astro.mjs');
const _page31 = () => import('./pages/vencimientos.astro.mjs');
const _page32 = () => import('./pages/vendedores.astro.mjs');
const _page33 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/247/carrito.astro", _page1],
    ["src/pages/247/categoria/[slug].astro", _page2],
    ["src/pages/247/combo/index.astro", _page3],
    ["src/pages/247/combos.astro", _page4],
    ["src/pages/247/descuentos.astro", _page5],
    ["src/pages/247/mayorista.astro", _page6],
    ["src/pages/247/pedidos.astro", _page7],
    ["src/pages/247/producto/index.astro", _page8],
    ["src/pages/247/seccion/index.astro", _page9],
    ["src/pages/247/todos.astro", _page10],
    ["src/pages/247/ultimo-pedido/index.astro", _page11],
    ["src/pages/247/vistos/index.astro", _page12],
    ["src/pages/247/index.astro", _page13],
    ["src/pages/api/articulos.ts", _page14],
    ["src/pages/api/buscar.ts", _page15],
    ["src/pages/api/catalogo.ts", _page16],
    ["src/pages/api/combos.ts", _page17],
    ["src/pages/api/debug-familias.ts", _page18],
    ["src/pages/api/descuentos.ts", _page19],
    ["src/pages/api/familias.ts", _page20],
    ["src/pages/api/reparto/digip.ts", _page21],
    ["src/pages/api/reparto/repartidores.ts", _page22],
    ["src/pages/api/reparto/verificar-patente.ts", _page23],
    ["src/pages/api/rubros.ts", _page24],
    ["src/pages/api/vencimientos/digip.ts", _page25],
    ["src/pages/catalogo/index.astro", _page26],
    ["src/pages/condiciones-del-servicio.html", _page27],
    ["src/pages/politicas-de-privacidad.html", _page28],
    ["src/pages/reparto/index.astro", _page29],
    ["src/pages/soy-cliente.astro", _page30],
    ["src/pages/vencimientos/index.astro", _page31],
    ["src/pages/vendedores.html", _page32],
    ["src/pages/index.astro", _page33]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "5c0fa7f5-ad4d-4e04-95c1-849e7c5a0eba",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
