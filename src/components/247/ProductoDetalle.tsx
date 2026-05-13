// src/components/247/ProductoDetalle.tsx
import React, { useState, useEffect, useRef } from "react";
import Header247 from "./Header247";
import ProductCard from "./ProductCard";
import CategoriesSection from "./CategoriesSection";
import Footer247 from "./Footer247";
import PageFooterSection from "./PageFooterSection";
import { addToCart } from "./hooks/cartStore";
import { supabaseClient } from "../../lib/supabaseClient";
import ShareButton from "./ShareButton";

// const FONDOS_FIG = [
//   "/img/247/figuritasFondo.webp",
//   "/img/247/figuritasFondo1.webp",
//   "/img/247/figuritasFondo2.webp",
// ];

interface Articulo {
  codigo: number;
  descripcion: string;
  rubro: string;
  precioFinal: number;
  descuento: number;
  multiplo: number;
  familiaNombre: string;
  // seccion?: string;
  uxb: number;
}

function fmt(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function BtnAgregar({ articulo, cantidad, precioConDescuento }: { articulo: Articulo; cantidad: number; precioConDescuento: number | null }) {
  const [btnState, setBtnState] = React.useState<"idle" | "ok" | "pending">("idle");

  React.useEffect(() => {
    function onConfirmed(e: Event) {
      const { codigo } = (e as CustomEvent<{ codigo: number }>).detail;
      if (codigo === articulo.codigo) {
        setBtnState("ok");
        setTimeout(() => setBtnState("idle"), 1800);
      }
    }
    window.addEventListener("cart-age-confirmed", onConfirmed);
    return () => window.removeEventListener("cart-age-confirmed", onConfirmed);
  }, [articulo.codigo]);

  function handleAgregar() {
    const result = addToCart({
      codigo:        articulo.codigo,
      descripcion:   articulo.descripcion,
      precioFinal:   precioConDescuento ?? articulo.precioFinal,
      multiplo:      cantidad,
      descuento:     articulo.descuento,
      familiaNombre: articulo.familiaNombre ?? "",
      rubro:         articulo.rubro ?? "",
      tipo:          "articulo",
    });
    setBtnState(result === "added" ? "ok" : "pending");
    setTimeout(() => setBtnState("idle"), 1800);
  }
  return (
    <button
      className={`pd__btn-agregar${btnState === "ok" ? " pd__btn-agregar--ok" : btnState === "pending" ? " pd__btn-agregar--pending" : ""}`}
      onClick={handleAgregar}
    >
      {btnState === "ok" ? "✓ ¡Agregado al carrito!" : btnState === "pending" ? "✕ No agregado" : "🛒 Agregar al carrito"}
    </button>
  );
}

export default function ProductoDetalle() {
  const [articulo, setArticulo]       = useState<Articulo | null>(null);
  const [relacionados, setRelacionados] = useState<any[]>([]);
  const [imgError, setImgError]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [cantidad, setCantidad]       = useState(1);
  const [inputVal, setInputVal]       = useState("1");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // const [bgIdx, setBgIdx]             = useState(0);
  // const [bgNext, setBgNext]           = useState(1);
  // const [bgFading, setBgFading]       = useState(false);

  useEffect(() => {
    const codigo = new URLSearchParams(window.location.search).get("codigo");
    if (!codigo) { setError(true); setLoading(false); return; }

    supabaseClient
      .from("articulos")
      .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock, uxb")
      .eq("codigo", parseInt(codigo))
      .gt("stock", 0)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError(true); return; }
        setArticulo(data);
        setCantidad(data.multiplo || 1);
        setInputVal(String(data.multiplo || 1));
        try { if (data.familiaNombre) localStorage.setItem("alzo_ultimo_visto", data.familiaNombre); } catch {}

        // Traer 40 de la misma familia, shufflear, tomar 10 (excluir el actual)
        supabaseClient
          .from("articulos")
          .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
          .eq("familiaNombre", data.familiaNombre)
          .gt("stock", 0)
          .neq("codigo", parseInt(codigo))
          .limit(40)
          .then(({ data: pool }) => {
            setRelacionados(shuffleArray(pool ?? []).slice(0, 10));
          });
      })
      .finally(() => setLoading(false));
  }, []);

  // const esFiguritas = articulo?.seccion === "figuritas";

  // useEffect(() => {
  //   if (!esFiguritas) return;
  //   const interval = setInterval(() => {
  //     const next = (bgIdx + 1) % FONDOS_FIG.length;
  //     setBgNext(next);
  //     setBgFading(true);
  //     setTimeout(() => { setBgIdx(next); setBgFading(false); }, 700);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [esFiguritas, bgIdx]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  const relRowRef = useRef<HTMLDivElement>(null);
  const scrollRel = (dir: "left" | "right") => {
    if (relRowRef.current) relRowRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  const tieneDescuento = articulo && articulo.descuento > 0;
  const precioConDescuento = tieneDescuento ? articulo!.precioFinal * (1 - articulo!.descuento / 100) : null;
  const maxCantidad = articulo?.codigo === 549146 ? 50 : Infinity;

  return (
    <div className="app-247">
      {/* esFiguritas && <>
        <div className="pd-fig-bg" style={{ backgroundImage: `url("${FONDOS_FIG[bgNext]}")`, opacity: 1, zIndex: 0 }} />
        <div className="pd-fig-bg" style={{ backgroundImage: `url("${FONDOS_FIG[bgIdx]}")`, opacity: bgFading ? 0 : 1, zIndex: 1 }} />
        <div className="pd-fig-overlay" />
      </> */}
      <Header247 showBack={true} />
      <div className="shell-247">
        {loading && (
          <div className="pd-skeleton">
            <div className="pd-skeleton__img" />
            <div className="pd-skeleton__info">
              <div className="pd-skeleton__line pd-skeleton__line--title" />
              <div className="pd-skeleton__line" />
              <div className="pd-skeleton__line pd-skeleton__line--price" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="pd-error">
            <p>Producto no encontrado.</p>
            <button onClick={() => window.history.back()} className="pd-error__btn">← Volver</button>
          </div>
        )}

        {!loading && !error && articulo && (
          <>
            <div className="pd">
              <nav className="pd__breadcrumb">
                <a href="/247">Inicio</a><span>›</span>
                <a href={`/247/categoria/${articulo.familiaNombre.toLowerCase().replace(/\s+/g, "-")}`}>{articulo.familiaNombre}</a>
                <span>›</span><span>{articulo.rubro}</span>
              </nav>

              <div className="pd__body">
                {/* Título mobile-only: aparece encima de la imagen */}
                <div className="pd__title-block">
                  <h1 className="pd__titulo">{articulo.descripcion}</h1>
                </div>

                <div className="pd__img-col">
                  <div className="pd__img-wrap">
                    {imgError
                      ? <div className="pd__img-placeholder">📦</div>
                      : <img
                          src={`https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos/${articulo.codigo}.png`}
                          alt={articulo.descripcion}
                          className="pd__img pd__img--zoomable"
                          onError={() => setImgError(true)}
                          onClick={() => setLightboxOpen(true)}
                        />
                    }
                  </div>
                </div>

                <div className="pd__info-col">
                  <h1 className="pd__titulo pd__titulo--desktop">{articulo.descripcion}</h1>

                  <div className={`pd__precio-wrap${tieneDescuento ? " pd__precio-wrap--descuento" : ""}`}>
                    {precioConDescuento && (
                      <div className="pd__ahorro-row">
                        <p className="pd__precio-original">{fmt(articulo!.precioFinal)}</p>
                        <span className="pd__ahorro-chip">Ahorrás {fmt(articulo!.precioFinal - precioConDescuento)}</span>
                      </div>
                    )}
                    <div className="pd__precio-row">
                      {tieneDescuento && <span className="pd__precio-badge">-{articulo.descuento}%</span>}
                      <span className="pd__precio">{fmt(precioConDescuento ?? articulo.precioFinal)}</span>
                    </div>
                    <p className="pd__precio-unit">precio por unidad</p>
                  </div>

                  <div className="pd__chips">
                    {articulo.uxb > 1 && (
                      <div className="pd__chip">
                        <span className="pd__chip-label">📦 Bulto</span>
                        <span className="pd__chip-val">{articulo.uxb} un.</span>
                      </div>
                    )}
                    {articulo.multiplo > 1 && (
                      <div className="pd__chip">
                        <span className="pd__chip-label">🔢 Múltiplo</span>
                        <span className="pd__chip-val">×{articulo.multiplo}</span>
                      </div>
                    )}
                    <div className="pd__chip pd__chip--code">
                      <span className="pd__chip-label">Código</span>
                      <span className="pd__chip-val">#{articulo.codigo}</span>
                    </div>
                  </div>

                  <div className="pd__cantidad-wrap">
                    <span className="pd__cantidad-label">Cantidad:</span>
                    <div className="pd__cantidad-ctrl">
                      <button className="pd__cantidad-btn"
                        onClick={() => { const paso = articulo.multiplo || 1; const next = Math.max(paso, cantidad - paso); setCantidad(next); setInputVal(String(next)); }}
                        disabled={cantidad <= (articulo.multiplo || 1)}>−</button>
                      <input
                        className={`pd__cantidad-val${articulo.multiplo > 1 ? " pd__cantidad-val--readonly" : ""}`}
                        type="number"
                        min={articulo.multiplo || 1}
                        step={articulo.multiplo || 1}
                        value={inputVal}
                        readOnly={articulo.multiplo > 1}
                        onChange={articulo.multiplo > 1 ? undefined : e => setInputVal(e.target.value)}
                        onBlur={articulo.multiplo > 1 ? undefined : () => {
                          const multiplo = articulo.multiplo || 1;
                          const v = parseInt(inputVal, 10);
                          const final = isNaN(v) || v < multiplo ? multiplo : Math.round(v / multiplo) * multiplo;
                          setCantidad(final);
                          setInputVal(String(final));
                        }}
                      />
                      <button className="pd__cantidad-btn"
                        onClick={() => { const paso = articulo.multiplo || 1; const next = Math.min(cantidad + paso, maxCantidad); setCantidad(next); setInputVal(String(next)); }}
                        disabled={cantidad >= maxCantidad}>+</button>
                    </div>
                  </div>

                  <p className="pd__total">Subtotal: <strong>{fmt((precioConDescuento ?? articulo.precioFinal) * (parseInt(inputVal, 10) || cantidad))}</strong></p>

                  <div className="pd__cta-row">
                    <BtnAgregar articulo={articulo} cantidad={cantidad} precioConDescuento={precioConDescuento} />
                    <ShareButton
                      productName={articulo.descripcion}
                      productUrl={`https://alzologistica.com/247/producto/?codigo=${articulo.codigo}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Productos relacionados */}
            {relacionados.length > 0 && (
              <div className="pd__relacionados">
                <div className="pd__relacionados-head">
                  <h2 className="pd__relacionados-titulo">
                    Más de <span>{articulo.familiaNombre}</span>
                  </h2>
                </div>
                <div className="home-section__row-wrap">
                  <button className="home-section__arrow home-section__arrow--left" onClick={() => scrollRel("left")} aria-label="Anterior">‹</button>
                  <div className="pd__relacionados-row" ref={relRowRef}>
                    {relacionados.map(a => <ProductCard key={a.codigo} articulo={a} />)}
                  </div>
                  <button className="home-section__arrow home-section__arrow--right" onClick={() => scrollRel("right")} aria-label="Siguiente">›</button>
                </div>
              </div>
            )}

          </>
        )}
      </div>

      {/* Footer con volver, categorías y footer */}
      {!loading && !error && <PageFooterSection />}

      {lightboxOpen && articulo && !imgError && (
        <div className="pd__lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="pd__lightbox-close" aria-label="Cerrar">✕</button>
          <img
            src={`https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos/${articulo.codigo}.png`}
            alt={articulo.descripcion}
            className="pd__lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}