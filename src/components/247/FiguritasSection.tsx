// src/components/247/FiguritasSection.tsx
import React, { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import ComboCard from "./ComboCard";
import { supabaseClient } from "../../lib/supabaseClient";

const FONDOS = [
  "/img/247/figuritasFondo.webp",
  "/img/247/figuritasFondo1.webp",
  "/img/247/figuritasFondo2.webp",
];

export default function FiguritasSection() {
  const [idx, setIdx]         = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [fading, setFading]   = useState(false);
  const [articulos, setArticulos] = useState<any[]>([]);
  const [combos, setCombos]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (idx + 1) % FONDOS.length;
      setNextIdx(next);
      setFading(true);
      setTimeout(() => { setIdx(next); setFading(false); }, 700);
    }, 5000);
    return () => clearInterval(interval);
  }, [idx]);

  useEffect(() => {
    Promise.all([
      supabaseClient
        .from("articulos")
        .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
        .eq("seccion", "figuritas")
        .gt("stock", 0),
      supabaseClient
        .from("combos")
        .select("cod_combo, nombre, precio, descripcion, imagen")
        .in("cod_combo", ["COMBO597", "COMBO592"])
        .eq("activo", true),
    ]).then(([artRes, comboRes]) => {
      setArticulos(artRes.data ?? []);
      setCombos(comboRes.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const hayItems = !loading && (articulos.length > 0 || combos.length > 0);
  if (!loading && !hayItems) return null;

  const cssVars = {
    "--fig-bg-next": `url("${FONDOS[nextIdx]}")`,
    "--fig-bg-cur":  `url("${FONDOS[idx]}")`,
    "--fig-opacity": fading ? "0" : "1",
  } as React.CSSProperties;

  return (
    <section id="figuritas" className="figuritas-section" style={cssVars}>

      {/* ── Fondos rotantes ── */}
      <div className="figuritas-section__bg-layer" style={{ backgroundImage: `url("${FONDOS[nextIdx]}")`, opacity: 1, zIndex: 0 }} />
      <div className="figuritas-section__bg-layer" style={{ backgroundImage: `url("${FONDOS[idx]}")`, opacity: fading ? 0 : 1, zIndex: 1 }} />

      {/* ── Header ── */}
      <div className="figuritas-section__header">
        <div className="figuritas-section__overlay" />
        <img src="/img/247/figuritasPaquete.png" alt="" className="figuritas-section__deco" aria-hidden="true" loading="lazy" />
        <div className="figuritas-section__titles">
          <h2 className="figuritas-section__title">FIGURITAS</h2>
          <p className="figuritas-section__subtitle">MUNDIAL 2026</p>
        </div>
      </div>

      {/* ── Productos ── */}
      <div className="figuritas-section__body-overlay" />
      <div className="figuritas-section__body-content">
        <div className="figuritas-section__row-wrap">
          <div className="figuritas-section__row" ref={rowRef}>
            {loading
              ? [...Array(2)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)
              : <>
                  {articulos.map(a => <ProductCard key={a.codigo} articulo={a} />)}
                  {combos.map(c => <ComboCard key={c.cod_combo} combo={c} />)}
                </>
            }
          </div>
        </div>
      </div>

    </section>
  );
}
