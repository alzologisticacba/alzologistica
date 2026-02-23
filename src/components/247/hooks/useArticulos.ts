// src/components/247/hooks/useArticulos.ts

import { useState, useEffect } from "react";

export interface Articulo {
  codigo: number;
  descripcion: string;
  proveedor: string;
  rubro: string;
  precioFinal: number;
  descuento: number;
  multiplo: number;
  familiaNombre: string;
  stock: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  familia?: string;
  rubro?: string;
  q?: string;
  page?: number;
}

export function useArticulos(filters: Filters) {
  const [data, setData]       = useState<Articulo[]>([]);
  const [meta, setMeta]       = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.familia) params.set("familia", filters.familia);
    if (filters.rubro)   params.set("rubro",   filters.rubro);
    if (filters.q)       params.set("q",       filters.q);
    if (filters.page)    params.set("page",    String(filters.page));

    fetch(`/api/articulos?${params}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((json) => {
        if (cancelled) return;
        if (json.error) throw new Error(json.error);
        setData(json.data ?? []);
        setMeta(json.meta ?? null);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters.familia, filters.rubro, filters.q, filters.page]);

  return { data, meta, loading, error };
}