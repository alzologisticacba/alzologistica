import { f as createComponent, l as renderHead, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { s as supabaseClient } from '../chunks/supabaseClient_Ou7rw0NR.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const SESSION_KEY = "venc_auth";
const POR_PAGINA = 30;
function estadoProducto(dias) {
  if (dias <= 31) return "rojo";
  if (dias <= 60) return "naranja";
  return "verde";
}
function formatFecha(f) {
  if (!f) return "—";
  if (f.includes("/")) return f;
  const [y, m, d] = f.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}
function LoginScreen({ onLogin }) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!codigo.trim()) return;
    setLoading(true);
    setError("");
    try {
      const codigoNum = Number(codigo.trim());
      if (isNaN(codigoNum)) throw new Error("invalid");
      const { data, error: error2 } = await supabaseClient.from("vendedores").select("nombre").eq("codigoVendedor", codigoNum).maybeSingle();
      if (error2 || !data) {
        setError("Código incorrecto. Intentá de nuevo.");
        setCodigo("");
        setTimeout(() => setError(""), 2e3);
      } else {
        sessionStorage.setItem(SESSION_KEY, "1");
        onLogin(data.nombre ?? "");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "venc-login-wrap", children: /* @__PURE__ */ jsxs("div", { className: "venc-login-card", children: [
    /* @__PURE__ */ jsx("img", { src: "/img/247/logoAlzo247.png", alt: "Alzo", className: "venc-login-card__logo" }),
    /* @__PURE__ */ jsx("h1", { children: "Control de Vencimientos" }),
    /* @__PURE__ */ jsx("p", { children: "Ingresá tu código de vendedor para continuar" }),
    /* @__PURE__ */ jsxs("form", { className: "venc-login-form", onSubmit: handleSubmit, autoComplete: "off", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "venc-input-label", htmlFor: "codigo", children: "Código de vendedor" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "codigo",
            className: `venc-input${error ? " venc-input--error" : ""}`,
            type: "password",
            inputMode: "numeric",
            maxLength: 8,
            value: codigo,
            onChange: (e) => setCodigo(e.target.value),
            placeholder: "••••",
            autoFocus: true,
            disabled: loading
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "venc-login-error", children: error || " " }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "venc-btn-login", disabled: loading, children: loading ? "Verificando..." : "Ingresar" })
    ] })
  ] }) });
}
function Paginador({
  pagina,
  total,
  porPagina,
  onChange
}) {
  const totalPags = Math.ceil(total / porPagina);
  if (totalPags <= 1) return null;
  function rango() {
    if (totalPags <= 5) return Array.from({ length: totalPags }, (_, i) => i + 1);
    const items = [1];
    if (pagina > 3) items.push("…");
    for (let i = Math.max(2, pagina - 1); i <= Math.min(totalPags - 1, pagina + 1); i++) items.push(i);
    if (pagina < totalPags - 2) items.push("…");
    items.push(totalPags);
    return items;
  }
  return /* @__PURE__ */ jsxs("div", { className: "venc-paginador", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "venc-pag-btn",
        disabled: pagina === 1,
        onClick: () => onChange(pagina - 1),
        "aria-label": "Anterior",
        children: "←"
      }
    ),
    rango().map(
      (item, i) => item === "…" ? /* @__PURE__ */ jsx("span", { className: "venc-pag-dots", children: "…" }, `dots-${i}`) : /* @__PURE__ */ jsx(
        "button",
        {
          className: `venc-pag-btn ${pagina === item ? "active" : ""}`,
          onClick: () => onChange(item),
          children: item
        },
        item
      )
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "venc-pag-btn",
        disabled: pagina === totalPags,
        onClick: () => onChange(pagina + 1),
        "aria-label": "Siguiente",
        children: "→"
      }
    )
  ] });
}
function VencimientosApp() {
  const [autenticado, setAutenticado] = useState(false);
  const [vendedor, setVendedor] = useState("");
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [areaFiltro, setAreaFiltro] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const [expandido, setExpandido] = useState(null);
  useEffect(() => {
    const sesionActiva = sessionStorage.getItem(SESSION_KEY) === "1";
    console.info("[vencimientos] sesion", { sesionActiva });
    if (sesionActiva) setAutenticado(true);
  }, []);
  useEffect(() => {
    console.info("[vencimientos] autenticado", { autenticado });
    if (autenticado) fetchProductos();
  }, [autenticado]);
  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtro, areaFiltro]);
  async function fetchProductos() {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/vencimientos/digip?t=${Date.now()}`;
      console.info("[vencimientos] consultando Digip", { url });
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache"
        }
      });
      const data = await res.json().catch(() => null);
      console.info("[vencimientos] respuesta Digip", {
        status: res.status,
        ok: res.ok,
        esArray: Array.isArray(data),
        total: Array.isArray(data) ? data.length : null,
        data
      });
      if (!res.ok) {
        throw new Error(data?.error ?? `Error ${res.status}`);
      }
      const productosDigip = Array.isArray(data) ? data : [];
      console.info("[vencimientos] productos recibidos", {
        total: productosDigip.length,
        primero: productosDigip[0] ?? null
      });
      setProductos(productosDigip);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAutenticado(false);
    setProductos([]);
  }
  const areas = useMemo(() => {
    const set = new Set(productos.map((p) => p.Area).filter(Boolean));
    return Array.from(set).sort();
  }, [productos]);
  const productosFiltrados = useMemo(() => {
    let list = productos;
    if (filtro !== "todos")
      list = list.filter((p) => estadoProducto(p["Dias para vencer"]) === filtro);
    if (areaFiltro !== "todas")
      list = list.filter((p) => p.Area === areaFiltro);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      list = list.filter(
        (p) => p.Descripcion?.toLowerCase().includes(q) || String(p.CodigoArticulo).includes(q)
      );
    }
    return list;
  }, [productos, filtro, areaFiltro, busqueda]);
  const paginaActual = useMemo(() => {
    const inicio2 = (pagina - 1) * POR_PAGINA;
    return productosFiltrados.slice(inicio2, inicio2 + POR_PAGINA);
  }, [productosFiltrados, pagina]);
  const stats = useMemo(() => ({
    rojo: productos.filter((p) => estadoProducto(p["Dias para vencer"]) === "rojo").length
  }), [productos]);
  if (!autenticado) return /* @__PURE__ */ jsx(LoginScreen, { onLogin: (nombre) => {
    setAutenticado(true);
    setVendedor(nombre);
  } });
  Math.ceil(productosFiltrados.length / POR_PAGINA);
  const inicio = (pagina - 1) * POR_PAGINA + 1;
  const fin = Math.min(pagina * POR_PAGINA, productosFiltrados.length);
  return /* @__PURE__ */ jsxs("div", { className: "venc-page", children: [
    /* @__PURE__ */ jsxs("header", { className: "venc-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "venc-header__logo", children: [
        /* @__PURE__ */ jsx("img", { src: "/img/247/logoAlzo247.png", alt: "Alzo" }),
        /* @__PURE__ */ jsx("span", { children: "Vencimientos" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "venc-header__right", children: [
        vendedor && /* @__PURE__ */ jsx("span", { className: "venc-header__vendedor", children: vendedor }),
        /* @__PURE__ */ jsx("button", { className: "venc-header__logout", onClick: handleLogout, children: "Cerrar sesión" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "venc-hero", children: [
      /* @__PURE__ */ jsx("h1", { className: "venc-hero__title", children: "Vencimientos" }),
      /* @__PURE__ */ jsxs("div", { className: "venc-hero__search-wrap", children: [
        /* @__PURE__ */ jsxs("svg", { className: "venc-hero__search-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: [
          /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
          /* @__PURE__ */ jsx("path", { d: "m21 21-4.35-4.35" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "venc-hero__search",
            type: "search",
            placeholder: "Buscar productos",
            value: busqueda,
            onChange: (e) => setBusqueda(e.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "venc-controls", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `venc-chip-30 ${filtro === "rojo" ? "active" : ""}`,
          onClick: () => setFiltro(filtro === "rojo" ? "todos" : "rojo"),
          children: [
            /* @__PURE__ */ jsx("span", { className: "venc-chip-30__num", children: stats.rojo }),
            /* @__PURE__ */ jsx("span", { className: "venc-chip-30__label", children: "Menos de 31 días" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "venc-select",
          value: areaFiltro,
          onChange: (e) => setAreaFiltro(e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "todas", children: "Todas las áreas" }),
            areas.map((a) => /* @__PURE__ */ jsx("option", { value: a, children: a }, a))
          ]
        }
      ),
      /* @__PURE__ */ jsxs("button", { className: "venc-refresh-btn", onClick: fetchProductos, title: "Actualizar", children: [
        /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", width: "15", height: "15", children: [
          /* @__PURE__ */ jsx("path", { d: "M23 4v6h-6M1 20v-6h6" }),
          /* @__PURE__ */ jsx("path", { d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" })
        ] }),
        "Actualizar"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "venc-table-outer", children: [
      loading && /* @__PURE__ */ jsxs("div", { className: "venc-loading", children: [
        /* @__PURE__ */ jsx("div", { className: "venc-spinner" }),
        /* @__PURE__ */ jsx("span", { children: "Cargando productos..." })
      ] }),
      error && /* @__PURE__ */ jsxs("div", { className: "venc-error", children: [
        /* @__PURE__ */ jsx("strong", { children: "Error:" }),
        " ",
        error,
        /* @__PURE__ */ jsx("button", { onClick: fetchProductos, children: "Reintentar" })
      ] }),
      !loading && !error && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "venc-table-wrap", children: productosFiltrados.length === 0 ? /* @__PURE__ */ jsx("div", { className: "venc-empty", children: productos.length === 0 ? "Sin productos en la base de datos." : "No hay resultados para este filtro." }) : /* @__PURE__ */ jsxs("table", { className: "venc-table", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Código" }),
            /* @__PURE__ */ jsx("th", { children: "Descripción" }),
            /* @__PURE__ */ jsx("th", { className: "venc-th-fecha", children: "Vencimiento" }),
            /* @__PURE__ */ jsx("th", { children: "Días" }),
            /* @__PURE__ */ jsx("th", { className: "venc-th-cant", children: "Cant." })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: paginaActual.map((p, i) => {
            const estado = estadoProducto(p["Dias para vencer"]);
            const rowKey = `${p.CodigoArticulo}-${i}`;
            const abierto = expandido === rowKey;
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs(
                "tr",
                {
                  "data-estado": estado,
                  className: `venc-tr-clickable${abierto ? " venc-tr-open" : ""}`,
                  onClick: () => setExpandido(abierto ? null : rowKey),
                  children: [
                    /* @__PURE__ */ jsx("td", { className: "venc-td-codigo", children: p.CodigoArticulo }),
                    /* @__PURE__ */ jsx("td", { className: "venc-td-desc", children: p.Descripcion }),
                    /* @__PURE__ */ jsx("td", { className: "venc-td-fecha venc-th-fecha", children: formatFecha(p.FechaVencimiento) }),
                    /* @__PURE__ */ jsx("td", { className: "venc-td-dias", children: /* @__PURE__ */ jsx("span", { className: `venc-dias-badge venc-dias-badge--${estado}`, children: p["Dias para vencer"] < 0 ? `Hace ${Math.abs(p["Dias para vencer"])}d` : p["Dias para vencer"] === 0 ? "Hoy" : `${p["Dias para vencer"]}d` }) }),
                    /* @__PURE__ */ jsx("td", { className: "venc-td-cant venc-th-cant", children: p.Cantidad })
                  ]
                },
                rowKey
              ),
              abierto && /* @__PURE__ */ jsx("tr", { "data-estado": estado, className: "venc-tr-detail", children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "venc-td-detail", children: /* @__PURE__ */ jsxs("div", { className: "venc-detail-grid", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Descripción" }),
                  /* @__PURE__ */ jsx("strong", { children: p.Descripcion })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Código" }),
                  /* @__PURE__ */ jsx("strong", { children: p.CodigoArticulo })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Área" }),
                  /* @__PURE__ */ jsx("strong", { children: p.Area || "Sin área" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Ubicación" }),
                  /* @__PURE__ */ jsx("strong", { children: p.Ubicacion || "Sin ubicación" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Lote" }),
                  /* @__PURE__ */ jsx("strong", { children: p.Lote || "Sin lote" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Contenedor" }),
                  /* @__PURE__ */ jsx("strong", { children: p.Contenedor || "Sin contenedor" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Vencimiento" }),
                  /* @__PURE__ */ jsx("strong", { children: formatFecha(p.FechaVencimiento) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Días restantes" }),
                  /* @__PURE__ */ jsxs("strong", { children: [
                    p["Dias para vencer"],
                    "d"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { children: "Cantidad" }),
                  /* @__PURE__ */ jsx("strong", { children: p.Cantidad })
                ] })
              ] }) }) }, `${rowKey}-detail`)
            ] });
          }) })
        ] }) }),
        productosFiltrados.length > 0 && /* @__PURE__ */ jsxs("div", { className: "venc-footer-bar", children: [
          /* @__PURE__ */ jsxs("span", { className: "venc-footer-info", children: [
            inicio,
            "–",
            fin,
            " de ",
            productosFiltrados.length,
            " productos"
          ] }),
          /* @__PURE__ */ jsx(
            Paginador,
            {
              pagina,
              total: productosFiltrados.length,
              porPagina: POR_PAGINA,
              onChange: (p) => {
                setPagina(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }
          )
        ] })
      ] })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Alzo — Control de Vencimientos</title><meta name="robots" content="noindex, nofollow"><link rel="icon" type="image/png" href="/img/alzo_logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">${renderHead()}</head> <body> ${renderComponent($$result, "VencimientosApp", VencimientosApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/workspace/alzologistica/src/components/vencimientos/VencimientosApp", "client:component-export": "default" })} </body></html>`;
}, "C:/workspace/alzologistica/src/pages/vencimientos/index.astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/vencimientos/index.astro";
const $$url = "/vencimientos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
