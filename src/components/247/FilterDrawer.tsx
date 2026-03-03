// src/components/247/FilterDrawer.tsx
// Drawer desde abajo con filtros (familias, secciones) y ordenamiento
import { useEffect, useRef } from "react";

export type SortOption =
  | "relevancia"
  | "precio-asc"
  | "precio-desc"
  | "descuento-desc"
  | "nombre-asc"
  | "nombre-desc";

export interface FilterState {
  familias: string[];
  secciones: string[];
  sort: SortOption;
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "filtrar" | "ordenar";
  // Opciones disponibles
  familiasDisponibles?: string[];
  seccionesDisponibles?: string[];
  // Estado actual
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  // Cuántos resultados activos
  activeCount?: number;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: "precio-asc",   label: "Menor precio",        icon: "↑" },
  { value: "precio-desc",  label: "Mayor precio",        icon: "↓" },
  { value: "descuento-desc", label: "Mayor descuento",   icon: "%" },
  { value: "nombre-asc",   label: "Nombre A → Z",        icon: "A" },
  { value: "nombre-desc",  label: "Nombre Z → A",        icon: "Z" },
];

export default function FilterDrawer({
  open, onClose, mode,
  familiasDisponibles = [],
  seccionesDisponibles = [],
  filters, onFiltersChange,
  activeCount,
}: FilterDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function toggleFamilia(f: string) {
    const next = filters.familias.includes(f)
      ? filters.familias.filter(x => x !== f)
      : [...filters.familias, f];
    onFiltersChange({ ...filters, familias: next });
  }

  function toggleSeccion(s: string) {
    const next = filters.secciones.includes(s)
      ? filters.secciones.filter(x => x !== s)
      : [...filters.secciones, s];
    onFiltersChange({ ...filters, secciones: next });
  }

  function setSort(s: SortOption) {
    onFiltersChange({ ...filters, sort: s });
  }

  function clearAll() {
    onFiltersChange({ familias: [], secciones: [], sort: "relevancia" });
  }

  const hasActiveFilters = filters.familias.length > 0 || filters.secciones.length > 0 || filters.sort !== "relevancia";

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fd-overlay${open ? " fd-overlay--visible" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fd-drawer${open ? " fd-drawer--open" : ""}`}>
        {/* Handle bar */}
        <div className="fd-handle" onClick={onClose} />

        {/* Header */}
        <div className="fd-header">
          <span className="fd-header__title">
            {mode === "filtrar" ? "🎯 Filtrar" : "↕ Ordenar"}
          </span>
          {hasActiveFilters && (
            <button className="fd-header__clear" onClick={clearAll}>
              Limpiar todo
            </button>
          )}
          <button className="fd-header__close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="fd-content">

          {/* ORDENAR */}
          {(mode === "ordenar" || mode === "filtrar") && (
            <div className="fd-section">
              <p className="fd-section__label">Ordenar por</p>
              <div className="fd-sort-grid">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`fd-sort-btn${filters.sort === opt.value ? " fd-sort-btn--active" : ""}`}
                    onClick={() => setSort(opt.value)}
                  >
                    <span className="fd-sort-btn__icon">{opt.icon}</span>
                    <span className="fd-sort-btn__label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FAMILIAS */}
          {mode === "filtrar" && familiasDisponibles.length > 0 && (
            <div className="fd-section">
              <p className="fd-section__label">
                Familia
                {filters.familias.length > 0 && (
                  <span className="fd-section__badge">{filters.familias.length}</span>
                )}
              </p>
              <div className="fd-chips">
                {familiasDisponibles.map(f => (
                  <button
                    key={f}
                    className={`fd-chip${filters.familias.includes(f) ? " fd-chip--active" : ""}`}
                    onClick={() => toggleFamilia(f)}
                  >
                    {f}
                    {filters.familias.includes(f) && <span className="fd-chip__check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECCIONES / MARCAS */}
          {mode === "filtrar" && seccionesDisponibles.length > 0 && (
            <div className="fd-section">
              <p className="fd-section__label">
                Marca
                {filters.secciones.length > 0 && (
                  <span className="fd-section__badge">{filters.secciones.length}</span>
                )}
              </p>
              <div className="fd-chips">
                {seccionesDisponibles.map(s => (
                  <button
                    key={s}
                    className={`fd-chip${filters.secciones.includes(s) ? " fd-chip--active" : ""}`}
                    onClick={() => toggleSeccion(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {filters.secciones.includes(s) && <span className="fd-chip__check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="fd-footer">
          <button className="fd-footer__apply" onClick={onClose}>
            {activeCount !== undefined
              ? `Ver ${activeCount} resultado${activeCount !== 1 ? "s" : ""}`
              : "Aplicar"}
          </button>
        </div>
      </div>
    </>
  );
}