// Cache de build: comparte la query de articulos entre todos los getStaticPaths.
// En Astro, getStaticPaths de distintas páginas corre en el mismo proceso Node.js,
// así que este módulo actúa como singleton y evita queries duplicadas a Supabase.
import { supabase } from "./supabase";

export interface ArticuloBase {
  codigo:        number;
  descripcion:   string;
  proveedor?:    string;
  rubro:         string;
  precioFinal:   number;
  descuento:     number;
  multiplo:      number;
  familiaNombre: string;
  stock:         number;
  uxb?:          number;
}

let _cache: ArticuloBase[] | null = null;

export async function getAllArticulosConStock(): Promise<ArticuloBase[]> {
  if (_cache) return _cache;
  const { data } = await supabase
    .from("articulos")
    .select("codigo, descripcion, proveedor, rubro, precioFinal, descuento, multiplo, familiaNombre, stock, uxb")
    .gt("stock", 0)
    .order("orden", { ascending: true });
  _cache = data ?? [];
  return _cache;
}
