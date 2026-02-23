// src/components/247/SearchResults.tsx
// Resultados del buscador global — busca en articulos y combos

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import ComboCard from "./ComboCard";

interface SearchResultsProps {
  q: string;
}

export default function SearchResults({ q }: SearchResultsProps) {
  const [articulos, setArticulos] = useState<any[]>([]);
  const [combos, setCombos]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!q || q.length < 2) return;
    setLoading(true);

    fetch(`/api/buscar?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(json => {
        setArticulos(json.articulos ?? []);
        setCombos(json.combos ?? []);
      })
      .finally(() => setLoading(false));
  }, [q]);

  if (loading) {
    return (
      <div className="product-grid" style={{ marginTop: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="product-card product-card--skeleton" />
        ))}
      </div>
    );
  }

  const total = articulos.length + combos.length;

  if (total === 0) {
    return <p className="cat-page__msg">Sin resultados para "{q}"</p>;
  }

  return (
    <div className="search-results">
      <p className="cat-page__count">{total} resultados para "{q}"</p>

      {combos.length > 0 && (
        <section className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__titulo">Combos</h2>
          </div>
          <div className="product-grid">
            {combos.map(c => <ComboCard key={c.cod_combo} combo={c} />)}
          </div>
        </section>
      )}

      {articulos.length > 0 && (
        <section className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__titulo">Productos</h2>
          </div>
          <div className="product-grid">
            {articulos.map(a => <ProductCard key={a.codigo} articulo={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}