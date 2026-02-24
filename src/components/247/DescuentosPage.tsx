// src/components/247/DescuentosPage.tsx
import { useState, useDeferredValue } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import { useArticulos } from "./hooks/useArticulos";

export default function DescuentosPage() {
  const [busqueda, setBusqueda] = useState("");
  const deferredQ               = useDeferredValue(busqueda);

  const { data, meta, loading } = useArticulos({
    q:        deferredQ || undefined,
    descuento: true,
  } as any);

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

        {loading && <div className="product-grid">{[...Array(10)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}</div>}
        {!loading && data.length === 0 && <p className="cat-page__msg">Sin descuentos disponibles.</p>}
        {!loading && data.length > 0 && (
          <>
            <p className="cat-page__count">{meta?.total ?? data.length} productos con descuento</p>
            <div className="product-grid">{data.map(a => <ProductCard key={a.codigo} articulo={a} />)}</div>
          </>
        )}
      </div>
    </div>
  );
}