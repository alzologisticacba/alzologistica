import { f as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { a as addToCart, g as getCartCount, $ as $$Layout247 } from '../chunks/Layout247_DHfWtw7f.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import React, { useState, useRef, useEffect, useDeferredValue } from 'react';
import { s as supabaseClient } from '../chunks/supabaseClient_Ou7rw0NR.mjs';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

function SearchSuggestions({ query, onSelect, onClose, visible }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    if (abortRef.current) clearTimeout(abortRef.current);
    setLoading(true);
    abortRef.current = setTimeout(() => {
      supabaseClient.from("articulos").select("descripcion, familiaNombre").gt("stock", 0).ilike("descripcion", `%${query}%`).order("orden", { ascending: true }).limit(8).then(({ data }) => {
        const seen = /* @__PURE__ */ new Set();
        const unique = (data ?? []).filter((item) => {
          const key = item.descripcion.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setSuggestions(unique);
      }).finally(() => setLoading(false));
    }, 180);
    return () => {
      if (abortRef.current) clearTimeout(abortRef.current);
    };
  }, [query]);
  if (!visible || query.length < 2) return null;
  function highlight(text, q) {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return /* @__PURE__ */ jsx("span", { children: text });
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      text.slice(0, idx),
      /* @__PURE__ */ jsx("strong", { children: text.slice(idx, idx + q.length) }),
      text.slice(idx + q.length)
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "ss-dropdown", children: [
    loading && suggestions.length === 0 && /* @__PURE__ */ jsxs("div", { className: "ss-loading", children: [
      /* @__PURE__ */ jsx("span", { className: "ss-loading__dot" }),
      /* @__PURE__ */ jsx("span", { className: "ss-loading__dot" }),
      /* @__PURE__ */ jsx("span", { className: "ss-loading__dot" })
    ] }),
    !loading && suggestions.length === 0 && /* @__PURE__ */ jsxs("div", { className: "ss-empty", children: [
      'Sin resultados para "',
      query,
      '"'
    ] }),
    suggestions.map((s, i) => /* @__PURE__ */ jsxs(
      "button",
      {
        className: "ss-item",
        onMouseDown: (e) => {
          e.preventDefault();
          onSelect(s.descripcion);
        },
        children: [
          /* @__PURE__ */ jsx("span", { className: "ss-item__icon", children: "🔍" }),
          /* @__PURE__ */ jsx("span", { className: "ss-item__text", children: highlight(s.descripcion, query) }),
          s.familiaNombre && /* @__PURE__ */ jsx("span", { className: "ss-item__familia", children: s.familiaNombre }),
          /* @__PURE__ */ jsx("span", { className: "ss-item__arrow", children: "↗" })
        ]
      },
      i
    ))
  ] });
}

