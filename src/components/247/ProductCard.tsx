// src/components/247/ProductCard.tsx
import { useState } from "react";
import { addToCart } from "./hooks/cartStore";
import type { Articulo } from "./hooks/useArticulos";

function fmt(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

export default function ProductCard({ articulo }: { articulo: Articulo }) {
  const [agregado, setAgregado] = useState(false);
  const tieneDescuento = articulo.descuento > 0;
  const precioOriginal = tieneDescuento
    ? articulo.precioFinal / (1 - articulo.descuento / 100)
    : null;

  function handleAgregar(e: React.MouseEvent) {
    e.stopPropagation();
    addToCart({
      codigo:      articulo.codigo,
      descripcion: articulo.descripcion,
      precioFinal: articulo.precioFinal,
      multiplo:    articulo.multiplo || 1,
      descuento:   articulo.descuento,
      familiaNombre: articulo.familiaNombre,
      tipo:        "articulo",
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  }

  return (
    <article
      className="product-card"
      onClick={() => window.location.href = `/247/producto/?codigo=${articulo.codigo}`}
      style={{ cursor: "pointer" }}
    >
      {tieneDescuento && <div className="product-card__badge">-{articulo.descuento}%</div>}

      <div className="product-card__img-wrap">
        <div className="product-card__img-placeholder">📦</div>
      </div>

      <div className="product-card__info">
        <p className="product-card__desc">{articulo.descripcion}</p>
        <p className="product-card__rubro">{articulo.rubro}</p>
        {precioOriginal && <p className="product-card__precio-original">{fmt(precioOriginal)}</p>}
        <p className="product-card__precio">{fmt(articulo.precioFinal)}</p>
        {articulo.multiplo > 1 && <p className="product-card__multiplo">x{articulo.multiplo} unidades</p>}
      </div>

      <button type="button" className={`product-card__btn${agregado ? " product-card__btn--ok" : ""}`} onClick={handleAgregar}>
        {agregado ? "✓ Agregado" : "Agregar"}
      </button>
    </article>
  );
}