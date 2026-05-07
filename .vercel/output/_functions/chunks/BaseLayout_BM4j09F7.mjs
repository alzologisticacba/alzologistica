import { e as createAstro, f as createComponent, r as renderTemplate, n as renderSlot, l as renderHead, o as renderScript, m as maybeRenderHead } from './astro/server_DeMhYegR.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://alzologistica.com");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title = "Alzo Log\xEDstica",
    description = "Alzo Log\xEDstica es un distribuidor mayorista en C\xF3rdoba. Abastecemos kioscos, autoservicios y supermercados con marcas l\xEDderes.",
    canonical = "https://alzologistica.com/",
    ogImage = "https://alzologistica.com/img/og.jpg"
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><!-- SEO base --><title>', `</title><meta name="google-site-verification" content="ZZHh5WEu4eCdILerXvBqiOUXCjhujhfqByb1znQIo7M"><link rel="icon" type="image/png" href="/img/alzo_logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- Google Fonts no-bloqueante --><link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">`, `<noscript><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet"></noscript><!-- Font Awesome no-bloqueante --><link rel="preload" as="style" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"></noscript>`, '<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y71FG34K3B"><\/script>', '<meta name="description" content="Alzo. Distribuidor mayorista en C\xF3rdoba. Abastecemos kioscos, autoservicios y supermercados con marcas l\xEDderes. Pedidos \xE1giles y atenci\xF3n por WhatsApp.">', '</head> <body> <main class="page"> ', " </main> </body></html>"])), title, maybeRenderHead(), renderSlot($$result, $$slots["head"]), renderScript($$result, "C:/workspace/alzologistica/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"), renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/workspace/alzologistica/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
