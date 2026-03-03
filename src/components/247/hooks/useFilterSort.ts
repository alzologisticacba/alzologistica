// src/components/247/hooks/useFilterSort.ts
// Hook reutilizable para manejar estado de filtros + ordenamiento + drawer
import { useState, useRef } from "react";
import type { FilterState, SortOption } from "../FilterDrawer";

export type { FilterState, SortOption };

// Fisher-Yates shuffle con seed — random estable por sesión
function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const DEFAULT_FILTERS: FilterState = {
  familias: [],
  secciones: [],
  sort: "relevancia",
};

export function useFilterSort() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"filtrar" | "ordenar">("filtrar");
  // Seed fija por montaje — los productos se ven random pero estables mientras navegás la misma sesión
  const shuffleSeed = useRef(Math.floor(Math.random() * 0xffffffff));

  function openFilter() { setDrawerMode("filtrar"); setDrawerOpen(true); }
  function openSort()   { setDrawerMode("ordenar"); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); }

  function removeFamilia(f: string) {
    setFilters(prev => ({ ...prev, familias: prev.familias.filter(x => x !== f) }));
  }
  function removeSeccion(s: string) {
    setFilters(prev => ({ ...prev, secciones: prev.secciones.filter(x => x !== s) }));
  }
  function clearSort() {
    setFilters(prev => ({ ...prev, sort: "relevancia" }));
  }

  return {
    filters, setFilters,
    shuffleSeed: shuffleSeed.current,
    drawerOpen, drawerMode,
    openFilter, openSort, closeDrawer,
    removeFamilia, removeSeccion, clearSort,
  };
}

// Aplica filtros y ordenamiento a un array de artículos ya cargados
// seed: número fijo por sesión para shuffle estable (viene de useFilterSort().shuffleSeed)
export function applyFilterSort<T extends {
  familiaNombre?: string;
  seccion?: string;
  precioFinal?: number;
  descuento?: number;
  descripcion?: string;
}>(items: T[], filters: FilterState, seed = 0): T[] {
  let result = [...items];

  // Filtro familias
  if (filters.familias.length > 0) {
    result = result.filter(i => filters.familias.includes(i.familiaNombre ?? ""));
  }

  // Filtro secciones
  if (filters.secciones.length > 0) {
    result = result.filter(i => filters.secciones.includes(i.seccion ?? ""));
  }

  // Ordenamiento
  switch (filters.sort) {
    case "relevancia":
      // Random estable por sesión: diferente cada vez que entrás, consistente mientras navegás
      result = shuffleSeeded(result, seed);
      break;
    case "precio-asc":
      result.sort((a, b) => (a.precioFinal ?? 0) - (b.precioFinal ?? 0));
      break;
    case "precio-desc":
      result.sort((a, b) => (b.precioFinal ?? 0) - (a.precioFinal ?? 0));
      break;
    case "descuento-desc":
      result.sort((a, b) => (b.descuento ?? 0) - (a.descuento ?? 0));
      break;
    case "nombre-asc":
      result.sort((a, b) => (a.descripcion ?? "").localeCompare(b.descripcion ?? ""));
      break;
    case "nombre-desc":
      result.sort((a, b) => (b.descripcion ?? "").localeCompare(a.descripcion ?? ""));
      break;
  }

  return result;
}

// Extrae familias y secciones únicas de los items
export function extractFilterOptions<T extends { familiaNombre?: string; seccion?: string }>(items: T[]) {
  const familias = [...new Set(items.map(i => i.familiaNombre).filter(Boolean) as string[])].sort();
  const secciones = [...new Set(items.map(i => i.seccion).filter(Boolean) as string[])].sort();
  return { familias, secciones };
}