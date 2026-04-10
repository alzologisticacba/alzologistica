// src/components/mayorista/SearchSuggestionsMayorista.tsx
import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

interface Suggestion {
  descripcion: string;
  codigo: number;
  familiaNombre?: string;
  proveedor?: string;
}

interface Props {
  query: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  visible: boolean;
}

export default function SearchSuggestionsMayorista({ query, onSelect, onClose, visible }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]         = useState(false);
  const abortRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }

    if (abortRef.current) clearTimeout(abortRef.current);
    setLoading(true);

    abortRef.current = setTimeout(async () => {
      const isNumeric = /^\d+$/.test(query.trim());

      const textQuery = supabaseClient
        .from("articulos")
        .select("descripcion, codigo, familiaNombre, proveedor")
        .gt("stock", 0)
        .or(`descripcion.ilike.%${query}%,proveedor.ilike.%${query}%`)
        .order("orden", { ascending: true })
        .limit(8);

      const codeQuery = isNumeric
        ? supabaseClient
            .from("articulos")
            .select("descripcion, codigo, familiaNombre, proveedor")
            .gt("stock", 0)
            .ilike("codigo_str", `${query}%`)
            .order("orden", { ascending: true })
            .limit(8)
        : null;

      const [textRes, codeRes] = await Promise.all([textQuery, codeQuery ?? Promise.resolve({ data: [] })]);

      const combined = [...(textRes.data ?? []), ...(codeRes.data ?? [])];
      const seen = new Set<string>();
      const unique = combined.filter(item => {
        const key = item.descripcion.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setSuggestions(unique.slice(0, 8));
      setLoading(false);
    }, 180);

    return () => { if (abortRef.current) clearTimeout(abortRef.current); };
  }, [query]);

  if (!visible || query.length < 2) return null;

  function highlight(text: string, q: string) {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <>
        {text.slice(0, idx)}
        <strong>{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div className="ss-dropdown">
      {loading && suggestions.length === 0 && (
        <div className="ss-loading">
          <span className="ss-loading__dot" /><span className="ss-loading__dot" /><span className="ss-loading__dot" />
        </div>
      )}
      {!loading && suggestions.length === 0 && (
        <div className="ss-empty">Sin resultados para "{query}"</div>
      )}
      {suggestions.map((s, i) => (
        <button
          key={i}
          className="ss-item"
          onMouseDown={e => { e.preventDefault(); onSelect(s.descripcion); }}
        >
          <span className="ss-item__icon">🔍</span>
          <span className="ss-item__text">{highlight(s.descripcion, query)}</span>
          <span className="ss-item__familia">{s.codigo}</span>
          <span className="ss-item__arrow">↗</span>
        </button>
      ))}
    </div>
  );
}
