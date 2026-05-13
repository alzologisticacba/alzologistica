export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

const STORAGE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public";
const SITE = "https://alzologistica.com";

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const GET: APIRoute = async () => {
  const { data, error } = await supabase
    .from("articulos")
    .select("codigo, descripcion, precioFinal, descuento, rubro, familiaNombre, proveedor, stock")
    .gt("stock", 0)
    .order("orden", { ascending: true });

  if (error) {
    return new Response(`<?xml version="1.0"?><error>${esc(error.message)}</error>`, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }

  const items = (data ?? []).map((p) => {
    const precio = p.descuento > 0
      ? p.precioFinal * (1 - p.descuento / 100)
      : p.precioFinal;
    const titulo = p.descripcion.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
    const imageUrl = `${STORAGE}/Productos/articulos/${p.codigo}.png`;
    const productUrl = `${SITE}/247/producto/?codigo=${p.codigo}`;
    const brand = p.proveedor ?? p.familiaNombre;

    return `
    <item>
      <g:id>${p.codigo}</g:id>
      <g:title><![CDATA[${titulo}]]></g:title>
      <g:description><![CDATA[${p.familiaNombre} · ${p.rubro} · Mayorista Alzo 24/7]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:price>${precio.toFixed(2)} ARS</g:price>
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand><![CDATA[${brand}]]></g:brand>
      <g:product_type><![CDATA[${p.familiaNombre} > ${p.rubro}]]></g:product_type>
      <g:mpn>${p.codigo}</g:mpn>
    </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Alzo 24/7</title>
    <link>${SITE}/247</link>
    <description>Mayorista de golosinas y alimentos en Córdoba, Argentina</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
