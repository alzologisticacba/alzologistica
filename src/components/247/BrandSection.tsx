// src/components/247/BrandSection.tsx
import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { supabaseClient } from "../../lib/supabaseClient";

const BRAND_COLORS: Record<string, { bg: string; text: string }> = {
  "alicante":  { bg: "#e8f0d8", text: "#1e3010" },
  "bic":       { bg: "#ffe4cc", text: "#7a2e00" },
  "bulldog":   { bg: "#e4d4ff", text: "#2a0a70" },
  "calipso":   { bg: "#f0d8ff", text: "#4a1060" },
  "camel":     { bg: "#f5e8c0", text: "#4a3000" },
  "clipper":   { bg: "#fff0a0", text: "#3a2800" },
  "drf":       { bg: "#cce8cc", text: "#1a3a1a" },
  "duracell":  { bg: "#1a1108", text: "#d4863a" },
  "gongys":    { bg: "#ffd4f0", text: "#5a0840" },
  "hamlet":    { bg: "#f0ddb8", text: "#3a2000" },
  "integra":   { bg: "#080808", text: "#e8e8e8" },
  "lucky":     { bg: "#ffc8c8", text: "#5a0808" },
  "mentos":    { bg: "#c8dcff", text: "#08204a" },
  "misky":     { bg: "#ffc8c0", text: "#5a1008" },
  "noel":      { bg: "#c0dcf8", text: "#082050" },
  "nosotras":  { bg: "#f0c8ff", text: "#480858" },
  "RindeDos":  { bg: "#c8f0c8", text: "#0a3010" },
  "suerox":    { bg: "#b8d8ff", text: "#041848" },
  "takis":     { bg: "#0e1217", text: "#f5d020" },
  "VerdeFlor": { bg: "#d0f0c0", text: "#0a2808" },
  "yummy":     { bg: "#1a2580", text: "#f5d020" },
  "zono":      { bg: "#e8faff", text: "#007a9a" },
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  seccion: string;   // slug exacto, ej: "calipso", "duracell"
  titulo: string;    // nombre visible, ej: "Calipso", "Duracell"
}

export default function BrandSection({ seccion, titulo }: Props) {
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  const brand = BRAND_COLORS[seccion] ?? { bg: "#f0f2f5", text: "#1a1a2e" };
  const bannerSrc = `/img/247/secciones/${seccion}.png`;
  const verTodosHref = `/247/seccion/?slug=${seccion}`;

  useEffect(() => {
    setLoading(true);
    supabaseClient
      .from("articulos")
      .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
      .eq("seccion", seccion)
      .gt("stock", 0)
      .limit(80)
      .then(({ data }) => {
        setItems(shuffleArray(data ?? []).slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, [seccion]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="brand-section" style={{ backgroundColor: brand.bg }}>
      {/* Banner */}
      <a href={verTodosHref} className="brand-section__banner-link">
        {imgError ? (
          <div className="brand-section__banner-fallback">
            <span className="brand-section__banner-title">{titulo}</span>
            <span className="brand-section__banner-cta">ver todos →</span>
          </div>
        ) : (
          <div className="brand-section__banner-wrap">
            <img
              src={bannerSrc}
              alt={titulo}
              className="brand-section__banner-img"
              onError={() => setImgError(true)}
            />
            <span className="brand-section__banner-cta-overlay">ver todos →</span>
          </div>
        )}
      </a>

      {/* Productos */}
      <div className="brand-section__row-wrap">
        <button className="home-section__arrow home-section__arrow--left" onClick={() => scroll("left")} aria-label="Anterior">‹</button>
        <div className="brand-section__row" ref={rowRef}>
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="product-card product-card--skeleton" />
              ))
            : <>
              {items.map(a => <ProductCard key={a.codigo} articulo={a} />)}
              <a href={verTodosHref} className="hs-ver-todos-card">
                <span className="hs-ver-todos-card__icon">→</span>
                <span className="hs-ver-todos-card__txt">Ver<br/>todos</span>
              </a>
            </>
          }
        </div>
        <button className="home-section__arrow home-section__arrow--right" onClick={() => scroll("right")} aria-label="Siguiente">›</button>
      </div>
    </section>
  );
}