function readCartCount() {
  try {
    return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]").reduce((s, i) => s + i.cantidad, 0);
  } catch {
    return 0;
  }
}
function readCartItems() {
  try {
    return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]");
  } catch {
    return [];
  }
}
function fmtPrice(n) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function Header247({
  cartCount: cartCountProp,
  busqueda = "",
  onBusquedaChange,
  onBusquedaClear,
  showSearch = false,
  showBack = false
}) {
  const [count, setCount] = useState(0);
  const [familias, setFamilias] = useState([]);
  const [ddOpen, setDdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ddRef = useRef(null);
  const [showSugg, setShowSugg] = useState(false);
  const [fcVisible, setFcVisible] = useState(false);
  const [fcDropping, setFcDropping] = useState(false);
  const [fcBumping, setFcBumping] = useState(false);
  const [fcModalOpen, setFcModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerBump, setHeaderBump] = useState(false);
  const prevCountRef = useRef(-1);
  const mountSyncedRef = useRef(false);
  const hasDroppedRef = useRef(false);
  const headerRef = useRef(null);
  useEffect(() => {
    const initial = cartCountProp ?? readCartCount();
    if (initial === 0) mountSyncedRef.current = true;
    setCount(initial);
    if (cartCountProp !== void 0) return;
    const sync = () => setCount(readCartCount());
    window.addEventListener("cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    if (cartCountProp !== void 0) setCount(cartCountProp);
  }, [cartCountProp]);
  useEffect(() => {
    if (prevCountRef.current === -1) {
      prevCountRef.current = count;
      return;
    }
    const prev = prevCountRef.current;
    prevCountRef.current = count;
    if (!mountSyncedRef.current) {
      mountSyncedRef.current = true;
      setFcVisible(count > 0);
      return;
    }
    const timers = [];
    if (prev === 0 && count > 0) {
      setFcVisible(true);
      if (!hasDroppedRef.current) {
        hasDroppedRef.current = true;
        setFcDropping(true);
        timers.push(setTimeout(() => setFcDropping(false), 1e3));
      }
    } else if (count === 0 && prev > 0) {
      setFcVisible(false);
      setFcDropping(false);
      setFcBumping(false);
      hasDroppedRef.current = false;
    } else if (count > prev && prev > 0) {
      setFcBumping(true);
      timers.push(setTimeout(() => setFcBumping(false), 500));
    }
    if (count > prev) {
      setHeaderBump(true);
      timers.push(setTimeout(() => setHeaderBump(false), 500));
    }
    if (timers.length > 0) return () => timers.forEach(clearTimeout);
  }, [count]);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHeaderVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!fcModalOpen) return;
    setCartItems(readCartItems());
    const sync = () => setCartItems(readCartItems());
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, [fcModalOpen]);
  useEffect(() => {
    if (fcModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else if (!menuOpen) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [fcModalOpen, menuOpen]);
  useEffect(() => {
    supabaseClient.from("articulos").select("familiaNombre").gt("stock", 0).then(({ data }) => {
      const u = [...new Set((data ?? []).map((r) => r.familiaNombre))].filter(Boolean).sort();
      setFamilias(u);
    });
  }, []);
  useEffect(() => {
    if (!ddOpen) return;
    const fn = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ddOpen]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  function toSlug(f) {
    return f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  }
  const Logo = () => /* @__PURE__ */ jsx("a", { href: "/247", className: "header-247__logo-link", children: /* @__PURE__ */ jsx("img", { src: "/img/247/logoAlzo247.png", alt: "Alzo 24/7", className: "header-247__logo-img" }) });
  const cartBtnClass = `header-247__cart-btn${headerBump ? " header-247__cart-btn--bump" : ""}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    fcVisible && !headerVisible && /* @__PURE__ */ jsxs(
      "button",
      {
        className: `floating-cart${fcDropping ? " floating-cart--drop" : ""}${fcBumping ? " floating-cart--bump" : ""}`,
        onClick: () => setFcModalOpen(true),
        "aria-label": "Ver carrito",
        children: [
          /* @__PURE__ */ jsx("img", { src: "/img/247/bolsaCompras.png", alt: "", className: "floating-cart__img" }),
          /* @__PURE__ */ jsx("span", { className: "floating-cart__badge", children: count })
        ]
      }
    ),
    fcModalOpen && /* @__PURE__ */ jsx("div", { className: "fc-modal-overlay", onClick: () => setFcModalOpen(false), children: /* @__PURE__ */ jsxs("div", { className: "fc-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "fc-modal__head", children: [
        /* @__PURE__ */ jsx("h2", { className: "fc-modal__title", children: "Mi carrito" }),
        /* @__PURE__ */ jsx("button", { className: "fc-modal__close", onClick: () => setFcModalOpen(false), children: "✕" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "fc-modal__body", children: cartItems.length === 0 ? /* @__PURE__ */ jsx("p", { className: "fc-modal__empty", children: "Tu carrito está vacío" }) : cartItems.map((item, i) => /* @__PURE__ */ jsxs("div", { className: "fc-modal__item", children: [
        /* @__PURE__ */ jsx("div", { className: "fc-modal__item-name", children: item.descripcion ?? item.nombre }),
        /* @__PURE__ */ jsxs("span", { className: "fc-modal__item-qty", children: [
          "x",
          item.cantidad
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "fc-modal__item-price", children: [
          "$ ",
          fmtPrice(item.precioFinal * item.cantidad)
        ] })
      ] }, i)) }),
      cartItems.length > 0 && /* @__PURE__ */ jsxs("div", { className: "fc-modal__footer", children: [
        /* @__PURE__ */ jsxs("div", { className: "fc-modal__total", children: [
          /* @__PURE__ */ jsx("span", { className: "fc-modal__total-label", children: "Total" }),
          /* @__PURE__ */ jsxs("span", { className: "fc-modal__total-amount", children: [
            "$ ",
            fmtPrice(cartItems.reduce((s, i) => s + i.precioFinal * i.cantidad, 0))
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "fc-modal__btn", onClick: () => {
          window.location.href = "/247/carrito";
        }, children: "Finalizar pedido →" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("header", { ref: headerRef, className: "header-247-wrap", children: [
      /* @__PURE__ */ jsx("div", { className: "header-247__bg", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx("div", { className: "header-247__gradient", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxs("div", { className: "header-247-inner", children: [
        showSearch ? /* @__PURE__ */ jsxs("div", { className: "header-247 header-247--search", children: [
          /* @__PURE__ */ jsx(Logo, {}),
          /* @__PURE__ */ jsxs("div", { className: "header-247__search-wrap", style: { position: "relative" }, children: [
            /* @__PURE__ */ jsx("span", { className: "header-247__search-icon", children: "🔍" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "search",
                className: "header-247__search-input",
                placeholder: "Buscar productos, combos, y más...",
                value: busqueda,
                onChange: (e) => {
                  onBusquedaChange?.(e.target.value);
                  setShowSugg(true);
                },
                onFocus: () => setShowSugg(true),
                onBlur: () => setTimeout(() => setShowSugg(false), 150)
              }
            ),
            busqueda && /* @__PURE__ */ jsx("button", { className: "header-247__search-clear", onClick: () => {
              onBusquedaClear?.();
              setShowSugg(false);
            }, children: "✕" }),
            /* @__PURE__ */ jsx(
              SearchSuggestions,
              {
                query: busqueda,
                visible: showSugg,
                onSelect: (v) => {
                  onBusquedaChange?.(v);
                  setShowSugg(false);
                },
                onClose: () => setShowSugg(false)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("button", { className: cartBtnClass, onClick: () => {
            window.location.href = "/247/carrito";
          }, "aria-label": "Carrito", children: [
            /* @__PURE__ */ jsx("img", { src: "/img/247/bolsaCompras.png", alt: "", className: "header-247__cart-icon" }),
            count > 0 && /* @__PURE__ */ jsx("span", { className: "header-247__cart-badge", children: count })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "header-247 header-247--simple", children: [
          /* @__PURE__ */ jsx("div", { className: "header-247__left", children: showBack && /* @__PURE__ */ jsx("button", { className: "header-247__back-btn", onClick: () => window.history.back(), children: "←" }) }),
          /* @__PURE__ */ jsx(Logo, {}),
          /* @__PURE__ */ jsx("div", { className: "header-247__right", children: /* @__PURE__ */ jsxs("button", { className: cartBtnClass, onClick: () => {
            window.location.href = "/247/carrito";
          }, "aria-label": "Carrito", children: [
            /* @__PURE__ */ jsx("img", { src: "/img/247/bolsaCompras.png", alt: "", className: "header-247__cart-icon" }),
            count > 0 && /* @__PURE__ */ jsx("span", { className: "header-247__cart-badge", children: count })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "header-247-nav header-247-nav--desktop", children: [
          /* @__PURE__ */ jsx("a", { href: "/247", className: "h247nav-btn", children: "Inicio" }),
          /* @__PURE__ */ jsx("a", { href: "/247/pedidos", className: "h247nav-btn", children: "Tus Pedidos" }),
          /* @__PURE__ */ jsxs("div", { className: "h247nav-dd", ref: ddRef, children: [
            /* @__PURE__ */ jsxs("button", { className: `h247nav-btn${ddOpen ? " h247nav-btn--open" : ""}`, onClick: () => setDdOpen((o) => !o), children: [
              "Categorías",
              /* @__PURE__ */ jsx(
                "svg",
                {
                  width: "11",
                  height: "11",
                  viewBox: "0 0 12 12",
                  fill: "none",
                  style: { transform: ddOpen ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 },
                  children: /* @__PURE__ */ jsx("path", { d: "M2 4l4 4 4-4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
                }
              )
            ] }),
            ddOpen && familias.length > 0 && /* @__PURE__ */ jsx("div", { className: "h247nav-dropdown", children: familias.map((f) => /* @__PURE__ */ jsx("a", { href: `/247/categoria/${toSlug(f)}`, className: "h247nav-dropdown__item", onClick: () => setDdOpen(false), children: f }, f)) })
          ] }),
          /* @__PURE__ */ jsx("a", { href: "/247/descuentos", className: "h247nav-btn", children: "Descuentos" }),
          /* @__PURE__ */ jsx("a", { href: "/247/combos", className: "h247nav-btn", children: "Combos" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: "header-247-hamburger",
            onClick: () => setMenuOpen((o) => !o),
            "aria-label": "Menú",
            children: [
              /* @__PURE__ */ jsx("span", { className: `hamburger-bar${menuOpen ? " hamburger-bar--open" : ""}` }),
              /* @__PURE__ */ jsx("span", { className: `hamburger-bar${menuOpen ? " hamburger-bar--open" : ""}` }),
              /* @__PURE__ */ jsx("span", { className: `hamburger-bar${menuOpen ? " hamburger-bar--open" : ""}` })
            ]
          }
        )
      ] }),
      menuOpen && /* @__PURE__ */ jsx("div", { className: "h247-mobile-menu", onClick: () => setMenuOpen(false), children: /* @__PURE__ */ jsxs("div", { className: "h247-mobile-menu__panel", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ jsxs("div", { className: "h247-mobile-menu__head", children: [
          /* @__PURE__ */ jsx("span", { className: "h247-mobile-menu__title", children: "Menú" }),
          /* @__PURE__ */ jsx("button", { className: "h247-mobile-menu__close", onClick: () => setMenuOpen(false), children: "✕" })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "h247-mobile-menu__nav", children: [
          /* @__PURE__ */ jsx("a", { href: "/247", className: "h247-mobile-menu__link", onClick: () => setMenuOpen(false), children: "🏠 Inicio" }),
          /* @__PURE__ */ jsx("a", { href: "/247/pedidos", className: "h247-mobile-menu__link", onClick: () => setMenuOpen(false), children: "📦 Tus Pedidos" }),
          /* @__PURE__ */ jsx("a", { href: "/247/descuentos", className: "h247-mobile-menu__link", onClick: () => setMenuOpen(false), children: "🏷️ Descuentos" }),
          /* @__PURE__ */ jsx("a", { href: "/247/combos", className: "h247-mobile-menu__link", onClick: () => setMenuOpen(false), children: "🎁 Combos" }),
          /* @__PURE__ */ jsx("div", { className: "h247-mobile-menu__separator", children: "Categorías" }),
          familias.map((f) => /* @__PURE__ */ jsx("a", { href: `/247/categoria/${toSlug(f)}`, className: "h247-mobile-menu__link h247-mobile-menu__link--cat", onClick: () => setMenuOpen(false), children: f }, f))
        ] })
      ] }) })
    ] })
  ] });
}

function fmt(n) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}
const IMG_BASE$1 = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";
function ProductImg({ codigo }) {
  const [error, setError] = React.useState(false);
  if (error) return /* @__PURE__ */ jsx("div", { className: "product-card__img-placeholder", children: "📦" });
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: `${IMG_BASE$1}/${codigo}.png`,
      alt: "",
      className: "product-card__img",
      onError: () => setError(true),
      loading: "lazy"
    }
  );
}
function ProductCard({ articulo }) {
  const [btnState, setBtnState] = useState("idle");
  React.useEffect(() => {
    function onConfirmed(e) {
      const { codigo } = e.detail;
      if (codigo === articulo.codigo) {
        setBtnState("ok");
        setTimeout(() => setBtnState("idle"), 1500);
      }
    }
    window.addEventListener("cart-age-confirmed", onConfirmed);
    return () => window.removeEventListener("cart-age-confirmed", onConfirmed);
  }, [articulo.codigo]);
  const tieneDescuento = articulo.descuento > 0;
  const precioConDescuento = tieneDescuento ? articulo.precioFinal * (1 - articulo.descuento / 100) : null;
  function handleAgregar(e) {
    e.stopPropagation();
    const result = addToCart({
      codigo: articulo.codigo,
      descripcion: articulo.descripcion,
      precioFinal: precioConDescuento ?? articulo.precioFinal,
      multiplo: articulo.multiplo || 1,
      descuento: articulo.descuento,
      familiaNombre: articulo.familiaNombre ?? "",
      rubro: articulo.rubro ?? "",
      tipo: "articulo"
    });
    setBtnState(result === "added" ? "ok" : "pending");
    setTimeout(() => setBtnState("idle"), 1500);
  }
  return /* @__PURE__ */ jsxs(
    "article",
    {
      className: `product-card${tieneDescuento ? " product-card--descuento" : ""}`,
      onClick: () => window.location.href = `/247/producto/?codigo=${articulo.codigo}`,
      style: { cursor: "pointer" },
      children: [
        tieneDescuento && /* @__PURE__ */ jsxs("div", { className: "product-card__badge", children: [
          "-",
          articulo.descuento,
          "%"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "product-card__img-wrap", children: /* @__PURE__ */ jsx(ProductImg, { codigo: articulo.codigo }) }),
        /* @__PURE__ */ jsxs("div", { className: "product-card__info", children: [
          /* @__PURE__ */ jsx("p", { className: "product-card__desc", children: articulo.descripcion }),
          /* @__PURE__ */ jsx("p", { className: "product-card__rubro", children: articulo.rubro }),
          precioConDescuento && /* @__PURE__ */ jsx("p", { className: "product-card__precio-original", children: fmt(articulo.precioFinal) }),
          /* @__PURE__ */ jsx("p", { className: "product-card__precio", children: fmt(precioConDescuento ?? articulo.precioFinal) }),
          articulo.multiplo > 1 && /* @__PURE__ */ jsxs("p", { className: "product-card__multiplo", children: [
            "x",
            articulo.multiplo,
            " unidades"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `product-card__btn${btnState === "ok" ? " product-card__btn--ok" : btnState === "pending" ? " product-card__btn--pending" : ""}`,
            onClick: handleAgregar,
            children: btnState === "ok" ? "✓ Agregado" : btnState === "pending" ? "✕ No agregado" : "Agregar"
          }
        )
      ]
    }
  );
}

function grupoRequiereEleccion(items) {
  return items.length > 1;
}
function totalPermitidoGrupo(detalles, g) {
  return Number(detalles.find((d) => d.grupo === g)?.cantidad ?? 1);
}
function buildContenido(detalles, gruposEleccion, cantidadesPorGrupo) {
  const grupos = [...new Set(detalles.map((d) => d.grupo))].sort();
  return grupos.flatMap((g) => {
    const items = detalles.filter((d) => d.grupo === g);
    if (gruposEleccion.includes(g)) {
      return items.filter((d) => (cantidadesPorGrupo[g]?.[d.productos] ?? 0) > 0).map((d) => ({
        producto: d.productos,
        nombre: d.nombre,
        cantidad: cantidadesPorGrupo[g][d.productos],
        elegido: true,
        descuentos: d.descuentos
      }));
    }
    return items.map((d) => ({
      producto: d.productos,
      nombre: d.nombre,
      cantidad: d.cantidad,
      elegido: false,
      descuentos: d.descuentos
    }));
  });
}
function SeleccionModal({ combo, gruposEleccion, onConfirm, onClose }) {
  React.useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);
  const [cantidades, setCantidades] = useState(() => {
    const init = {};
    gruposEleccion.forEach((g) => {
      const opciones = combo.detalles.filter((d) => d.grupo === g);
      init[g] = Object.fromEntries(opciones.map((o) => [o.productos, 0]));
    });
    return init;
  });
  function totalElegido(g) {
    return Object.values(cantidades[g] ?? {}).reduce((s, v) => s + v, 0);
  }
  function inc(g, producto) {
    if (totalElegido(g) >= totalPermitidoGrupo(combo.detalles, g)) return;
    setCantidades((prev) => ({ ...prev, [g]: { ...prev[g], [producto]: (prev[g][producto] ?? 0) + 1 } }));
  }
  function dec(g, producto) {
    setCantidades((prev) => ({ ...prev, [g]: { ...prev[g], [producto]: Math.max(0, (prev[g][producto] ?? 0) - 1) } }));
  }
  const todosCompletos = gruposEleccion.every(
    (g) => totalElegido(g) === totalPermitidoGrupo(combo.detalles, g)
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "alzomodal-backdrop", onClick: onClose }),
    /* @__PURE__ */ jsx("div", { className: "alzomodal", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "alzomodal-card alzomodal-card--wide", children: [
      /* @__PURE__ */ jsxs("div", { className: "alzomodal-head", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "alzomodal-title", children: "Personalizar combo" }),
          /* @__PURE__ */ jsx("p", { className: "alzomodal-head-sub", children: combo.nombre })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "alzomodal-close", onClick: onClose, children: "✕" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "alzomodal-body seleccion-body", children: gruposEleccion.map((g, idx) => {
        const opciones = combo.detalles.filter((d) => d.grupo === g);
        const permitido = totalPermitidoGrupo(combo.detalles, g);
        const elegido = totalElegido(g);
        const restante = permitido - elegido;
        return /* @__PURE__ */ jsxs("div", { className: "seleccion-grupo", children: [
          /* @__PURE__ */ jsxs("div", { className: "seleccion-grupo__header", children: [
            /* @__PURE__ */ jsxs("p", { className: "seleccion-grupo__label", children: [
              "Opción ",
              idx + 1
            ] }),
            /* @__PURE__ */ jsx("span", { className: `seleccion-grupo__contador${restante === 0 ? " seleccion-grupo__contador--ok" : ""}`, children: restante === 0 ? "✓ Completo" : `Faltan ${restante}` })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "seleccion-grupo__items", children: opciones.map((op) => {
            const qty = cantidades[g]?.[op.productos] ?? 0;
            return /* @__PURE__ */ jsxs("div", { className: `seleccion-opcion${qty > 0 ? " seleccion-opcion--activa" : ""}`, children: [
              /* @__PURE__ */ jsx("span", { className: "seleccion-opcion__nombre", children: op.nombre ?? op.productos }),
              /* @__PURE__ */ jsxs("div", { className: "seleccion-opcion__ctrl", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "seleccion-opcion__btn",
                    onClick: () => dec(g, op.productos),
                    disabled: qty === 0,
                    children: "−"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "seleccion-opcion__qty", children: qty }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "seleccion-opcion__btn",
                    onClick: () => inc(g, op.productos),
                    disabled: restante === 0,
                    children: "+"
                  }
                )
              ] })
            ] }, op.id);
          }) })
        ] }, g);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "alzomodal-actions", children: [
        /* @__PURE__ */ jsx("button", { className: "alzomodal-btn alzomodal-btn--secondary", onClick: onClose, children: "Cancelar" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "alzomodal-btn alzomodal-btn--primary",
            onClick: () => onConfirm(cantidades),
            disabled: !todosCompletos,
            children: "Confirmar y agregar"
          }
        )
      ] })
    ] }) })
  ] });
}
function useComboAgregar({ onAdded } = {}) {
  const [modalCombo, setModalCombo] = useState(null);
  const [loading, setLoading] = useState(false);
  async function fetchDetalles(cod_combo) {
    const [detallesRes, articulosRes] = await Promise.all([
      supabaseClient.from("detalles_combos").select("id, productos, cantidad, descuentos, grupo").eq("detalle_combo", cod_combo).order("grupo"),
      supabaseClient.from("articulos").select("codigo, descripcion")
    ]);
    const detalles = detallesRes.data ?? [];
    const codigos = [...new Set(detalles.map((d) => d.productos).filter(Boolean))];
    let artMap = {};
    if (codigos.length > 0) {
      const { data: arts } = await supabaseClient.from("articulos").select("codigo, descripcion").in("codigo", codigos.map((c) => parseInt(c)));
      if (arts) artMap = Object.fromEntries(arts.map((a) => [String(a.codigo), a.descripcion]));
    }
    return detalles.map((d) => ({ ...d, nombre: artMap[String(d.productos)] ?? null }));
  }
  function doAdd(combo, detalles, cantidadesPorGrupo) {
    const grupos = [...new Set(detalles.map((d) => d.grupo))].sort();
    const gruposEleccion = grupos.filter((g) => grupoRequiereEleccion(detalles.filter((d) => d.grupo === g)));
    const contenido = buildContenido(detalles, gruposEleccion, cantidadesPorGrupo);
    addToCart({
      codigo: -parseInt(combo.cod_combo.replace(/\D/g, ""), 10),
      cod_combo: combo.cod_combo,
      descripcion: combo.nombre,
      precioFinal: combo.precio,
      multiplo: 1,
      descuento: 0,
      tipo: "combo",
      contenido
    });
    onAdded?.();
  }
  async function agregar(combo) {
    setLoading(true);
    try {
      const detalles = await fetchDetalles(combo.cod_combo);
      const grupos = [...new Set(detalles.map((d) => d.grupo))].sort();
      const gruposEleccion = grupos.filter((g) => grupoRequiereEleccion(detalles.filter((d) => d.grupo === g)));
      if (gruposEleccion.length > 0) {
        setModalCombo({ ...combo, descripcion: "", detalles });
      } else {
        doAdd(combo, detalles, {});
      }
    } finally {
      setLoading(false);
    }
  }
  function handleConfirm(cantidadesPorGrupo) {
    if (!modalCombo) return;
    const grupos = [...new Set(modalCombo.detalles.map((d) => d.grupo))].sort();
    grupos.filter((g) => grupoRequiereEleccion(modalCombo.detalles.filter((d) => d.grupo === g)));
    doAdd(modalCombo, modalCombo.detalles, cantidadesPorGrupo);
    setModalCombo(null);
  }
  const modal = modalCombo ? /* @__PURE__ */ jsx(
    SeleccionModal,
    {
      combo: modalCombo,
      gruposEleccion: [...new Set(modalCombo.detalles.map((d) => d.grupo))].sort().filter((g) => grupoRequiereEleccion(modalCombo.detalles.filter((d) => d.grupo === g))),
      onConfirm: handleConfirm,
      onClose: () => setModalCombo(null)
    }
  ) : null;
  return { agregar, loading, modal };
}

const IMG_BASE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";
function ComboImg({ cod_combo }) {
  const [error, setError] = React.useState(false);
  if (error) return /* @__PURE__ */ jsx("div", { className: "product-card__img-placeholder", children: "🎁" });
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: `${IMG_BASE}/${cod_combo}.png`,
      alt: "",
      className: "combo-card__img",
      onError: () => setError(true),
      loading: "lazy"
    }
  );
}
function formatPrecio(precio) {
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}
function ComboCard({ combo }) {
  const [btnState, setBtnState] = useState("idle");
  const { agregar, loading, modal } = useComboAgregar({
    onAdded: () => {
      setBtnState("ok");
      setTimeout(() => setBtnState("idle"), 1500);
    }
  });
  function handleAgregar(e) {
    e.stopPropagation();
    agregar(combo);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "article",
      {
        className: "product-card combo-card",
        onClick: () => window.location.href = `/247/combo/?cod_combo=${combo.cod_combo}`,
        style: { cursor: "pointer" },
        children: [
          /* @__PURE__ */ jsx("div", { className: "product-card__img-wrap", children: /* @__PURE__ */ jsx(ComboImg, { cod_combo: combo.cod_combo }) }),
          /* @__PURE__ */ jsxs("div", { className: "product-card__info", children: [
            /* @__PURE__ */ jsx("p", { className: "product-card__desc", children: combo.nombre }),
            combo.descripcion && /* @__PURE__ */ jsx("p", { className: "product-card__rubro", children: combo.descripcion }),
            /* @__PURE__ */ jsx("p", { className: "product-card__precio", children: formatPrecio(combo.precio) })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `product-card__btn${btnState === "ok" ? " product-card__btn--ok" : ""}`,
              onClick: handleAgregar,
              disabled: loading,
              children: loading ? "..." : btnState === "ok" ? "✓ Agregado" : "Agregar"
            }
          )
        ]
      }
    ),
    modal
  ] });
}

function shuffleArray$1(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const EXCLUIR_FAMILIAS = ["Cigarrillos", "Tabaco", "Tabacos", "Cigarros", "Cigarette"];
const PAGE_SIZE = 8;
function HomeSection({ id, titulo, filtro, verTodosHref, hideVerTodos = false, maxItems, banner }) {
  const isGrid2x2 = filtro.grid2x2 ?? false;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seed, setSeed] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const baseOffsetRef = useRef(-1);
  const discountPoolRef = useRef([]);
  const shufflePoolRef = useRef([]);
  const rowRef = useRef(null);
  const [atScrollEnd, setAtScrollEnd] = useState(false);
  const [atScrollStart, setAtScrollStart] = useState(true);
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) setSeed((s) => s + 1);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") setSeed((s) => s + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  useEffect(() => {
    setPage(0);
    baseOffsetRef.current = -1;
    discountPoolRef.current = [];
    shufflePoolRef.current = [];
  }, [seed]);
  useEffect(() => {
    setLoading(true);
    if (rowRef.current) rowRef.current.scrollLeft = 0;
    let cancelled = false;
    async function fetchData() {
      try {
        const sectionId = id ?? "";
        if (filtro.combos) {
          const { data } = await supabaseClient.from("combos").select("cod_combo, nombre, precio, descripcion, imagen").eq("activo", true).limit(10);
          if (!cancelled) {
            setItems(data ?? []);
            setHasNext(false);
          }
          return;
        }
        if (isGrid2x2) {
          let result2 = [];
          if (filtro.familias && filtro.familias.length > 0) {
            const primeraFamilia = filtro.familias[0];
            if (primeraFamilia.startsWith("__codigos__:")) {
              const codigos = primeraFamilia.replace("__codigos__:", "").split(",").map(Number);
              const { data: pool } = await supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).in("codigo", codigos);
              const familias = [...new Set((pool ?? []).map((p) => p.familiaNombre).filter(Boolean))];
              if (familias.length > 0) {
                const { data: masPool } = await supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).in("familiaNombre", familias).limit(80);
                result2 = shuffleArray$1(masPool ?? []).slice(0, 4);
              } else {
                result2 = shuffleArray$1(pool ?? []).slice(0, 4);
              }
            } else {
              const { data: pool } = await supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).in("familiaNombre", filtro.familias).limit(80);
              result2 = shuffleArray$1(pool ?? []).slice(0, 4);
            }
          }
          if (!cancelled) {
            setItems(result2);
            setHasNext(false);
          }
          return;
        }
        const pageSize = maxItems ?? PAGE_SIZE;
        const offset = page * pageSize;
        let result = [];
        let nextExists = false;
        if (sectionId === "todos") {
          if (shufflePoolRef.current.length === 0) {
            const { data: pool } = await supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).not("familiaNombre", "in", `(${EXCLUIR_FAMILIAS.join(",")})`).limit(500);
            shufflePoolRef.current = shuffleArray$1(pool ?? []);
          }
          result = shufflePoolRef.current.slice(offset, offset + pageSize);
          nextExists = shufflePoolRef.current.length > offset + pageSize;
        } else if (filtro.familias && filtro.familias.length > 0) {
          if (shufflePoolRef.current.length === 0) {
            const { data: pool } = await supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).in("familiaNombre", filtro.familias).limit(300);
            shufflePoolRef.current = shuffleArray$1(pool ?? []);
          }
          result = shufflePoolRef.current.slice(offset, offset + pageSize);
          nextExists = shufflePoolRef.current.length > offset + pageSize;
        } else if (filtro.descuento) {
          if (discountPoolRef.current.length === 0) {
            const { data: pool } = await supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).gt("descuento", 0).limit(300);
            discountPoolRef.current = shuffleArray$1(pool ?? []);
          }
          result = discountPoolRef.current.slice(offset, offset + pageSize);
          nextExists = discountPoolRef.current.length > offset + pageSize;
        } else {
          if (shufflePoolRef.current.length === 0) {
            let query = supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).limit(300);
            if (filtro.familia) query = query.ilike("familiaNombre", filtro.familia);
            if (filtro.seccion) query = query.eq("seccion", filtro.seccion);
            const { data: pool } = await query;
            shufflePoolRef.current = shuffleArray$1(pool ?? []);
          }
          result = shufflePoolRef.current.slice(offset, offset + pageSize);
          nextExists = shufflePoolRef.current.length > offset + pageSize;
        }
        if (!cancelled) {
          setItems(result);
          setHasNext(nextExists);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [seed, page]);
  if (!loading && items.length === 0) return null;
  const handleRowScroll = () => {
    const row = rowRef.current;
    if (!row) return;
    setAtScrollStart(row.scrollLeft <= 16);
    setAtScrollEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - 16);
  };
  const handleArrow = (dir) => {
    rowRef.current?.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxs("section", { className: "home-section home-section--banner", children: [
    banner ? /* @__PURE__ */ jsx("a", { href: verTodosHref, className: "home-section__banner-link", children: /* @__PURE__ */ jsx("img", { src: banner, alt: titulo, className: "home-section__banner", loading: "lazy" }) }) : /* @__PURE__ */ jsx("a", { href: verTodosHref, className: "home-section__banner-link home-section__banner-link--css", children: /* @__PURE__ */ jsxs("div", { className: "home-section__css-banner", children: [
      /* @__PURE__ */ jsx("h2", { className: "home-section__css-banner__titulo", children: titulo }),
      /* @__PURE__ */ jsx("img", { src: "/img/247/logoAlzo247.png", alt: "Alzo 24/7", className: "home-section__css-banner__logo", loading: "lazy" })
    ] }) }),
    isGrid2x2 ? /* @__PURE__ */ jsx("div", { className: "home-section__grid2x2", children: loading ? [...Array(4)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "product-card product-card--skeleton" }, i)) : items.map((a) => /* @__PURE__ */ jsx(ProductCard, { articulo: a }, a.codigo)) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "home-section__row-wrap", children: [
      !atScrollStart && /* @__PURE__ */ jsx("button", { className: "home-section__arrow home-section__arrow--left", onClick: () => handleArrow("left"), "aria-label": "Anterior", children: "‹" }),
      /* @__PURE__ */ jsx("div", { className: "home-section__row", ref: rowRef, onScroll: handleRowScroll, children: loading ? [...Array(4)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "product-card product-card--skeleton" }, i)) : /* @__PURE__ */ jsxs(Fragment, { children: [
        filtro.combos ? items.map((c) => /* @__PURE__ */ jsx(ComboCard, { combo: c }, c.cod_combo)) : items.map((a) => /* @__PURE__ */ jsx(ProductCard, { articulo: a }, a.codigo)),
        /* @__PURE__ */ jsxs("a", { href: verTodosHref, className: "hs-ver-todos-card", children: [
          /* @__PURE__ */ jsx("span", { className: "hs-ver-todos-card__icon", children: "→" }),
          /* @__PURE__ */ jsxs("span", { className: "hs-ver-todos-card__txt", children: [
            "Ver",
            /* @__PURE__ */ jsx("br", {}),
            "todos"
          ] })
        ] })
      ] }) }),
      !atScrollEnd && /* @__PURE__ */ jsx("button", { className: "home-section__arrow home-section__arrow--right", onClick: () => handleArrow("right"), "aria-label": "Siguiente", children: "›" })
    ] }) })
  ] });
}

const FAMILIA_ICONS = {
  // Familias exactas de la BD
  "Almacen": "🛒",
  "Bebidas": "🥤",
  "Chocolates": "🍫",
  "Cigarrillos": "🚬",
  "Cuidado del Hogar": "🧹",
  "Cuidado Personal": "🧴",
  "Golosinas": "🍬",
  "Harinas": "🌾",
  "Libreria": "📚",
  "Varios": "📦",
  // Extras por si agregan más
  "Bebidas con Alcohol": "🍺",
  "Snacks": "🍿",
  "Lácteos": "🥛",
  "Conservas": "🥫",
  "Panadería": "🍞",
  "Congelados": "🧊",
  "Farmacia": "💊",
  "Caramelos Masticables": "🍬",
  "Chicles": "🫧",
  "Mascotas": "🐾"
};
function getIcon(familia) {
  if (FAMILIA_ICONS[familia]) return FAMILIA_ICONS[familia];
  const key = Object.keys(FAMILIA_ICONS).find(
    (k) => familia.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(familia.toLowerCase())
  );
  return key ? FAMILIA_ICONS[key] : "📦";
}
function toSlug(f) {
  return f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}
const PALETA = [
  { bg: "#eef0ff", icon: "#3300ff" },
  { bg: "#fff0e6", icon: "#ff6b00" },
  { bg: "#e6f7ee", icon: "#00a650" },
  { bg: "#fff5e6", icon: "#f59e0b" },
  { bg: "#fce8f3", icon: "#d946a8" },
  { bg: "#e8f4fd", icon: "#0284c7" },
  { bg: "#f0fdf4", icon: "#16a34a" },
  { bg: "#fef9c3", icon: "#ca8a04" }
];
function CategoriesSection({ brandBg, brandText } = {}) {
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabaseClient.from("articulos").select("familiaNombre").gt("stock", 0).then(({ data }) => {
      const u = [...new Set((data ?? []).map((r) => r.familiaNombre))].filter(Boolean).sort();
      setFamilias(u);
      setLoading(false);
    });
  }, []);
  const sectionStyle = brandBg ? { backgroundColor: brandBg } : {};
  const titleStyle = brandText ? { color: brandText } : {};
  if (loading) return /* @__PURE__ */ jsxs("div", { className: "cat-section", style: sectionStyle, children: [
    /* @__PURE__ */ jsx("div", { className: "cat-section__head", children: /* @__PURE__ */ jsx("h2", { className: "cat-section__title", style: titleStyle, children: "Categorías" }) }),
    /* @__PURE__ */ jsx("div", { className: "cat-section__grid", children: [...Array(8)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "cat-section__card cat-section__card--skeleton" }, i)) })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "cat-section", style: sectionStyle, children: [
    /* @__PURE__ */ jsxs("div", { className: "cat-section__head", children: [
      /* @__PURE__ */ jsx("h2", { className: "cat-section__title", style: titleStyle, children: "Categorías" }),
      /* @__PURE__ */ jsx("a", { href: "/247/todos", className: "cat-section__ver-todas", style: brandText ? { color: brandText } : {}, children: "Ver todos los productos →" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "cat-section__grid", children: familias.map((f, i) => {
      const color = PALETA[i % PALETA.length];
      return /* @__PURE__ */ jsxs("a", { href: `/247/categoria/${toSlug(f)}`, className: "cat-section__card", children: [
        /* @__PURE__ */ jsx("div", { className: "cat-section__card-icon", style: { background: color.bg }, children: /* @__PURE__ */ jsx("span", { style: { fontSize: 28 }, children: getIcon(f) }) }),
        /* @__PURE__ */ jsx("span", { className: "cat-section__card-name", children: f })
      ] }, f);
    }) })
  ] });
}

function SearchResults({ q }) {
  const [articulos, setArticulos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (q.length < 2) return;
    setLoading(true);
    Promise.all([
      supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").gt("stock", 0).ilike("descripcion", `%${q}%`).order("orden", { ascending: true }).limit(20),
      supabaseClient.from("combos").select("cod_combo, nombre, precio, descripcion, imagen").eq("activo", true).ilike("nombre", `%${q}%`).limit(5)
    ]).then(([artRes, comboRes]) => {
      setArticulos(artRes.data ?? []);
      setCombos(comboRes.data ?? []);
    }).finally(() => setLoading(false));
  }, [q]);
  const total = articulos.length + combos.length;
  if (loading) return /* @__PURE__ */ jsx("div", { className: "search-results", children: /* @__PURE__ */ jsx("div", { className: "product-grid", children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "product-card product-card--skeleton" }, i)) }) });
  if (!loading && total === 0) return /* @__PURE__ */ jsx("div", { className: "search-results", children: /* @__PURE__ */ jsxs("p", { className: "cat-page__msg", children: [
    'Sin resultados para "',
    /* @__PURE__ */ jsx("strong", { children: q }),
    '"'
  ] }) });
  return /* @__PURE__ */ jsxs("div", { className: "search-results", children: [
    /* @__PURE__ */ jsxs("p", { className: "cat-page__count", children: [
      total,
      " resultado",
      total !== 1 ? "s" : "",
      ' para "',
      /* @__PURE__ */ jsx("strong", { children: q }),
      '"'
    ] }),
    combos.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("h3", { className: "search-results__subtitulo", children: "Combos" }),
      /* @__PURE__ */ jsx("div", { className: "product-grid", children: combos.map((c) => /* @__PURE__ */ jsx(ComboCard, { combo: c }, c.cod_combo)) })
    ] }),
    articulos.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      combos.length > 0 && /* @__PURE__ */ jsx("h3", { className: "search-results__subtitulo", children: "Productos" }),
      /* @__PURE__ */ jsx("div", { className: "product-grid", children: articulos.map((a) => /* @__PURE__ */ jsx(ProductCard, { articulo: a }, a.codigo)) })
    ] })
  ] });
}

const LINKS = [
  {
    img: "/img/247/difusionfooter.png",
    titulo: "Canal de Difusión",
    descripcion: "Seguí nuestras novedades, ofertas y lanzamientos en tiempo real.",
    href: "https://whatsapp.com/channel/0029VbC00Vd3QxS30oAEN60G",
    label: "Unirse al canal"
  },
  {
    img: "/img/247/comercialfooter.png",
    titulo: "Área Comercial",
    descripcion: "Contactá a nuestro equipo de ventas para asesoramiento personalizado.",
    href: `https://wa.me/5493513276516?text=${encodeURIComponent("Hola vengo de Alzo 24/7! Quiero obtener asesoramiento para mi punto de venta!")}`,
    label: "Contactar vendedor"
  },
  {
    img: "/img/247/mayoristafooter.png",
    titulo: "Mayoristas",
    descripcion: "Accedé a precios especiales y condiciones exclusivas para revendedores.",
    href: `https://wa.me/5493516316968?text=${encodeURIComponent("Hola vengo de Alzo 24/7! Quiero obtener asesoramiento para mayoristas!")}`,
    label: "Canal mayorista"
  },
  {
    img: "/img/247/adminfooter.png",
    titulo: "Administración",
    descripcion: "Consultas sobre facturación, pagos y gestión de cuenta.",
    href: "https://wa.me/5493512029862",
    label: "Ir a administración"
  }
];
function Footer247() {
  return /* @__PURE__ */ jsx("footer", { className: "footer247", suppressHydrationWarning: true, children: /* @__PURE__ */ jsxs("div", { className: "footer247__inner", children: [
    /* @__PURE__ */ jsx("div", { className: "footer247__grid", children: LINKS.map((item, i) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: item.href,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "footer247__card",
        children: [
          i > 0 && /* @__PURE__ */ jsx("div", { className: "footer247__divider", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxs("div", { className: "footer247__card-inner", children: [
            /* @__PURE__ */ jsx("div", { className: "footer247__icon", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: item.img,
                alt: item.titulo,
                className: "footer247__icon-img",
                loading: "lazy"
              }
            ) }),
            /* @__PURE__ */ jsx("h3", { className: "footer247__titulo", children: item.titulo }),
            /* @__PURE__ */ jsx("p", { className: "footer247__desc", children: item.descripcion }),
            /* @__PURE__ */ jsx("span", { className: "footer247__link", children: item.label })
          ] })
        ]
      },
      i
    )) }),
    /* @__PURE__ */ jsx("div", { className: "footer247__bottom", children: /* @__PURE__ */ jsx("p", { className: "footer247__copy", suppressHydrationWarning: true, children: "© 2026 Alzo Logística" }) })
  ] }) });
}

