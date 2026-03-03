// src/components/247/CategoryPage.tsx
import { useState, useDeferredValue, useEffect } from "react";
import { useArticulos } from "./hooks/useArticulos";
import ProductCard from "./ProductCard";
import Header247 from "./Header247";
import PageFooterSection from "./PageFooterSection";
import FilterDrawer from "./FilterDrawer";
import FilterSortBar from "./FilterSortBar";
import { useFilterSort, applyFilterSort, extractFilterOptions } from "./hooks/useFilterSort";

interface CategoryPageProps {
  familia?: string;
  titulo?: string;
}

export default function CategoryPage({ familia: familiaProp, titulo: tituloProp }: CategoryPageProps) {
  const [busqueda, setBusqueda] = useState("");
  const deferredBusqueda        = useDeferredValue(busqueda);
  const [familia, setFamilia]   = useState<string>(familiaProp ?? "");
  const [titulo,  setTitulo]    = useState<string>(tituloProp  ?? "");

  useEffect(() => {
    if (familiaProp) { setFamilia(familiaProp); setTitulo(tituloProp ?? familiaProp); return; }
    const slug = window.location.pathname.split("/").pop() ?? "";
    if (slug) {
      const display = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      setFamilia(display);
      setTitulo(display);
    }
  }, [familiaProp, tituloProp]);

  const { data: articulos, loading, error, meta } = useArticulos({
    familia: familia || undefined,
    q:       deferredBusqueda || undefined,
    limit:   200,
  });

  const {
    filters, setFilters, drawerOpen, drawerMode,
    openFilter, openSort, closeDrawer, shuffleSeed,
    removeFamilia, removeSeccion, clearSort,
  } = useFilterSort();

  // En CategoryPage el filtro de rubros es el que ya venía — lo mantenemos como chips
  // pero ahora el sort y el drawer de secciones también aplican
  const { secciones } = extractFilterOptions(articulos);
  const filtered = applyFilterSort(articulos, filters, shuffleSeed);

  return (
    <>
    <div className="app-247">
      <Header247 showBack={true} />

      <div className="shell-247">
        <h1 className="cat-page__titulo">{titulo}</h1>

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

        {loading && <div className="product-grid">{[...Array(6)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}</div>}
        {!loading && error && <p className="cat-page__msg">Error al cargar productos.</p>}
        {!loading && !error && filtered.length === 0 && <p className="cat-page__msg">No se encontraron productos.</p>}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="cat-page__count">{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</p>
            <div className="product-grid">{filtered.map(a => <ProductCard key={a.codigo} articulo={a} />)}</div>
          </>
        )}
      </div>
    </div>

    <FilterDrawer
      open={drawerOpen}
      onClose={closeDrawer}
      mode={drawerMode}
      familiasDisponibles={[]}
      seccionesDisponibles={secciones}
      filters={filters}
      onFiltersChange={setFilters}
      activeCount={filtered.length}
    />

    {!loading && <PageFooterSection />}
  </>
  );
}