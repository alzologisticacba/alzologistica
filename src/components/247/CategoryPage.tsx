// src/components/247/CategoryPage.tsx
import { useState, useDeferredValue, useEffect } from "react";
import { useArticulos } from "./hooks/useArticulos";
import { useRubros } from "./hooks/useRubros";
import ProductCard from "./ProductCard";
import Header247 from "./Header247";
import PageFooterSection from "./PageFooterSection";

interface CategoryPageProps {
  familia?: string;
  titulo?: string;
}

export default function CategoryPage({ familia: familiaProp, titulo: tituloProp }: CategoryPageProps) {
  const [rubroActivo, setRubroActivo] = useState<string>("");
  const [busqueda, setBusqueda]       = useState("");
  const deferredBusqueda              = useDeferredValue(busqueda);
  const [familia, setFamilia]         = useState<string>(familiaProp ?? "");
  const [titulo,  setTitulo]          = useState<string>(tituloProp  ?? "");

  useEffect(() => {
    if (familiaProp) { setFamilia(familiaProp); setTitulo(tituloProp ?? familiaProp); return; }
    const slug = window.location.pathname.split("/").pop() ?? "";
    if (slug) {
      const display = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      setFamilia(display);
      setTitulo(display);
    }
  }, [familiaProp, tituloProp]);

  const { rubros } = useRubros(familia);
  const { data: articulos, loading, error, meta } = useArticulos({
    familia: familia || undefined,
    rubro:   rubroActivo || undefined,
    q:       deferredBusqueda || undefined,
  });

  return (
    <>
    <div className="app-247">
      {/* Header FUERA del shell para que sea full-width */}
      <Header247 showBack={true} />

      <div className="shell-247">
        <h1 className="cat-page__titulo">{titulo}</h1>

        <div className="cat-page__search-wrap">
          <span className="cat-page__search-icon">🔍</span>
          <input type="search" className="cat-page__search" placeholder="Buscar producto..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          {busqueda && <button className="cat-page__search-clear" onClick={() => setBusqueda("")}>✕</button>}
        </div>

        {rubros.length > 0 && (
          <div className="cat-page__rubros">
            <button className={`cat-page__rubro-btn${rubroActivo === "" ? " cat-page__rubro-btn--active" : ""}`} onClick={() => setRubroActivo("")}>Todos</button>
            {rubros.map(r => (
              <button key={r}
                className={`cat-page__rubro-btn${rubroActivo === r ? " cat-page__rubro-btn--active" : ""}`}
                onClick={() => setRubroActivo(r === rubroActivo ? "" : r)}>{r}</button>
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
    {!loading && <PageFooterSection />}
  </>
  );
}