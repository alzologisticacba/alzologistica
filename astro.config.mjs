// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://alzologistica.com",
  output: "hybrid",
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes("/admin/") &&
        !page.includes("/reparto/") &&
        !page.includes("/vencimientos/") &&
        !page.includes("/auth/") &&
        !page.includes("/carrito") &&
        !page.includes("/pedidos") &&
        !page.includes("/mayorista") &&
        !page.includes("/api/") &&
        !page.includes("/ultimo-pedido") &&
        !page.includes("/vistos") &&
        !page.endsWith("/247/producto/") &&
        !page.endsWith("/247/seccion/") &&
        !page.endsWith("/247/combo/"),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
