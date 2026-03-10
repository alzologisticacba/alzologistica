// src/components/247/DescuentosPage.tsx
import { useState, useDeferredValue, useEffect } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import PageFooterSection from "./PageFooterSection";
import FilterDrawer from "./FilterDrawer";
import FilterSortBar from "./FilterSortBar";
import { useFilterSort, applyFilterSort, extractFilterOptions } from "./hooks/useFilterSort";
import { useArticulos } from "./hooks/useArticulos";

const PAGE_SIZE = 24;

export default function DescuentosPage() {
  const [busqueda, setBusqueda] = useState("");
  const deferredQ               = useDeferredValue(busqueda);
  const [visibles, setVisibles] = useState(PAGE_SIZE);

  const { data, meta, loading } = useArticulos({
    q:         deferredQ || undefined,
    descuento: true,
    limit:     200,
  } as any);

  const {
    filters, setFilters, drawerOpen, drawerMode,
    openFilter, openSort, closeDrawer, shuffleSeed,
    removeFamilia, removeSeccion, clearSort,
  } = useFilterSort();

  const { familias, secciones } = extractFilterOptions(data);
  const filtered = applyFilterSort(data, filters, shuffleSeed);

  // Resetear paginación cuando cambia búsqueda o filtros
  useEffect(() => { setVisibles(PAGE_SIZE); }, [deferredQ, filters, shuffleSeed]);

  return (
    <>
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        <div className="seccion-banner-wrap">
          <img
            src="/img/247/secciones/descuentosExlusivosBanner.png"
            alt="Descuentos Exclusivos"
            className="seccion-banner"
          />
        </div>
        <div className="cat-page__search-wrap">
          <span className="cat-page__search-icon">🔍</span>
          <input type="search" className="cat-page__search" placeholder="Buscar producto..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          {busqueda && <button className="cat-page__search-clear" onClick={() => setBusqueda("")}>✕</button>}
        </div>

        <FilterSortBar
          filters={filters}
          onOpenFilter={openFilter}
          onOpenSort={openSort}
          onRemoveFamilia={removeFamilia}
          onRemoveSeccion={removeSeccion}
          onClearSort={clearSort}
        />

        {loading && <div className="product-grid">{[...Array(10)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}</div>}
        {!loading && filtered.length === 0 && <p className="cat-page__msg">Sin descuentos disponibles.</p>}
        {!loading && filtered.length > 0 && (() => {
          const pagina      = filtered.slice(0, visibles);
          const hayMas      = visibles < filtered.length;
          const restantes   = filtered.length - visibles;
          const split       = typeof window !== "undefined" && window.innerWidth >= 768 ? 10 : 8;
          const conBanner   = split < pagina.length;
          return (
            <>
              <p className="cat-page__count">{filtered.length} producto{filtered.length !== 1 ? "s" : ""} con descuento</p>
              <div className="product-grid">
                {pagina.slice(0, split).map(a => <ProductCard key={a.codigo} articulo={a} />)}
                {conBanner && (
                  <a href="https://whatsapp.com/channel/0029VbC00Vd3QxS30oAEN60G" target="_blank" rel="noopener noreferrer" className="canal-dif-banner-inline">
                    <img src="/img/247/secciones/canalDeDifBanner.png" alt="Canal de difusión Alzo" />
                  </a>
                )}
                {pagina.slice(split).map(a => <ProductCard key={a.codigo} articulo={a} />)}
              </div>
              {hayMas && (
                <button
                  className="cat-page__ver-mas"
                  onClick={() => setVisibles(v => v + PAGE_SIZE)}
                >
                  Ver más ({restantes} producto{restantes !== 1 ? "s" : ""})
                </button>
              )}
            </>
          );
        })()}
      </div>
    </div>

    <FilterDrawer
      open={drawerOpen}
      onClose={closeDrawer}
      mode={drawerMode}
      familiasDisponibles={familias}
      seccionesDisponibles={secciones}
      filters={filters}
      onFiltersChange={setFilters}
      activeCount={filtered.length}
    />

    {!loading && <PageFooterSection />}
  </>
  );
}