// src/components/247/SearchSuggestions.tsx
// Dropdown de sugerencias en tiempo real — estilo Mercado Libre
import { useState, useEffect, useRef, useCallback } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

interface Suggestion {
  descripcion: string;
  familiaNombre?: string;
}

interface SearchSuggestionsProps {
  query: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  visible: boolean;
}

export default function SearchSuggestions({ query, onSelect, onClose, visible }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]         = useState(false);
  const abortRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }

    // Debounce 180ms
    if (abortRef.current) clearTimeout(abortRef.current);
    setLoading(true);

    abortRef.current = setTimeout(() => {
      supabaseClient
        .from("articulos")
        .select("descripcion, familiaNombre")
        .gt("stock", 0)
        .ilike("descripcion", `%${query}%`)
        .order("orden", { ascending: true })
        .limit(8)
        .then(({ data }) => {
          // Deduplicar por descripcion
          const seen = new Set<string>();
          const unique = (data ?? []).filter(item => {
            const key = item.descripcion.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setSuggestions(unique);
        })
        .finally(() => setLoading(false));
    }, 180);

    return () => { if (abortRef.current) clearTimeout(abortRef.current); };
  }, [query]);

  if (!visible || query.length < 2) return null;

  // Highlight del texto que matchea
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
          {s.familiaNombre && <span className="ss-item__familia">{s.familiaNombre}</span>}
          <span className="ss-item__arrow">↗</span>
        </button>
      ))}
    </div>
  );
}