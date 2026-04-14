// src/components/catalogo/CatalogoPage.tsx
import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

const MARCAS_IMG = "/img/247/MarcasMayorista";
const PROD_IMG   = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/render/image/public/Productos/articulos";

interface Marca {
  codigo: number;
  descripcion: string;
  marca: string;
}

interface Articulo {
  codigo: number;
  descripcion: string;
  uxb: number | null;
}

function MarcaImg({ marca }: { marca: string }) {
  const pascal = marca.charAt(0).toUpperCase() + marca.slice(1);
  const [src, setSrc]       = useState(`${MARCAS_IMG}/${marca}.png`);
  const [failed, setFailed] = useState(false);

  if (failed) return <span className="cat-nav__fallback">{pascal}</span>;

  return (
    <img
      src={src}
      alt={marca}
      className="cat-nav__logo"
      onError={() => {
        if (src !== `${MARCAS_IMG}/${pascal}.png`) {
          setSrc(`${MARCAS_IMG}/${pascal}.png`);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

function ProductImg({ codigo }: { codigo: number }) {
  const [error, setError] = useState(false);
  if (error) return (
    <div className="cat-card__placeholder">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.2 }}>
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-4 0v2"/>
      </svg>
    </div>
  );
  return (
    <img
      src={`${PROD_IMG}/${codigo}.png?width=300&quality=75&resize=contain`}
      alt="" className="cat-card__img"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

export default function CatalogoPage() {
  const [marcas, setMarcas]       = useState<Marca[]>([]);
  const [selected, setSelected]   = useState<Marca | null>(null);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(true);
  const [loadingProds,  setLoadingProds]  = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Marcas únicas (para el nav) — solo carga una vez
  useEffect(() => {
    let cancelled = false;
    supabaseClient
      .from("Marcas")
      .select("marca, descripcion")
      .order("marca", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const unique: Marca[] = [];
        for (const row of (data ?? []) as { marca: string; descripcion: string }[]) {
          const key = row.marca.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push({ codigo: 0, descripcion: row.descripcion, marca: row.marca });
        }
        // Orden aleatorio
        for (let i = unique.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [unique[i], unique[j]] = [unique[j], unique[i]];
        }
        setMarcas(unique);
        if (unique.length > 0) setSelected(unique[0]);
        setLoadingMarcas(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Artículos: join Marcas.codigo = articulos.codigo filtrando por marca
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoadingProds(true);
    // NO limpiar artículos — los anteriores quedan visibles mientras carga

    supabaseClient
      .from("Marcas")
      .select("codigo")
      .eq("marca", selected.marca)
      .then(({ data: codigosData }) => {
        if (cancelled) return;
        const codigos = (codigosData ?? []).map((r: { codigo: number }) => r.codigo);
        if (codigos.length === 0) {
          setArticulos([]);
          setLoadingProds(false);
          return;
        }
        supabaseClient
          .from("articulos")
          .select("codigo, descripcion, uxb")
          .in("codigo", codigos)
          .order("descripcion", { ascending: true })
          .then(({ data }) => {
            if (cancelled) return;
            setArticulos((data ?? []) as Articulo[]);
            setLoadingProds(false);
          });
      });

    return () => { cancelled = true; };
  }, [selected?.marca]); // usar .marca como dep evita re-fires por nueva referencia de objeto

  // Centrar marca activa — solo scroll horizontal dentro del nav, nunca vertical
  useEffect(() => {
    if (!selected || !scrollRef.current) return;
    const container = scrollRef.current;
    const el = container.querySelector(
      `[data-marca="${selected.marca}"]`
    ) as HTMLElement | null;
    if (!el) return;
    const scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [selected?.marca]);

  if (loadingMarcas) return (
    <div className="cat-loading"><div className="cat-spinner" /><span>Cargando...</span></div>
  );

  return (
    <>
      {/* ── NAV de marcas: estilo carrusel landing ── */}
      <nav className="cat-nav">
        <div className="cat-nav__scroll" ref={scrollRef}>
          {marcas.map((m) => (
            <button
              key={m.marca}
              type="button"
              data-marca={m.marca}
              className={`cat-nav__item${selected?.marca === m.marca ? " active" : ""}`}
              onClick={() => setSelected(m)}
            >
              <MarcaImg marca={m.marca} />
            </button>
          ))}
        </div>
      </nav>

      {/* ── Grilla de productos ── */}
      <div className="cat-prods-wrap" style={{ position: "relative" }}>
        {loadingProds && (
          <div className="cat-prods-overlay">
            <div className="cat-spinner" />
          </div>
        )}
        {!loadingProds && articulos.length === 0 ? (
          <div className="cat-empty"><span>📦</span><span>Sin productos para esta marca.</span></div>
        ) : (
          <div className={`cat-grid${loadingProds ? " cat-grid--loading" : ""}`}>
            {articulos.map((a) => (
              <article key={a.codigo} className="cat-card">
                <div className="cat-card__img-wrap">
                  <ProductImg codigo={a.codigo} />
                </div>
                <div className="cat-card__info">
                  <p className="cat-card__desc">{a.descripcion}</p>
                  {a.uxb != null && <span className="cat-card__uxb">UxB: {a.uxb}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

