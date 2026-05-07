import { e as createAstro, f as createComponent, r as renderTemplate, k as renderComponent, n as renderSlot, l as renderHead, o as renderScript, h as addAttribute } from './astro/server_DeMhYegR.mjs';
import 'piccolore';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
/* empty css                           */

const KEY = "alzo_cart";
const AGE_KEY = "alzo_mayor18";
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
function save(cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
  }
}
function dispatch() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("cart-updated"));
}
function buildCartKey(item) {
  if (item.tipo === "combo" && item.contenido) {
    const elegidos = item.contenido.filter((c) => c.elegido).map((c) => `${c.producto}x${c.cantidad}`).sort().join(",");
    return elegidos ? `combo:${item.cod_combo}:${elegidos}` : `combo:${item.cod_combo}`;
  }
  return String(item.codigo);
}
function getCartCount() {
  return load().reduce((s, i) => s + i.cantidad, 0);
}
function requiresAgeGate(item) {
  const keywords = ["cigarro", "cigarri", "tabaco"];
  const haystack = `${item.rubro ?? ""} ${item.familiaNombre ?? ""} ${item.descripcion}`.toLowerCase();
  return keywords.some((k) => haystack.includes(k));
}
function addToCart(item) {
  if (typeof window !== "undefined" && requiresAgeGate(item)) {
    const age = localStorage.getItem(AGE_KEY);
    if (age === null) {
      window.dispatchEvent(new CustomEvent("cart-age-gate", { detail: item }));
      return "pending";
    }
  }
  const MAX_POR_CODIGO = { 549146: 50 };
  const MAX_COMBO_TOTAL = { "COMBO597": 2 };
  const cartKey = buildCartKey(item);
  const cart = load();
  const existing = cart.find((i) => i.cartKey === cartKey);
  const incremento = item.multiplo || 1;
  let maxQty;
  if (item.cod_combo && MAX_COMBO_TOTAL[item.cod_combo] !== void 0) {
    const totalOtros = cart.filter((i) => i.cod_combo === item.cod_combo && i.cartKey !== cartKey).reduce((s, i) => s + i.cantidad, 0);
    maxQty = Math.max(0, MAX_COMBO_TOTAL[item.cod_combo] - totalOtros);
  } else {
    maxQty = item.cod_combo ? Infinity : MAX_POR_CODIGO[item.codigo] ?? Infinity;
  }
  if (existing) {
    existing.cantidad = Math.min(existing.cantidad + incremento, maxQty);
  } else {
    if (maxQty <= 0) return "added";
    cart.push({ ...item, cartKey, cantidad: Math.min(incremento, maxQty) });
  }
  save(cart);
  dispatch();
  return "added";
}
function setAgeVerified(v) {
  try {
    localStorage.setItem(AGE_KEY, v ? "true" : "false");
  } catch {
  }
}

function AgeGateModal() {
  const [pendingItem, setPendingItem] = useState(null);
  useEffect(() => {
    function handleAgeGate(e) {
      const item = e.detail;
      setPendingItem(item);
    }
    window.addEventListener("cart-age-gate", handleAgeGate);
    return () => window.removeEventListener("cart-age-gate", handleAgeGate);
  }, []);
  function confirmar(esMayor) {
    if (esMayor) {
      setAgeVerified(true);
      if (pendingItem) {
        addToCart(pendingItem);
        window.dispatchEvent(new CustomEvent("cart-age-confirmed", { detail: { codigo: pendingItem.codigo } }));
      }
    }
    setPendingItem(null);
  }
  if (!pendingItem) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "alzomodal-backdrop", onClick: () => setPendingItem(null) }),
    /* @__PURE__ */ jsx("div", { className: "alzomodal", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "alzomodal-card age-gate-card", children: [
      /* @__PURE__ */ jsx("div", { className: "age-gate__icon", children: "🔞" }),
      /* @__PURE__ */ jsx("h3", { className: "alzomodal-title age-gate__title", children: "¿Sos mayor de 18 años?" }),
      /* @__PURE__ */ jsx("p", { className: "age-gate__desc", children: "Algunos de nuestros productos, como cigarrillos, están destinados exclusivamente a adultos." }),
      /* @__PURE__ */ jsxs("div", { className: "alzomodal-actions age-gate__actions", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "alzomodal-btn alzomodal-btn--ghost",
            onClick: () => confirmar(false),
            children: "No, soy menor"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "alzomodal-btn",
            onClick: () => confirmar(true),
            children: "Sí, soy mayor de 18"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "age-gate__legal", children: "Al continuar confirmás que tenés 18 años o más." })
    ] }) })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://alzologistica.com");
const $$Layout247 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout247;
  const {
    title = "Alzo 24/7",
    description = "Alzo 24/7: Hace tu pedido simple, sin registros y sin vueltas",
    canonical = "https://alzologistica.com/247"
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', '</title><meta name="description"', '><link rel="canonical"', '><link rel="icon" type="image/png" href="/img/alzo_logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Barlow+Condensed:wght@800&display=swap" rel="stylesheet"><!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-9Q1TQ7Y5BH"><\/script>', "", "</head> <body> ", " ", " </body></html>"])), title, addAttribute(description, "content"), addAttribute(canonical, "href"), renderScript($$result, "C:/workspace/alzologistica/src/layouts/Layout247.astro?astro&type=script&index=0&lang.ts"), renderHead(), renderSlot($$result, $$slots["default"]), renderComponent($$result, "AgeGateModal", AgeGateModal, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/workspace/alzologistica/src/components/247/AgeGateModal", "client:component-export": "default" }));
}, "C:/workspace/alzologistica/src/layouts/Layout247.astro", void 0);

export { $$Layout247 as $, addToCart as a, getCartCount as g };
