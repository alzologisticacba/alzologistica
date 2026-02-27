// src/components/247/HomeSection.tsx
import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import ComboCard from "./ComboCard";
import { supabaseClient } from "../../lib/supabaseClient";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// IDs de secciones que deben mostrarse en orden aleatorio
const SHUFFLE_IDS = new Set(["todos", "cigarrillos"]);

interface Filtro {
  id?: string;
  familia?: string;
  familias?: string[];   // múltiples familias para "según tu pedido"
  grid2x2?: boolean;
  descuento?: boolean;
  combos?: boolean;
}

interface Props {
  id?: string;
  titulo: string;
  filtro: Filtro;
  verTodosHref: string;
  hideVerTodos?: boolean;
  maxItems?: number;
}

export default function HomeSection({ id, titulo, filtro, verTodosHref, hideVerTodos = false, maxItems }: Props) {
  const isGrid2x2 = filtro.grid2x2 ?? false;
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seed, setSeed]       = useState(0);

  // Refrescar al volver atrás con flecha/historial del navegador
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setSeed(s => s + 1); // página restaurada desde bfcache
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") setSeed(s => s + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      setLoading(true);
      try {
        const sectionId = id ?? "";
        if (filtro.combos) {
          const { data } = await supabaseClient
            .from("combos")
            .select("cod_combo, nombre, precio, descripcion, imagen")
            .eq("activo", true)
            .limit(10);
          setItems(data ?? []);
        } else {
          // Para "todos": obtener total y elegir un offset aleatorio
          let result: any[] = [];
          if (sectionId === "todos") {
            // Traer un pool grande desde un offset aleatorio y elegir 10 distintos
            const EXCLUIR_FAMILIAS = ["Cigarrillos", "Tabaco", "Tabacos", "Cigarros", "Cigarette"];
            const { count } = await supabaseClient
              .from("articulos")
              .select("*", { count: "exact", head: true })
              .gt("stock", 0)
              .not("familiaNombre", "in", `(${EXCLUIR_FAMILIAS.join(",")})`);
            const total = count ?? 0;
            const poolSize = 80;
            const maxOffset = Math.max(0, total - poolSize);
            const offset = Math.floor(Math.random() * maxOffset);
            const { data: pool } = await supabaseClient
              .from("articulos")
              .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
              .gt("stock", 0)
              .not("familiaNombre", "in", `(${EXCLUIR_FAMILIAS.join(",")})`)
              .order("orden", { ascending: true })
              .range(offset, offset + poolSize - 1);
            // Shuffle el pool completo y tomar los primeros 10
            result = shuffleArray(pool ?? []).slice(0, isGrid2x2 ? 4 : (maxItems ?? 10));
          } else if (filtro.familias && filtro.familias.length > 0) {
            // Sección "Según tu último pedido"
            const primeraFamilia = filtro.familias[0];
            if (primeraFamilia.startsWith("__codigos__:")) {
              // Fallback: buscar por códigos directamente
              const codigos = primeraFamilia.replace("__codigos__:", "").split(",").map(Number);
              const { data: pool } = await supabaseClient
                .from("articulos")
                .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
                .gt("stock", 0)
                .in("codigo", codigos);
              // Con los codigos obtenemos las familias reales y traemos más productos
              const familias = [...new Set((pool ?? []).map((p: any) => p.familiaNombre).filter(Boolean))];
              if (familias.length > 0) {
                const { data: masPool } = await supabaseClient
                  .from("articulos")
                  .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
                  .gt("stock", 0)
                  .in("familiaNombre", familias)
                  .limit(80);
                result = shuffleArray(masPool ?? []).slice(0, isGrid2x2 ? 4 : (maxItems ?? 10));
              } else {
                result = shuffleArray(pool ?? []).slice(0, isGrid2x2 ? 4 : (maxItems ?? 10));
              }
            } else {
              const { data: pool } = await supabaseClient
                .from("articulos")
                .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
                .gt("stock", 0)
                .in("familiaNombre", filtro.familias)
                .order("orden", { ascending: true })
                .limit(80);
              result = shuffleArray(pool ?? []).slice(0, isGrid2x2 ? 4 : (maxItems ?? 10));
            }
          } else {
            let query = supabaseClient
              .from("articulos")
              .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
              .gt("stock", 0)
              .order("orden", { ascending: true })
              .limit(10);

            if (filtro.familia)   query = query.ilike("familiaNombre", filtro.familia);
            if (filtro.descuento) query = query.gt("descuento", 0).order("descuento", { ascending: false });

            const { data } = await query;
            result = data ?? [];
            if (SHUFFLE_IDS.has(sectionId)) result = shuffleArray(result);
          }
          setItems(result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [seed]);

  if (!loading && items.length === 0) return null;

  const rowRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2 className="home-section__titulo">{titulo}</h2>
        {!hideVerTodos && <a href={verTodosHref} className="home-section__ver-todos">ver todos →</a>}
      </div>
      {isGrid2x2 ? (
        <div className="home-section__grid2x2">
          {loading
            ? [...Array(4)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)
            : items.map(a => <ProductCard key={a.codigo} articulo={a} />)
          }
        </div>
      ) : (
        <div className="home-section__row-wrap">
          <button className="home-section__arrow home-section__arrow--left" onClick={() => scroll("left")} aria-label="Anterior">‹</button>
          <div className="home-section__row" ref={rowRef}>
            {loading
              ? [...Array(4)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)
              : <>
                  {filtro.combos
                    ? items.map(c => <ComboCard key={c.cod_combo} combo={c} />)
                    : items.map(a => <ProductCard key={a.codigo} articulo={a} />)
                  }
                  <a href={verTodosHref} className="hs-ver-todos-card">
                    <span className="hs-ver-todos-card__icon">→</span>
                    <span className="hs-ver-todos-card__txt">Ver<br/>todos</span>
                  </a>
                </>
            }
          </div>
          <button className="home-section__arrow home-section__arrow--right" onClick={() => scroll("right")} aria-label="Siguiente">›</button>
        </div>
      )}
    </section>
  );
}