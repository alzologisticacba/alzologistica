// src/components/247/SearchResults.tsx
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import ComboCard from "./ComboCard";
import { supabaseClient } from "../../lib/supabaseClient";

export default function SearchResults({ q }: { q: string }) {
  const [articulos, setArticulos] = useState<any[]>([]);
  const [combos, setCombos]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (q.length < 2) return;
    setLoading(true);

    Promise.all([
      supabaseClient
        .from("articulos")
        .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
        .gt("stock", 0)
        .ilike("descripcion", `%${q}%`)
        .order("orden", { ascending: true })
        .limit(20),
      supabaseClient
        .from("combos")
        .select("cod_combo, nombre, precio, descripcion, imagen")
        .eq("activo", true)
        .ilike("nombre", `%${q}%`)
        .limit(5),
    ]).then(([artRes, comboRes]) => {
      setArticulos(artRes.data ?? []);
      setCombos(comboRes.data ?? []);
    }).finally(() => setLoading(false));
  }, [q]);

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
      <p className="cat-page__msg">Sin resultados para "<strong>{q}</strong>"</p>
    </div>
  );

  return (
    <div className="search-results">
      <p className="cat-page__count">{total} resultado{total !== 1 ? "s" : ""} para "<strong>{q}</strong>"</p>
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