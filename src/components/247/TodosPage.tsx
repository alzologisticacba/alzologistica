// src/components/247/TodosPage.tsx
import { useState, useDeferredValue, useEffect, useMemo } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import PageFooterSection from "./PageFooterSection";
import FilterDrawer from "./FilterDrawer";
import FilterSortBar from "./FilterSortBar";
import { useFilterSort, applyFilterSort, extractFilterOptions } from "./hooks/useFilterSort";
import { supabaseClient } from "../../lib/supabaseClient";

const PAGE_SIZE = 40;

export default function TodosPage() {
  const [todos, setTodos]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage]         = useState(1);
  const deferredQ               = useDeferredValue(busqueda);

  const {
    filters, setFilters, drawerOpen, drawerMode,
    openFilter, openSort, closeDrawer, shuffleSeed,
    removeFamilia, removeSeccion, clearSort,
  } = useFilterSort();

  // Carga TODOS los productos de una vez — shuffle en cliente
  useEffect(() => {
    supabaseClient
      .from("articulos")
      .select("codigo, descripcion, precioFinal, descuento, multiplo, rubro, familiaNombre, seccion, stock")
      .gt("stock", 0)
      .limit(2000)
      .then(({ data }) => {
        setTodos(data ?? []);
        setLoading(false);
      });
  }, []);

  // Opciones de filtro extraidas del total
  const { familias: todasFamilias, secciones: todasSecciones } = useMemo(
    () => extractFilterOptions(todos),
    [todos]
  );

  // Filtrar por texto primero (rapido, en cliente)
  const porBusqueda = useMemo(() => {
    if (!deferredQ) return todos;
    const q = deferredQ.toLowerCase();
    return todos.filter(a =>
      a.descripcion?.toLowerCase().includes(q) ||
      a.familiaNombre?.toLowerCase().includes(q) ||
      a.rubro?.toLowerCase().includes(q)
    );
  }, [todos, deferredQ]);

  // Aplicar filtros + sort/shuffle — sobre el total antes de paginar
  const filteredAll = useMemo(
    () => applyFilterSort(porBusqueda, filters, shuffleSeed),
    [porBusqueda, filters, shuffleSeed]
  );

  // Paginacion en cliente
  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));
  const pageSafe   = Math.min(page, totalPages);
  const pageItems  = filteredAll.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  function handleBusqueda(v: string) { setBusqueda(v); setPage(1); }
  function handleFilters(f: typeof filters) { setFilters(f); setPage(1); }

  return (
    <>
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        <h1 className="cat-page__titulo">Todos los productos</h1>

        <div className="cat-page__search-wrap">
          <span className="cat-page__search-icon">🔍</span>
          <input type="search" className="cat-page__search" placeholder="Buscar producto..."
            value={busqueda} onChange={(e) => handleBusqueda(e.target.value)} />
          {busqueda && <button className="cat-page__search-clear" onClick={() => handleBusqueda("")}>X</button>}
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
            {[...Array(10)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}
          </div>
        )}

        {!loading && filteredAll.length === 0 && <p className="cat-page__msg">Sin resultados.</p>}

        {!loading && filteredAll.length > 0 && (
          <>
            <p className="cat-page__count">
              {filteredAll.length} producto{filteredAll.length !== 1 ? "s" : ""}
              {filters.familias.length > 0 ? ` en ${filters.familias.join(", ")}` : ""}
            </p>
            <div className="product-grid">
              {pageItems.map(a => <ProductCard key={a.codigo} articulo={a} />)}
            </div>
            {totalPages > 1 && (
              <div className="cat-page__pagination">
                <button
                  disabled={pageSafe <= 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                  className="cat-page__page-btn"
                >Anterior</button>
                <span>{pageSafe} / {totalPages}</span>
                <button
                  disabled={pageSafe >= totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                  className="cat-page__page-btn"
                >Siguiente</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>

    <FilterDrawer
      open={drawerOpen}
      onClose={closeDrawer}
      mode={drawerMode}
      familiasDisponibles={todasFamilias}
      seccionesDisponibles={todasSecciones}
      filters={filters}
      onFiltersChange={handleFilters}
      activeCount={filteredAll.length}
    />

    {!loading && <PageFooterSection />}
    </>
  );
}