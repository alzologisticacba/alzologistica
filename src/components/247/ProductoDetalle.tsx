// src/components/247/ProductoDetalle.tsx
import React, { useState, useEffect } from "react";
import Header247 from "./Header247";
import { addToCart } from "./hooks/cartStore";

interface Articulo {
  codigo: number;
  descripcion: string;
  proveedor: string;
  rubro: string;
  precioFinal: number;
  descuento: number;
  multiplo: number;
  familiaNombre: string;
  stock: number;
  uxb: number;
}

function formatPrecio(precio: number) {
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}


function BtnAgregar({ articulo, cantidad }: { articulo: any; cantidad: number }) {
  const [agregado, setAgregado] = React.useState(false);

  function handleAgregar() {
    addToCart({
      codigo:      articulo.codigo,
      descripcion: articulo.descripcion,
      precioFinal: articulo.precioFinal,
      multiplo:    cantidad,
      descuento:   articulo.descuento,
      tipo:        "articulo",
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  }

  return (
    <button
      className={`pd__btn-agregar${agregado ? " pd__btn-agregar--ok" : ""}`}
      onClick={handleAgregar}
    >
      {agregado ? "✓ ¡Agregado al carrito!" : "🛒 Agregar al carrito"}
    </button>
  );
}

export default function ProductoDetalle() {
  const [articulo, setArticulo] = useState<Articulo | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const codigo = window.location.pathname.split("/").pop();
    if (!codigo) { setError(true); setLoading(false); return; }

    fetch(`/api/articulo/${codigo}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(true); return; }
        setArticulo(json.data);
        // Cantidad mínima = multiplo
        if (json.data.multiplo > 1) setCantidad(json.data.multiplo);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const precioOriginal = articulo?.descuento > 0
    ? articulo.precioFinal / (1 - articulo.descuento / 100)
    : null;

  const precioTotal = articulo ? articulo.precioFinal * cantidad : 0;
  const step        = articulo?.multiplo > 1 ? articulo.multiplo : 1;

  return (
    <div className="app-247">
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
          <div className="pd">
            {/* Breadcrumb */}
            <nav className="pd__breadcrumb">
              <a href="/247">Inicio</a>
              <span>›</span>
              <a href={`/247/categoria/${articulo.familiaNombre.toLowerCase().replace(/\s+/g, "-")}`}>{articulo.familiaNombre}</a>
              <span>›</span>
              <span>{articulo.rubro}</span>
            </nav>

            <div className="pd__body">
              {/* Imagen */}
              <div className="pd__img-col">
                <div className="pd__img-wrap">
                  {articulo.descuento > 0 && (
                    <span className="pd__discount-badge">-{articulo.descuento}% OFF</span>
                  )}
                  <div className="pd__img-placeholder">📦</div>
                </div>
              </div>

              {/* Info */}
              <div className="pd__info-col">
                <p className="pd__rubro">{articulo.rubro} · {articulo.familiaNombre}</p>
                <h1 className="pd__titulo">{articulo.descripcion}</h1>

                {/* Precio */}
                <div className="pd__precio-wrap">
                  {precioOriginal && (
                    <p className="pd__precio-original">{formatPrecio(precioOriginal)}</p>
                  )}
                  <div className="pd__precio-row">
                    <span className="pd__precio">{formatPrecio(articulo.precioFinal)}</span>
                    {articulo.descuento > 0 && (
                      <span className="pd__precio-off">{articulo.descuento}% OFF</span>
                    )}
                  </div>
                  <p className="pd__precio-unit">por unidad</p>
                </div>

                {/* Detalles */}
                <div className="pd__details">
                  {articulo.uxb > 1 && (
                    <div className="pd__detail-row">
                      <span className="pd__detail-label">Unidades por bulto</span>
                      <span className="pd__detail-value">{articulo.uxb} un.</span>
                    </div>
                  )}
                  {articulo.multiplo > 1 && (
                    <div className="pd__detail-row">
                      <span className="pd__detail-label">Múltiplo de venta</span>
                      <span className="pd__detail-value">x{articulo.multiplo} unidades</span>
                    </div>
                  )}
                  <div className="pd__detail-row">
                    <span className="pd__detail-label">Código</span>
                    <span className="pd__detail-value">#{articulo.codigo}</span>
                  </div>
                </div>

                {/* Cantidad */}
                <div className="pd__cantidad-wrap">
                  <span className="pd__cantidad-label">Cantidad:</span>
                  <div className="pd__cantidad-ctrl">
                    <button
                      className="pd__cantidad-btn"
                      onClick={() => setCantidad(c => Math.max(step, c - step))}
                      disabled={cantidad <= step}
                    >−</button>
                    <span className="pd__cantidad-val">{cantidad}</span>
                    <button
                      className="pd__cantidad-btn"
                      onClick={() => setCantidad(c => c + step)}
                    >+</button>
                  </div>
                  {articulo.multiplo > 1 && (
                    <span className="pd__cantidad-hint">Múltiplos de {articulo.multiplo}</span>
                  )}
                </div>

                {/* Total */}
                {cantidad > 1 && (
                  <p className="pd__total">Total: <strong>{formatPrecio(precioTotal)}</strong></p>
                )}

                {/* CTA */}
                <BtnAgregar articulo={articulo} cantidad={cantidad} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}