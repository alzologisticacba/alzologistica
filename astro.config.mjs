// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://alzologistica.com",
  output: "static",
  integrations: [react()],
});
