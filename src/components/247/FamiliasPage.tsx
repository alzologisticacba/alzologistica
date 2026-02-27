// src/components/247/FamiliasPage.tsx
// Página genérica para mostrar productos de múltiples familias
// Usada por /247/vistos y /247/ultimo-pedido
import { useState, useDeferredValue } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import PageFooterSection from "./PageFooterSection";
import { useArticulos } from "./hooks/useArticulos";

interface Props {
  titulo: string;
  subtitulo?: string;
  emoji?: string;
}

export default function FamiliasPage({ titulo, subtitulo, emoji = "✨" }: Props) {
  const params   = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const familias = params?.get("familias")?.split(",").filter(Boolean) ?? [];

  const [busqueda, setBusqueda] = useState("");
  const deferredQ = useDeferredValue(busqueda);

  const { data, meta, loading } = useArticulos({
    q:       deferredQ || undefined,
    familias: familias.length > 0 ? familias : undefined,
    limit:   200,
  } as any);

  return (
    <>
      <div className="app-247">
        <Header247 showBack={true} />
        <div className="shell-247">

          {/* Hero header de la sección */}
          <div className="familias-page__hero">
            <span className="familias-page__hero-emoji">{emoji}</span>
            <div>
              <h1 className="familias-page__titulo">{titulo}</h1>
              {subtitulo && <p className="familias-page__subtitulo">{subtitulo}</p>}
              {familias.length > 0 && (
                <div className="familias-page__tags">
                  {familias.map(f => (
                    <span key={f} className="familias-page__tag">{f}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buscador */}
          <div className="cat-page__search-wrap">
            <span className="cat-page__search-icon">🔍</span>
            <input
              type="search"
              className="cat-page__search"
              placeholder={`Buscar en ${titulo}...`}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="cat-page__search-clear" onClick={() => setBusqueda("")}>✕</button>
            )}
          </div>

          {loading && (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-card product-card--skeleton" />
              ))}
            </div>
          )}
          {!loading && data.length === 0 && (
            <p className="cat-page__msg">Sin productos disponibles.</p>
          )}
          {!loading && data.length > 0 && (
            <>
              <p className="cat-page__count">{meta?.total ?? data.length} productos</p>
              <div className="product-grid">
                {data.map(a => <ProductCard key={a.codigo} articulo={a} />)}
              </div>
            </>
          )}
        </div>
      </div>
      {!loading && <PageFooterSection />}
    </>
  );
}