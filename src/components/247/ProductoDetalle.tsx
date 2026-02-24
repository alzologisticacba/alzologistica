// src/components/247/ProductoDetalle.tsx
import React, { useState, useEffect } from "react";
import Header247 from "./Header247";
import { addToCart } from "./hooks/cartStore";
import { supabaseClient } from "../../lib/supabaseClient";

interface Articulo {
  codigo: number;
  descripcion: string;
  rubro: string;
  precioFinal: number;
  descuento: number;
  multiplo: number;
  familiaNombre: string;
  uxb: number;
}

function fmt(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function BtnAgregar({ articulo, cantidad }: { articulo: Articulo; cantidad: number }) {
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
    const codigo = new URLSearchParams(window.location.search).get("codigo");
    if (!codigo) { setError(true); setLoading(false); return; }

    supabaseClient
      .from("articulos")
      .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock, uxb")
      .eq("codigo", parseInt(codigo))
      .gt("stock", 0)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) setError(true);
        else {
          setArticulo(data);
          setCantidad(data.multiplo || 1);
          // Guardar familiaNombre en historial de vistos
          try {
            const vistos = JSON.parse(localStorage.getItem("alzo_vistos") ?? "[]");
            if (data.familiaNombre && !vistos.includes(data.familiaNombre)) {
              vistos.unshift(data.familiaNombre);
              localStorage.setItem("alzo_vistos", JSON.stringify(vistos.slice(0, 5)));
            }
          } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const tieneDescuento  = articulo && articulo.descuento > 0;
  const precioOriginal  = tieneDescuento ? articulo!.precioFinal / (1 - articulo!.descuento / 100) : null;

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
            <nav className="pd__breadcrumb">
              <a href="/247">Inicio</a><span>›</span>
              <a href={`/247/categoria/${articulo.familiaNombre.toLowerCase().replace(/\s+/g, "-")}`}>{articulo.familiaNombre}</a>
              <span>›</span><span>{articulo.rubro}</span>
            </nav>

            <div className="pd__body">
              <div className="pd__img-col">
                <div className="pd__img-wrap">
                  <div className="pd__img-placeholder">📦</div>
                </div>
                {tieneDescuento && <div className="pd__badge">-{articulo.descuento}% OFF</div>}
              </div>

              <div className="pd__info-col">
                <p className="pd__rubro">{articulo.rubro} · {articulo.familiaNombre}</p>
                <h1 className="pd__titulo">{articulo.descripcion}</h1>

                <div className="pd__precio-wrap">
                  {precioOriginal && <p className="pd__precio-original">{fmt(precioOriginal)}</p>}
                  <div className="pd__precio-row">
                    {tieneDescuento && <span className="pd__precio-badge">-{articulo.descuento}%</span>}
                    <span className="pd__precio">{fmt(articulo.precioFinal)}</span>
                  </div>
                  <p className="pd__precio-unit">precio por unidad</p>
                </div>

                <table className="pd__details">
                  <tbody>
                    {articulo.uxb > 1 && <tr><td>Unidades por bulto</td><td><strong>{articulo.uxb}</strong></td></tr>}
                    {articulo.multiplo > 1 && <tr><td>Múltiplo de venta</td><td><strong>×{articulo.multiplo}</strong></td></tr>}
                    <tr><td>Código</td><td><strong>#{articulo.codigo}</strong></td></tr>
                  </tbody>
                </table>

                <div className="pd__cantidad-wrap">
                  <span className="pd__cantidad-label">Cantidad:</span>
                  <div className="pd__cantidad-ctrl">
                    <button className="pd__cantidad-btn"
                      onClick={() => setCantidad(c => Math.max(articulo.multiplo || 1, c - (articulo.multiplo || 1)))}
                      disabled={cantidad <= (articulo.multiplo || 1)}>−</button>
                    <span className="pd__cantidad-val">{cantidad}</span>
                    <button className="pd__cantidad-btn"
                      onClick={() => setCantidad(c => c + (articulo.multiplo || 1))}>+</button>
                  </div>
                </div>

                {cantidad > (articulo.multiplo || 1) && (
                  <p className="pd__total">Total: <strong>{fmt(articulo.precioFinal * cantidad)}</strong></p>
                )}

                <BtnAgregar articulo={articulo} cantidad={cantidad} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}