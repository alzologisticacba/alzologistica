// src/components/247/SeccionPage.tsx
import { useState, useDeferredValue, useEffect } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import PageFooterSection from "./PageFooterSection";
import FilterDrawer from "./FilterDrawer";
import FilterSortBar from "./FilterSortBar";
import { useFilterSort, applyFilterSort, extractFilterOptions } from "./hooks/useFilterSort";
import { useArticulos } from "./hooks/useArticulos";

const BRAND_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  "alicante":  { bg: "#e8f0d8", text: "#1e3010", accent: "#4a7a20" },
  "bic":       { bg: "#ffe4cc", text: "#7a2e00", accent: "#e15f17" },
  "bulldog":   { bg: "#e4d4ff", text: "#2a0a70", accent: "#6b30e0" },
  "calipso":   { bg: "#f0d8ff", text: "#4a1060", accent: "#a040c0" },
  "camel":     { bg: "#f5e8c0", text: "#4a3000", accent: "#c08020" },
  "clipper":   { bg: "#fff0a0", text: "#3a2800", accent: "#c8a000" },
  "drf":       { bg: "#cce8cc", text: "#1a3a1a", accent: "#3a7a3a" },
  "duracell":  { bg: "#1a1108", text: "#d4863a", accent: "#c06820" },
  "gongys":    { bg: "#ffd4f0", text: "#5a0840", accent: "#c03090" },
  "hamlet":    { bg: "#f0ddb8", text: "#3a2000", accent: "#8a5820" },
  "integra":   { bg: "#080808", text: "#e8e8e8", accent: "#cc2040" },
  "lucky":     { bg: "#ffc8c8", text: "#5a0808", accent: "#cc1818" },
  "mentos":    { bg: "#c8dcff", text: "#08204a", accent: "#1848b8" },
  "misky":     { bg: "#ffc8c0", text: "#5a1008", accent: "#cc2810" },
  "noel":      { bg: "#c0dcf8", text: "#082050", accent: "#1060c0" },
  "nosotras":  { bg: "#f0c8ff", text: "#480858", accent: "#a020c0" },
  "RindeDos":  { bg: "#c8f0c8", text: "#0a3010", accent: "#208020" },
  "suerox":    { bg: "#b8d8ff", text: "#041848", accent: "#0848c8" },
  "takis":     { bg: "#0e1217", text: "#f5d020", accent: "#8828d0" },
  "VerdeFlor": { bg: "#d0f0c0", text: "#0a2808", accent: "#187818" },
  "yummy":     { bg: "#1a2580", text: "#f5d020", accent: "#f5d020" },
  "zono":      { bg: "#e8faff", text: "#007a9a", accent: "#00b4d8" },
};

export default function SeccionPage() {
  const slug = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("slug") ?? ""
    : "";
  const titulo = slug.charAt(0).toUpperCase() + slug.slice(1);
  const brand = BRAND_COLORS[slug] ?? { bg: "#e8eaf0", text: "#1a1a2e", accent: "#3300ff" };

  const [busqueda, setBusqueda] = useState("");
  const deferredQ = useDeferredValue(busqueda);

  const { data, meta, loading } = useArticulos({
    q:       deferredQ || undefined,
    seccion: slug,
    limit:   200,
  } as any);

  const {
    filters, setFilters, drawerOpen, drawerMode,
    openFilter, openSort, closeDrawer, shuffleSeed,
    removeFamilia, clearSort,
  } = useFilterSort();

  const { familias } = extractFilterOptions(data);
  const filtered = applyFilterSort(data, filters, shuffleSeed);

  useEffect(() => {
    document.body.style.backgroundColor = brand.bg;
    document.body.style.transition = "background-color 0.4s ease";
    return () => { document.body.style.backgroundColor = ""; };
  }, [brand.bg]);

  return (
    <>
      <div className="app-247" style={{ backgroundColor: brand.bg }}>
        <Header247 showBack={true} />
        <div className="shell-247">

          <div className="seccion-page__hero">
            <img
              src={`/img/247/secciones/${slug}.png`}
              alt={titulo}
              className="seccion-page__hero-img"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          <div className="cat-page__search-wrap"
            style={{ backgroundColor: "#ffffff", borderColor: `${brand.text}30` }}>
            <span className="cat-page__search-icon">🔍</span>
            <input
              type="search"
              className="cat-page__search"
              placeholder={`Buscar en ${titulo}...`}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ color: brand.text, backgroundColor: "#ffffff" }}
            />
            {busqueda && (
              <button className="cat-page__search-clear"
                onClick={() => setBusqueda("")}
                style={{ color: brand.text }}>X</button>
            )}
          </div>

          <FilterSortBar
            filters={filters}
            onOpenFilter={openFilter}
            onOpenSort={openSort}
            onRemoveFamilia={removeFamilia}
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
            <p className="cat-page__msg" style={{ color: brand.text }}>Sin productos disponibles.</p>
          )}
          {!loading && filtered.length > 0 && (
            <>
              <p className="cat-page__count" style={{ color: brand.text, opacity: 0.75 }}>
                {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              </p>
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
        familiasDisponibles={familias}
        seccionesDisponibles={[]}
        filters={filters}
        onFiltersChange={setFilters}
        activeCount={filtered.length}
      />

      {!loading && <PageFooterSection />}
    </>
  );
}