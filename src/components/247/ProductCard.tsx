// src/components/247/ProductCard.tsx
import { useState } from "react";
import React from "react";
import { addToCart } from "./hooks/cartStore";
import type { Articulo } from "./hooks/useArticulos";

function fmt(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}


const IMG_BASE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";

function ProductImg({ codigo }: { codigo: number }) {
  const [error, setError] = React.useState(false);
  if (error) return <div className="product-card__img-placeholder">📦</div>;
  return (
    <img
      src={`${IMG_BASE}/${codigo}.png`}
      alt=""
      className="product-card__img"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

export default function ProductCard({ articulo }: { articulo: Articulo }) {
  const [btnState, setBtnState] = useState<"idle" | "ok" | "pending">("idle");

  React.useEffect(() => {
    function onConfirmed(e: Event) {
      const { codigo } = (e as CustomEvent<{ codigo: number }>).detail;
      if (codigo === articulo.codigo) {
        setBtnState("ok");
        setTimeout(() => setBtnState("idle"), 1500);
      }
    }
    window.addEventListener("cart-age-confirmed", onConfirmed);
    return () => window.removeEventListener("cart-age-confirmed", onConfirmed);
  }, [articulo.codigo]);
  const tieneDescuento = articulo.descuento > 0;
  const precioOriginal = tieneDescuento
    ? articulo.precioFinal / (1 - articulo.descuento / 100)
    : null;

  function handleAgregar(e: React.MouseEvent) {
    e.stopPropagation();
    const result = addToCart({
      codigo:        articulo.codigo,
      descripcion:   articulo.descripcion,
      precioFinal:   articulo.precioFinal,
      multiplo:      articulo.multiplo || 1,
      descuento:     articulo.descuento,
      familiaNombre: articulo.familiaNombre ?? "",
      rubro:         articulo.rubro ?? "",
      tipo:          "articulo",
    });
    setBtnState(result === "added" ? "ok" : "pending");
    setTimeout(() => setBtnState("idle"), 1500);
  }

  return (
    <article
      className="product-card"
      onClick={() => window.location.href = `/247/producto/?codigo=${articulo.codigo}`}
      style={{ cursor: "pointer" }}
    >
      {tieneDescuento && <div className="product-card__badge">-{articulo.descuento}%</div>}

      <div className="product-card__img-wrap">
        <ProductImg codigo={articulo.codigo} />
      </div>

      <div className="product-card__info">
        <p className="product-card__desc">{articulo.descripcion}</p>
        <p className="product-card__rubro">{articulo.rubro}</p>
        {precioOriginal && <p className="product-card__precio-original">{fmt(precioOriginal)}</p>}
        <p className="product-card__precio">{fmt(articulo.precioFinal)}</p>
        {articulo.multiplo > 1 && <p className="product-card__multiplo">x{articulo.multiplo} unidades</p>}
      </div>

      <button
        type="button"
        className={`product-card__btn${btnState === "ok" ? " product-card__btn--ok" : btnState === "pending" ? " product-card__btn--pending" : ""}`}
        onClick={handleAgregar}
      >
        {btnState === "ok" ? "✓ Agregado" : btnState === "pending" ? "✕ No agregado" : "Agregar"}
      </button>
    </article>
  );
}