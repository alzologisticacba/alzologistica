// src/components/mayorista/ConsultaUxB.tsx
import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

interface Articulo {
  codigo: number;
  descripcion: string;
  proveedor: string;
  uxb: number;
  precioFinal: number;
}

export default function ConsultaUxB() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResultados([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      const q = query.trim();
      const isNum = /^\d+$/.test(q);

      const promises: Promise<any>[] = [
        supabaseClient
          .from("articulos")
          .select("codigo, descripcion, proveedor, uxb, precioFinal")
          .ilike("descripcion", `%${q}%`)
          .limit(15),
        supabaseClient
          .from("articulos")
          .select("codigo, descripcion, proveedor, uxb, precioFinal")
          .ilike("proveedor", `%${q}%`)
          .limit(8),
      ];

      if (isNum) {
        promises.push(
          supabaseClient
            .from("articulos")
            .select("codigo, descripcion, proveedor, uxb, precioFinal")
            .ilike("codigo_str", `%${q}%`)
            .limit(5)
        );
      }

      const results = await Promise.all(promises);
      const seen = new Set<number>();
      const merged: Articulo[] = [];
      for (const { data } of results) {
        for (const item of data ?? []) {
          if (!seen.has(item.codigo)) {
            seen.add(item.codigo);
            merged.push(item);
          }
        }
      }

      setResultados(merged.slice(0, 15));
      setLoading(false);
    }, 200);
  }, [query]);

  return (
    <div className="may-page">
      <div className="may-card">
        <h2 className="may-card__title">Consultar UxB</h2>

        <div className="may-field may-field--full">
          <label className="may-label">Buscar producto</label>
          <div className="may-buscador-input-wrap">
            <span className="may-buscador-icon">🔍</span>
            <input
              type="text"
              className="may-buscador-input"
              placeholder="Descripción, proveedor o código..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button className="may-buscador-clear" onClick={() => { setQuery(""); setResultados([]); }}>✕</button>
            )}
          </div>
        </div>

        {loading && <div className="may-uxb-empty">Buscando…</div>}

        {!loading && query.length >= 2 && resultados.length === 0 && (
          <div className="may-uxb-empty">Sin resultados para "{query}"</div>
        )}

        {resultados.length > 0 && (
          <div className="may-uxb-list">
            {resultados.map(a => (
              <div key={a.codigo} className="may-uxb-item">
                <div className="may-uxb-item__top">
                  <span className="may-uxb-item__cod">#{a.codigo}</span>
                  <span className="may-uxb-item__uxb">
                    <span className="may-uxb-item__uxb-label">UxB</span>
                    <span className="may-uxb-item__uxb-val">{a.uxb ?? "—"}</span>
                  </span>
                </div>
                <div className="may-uxb-item__desc">{a.descripcion}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
