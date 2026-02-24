// src/components/247/TodosPage.tsx
import { useState, useDeferredValue, useEffect } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import PageFooterSection from "./PageFooterSection";
import { useArticulos } from "./hooks/useArticulos";
import { supabaseClient } from "../../lib/supabaseClient";

export default function TodosPage() {
  const [busqueda, setBusqueda]       = useState("");
  const [familiaActiva, setFamilia]   = useState("");
  const [familias, setFamilias]       = useState<string[]>([]);
  const [page, setPage]               = useState(1);
  const deferredQ                     = useDeferredValue(busqueda);

  // Cargar familias disponibles
  useEffect(() => {
    supabaseClient
      .from("articulos")
      .select("familiaNombre")
      .gt("stock", 0)
      .then(({ data }) => {
        const unicas = [...new Set((data ?? []).map((r: any) => r.familiaNombre as string))]
          .filter(Boolean).sort();
        setFamilias(unicas);
      });
  }, []);

  const { data, meta, loading } = useArticulos({
    familia: familiaActiva || undefined,
    q:       deferredQ     || undefined,
    page,
    limit: 40,
  });

  function handleBusqueda(v: string) { setBusqueda(v); setPage(1); }
  function handleFamilia(f: string)  { setFamilia(f); setPage(1); }

  return (
    <>
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        <h1 className="cat-page__titulo">Todos los productos</h1>

        {/* Buscador */}
        <div className="cat-page__search-wrap">
          <span className="cat-page__search-icon">🔍</span>
          <input type="search" className="cat-page__search" placeholder="Buscar producto..."
            value={busqueda} onChange={(e) => handleBusqueda(e.target.value)} />
          {busqueda && <button className="cat-page__search-clear" onClick={() => handleBusqueda("")}>✕</button>}
        </div>

        {/* Filtros de familia */}
        {familias.length > 0 && (
          <div className="cat-page__rubros">
            <button
              className={`cat-page__rubro-btn${familiaActiva === "" ? " cat-page__rubro-btn--active" : ""}`}
              onClick={() => handleFamilia("")}
            >Todos</button>
            {familias.map(f => (
              <button
                key={f}
                className={`cat-page__rubro-btn${familiaActiva === f ? " cat-page__rubro-btn--active" : ""}`}
                onClick={() => handleFamilia(familiaActiva === f ? "" : f)}
              >{f}</button>
            ))}
          </div>
        )}

        {/* Resultados */}
        {loading && (
          <div className="product-grid">
            {[...Array(10)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}
          </div>
        )}

        {!loading && data.length === 0 && <p className="cat-page__msg">Sin resultados.</p>}

        {!loading && data.length > 0 && (
          <>
            <p className="cat-page__count">{meta?.total ?? data.length} productos{familiaActiva ? ` en ${familiaActiva}` : ""}</p>
            <div className="product-grid">
              {data.map(a => <ProductCard key={a.codigo} articulo={a} />)}
            </div>
            {meta && meta.totalPages > 1 && (
              <div className="cat-page__pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="cat-page__page-btn">← Anterior</button>
                <span>{page} / {meta.totalPages}</span>
                <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="cat-page__page-btn">Siguiente →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    {!loading && <PageFooterSection />}
  </>
  );
}