// src/components/247/FamiliasPage.tsx
import { useState, useDeferredValue } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import PageFooterSection from "./PageFooterSection";
import FilterDrawer from "./FilterDrawer";
import FilterSortBar from "./FilterSortBar";
import { useFilterSort, applyFilterSort, extractFilterOptions } from "./hooks/useFilterSort";
import { useArticulos } from "./hooks/useArticulos";

interface Props {
  titulo: string;
  subtitulo?: string;
  emoji?: string;
}

export default function FamiliasPage({ titulo, subtitulo, emoji = "✨" }: Props) {
  const params   = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const familias = params?.get("familias")?.split(",").filter(Boolean) ?? [];

  const [busqueda, setBusqueda] = useState("");
  const deferredQ = useDeferredValue(busqueda);

  const { data, meta, loading } = useArticulos({
    q:       deferredQ || undefined,
    familias: familias.length > 0 ? familias : undefined,
    limit:   200,
  } as any);

  const {
    filters, setFilters, drawerOpen, drawerMode,
    openFilter, openSort, closeDrawer, shuffleSeed,
    removeFamilia, removeSeccion, clearSort,
  } = useFilterSort();

  const { familias: famOpts, secciones } = extractFilterOptions(data);
  const filtered = applyFilterSort(data, filters, shuffleSeed);

  return (
    <>
      <div className="app-247">
        <Header247 showBack={true} />
        <div className="shell-247">

          <div className="familias-page__hero">
            <span className="familias-page__hero-emoji">{emoji}</span>
            <div>
              <h1 className="familias-page__titulo">{titulo}</h1>
              {subtitulo && <p className="familias-page__subtitulo">{subtitulo}</p>}
            </div>
          </div>

          <div className="cat-page__search-wrap">
            <span className="cat-page__search-icon">🔍</span>
            <input
              type="search"
              className="cat-page__search"
              placeholder={`Buscar en ${titulo}...`}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="cat-page__search-clear" onClick={() => setBusqueda("")}>X</button>
            )}
          </div>

          <FilterSortBar
            filters={filters}
            onOpenFilter={openFilter}
            onOpenSort={openSort}
            onRemoveFamilia={removeFamilia}
            onRemoveSeccion={removeSeccion}
            onClearSort={clearSort}
          />

          {loading && (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-card product-card--skeleton" />
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <p className="cat-page__msg">Sin productos disponibles.</p>
          )}
          {!loading && filtered.length > 0 && (
            <>
              <p className="cat-page__count">{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</p>
              <div className="product-grid">
                {filtered.map(a => <ProductCard key={a.codigo} articulo={a} />)}
              </div>
            </>
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        mode={drawerMode}
        familiasDisponibles={famOpts}
        seccionesDisponibles={secciones}
        filters={filters}
        onFiltersChange={setFilters}
        activeCount={filtered.length}
      />

      {!loading && <PageFooterSection />}
    </>
  );
}