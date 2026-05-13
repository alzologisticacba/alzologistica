export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

const STORAGE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public";
const SITE = "https://alzologistica.com";

export const GET: APIRoute = async () => {
  const { data, error } = await supabase
    .from("articulos")
    .select("codigo, descripcion, rubro, familiaNombre, stock")
    .gt("stock", 0)
    .order("orden", { ascending: true });

  if (error) {
    return new Response(`<?xml version="1.0"?><error>${error.message}</error>`, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }

  const urls = (data ?? []).map((p) => {
    const titulo = p.descripcion.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
    const imageUrl = `${STORAGE}/Productos/articulos/${p.codigo}.png`;
    const pageUrl = `${SITE}/247/producto/?codigo=${p.codigo}`;
    const caption = `${p.familiaNombre} · ${p.rubro} · Mayorista Alzo 24/7`;

    return `
  <url>
    <loc>${pageUrl}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${titulo}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${urls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
