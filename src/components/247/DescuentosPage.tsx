// src/components/247/DescuentosPage.tsx
import { useState, useEffect, useDeferredValue } from "react";
import ProductCard from "./ProductCard";
import Header247 from "./Header247";
import type { Articulo } from "./hooks/useArticulos";

export default function DescuentosPage() {
  const [busqueda, setBusqueda]     = useState("");
  const [articulos, setArticulos]   = useState<Articulo[]>([]);
  const [loading, setLoading]       = useState(true);
  const deferredQ                   = useDeferredValue(busqueda);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (deferredQ) params.set("q", deferredQ);
    fetch(`/api/descuentos?${params}`)
      .then(r => r.json())
      .then(json => setArticulos(json.data ?? []))
      .finally(() => setLoading(false));
  }, [deferredQ]);

  return (
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        <h1 className="cat-page__titulo">Descuentos Exclusivos</h1>

        <div className="cat-page__search-wrap">
          <span className="cat-page__search-icon">🔍</span>
          <input type="search" className="cat-page__search" placeholder="Buscar producto..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          {busqueda && <button className="cat-page__search-clear" onClick={() => setBusqueda("")}>✕</button>}
        </div>

        {loading && <div className="product-grid">{[...Array(6)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}</div>}
        {!loading && articulos.length === 0 && <p className="cat-page__msg">No hay productos con descuento.</p>}
        {!loading && articulos.length > 0 && (
          <>
            <p className="cat-page__count">{articulos.length} productos con descuento</p>
            <div className="product-grid">{articulos.map(a => <ProductCard key={a.codigo} articulo={a} />)}</div>
          </>
        )}
      </div>
    </div>
  );
}