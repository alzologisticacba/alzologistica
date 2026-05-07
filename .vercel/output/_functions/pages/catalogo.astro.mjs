import { f as createComponent, l as renderHead, k as renderComponent, o as renderScript, r as renderTemplate } from '../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { s as supabaseClient } from '../chunks/supabaseClient_Ou7rw0NR.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const MARCAS_IMG = "/img/247/MarcasMayorista";
const PROD_IMG = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";
function MarcaImg({ marca }) {
  const pascal = marca.charAt(0).toUpperCase() + marca.slice(1);
  const [src, setSrc] = useState(`${MARCAS_IMG}/${marca}.png`);
  const [failed, setFailed] = useState(false);
  if (failed) return /* @__PURE__ */ jsx("span", { className: "cat-nav__fallback", children: pascal });
  return /* @__PURE__ */ jsx(
    "img",
    {
      src,
      alt: marca,
      className: "cat-nav__logo",
      onError: () => {
        if (src !== `${MARCAS_IMG}/${pascal}.png`) {
          setSrc(`${MARCAS_IMG}/${pascal}.png`);
        } else {
          setFailed(true);
        }
      }
    }
  );
}
function ProductImg({ codigo }) {
  const [error, setError] = useState(false);
  if (error) return /* @__PURE__ */ jsx("div", { className: "cat-card__placeholder", children: /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "36",
      height: "36",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.2",
      style: { opacity: 0.2 },
      children: [
        /* @__PURE__ */ jsx("rect", { x: "2", y: "7", width: "20", height: "14", rx: "2" }),
        /* @__PURE__ */ jsx("path", { d: "M16 7V5a2 2 0 0 0-4 0v2" })
      ]
    }
  ) });
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: `${PROD_IMG}/${codigo}.png`,
      alt: "",
      className: "cat-card__img",
      onError: () => setError(true),
      loading: "lazy"
    }
  );
}
function CatalogoPage() {
  const [marcas, setMarcas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [articulos, setArticulos] = useState([]);
  const [loadingMarcas, setLoadingMarcas] = useState(true);
  const [loadingProds, setLoadingProds] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY * 3;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  useEffect(() => {
    let cancelled = false;
    supabaseClient.from("Marcas").select("marca, descripcion").order("marca", { ascending: true }).then(({ data }) => {
      if (cancelled) return;
      const seen = /* @__PURE__ */ new Set();
      const unique = [];
      for (const row of data ?? []) {
        const key = row.marca.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push({ codigo: 0, descripcion: row.descripcion, marca: row.marca });
      }
      for (let i = unique.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unique[i], unique[j]] = [unique[j], unique[i]];
      }
      setMarcas(unique);
      if (unique.length > 0) setSelected(unique[0]);
      setLoadingMarcas(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoadingProds(true);
    supabaseClient.from("Marcas").select("codigo").eq("marca", selected.marca).then(({ data: codigosData }) => {
      if (cancelled) return;
      const codigos = (codigosData ?? []).map((r) => r.codigo);
      if (codigos.length === 0) {
        setArticulos([]);
        setLoadingProds(false);
        return;
      }
      supabaseClient.from("articulos").select("codigo, descripcion, uxb").in("codigo", codigos).order("descripcion", { ascending: true }).then(({ data }) => {
        if (cancelled) return;
        setArticulos(data ?? []);
        setLoadingProds(false);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [selected?.marca]);
  useEffect(() => {
    if (!selected || !scrollRef.current) return;
    const container = scrollRef.current;
    const el = container.querySelector(
      `[data-marca="${selected.marca}"]`
    );
    if (!el) return;
    const scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [selected?.marca]);
  if (loadingMarcas) return /* @__PURE__ */ jsxs("div", { className: "cat-loading", children: [
    /* @__PURE__ */ jsx("div", { className: "cat-spinner" }),
    /* @__PURE__ */ jsx("span", { children: "Cargando..." })
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("nav", { className: "cat-nav", children: /* @__PURE__ */ jsx("div", { className: "cat-nav__scroll", ref: scrollRef, children: marcas.map((m) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "data-marca": m.marca,
        className: `cat-nav__item${selected?.marca === m.marca ? " active" : ""}`,
        onClick: () => setSelected(m),
        children: /* @__PURE__ */ jsx(MarcaImg, { marca: m.marca })
      },
      m.marca
    )) }) }),
    /* @__PURE__ */ jsxs("div", { className: "cat-prods-wrap", style: { position: "relative" }, children: [
      loadingProds && /* @__PURE__ */ jsx("div", { className: "cat-prods-overlay", children: /* @__PURE__ */ jsx("div", { className: "cat-spinner" }) }),
      !loadingProds && articulos.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "cat-empty", children: [
        /* @__PURE__ */ jsx("span", { children: "📦" }),
        /* @__PURE__ */ jsx("span", { children: "Sin productos para esta marca." })
      ] }) : /* @__PURE__ */ jsx("div", { className: `cat-grid${loadingProds ? " cat-grid--loading" : ""}`, children: articulos.map((a) => /* @__PURE__ */ jsxs("article", { className: "cat-card", children: [
        /* @__PURE__ */ jsx("div", { className: "cat-card__img-wrap", children: /* @__PURE__ */ jsx(ProductImg, { codigo: a.codigo }) }),
        /* @__PURE__ */ jsxs("div", { className: "cat-card__info", children: [
          /* @__PURE__ */ jsx("p", { className: "cat-card__desc", children: a.descripcion }),
          a.uxb != null && /* @__PURE__ */ jsxs("span", { className: "cat-card__uxb", children: [
            "UxB: ",
            a.uxb
          ] })
        ] })
      ] }, a.codigo)) })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Catálogo ALZO</title><meta name="description" content="Catálogo de todos los productos de Alzo"><link rel="icon" type="image/png" href="/img/alzo_logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">${renderHead()}</head> <body class="cat-body"> <!-- ═══ HERO ═══ --> <section class="cat-hero"> <div class="cat-hero__inner"> <img src="/logos/alzo_logo.png" alt="Alzo" class="cat-hero__logo" width="793" height="334" fetchpriority="high" loading="eager"> <p class="cat-hero__subtitle">CATÁLOGO DE PRODUCTOS</p> <a href="#productos" class="cat-hero__cta"> <span>Mirá nuestros productos</span> <svg class="cat-hero__cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M12 5v14M5 12l7 7 7-7"></path> </svg> </a> </div> </section> <!-- ═══ PRODUCTOS ═══ --> <section id="productos" class="cat-productos"> ${renderComponent($$result, "CatalogoBody", CatalogoPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/workspace/alzologistica/src/components/catalogo/CatalogoPage", "client:component-export": "default" })} </section> ${renderScript($$result, "C:/workspace/alzologistica/src/pages/catalogo/index.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "C:/workspace/alzologistica/src/pages/catalogo/index.astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/catalogo/index.astro";
const $$url = "/catalogo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
