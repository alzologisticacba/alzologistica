// src/components/247/FamiliasPage.tsx
import { useState, useDeferredValue, useEffect, useMemo } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import PageFooterSection from "./PageFooterSection";
import FilterDrawer from "./FilterDrawer";
import FilterSortBar from "./FilterSortBar";
import { useFilterSort, applyFilterSort, extractFilterOptions } from "./hooks/useFilterSort";
import { useArticulos } from "./hooks/useArticulos";
import { supabaseClient } from "../../lib/supabaseClient";

interface Props {
  titulo: string;
  subtitulo?: string;
  emoji?: string;
}

export default function FamiliasPage({ titulo, subtitulo, emoji = "✨" }: Props) {
  const params      = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const familiasRaw = params?.get("familias") ?? "";
  // Si empieza con __codigos__: lo tratamos como un único token (no split por coma)
  const familiasParam = familiasRaw.startsWith("__codigos__:")
    ? [familiasRaw]
    : familiasRaw.split(",").filter(Boolean);

  // Resolvemos __codigos__: a familiaNombre reales antes de consultar
  const [resolvedFamilias, setResolvedFamilias] = useState<string[] | null>(null);

  useEffect(() => {
    const codigosItem = familiasParam.find(f => f.startsWith("__codigos__:"));
    if (codigosItem) {
      const codigos = codigosItem.replace("__codigos__:", "").split(",").map(Number);
      supabaseClient
        .from("articulos")
        .select("familiaNombre")
        .gt("stock", 0)
        .in("codigo", codigos)
        .then(({ data }) => {
          const familias = [...new Set((data ?? []).map((r: any) => r.familiaNombre).filter(Boolean))] as string[];
          setResolvedFamilias(familias.length > 0 ? familias : []);
        });
    } else {
      setResolvedFamilias(familiasParam.length > 0 ? familiasParam : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [busqueda, setBusqueda] = useState("");
  const deferredQ = useDeferredValue(busqueda);

  const resolvingCodigos = familiasParam.some(f => f.startsWith("__codigos__:"));
  // Mientras resolvemos los codigos usamos un placeholder imposible para que useArticulos
  // no devuelva todos los productos antes de tener las familias reales
  const familiasParaQuery = resolvingCodigos && resolvedFamilias === null
    ? ["__resolving__"]
    : (resolvedFamilias ?? (familiasParam.length > 0 ? familiasParam : undefined));

  const { data, meta, loading: loadingArticulos } = useArticulos({
    q:        deferredQ || undefined,
    familias: familiasParaQuery as string[] | undefined,
    limit:    200,
  } as any);

  const loading = (resolvingCodigos && resolvedFamilias === null) || loadingArticulos;

  const {
    filters, setFilters, drawerOpen, drawerMode,
    openFilter, openSort, closeDrawer, shuffleSeed,
    removeFamilia, removeSeccion, clearSort,
  } = useFilterSort();

  const { familias: famOpts, secciones } = extractFilterOptions(data);
  const filtered = applyFilterSort(data, filters, shuffleSeed);

  const PAGE_SIZE  = 40;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSafe   = Math.min(page, Math.max(1, totalPages));
  const pageItems  = useMemo(
    () => filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE),
    [filtered, pageSafe]
  );

  // Resetear página al cambiar búsqueda o filtros
  useEffect(() => { setPage(1); }, [deferredQ, filters, shuffleSeed]);

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
              {(() => {
                const split = typeof window !== "undefined" && window.innerWidth >= 768 ? 10 : 8;
                return (
                  <div className="product-grid">
                    {pageItems.slice(0, split).map(a => <ProductCard key={a.codigo} articulo={a} />)}
                    {pageItems.length > split && (
                      <a href="https://whatsapp.com/channel/0029VbC00Vd3QxS30oAEN60G" target="_blank" rel="noopener noreferrer" className="canal-dif-banner-inline">
                        <img src="/img/247/secciones/canalDeDifBanner.png" alt="Canal de difusión Alzo" />
                      </a>
                    )}
                    {pageItems.slice(split).map(a => <ProductCard key={a.codigo} articulo={a} />)}
                  </div>
                );
              })()}
              {totalPages > 1 && (
                <div className="cat-page__pagination">
                  <button
                    className="cat-page__page-btn"
                    disabled={pageSafe <= 1}
                    onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                  >Anterior</button>
                  <span>{pageSafe} / {totalPages}</span>
                  <button
                    className="cat-page__page-btn"
                    disabled={pageSafe >= totalPages}
                    onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
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