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

const EXCLUIR_FAMILIAS = ["Cigarrillos", "Tabaco", "Tabacos", "Cigarros", "Cigarette"];
const PAGE_SIZE = 8;

interface Filtro {
  id?: string;
  familia?: string;
  familias?: string[];
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
  banner?: string;
}

export default function HomeSection({ id, titulo, filtro, verTodosHref, hideVerTodos = false, maxItems, banner }: Props) {
  const isGrid2x2      = filtro.grid2x2 ?? false;
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seed, setSeed]       = useState(0);
  const [page, setPage]         = useState(0);
  const [hasNext, setHasNext]   = useState(false);
  const baseOffsetRef         = useRef(-1);
  const discountPoolRef       = useRef<any[]>([]);
  const rowRef                = useRef<HTMLDivElement>(null);

  // Refrescar al volver atrás con flecha/historial del navegador
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setSeed(s => s + 1);
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

  // Resetear página y offset base cuando cambia el seed
  useEffect(() => {
    setPage(0);
    baseOffsetRef.current = -1;
    discountPoolRef.current = [];
  }, [seed]);

  useEffect(() => {
    setLoading(true);
    if (rowRef.current) rowRef.current.scrollLeft = 0;
    let cancelled = false;

    async function fetchData() {
      try {
        const sectionId = id ?? "";

        // --- Combos: sin paginación ---
        if (filtro.combos) {
          const { data } = await supabaseClient
            .from("combos")
            .select("cod_combo, nombre, precio, descripcion, imagen")
            .eq("activo", true)
            .limit(10);
          if (!cancelled) { setItems(data ?? []); setHasNext(false); }
          return;
        }

        // --- Grid 2x2: sin paginación, 4 items shuffled ---
        if (isGrid2x2) {
          let result: any[] = [];
          if (filtro.familias && filtro.familias.length > 0) {
            const primeraFamilia = filtro.familias[0];
            if (primeraFamilia.startsWith("__codigos__:")) {
              const codigos = primeraFamilia.replace("__codigos__:", "").split(",").map(Number);
              const { data: pool } = await supabaseClient
                .from("articulos")
                .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
                .gt("stock", 0)
                .in("codigo", codigos);
              const familias = [...new Set((pool ?? []).map((p: any) => p.familiaNombre).filter(Boolean))];
              if (familias.length > 0) {
                const { data: masPool } = await supabaseClient
                  .from("articulos")
                  .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
                  .gt("stock", 0)
                  .in("familiaNombre", familias)
                  .limit(80);
                result = shuffleArray(masPool ?? []).slice(0, 4);
              } else {
                result = shuffleArray(pool ?? []).slice(0, 4);
              }
            } else {
              const { data: pool } = await supabaseClient
                .from("articulos")
                .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
                .gt("stock", 0)
                .in("familiaNombre", filtro.familias)
                .limit(80);
              result = shuffleArray(pool ?? []).slice(0, 4);
            }
          }
          if (!cancelled) { setItems(result); setHasNext(false); }
          return;
        }

        // --- Secciones con paginación ---
        const pageSize = maxItems ?? PAGE_SIZE;
        const offset   = page * pageSize;
        let result: any[] = [];
        let nextExists = false;

        if (sectionId === "todos") {
          // Calcular base offset aleatorio una vez por seed
          if (baseOffsetRef.current < 0) {
            const { count } = await supabaseClient
              .from("articulos")
              .select("*", { count: "exact", head: true })
              .gt("stock", 0)
              .not("familiaNombre", "in", `(${EXCLUIR_FAMILIAS.join(",")})`);
            const total = count ?? 0;
            const maxBase = Math.max(0, total - pageSize * 20);
            baseOffsetRef.current = Math.floor(Math.random() * maxBase);
          }
          const from = baseOffsetRef.current + offset;
          const { data } = await supabaseClient
            .from("articulos")
            .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
            .gt("stock", 0)
            .not("familiaNombre", "in", `(${EXCLUIR_FAMILIAS.join(",")})`)
            .order("orden", { ascending: true })
            .range(from, from + pageSize); // +1 para detectar hasNext
          const fetched = data ?? [];
          result = fetched.slice(0, pageSize);
          nextExists = fetched.length > pageSize;

        } else if (filtro.familias && filtro.familias.length > 0) {
          const { data } = await supabaseClient
            .from("articulos")
            .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
            .gt("stock", 0)
            .in("familiaNombre", filtro.familias)
            .order("orden", { ascending: true })
            .range(offset, offset + pageSize); // +1 para detectar hasNext
          const fetched = data ?? [];
          result = fetched.slice(0, pageSize);
          nextExists = fetched.length > pageSize;

        } else if (filtro.descuento) {
          // Descuentos: fetchear pool completo una vez, shufflear y paginar client-side
          if (discountPoolRef.current.length === 0) {
            const { data: pool } = await supabaseClient
              .from("articulos")
              .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
              .gt("stock", 0)
              .gt("descuento", 0)
              .limit(300);
            discountPoolRef.current = shuffleArray(pool ?? []);
          }
          result = discountPoolRef.current.slice(offset, offset + pageSize);
          nextExists = discountPoolRef.current.length > offset + pageSize;

        } else {
          let query = supabaseClient
            .from("articulos")
            .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
            .gt("stock", 0)
            .order("orden", { ascending: true });
          if (filtro.familia) query = query.ilike("familiaNombre", filtro.familia);
          const { data } = await query.range(offset, offset + pageSize); // +1 para detectar hasNext
          const fetched = data ?? [];
          result = fetched.slice(0, pageSize);
          nextExists = fetched.length > pageSize;
        }

        if (!cancelled) {
          setItems(result);
          setHasNext(nextExists);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [seed, page]);

  if (!loading && items.length === 0) return null;

  // Las flechas primero scrollean dentro de la página; al llegar al borde cargan página siguiente/anterior
  const handleArrow = (dir: "left" | "right") => {
    const row = rowRef.current;
    if (!row) return;
    const atEnd   = row.scrollLeft + row.clientWidth >= row.scrollWidth - 16;
    const atStart = row.scrollLeft <= 16;

    if (dir === "right") {
      if (atEnd && hasNext) setPage(p => p + 1);
      else row.scrollBy({ left: 320, behavior: "smooth" });
    } else {
      if (atStart && page > 0) setPage(p => p - 1);
      else row.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  return (
    <section className={`home-section${banner ? " home-section--banner" : ""}`}>
      {banner ? (
        <a href={verTodosHref} className="home-section__banner-link">
          <img src={banner} alt={titulo} className="home-section__banner" />
        </a>
      ) : (
        <div className="home-section__header">
          <h2 className="home-section__titulo">{titulo}</h2>
          {!hideVerTodos && <a href={verTodosHref} className="home-section__ver-todos">ver todos →</a>}
        </div>
      )}
      {isGrid2x2 ? (
        <div className="home-section__grid2x2">
          {loading
            ? [...Array(4)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)
            : items.map(a => <ProductCard key={a.codigo} articulo={a} />)
          }
        </div>
      ) : (
        <>
          <div className="home-section__row-wrap">
            <button className="home-section__arrow home-section__arrow--left" onClick={() => handleArrow("left")} disabled={page === 0} aria-label="Anterior">‹</button>
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
            <button className="home-section__arrow home-section__arrow--right" onClick={() => handleArrow("right")} aria-label="Siguiente">›</button>
          </div>
        </>
      )}
    </section>
  );
}
