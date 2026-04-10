// src/components/mayorista/SearchResultsMayorista.tsx
import { useState, useEffect } from "react";
import ProductCard from "../247/ProductCard";
import ComboCard from "../247/ComboCard";
import { supabaseClient } from "../../lib/supabaseClient";

export default function SearchResultsMayorista({ query, onClear }: { query: string; onClear: () => void }) {
  const [articulos, setArticulos] = useState<any[]>([]);
  const [combos, setCombos]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (query.length < 2) return;
    setLoading(true);

    const isNumeric = /^\d+$/.test(query.trim());

    const textQuery = supabaseClient
      .from("articulos")
      .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock, proveedor")
      .gt("stock", 0)
      .or(`descripcion.ilike.%${query}%,proveedor.ilike.%${query}%`)
      .order("orden", { ascending: true })
      .limit(60);

    const codeQuery = isNumeric
      ? supabaseClient
          .from("articulos")
          .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock, proveedor")
          .gt("stock", 0)
          .ilike("codigo_str", `${query}%`)
          .order("orden", { ascending: true })
          .limit(60)
      : null;

    const comboQuery = supabaseClient
      .from("combos")
      .select("cod_combo, nombre, precio, descripcion, imagen")
      .eq("activo", true)
      .ilike("nombre", `%${query}%`)
      .limit(5);

    Promise.all([textQuery, codeQuery ?? Promise.resolve({ data: [] }), comboQuery])
      .then(([textRes, codeRes, comboRes]) => {
        const combined = [...(textRes.data ?? []), ...(codeRes.data ?? [])];
        const seen = new Set<number>();
        const unique = combined.filter(item => {
          if (seen.has(item.codigo)) return false;
          seen.add(item.codigo);
          return true;
        });
        setArticulos(unique);
        setCombos(comboRes.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [query]);

  const total = articulos.length + combos.length;

  if (loading) return (
    <div className="search-results">
      <div className="product-grid">
        {[...Array(6)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}
      </div>
    </div>
  );

  if (!loading && total === 0) return (
    <div className="search-results">
      <p className="cat-page__msg">Sin resultados para "<strong>{query}</strong>"</p>
    </div>
  );

  return (
    <div className="search-results">
      <p className="cat-page__count">{total} resultado{total !== 1 ? "s" : ""} para "<strong>{query}</strong>"</p>
      {combos.length > 0 && (
        <>
          <h3 className="search-results__subtitulo">Combos</h3>
          <div className="product-grid">
            {combos.map(c => <ComboCard key={c.cod_combo} combo={c} />)}
          </div>
        </>
      )}
      {articulos.length > 0 && (
        <>
          {combos.length > 0 && <h3 className="search-results__subtitulo">Productos</h3>}
          <div className="product-grid">
            {articulos.map(a => <ProductCard key={a.codigo} articulo={a} />)}
          </div>
        </>
      )}
    </div>
  );
}