const BRAND_COLORS = {
  "alicante": { bg: "#e8f0d8", text: "#1e3010" },
  "bic": { bg: "#ffe4cc", text: "#7a2e00" },
  "bulldog": { bg: "#e4d4ff", text: "#2a0a70" },
  "calipso": { bg: "#f0d8ff", text: "#4a1060" },
  "camel": { bg: "#f5e8c0", text: "#4a3000" },
  "clipper": { bg: "#fff0a0", text: "#3a2800" },
  "drf": { bg: "#cce8cc", text: "#1a3a1a" },
  "duracell": { bg: "#1a1108", text: "#d4863a" },
  "gongys": { bg: "#ffd4f0", text: "#5a0840" },
  "hamlet": { bg: "#f0ddb8", text: "#3a2000" },
  "integra": { bg: "#080808", text: "#e8e8e8" },
  "lucky": { bg: "#ffc8c8", text: "#5a0808" },
  "mentos": { bg: "#c8dcff", text: "#08204a" },
  "misky": { bg: "#ffc8c0", text: "#5a1008" },
  "noel": { bg: "#c0dcf8", text: "#082050" },
  "nosotras": { bg: "#f0c8ff", text: "#480858" },
  "RindeDos": { bg: "#c8f0c8", text: "#0a3010" },
  "suerox": { bg: "#b8d8ff", text: "#041848" },
  "takis": { bg: "#0e1217", text: "#f5d020" },
  "VerdeFlor": { bg: "#d0f0c0", text: "#0a2808" },
  "yummy": { bg: "#1a2580", text: "#f5d020" },
  "zono": { bg: "#e8faff", text: "#007a9a" }
};
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function BrandSection({ seccion, titulo }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const rowRef = useRef(null);
  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };
  const brand = BRAND_COLORS[seccion] ?? { bg: "#f0f2f5"};
  const bannerSrc = `/img/247/secciones/${seccion}.png`;
  const verTodosHref = `/247/seccion/?slug=${seccion}`;
  useEffect(() => {
    setLoading(true);
    supabaseClient.from("articulos").select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock").eq("seccion", seccion).gt("stock", 0).limit(80).then(({ data }) => {
      setItems(shuffleArray(data ?? []).slice(0, 10));
    }).finally(() => setLoading(false));
  }, [seccion]);
  if (!loading && items.length === 0) return null;
  return /* @__PURE__ */ jsxs("section", { className: "brand-section", style: { backgroundColor: brand.bg }, children: [
    /* @__PURE__ */ jsx("a", { href: verTodosHref, className: "brand-section__banner-link", children: imgError ? /* @__PURE__ */ jsxs("div", { className: "brand-section__banner-fallback", children: [
      /* @__PURE__ */ jsx("span", { className: "brand-section__banner-title", children: titulo }),
      /* @__PURE__ */ jsx("span", { className: "brand-section__banner-cta", children: "ver todos →" })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "brand-section__banner-wrap", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: bannerSrc,
          alt: titulo,
          className: "brand-section__banner-img",
          onError: () => setImgError(true),
          loading: "lazy"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "brand-section__banner-cta-overlay", children: "ver todos →" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "brand-section__row-wrap", children: [
      /* @__PURE__ */ jsx("button", { className: "home-section__arrow home-section__arrow--left", onClick: () => scroll("left"), "aria-label": "Anterior", children: "‹" }),
      /* @__PURE__ */ jsx("div", { className: "brand-section__row", ref: rowRef, children: loading ? [...Array(4)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "product-card product-card--skeleton" }, i)) : /* @__PURE__ */ jsxs(Fragment, { children: [
        items.map((a) => /* @__PURE__ */ jsx(ProductCard, { articulo: a }, a.codigo)),
        /* @__PURE__ */ jsxs("a", { href: verTodosHref, className: "hs-ver-todos-card", children: [
          /* @__PURE__ */ jsx("span", { className: "hs-ver-todos-card__icon", children: "→" }),
          /* @__PURE__ */ jsxs("span", { className: "hs-ver-todos-card__txt", children: [
            "Ver",
            /* @__PURE__ */ jsx("br", {}),
            "todos"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("button", { className: "home-section__arrow home-section__arrow--right", onClick: () => scroll("right"), "aria-label": "Siguiente", children: "›" })
    ] })
  ] });
}

function App247() {
  const [busqueda, setBusqueda] = useState("");
  const [cartCount, setCartCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]").reduce((s, i) => s + i.cantidad, 0);
    } catch {
      return 0;
    }
  });
  const [familiasUltimoPedido, setFamiliasUltimoPedido] = useState([]);
  const [familiasVistos, setFamiliasVistos] = useState([]);
  const [familiasOpuestas, setFamiliasOpuestas] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const deferredQ = useDeferredValue(busqueda);
  const buscando = deferredQ.length >= 2;
  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", sync);
    try {
      const pedidos = JSON.parse(localStorage.getItem("alzo_pedidos") ?? "[]");
      if (pedidos.length > 0) {
        const items = pedidos[0].items ?? [];
        const familias = [...new Set(items.map((i) => i.familiaNombre).filter(Boolean))];
        if (familias.length > 0) {
          setFamiliasUltimoPedido(familias);
        } else if (items.length > 0) {
          const codigos = items.map((i) => i.codigo).filter(Boolean);
          if (codigos.length > 0) setFamiliasUltimoPedido(["__codigos__:" + codigos.join(",")]);
        }
      }
    } catch {
    }
    try {
      const ultimoVisto = localStorage.getItem("alzo_ultimo_visto");
      if (ultimoVisto) {
        setFamiliasVistos([ultimoVisto]);
        const EXCLUIR = ["Cigarrillos", "Tabaco", "Tabacos", "Cigarros", "Cigarette"];
        supabaseClient.from("articulos").select("familiaNombre").gt("stock", 0).not("familiaNombre", "is", null).neq("familiaNombre", "").neq("familiaNombre", ultimoVisto).not("familiaNombre", "in", `(${EXCLUIR.join(",")})`).then(({ data }) => {
          if (!data) return;
          const familias = [...new Set(data.map((r) => r.familiaNombre).filter(Boolean))];
          if (familias.length > 0) {
            const elegida = familias[Math.floor(Math.random() * familias.length)];
            setFamiliasOpuestas([elegida]);
          }
        });
      }
    } catch {
    }
    supabaseClient.from("articulos").select("seccion").gt("stock", 0).not("seccion", "is", null).neq("seccion", "").then(({ data }) => {
      if (!data) return;
      const slugs = [...new Set(data.map((r) => r.seccion).filter(Boolean))];
      const todas = slugs.map((s) => ({
        seccion: s,
        titulo: s.charAt(0).toUpperCase() + s.slice(1)
      }));
      for (let i = todas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [todas[i], todas[j]] = [todas[j], todas[i]];
      }
      setMarcas(todas);
    });
    setMounted(true);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);
  const marcasRandom = marcas.slice(0, 3);
  return /* @__PURE__ */ jsxs("div", { className: "app-247", children: [
    /* @__PURE__ */ jsx(
      Header247,
      {
        showSearch: true,
        busqueda,
        onBusquedaChange: setBusqueda,
        onBusquedaClear: () => setBusqueda(""),
        cartCount
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "shell-247", children: buscando ? /* @__PURE__ */ jsx(SearchResults, { q: deferredQ }) : /* @__PURE__ */ jsxs("div", { className: "home-sections", children: [
      mounted && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(HomeSection, { id: "descuentos", titulo: "Descuentos Exclusivos", filtro: { descuento: true }, verTodosHref: "/247/descuentos", banner: "/img/247/secciones/descuentosExlusivosBanner.png" }),
        familiasVistos.length > 0 && /* @__PURE__ */ jsx(HomeSection, { id: "vistos", titulo: "Inspirado en lo último que viste", filtro: { familias: familiasVistos }, verTodosHref: `/247/vistos/?familias=${encodeURIComponent(familiasVistos.join(","))}` }),
        marcasRandom[0] && /* @__PURE__ */ jsx(BrandSection, { seccion: marcasRandom[0].seccion, titulo: marcasRandom[0].titulo }),
        familiasOpuestas.length > 0 && /* @__PURE__ */ jsx(HomeSection, { id: "te-puede-interesar", titulo: "Te puede interesar", filtro: { familias: familiasOpuestas }, verTodosHref: `/247/categoria/${familiasOpuestas[0].toLowerCase().replace(/\s+/g, "-")}` }),
        /* @__PURE__ */ jsx(HomeSection, { id: "combos", titulo: "Combos", filtro: { combos: true }, verTodosHref: "/247/combos", banner: "/img/247/secciones/combosBanner.png" }),
        familiasUltimoPedido.length > 0 && /* @__PURE__ */ jsx(HomeSection, { id: "ultimo-pedido", titulo: "Según tu último pedido", filtro: { familias: familiasUltimoPedido, grid2x2: true }, verTodosHref: `/247/ultimo-pedido/?familias=${encodeURIComponent(familiasUltimoPedido.join(","))}` }),
        marcasRandom[1] && /* @__PURE__ */ jsx(BrandSection, { seccion: marcasRandom[1].seccion, titulo: marcasRandom[1].titulo }),
        /* @__PURE__ */ jsx(HomeSection, { id: "todos", titulo: "Todos los productos", filtro: {}, verTodosHref: "/247/todos" }),
        marcasRandom[2] && /* @__PURE__ */ jsx(BrandSection, { seccion: marcasRandom[2].seccion, titulo: marcasRandom[2].titulo }),
        /* @__PURE__ */ jsx("a", { href: "https://whatsapp.com/channel/0029VbC00Vd3QxS30oAEN60G", target: "_blank", rel: "noopener noreferrer", className: "home-canal-dif-banner", children: /* @__PURE__ */ jsx("img", { src: "/img/247/secciones/canalDeDifBanner.png", alt: "Canal de difusión Alzo" }) }),
        /* @__PURE__ */ jsx(HomeSection, { id: "cigarrillos", titulo: "Cigarrillos", filtro: { familia: "Cigarrillos" }, verTodosHref: "/247/categoria/cigarrillos" })
      ] }),
      /* @__PURE__ */ jsx(CategoriesSection, {})
    ] }) }),
    /* @__PURE__ */ jsx(Footer247, {})
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout247", $$Layout247, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "App247", App247, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/workspace/alzologistica/src/components/247/App247", "client:component-export": "default" })} ` })}`;
}, "C:/workspace/alzologistica/src/pages/247/index.astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/247/index.astro";
const $$url = "/247";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
