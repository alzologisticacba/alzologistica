// src/components/247/CatSearchWithSuggestions.tsx
// Buscador con sugerencias para usar en páginas internas (CategoryPage, DescuentosPage, etc.)
import { useState } from "react";
import SearchSuggestions from "./SearchSuggestions";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function CatSearchWithSuggestions({ value, onChange, placeholder = "Buscar producto..." }: Props) {
  const [showSugg, setShowSugg] = useState(false);

  return (
    <div className="cat-page__search-wrap" style={{ position: "relative" }}>
      <span className="cat-page__search-icon">🔍</span>
      <input
        type="search"
        className="cat-page__search"
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setShowSugg(true); }}
        onFocus={() => setShowSugg(true)}
        onBlur={() => setTimeout(() => setShowSugg(false), 150)}
      />
      {value && (
        <button className="cat-page__search-clear" onClick={() => { onChange(""); setShowSugg(false); }}>✕</button>
      )}
      <SearchSuggestions
        query={value}
        visible={showSugg}
        onSelect={v => { onChange(v); setShowSugg(false); }}
        onClose={() => setShowSugg(false)}
      />
    </div>
  );
}