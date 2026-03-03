// src/components/247/FilterSortBar.tsx
// Barra con botones "Filtrar" y "Ordenar" + chips de filtros activos
import type { FilterState, SortOption } from "./FilterDrawer";

const SORT_LABELS: Record<SortOption, string> = {
  "relevancia":    "Relevancia",
  "precio-asc":    "Menor precio",
  "precio-desc":   "Mayor precio",
  "descuento-desc":"Mayor descuento",
  "nombre-asc":    "A → Z",
  "nombre-desc":   "Z → A",
};

interface FilterSortBarProps {
  filters: FilterState;
  onOpenFilter: () => void;
  onOpenSort: () => void;
  onRemoveFamilia?: (f: string) => void;
  onRemoveSeccion?: (s: string) => void;
  onClearSort?: () => void;
}

export default function FilterSortBar({
  filters, onOpenFilter, onOpenSort,
  onRemoveFamilia, onRemoveSeccion, onClearSort,
}: FilterSortBarProps) {
  const filterCount = filters.familias.length + filters.secciones.length;
  const hasSort = filters.sort !== "relevancia";
  const hasActive = filterCount > 0 || hasSort;

  return (
    <div className="fsbar">
      {/* Botones principales */}
      <div className="fsbar__btns">
        <button
          className={`fsbar__btn${filterCount > 0 ? " fsbar__btn--active" : ""}`}
          onClick={onOpenFilter}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Filtrar
          {filterCount > 0 && <span className="fsbar__btn-badge">{filterCount}</span>}
        </button>

        <button
          className={`fsbar__btn${hasSort ? " fsbar__btn--active" : ""}`}
          onClick={onOpenSort}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 4l3-3 3 3M6 1v10M10 12l3 3 3-3M13 15V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ordenar
          {hasSort && <span className="fsbar__btn-dot" />}
        </button>
      </div>

      {/* Chips de filtros activos */}
      {hasActive && (
        <div className="fsbar__chips">
          {filters.familias.map(f => (
            <span key={f} className="fsbar__chip">
              {f}
              <button className="fsbar__chip-remove" onClick={() => onRemoveFamilia?.(f)}>✕</button>
            </span>
          ))}
          {filters.secciones.map(s => (
            <span key={s} className="fsbar__chip fsbar__chip--marca">
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <button className="fsbar__chip-remove" onClick={() => onRemoveSeccion?.(s)}>✕</button>
            </span>
          ))}
          {hasSort && (
            <span className="fsbar__chip fsbar__chip--sort">
              {SORT_LABELS[filters.sort]}
              <button className="fsbar__chip-remove" onClick={onClearSort}>✕</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}