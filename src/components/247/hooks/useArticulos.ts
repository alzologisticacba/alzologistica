// src/components/247/hooks/useArticulos.ts
import { useState, useEffect } from "react";
import { supabaseClient } from "../../../lib/supabaseClient";

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

interface Meta { total: number; page: number; limit: number; totalPages: number; }
interface Filters { familia?: string; rubro?: string; q?: string; page?: number; limit?: number; descuento?: boolean; }

export function useArticulos(filters: Filters) {
  const [data, setData]       = useState<Articulo[]>([]);
  const [meta, setMeta]       = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const limit  = filters.limit ?? 40;
    const page   = filters.page  ?? 1;
    const offset = (page - 1) * limit;

    let query = supabaseClient
      .from("articulos")
      .select("codigo, descripcion, proveedor, rubro, precioFinal, descuento, multiplo, familiaNombre, stock", { count: "exact" })
      .gt("stock", 0)
      .order("orden", { ascending: true })
      .range(offset, offset + limit - 1);

    if (filters.familia)   query = query.ilike("familiaNombre", filters.familia);
    if (filters.rubro)     query = query.ilike("rubro", filters.rubro);
    if (filters.q)         query = query.ilike("descripcion", `%${filters.q}%`);
    if (filters.descuento) query = (query as any).gt("descuento", 0).order("descuento", { ascending: false });

    query.then(({ data: rows, error: err, count }) => {
      if (cancelled) return;
      if (err) { setError(err.message); return; }
      setData(rows ?? []);
      const total = count ?? 0;
      setMeta({ total, page, limit, totalPages: Math.ceil(total / limit) });
    }).finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters.familia, filters.rubro, filters.q, filters.page, filters.limit, filters.descuento]);

  return { data, meta, loading, error };
}