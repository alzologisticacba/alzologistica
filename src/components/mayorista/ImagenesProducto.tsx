// src/components/mayorista/ImagenesProducto.tsx
import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

const IMG_BASE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/render/image/public/Productos/articulos";

interface Articulo {
  codigo: number;
  descripcion: string;
  proveedor: string;
}

function ProductImg({ codigo, descripcion }: { codigo: number; descripcion: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="may-img-placeholder">
        <span>📦</span>
        <span>Sin imagen</span>
      </div>
    );
  }
  return (
    <img
      src={`${IMG_BASE}/${codigo}.png?width=400&quality=80&resize=contain`}
      alt={descripcion}
      className="may-img-photo"
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}

export default function ImagenesProducto() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Articulo | null>(null);
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
          .select("codigo, descripcion, proveedor")
          .ilike("descripcion", `%${q}%`)
          .limit(12),
        supabaseClient
          .from("articulos")
          .select("codigo, descripcion, proveedor")
          .ilike("proveedor", `%${q}%`)
          .limit(8),
      ];

      if (isNum) {
        promises.push(
          supabaseClient
            .from("articulos")
            .select("codigo, descripcion, proveedor")
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

      setResultados(merged.slice(0, 12));
      setLoading(false);
    }, 200);
  }, [query]);

  return (
    <div className="may-page">
      <div className="may-card">
        <h2 className="may-card__title">Ver Imágenes de prod</h2>

        <div className="may-field may-field--full">
          <label className="may-label">Buscar producto</label>
          <div className="may-buscador-input-wrap">
            <span className="may-buscador-icon">🔍</span>
            <input
              type="text"
              className="may-buscador-input"
              placeholder="Descripción, proveedor o código..."
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null); }}
              autoComplete="off"
            />
            {query && (
              <button className="may-buscador-clear" onClick={() => { setQuery(""); setResultados([]); setSelected(null); }}>✕</button>
            )}
          </div>
        </div>

        {loading && <div className="may-uxb-empty">Buscando…</div>}

        {!loading && query.length >= 2 && resultados.length === 0 && (
          <div className="may-uxb-empty">Sin resultados para "{query}"</div>
        )}
      </div>

      {/* Grid de imágenes */}
      {resultados.length > 0 && !selected && (
        <div className="may-card">
          <div className="may-img-grid">
            {resultados.map(a => (
              <button key={a.codigo} className="may-img-card" onClick={() => setSelected(a)}>
                <ProductImg codigo={a.codigo} descripcion={a.descripcion} />
                <div className="may-img-card__info">
                  <span className="may-img-card__cod">#{a.codigo}</span>
                  <span className="may-img-card__name">{a.descripcion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vista ampliada */}
      {selected && (
        <div className="may-card">
          <button className="may-img-back" onClick={() => setSelected(null)}>← Volver</button>
          <div className="may-img-detail">
            <ProductImg codigo={selected.codigo} descripcion={selected.descripcion} />
            <div className="may-img-detail__info">
              <span className="may-img-card__cod">#{selected.codigo}</span>
              <span className="may-img-detail__name">{selected.descripcion}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
