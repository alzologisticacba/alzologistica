// src/components/247/TodosPage.tsx
import { useState, useDeferredValue } from "react";
import { useArticulos } from "./hooks/useArticulos";
import { useFamilias } from "./hooks/useFamilias";
import ProductCard from "./ProductCard";
import Header247 from "./Header247";

export default function TodosPage() {
  const [familiaActiva, setFamiliaActiva] = useState<string>("");
  const [busqueda, setBusqueda]           = useState("");
  const deferredQ                         = useDeferredValue(busqueda);
  const { familias }                      = useFamilias();

  const { data: articulos, loading, error, meta } = useArticulos({
    familia: familiaActiva || undefined,
    q:       deferredQ    || undefined,
  });

  return (
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        <h1 className="cat-page__titulo">Todos los productos</h1>

        <div className="cat-page__search-wrap">
          <span className="cat-page__search-icon">🔍</span>
          <input type="search" className="cat-page__search" placeholder="Buscar producto..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          {busqueda && <button className="cat-page__search-clear" onClick={() => setBusqueda("")}>✕</button>}
        </div>

        {familias.length > 0 && (
          <div className="cat-page__rubros">
            <button className={`cat-page__rubro-btn${familiaActiva === "" ? " cat-page__rubro-btn--active" : ""}`} onClick={() => setFamiliaActiva("")}>Todos</button>
            {familias.map(f => (
              <button key={f}
                className={`cat-page__rubro-btn${familiaActiva === f ? " cat-page__rubro-btn--active" : ""}`}
                onClick={() => setFamiliaActiva(f === familiaActiva ? "" : f)}>{f}</button>
            ))}
          </div>
        )}

        {loading && <div className="product-grid">{[...Array(6)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}</div>}
        {!loading && error && <p className="cat-page__msg">Error al cargar productos.</p>}
        {!loading && !error && articulos.length === 0 && <p className="cat-page__msg">No se encontraron productos.</p>}
        {!loading && !error && articulos.length > 0 && (
          <>
            <p className="cat-page__count">{meta?.total ?? articulos.length} productos</p>
            <div className="product-grid">{articulos.map(a => <ProductCard key={a.codigo} articulo={a} />)}</div>
          </>
        )}
      </div>
    </div>
  );
}