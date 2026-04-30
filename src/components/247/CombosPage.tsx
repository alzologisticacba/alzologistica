// src/components/247/CombosPage.tsx
import { useState, useEffect, useDeferredValue } from "react";
import Header247 from "./Header247";
import ComboCard from "./ComboCard";
import PageFooterSection from "./PageFooterSection";
import FilterDrawer from "./FilterDrawer";
import FilterSortBar from "./FilterSortBar";
import { useFilterSort } from "./hooks/useFilterSort";
import type { FilterState } from "./FilterDrawer";
import { supabaseClient } from "../../lib/supabaseClient";

interface Combo {
  cod_combo: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
}

function applyCombosSort(items: Combo[], filters: FilterState): Combo[] {
  const result = [...items];
  switch (filters.sort) {
    case "precio-asc":  result.sort((a, b) => a.precio - b.precio); break;
    case "precio-desc": result.sort((a, b) => b.precio - a.precio); break;
    case "nombre-asc":  result.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
    case "nombre-desc": result.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
  }
  return result;
}

export default function CombosPage() {
  const [combos, setCombos]     = useState<Combo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const deferredQ               = useDeferredValue(busqueda);

  const {
    filters, setFilters, drawerOpen, drawerMode,
    openSort, closeDrawer, clearSort,
  } = useFilterSort();

  useEffect(() => {
    supabaseClient
      .from("combos")
      .select("cod_combo, nombre, precio, descripcion, imagen")
      .eq("activo", true)
      .order("nombre", { ascending: true })
      .limit(100)
      .then(({ data }) => setCombos(data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const porBusqueda = deferredQ
    ? combos.filter(c => c.nombre.toLowerCase().includes(deferredQ.toLowerCase()))
    : combos;

  const filtrados = applyCombosSort(porBusqueda, filters);

  return (
    <>
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        <div className="seccion-banner-wrap">
          <img
            src="/img/247/secciones/combosBanner.png"
            alt="Combos"
            className="seccion-banner"
          />
        </div>
        <div className="cat-page__search-wrap">
          <span className="cat-page__search-icon">🔍</span>
          <input
            type="search"
            className="cat-page__search"
            placeholder="Buscar combo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && <button className="cat-page__search-clear" onClick={() => setBusqueda("")}>X</button>}
        </div>

        <FilterSortBar
          filters={filters}
          onOpenFilter={openSort}
          onOpenSort={openSort}
          onClearSort={clearSort}
        />

        {loading && (
          <div className="product-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <p className="cat-page__msg">No hay combos disponibles.</p>
        )}

        {!loading && filtrados.length > 0 && (
          <>
            <p className="cat-page__count">{filtrados.length} combos</p>
            <div className="product-grid">
              {filtrados.map(c => <ComboCard key={c.cod_combo} combo={c} />)}
            </div>
          </>
        )}
      </div>
    </div>

    <FilterDrawer
      open={drawerOpen}
      onClose={closeDrawer}
      mode="ordenar"
      filters={filters}
      onFiltersChange={setFilters}
      activeCount={filtrados.length}
    />

    {!loading && <PageFooterSection />}
    </>
  );
}