// src/components/247/ComboDetalle.tsx

import React, { useState, useEffect } from "react";
import Header247 from "./Header247";
import { addToCart } from "./hooks/cartStore";

interface DetalleLine {
  id: number;
  productos: string;
  nombre: string | null;
  cantidad: number;
  descuentos: number;
  grupo: number;
}

interface Combo {
  cod_combo: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen?: string;
  detalles: DetalleLine[];
}

function formatPrecio(precio: number) {
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function ItemRow({ item }: { item: DetalleLine }) {
  return (
    <div className="combo-item">
      <div className="combo-item__left">
        <span className="combo-item__qty">{item.cantidad}×</span>
        <div className="combo-item__info">
          {item.nombre && <span className="combo-item__name">{item.nombre}</span>}
          <span className="combo-item__code">#{item.productos}</span>
        </div>
      </div>
      {item.descuentos > 0 && (
        <span className="combo-item__desc">-{item.descuentos}%</span>
      )}
    </div>
  );
}


function BtnComboAgregar({ combo, cantidad }: { combo: any; cantidad: number }) {
  const [agregado, setAgregado] = React.useState(false);
  function handleAgregar() {
    addToCart({
      codigo:      combo.cod_combo,
      descripcion: combo.nombre,
      precioFinal: combo.precio,
      multiplo:    1,
      descuento:   0,
      tipo:        "combo",
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

export default function ComboDetalle() {
  const [combo, setCombo]       = useState<Combo | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const cod = window.location.pathname.split("/").pop();
    if (!cod) { setError(true); setLoading(false); return; }
    fetch(`/api/combo/${cod}`)
      .then(r => r.json())
      .then(json => { if (json.error) setError(true); else setCombo(json.data); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const grupos = combo ? [...new Set(combo.detalles.map(d => d.grupo))].sort() : [];
  const multiGrupo = grupos.length > 1;

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
            <p>Combo no encontrado.</p>
            <button onClick={() => window.history.back()} className="pd-error__btn">← Volver</button>
          </div>
        )}

        {!loading && !error && combo && (
          <div className="pd">
            <nav className="pd__breadcrumb">
              <a href="/247">Inicio</a><span>›</span>
              <a href="/247/combos">Combos</a><span>›</span>
              <span>{combo.nombre}</span>
            </nav>

            <div className="pd__body">
              {/* Imagen */}
              <div className="pd__img-col">
                <div className="pd__img-wrap">
                  {combo.imagen
                    ? <img src={combo.imagen} alt={combo.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div className="pd__img-placeholder">🎁</div>
                  }
                </div>
              </div>

              {/* Info */}
              <div className="pd__info-col">
                <p className="pd__rubro">COMBO</p>
                <h1 className="pd__titulo">{combo.nombre}</h1>
                {combo.descripcion && <p style={{ fontSize: 13, color: "#7a84a8" }}>{combo.descripcion}</p>}

                <div className="pd__precio-wrap">
                  <div className="pd__precio-row">
                    <span className="pd__precio">{formatPrecio(combo.precio)}</span>
                  </div>
                  <p className="pd__precio-unit">precio del combo</p>
                </div>

                {/* Componentes */}
                {combo.detalles.length > 0 && (
                  <div className="combo-detalles">
                    <h2 className="combo-detalles__titulo">Contenido del combo</h2>
                    {multiGrupo
                      ? grupos.map(g => (
                          <div key={g} className="combo-grupo">
                            <p className="combo-grupo__label">Grupo {g}</p>
                            {combo.detalles.filter(d => d.grupo === g).map(item => <ItemRow key={item.id} item={item} />)}
                          </div>
                        ))
                      : combo.detalles.map(item => <ItemRow key={item.id} item={item} />)
                    }
                  </div>
                )}

                {/* Cantidad */}
                <div className="pd__cantidad-wrap">
                  <span className="pd__cantidad-label">Cantidad:</span>
                  <div className="pd__cantidad-ctrl">
                    <button className="pd__cantidad-btn" onClick={() => setCantidad(c => Math.max(1, c - 1))} disabled={cantidad <= 1}>−</button>
                    <span className="pd__cantidad-val">{cantidad}</span>
                    <button className="pd__cantidad-btn" onClick={() => setCantidad(c => c + 1)}>+</button>
                  </div>
                </div>

                {cantidad > 1 && <p className="pd__total">Total: <strong>{formatPrecio(combo.precio * cantidad)}</strong></p>}

                <BtnComboAgregar combo={combo} cantidad={cantidad} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}