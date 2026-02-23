// src/components/247/CarritoPage.tsx
// cartStore está en: src/components/247/hooks/cartStore.ts
import { useState, useEffect } from "react";

import { getCart, clearCart, removeFromCart, updateQuantity } from "./hooks/cartStore";
export type { CartItem } from "./hooks/cartStore";

function fmt(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>([...getCart()]);

  useEffect(() => {
    const sync = () => setItems([...getCart()]);
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const totalSKUs     = items.length;
  const totalUnidades = items.reduce((s, i) => s + i.cantidad, 0);
  const totalPrecio   = items.reduce((s, i) => s + i.precioFinal * i.cantidad, 0);

  function cambiarCantidad(codigo: number, dir: 1 | -1) {
    const cart = getCart();
    const item = cart.find(i => i.codigo === codigo);
    if (!item) return;
    const step  = item.multiplo || 1;
    const nueva = Math.max(step, item.cantidad + dir * step);
    updateQuantity(codigo, nueva);
    setItems([...getCart()]);
  }

  function eliminar(codigo: number) {
    removeFromCart(codigo);
    setItems([...getCart()]);
  }

  function vaciar() {
    clearCart();
    setItems([]);
  }

  function enviarPedido() {
    if (!items.length) return;
    const lineas = items
      .map(i => `• ${i.cantidad}x ${i.descripcion} — ${fmt(i.precioFinal * i.cantidad)}`)
      .join("\n");
    const msg = encodeURIComponent(
      `Hola! Quiero hacer el siguiente pedido:\n\n${lineas}\n\n*Total: ${fmt(totalPrecio)}*`
    );
    window.open(`https://wa.me/5493513000000?text=${msg}`, "_blank");
  }

  return (
    <div className="cart-app">
      {/* ── Header ── */}
      <header className="cart-header">
        <button className="cart-header__back" onClick={() => window.history.back()}>
          ← Volver
        </button>
        <h1 className="cart-header__title">Tu carrito</h1>
        {items.length > 0
          ? <button className="cart-header__vaciar" onClick={vaciar}>🗑 Vaciar</button>
          : <div />
        }
      </header>

      {/* ── Body ── */}
      <div className="cart-shell">

        {/* Columna izquierda */}
        <div className="cart-items-col">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">
                <img src="/img/247/bolsaCompras.png" alt="" style={{ width: 72, opacity: 0.25, filter: "grayscale(1)" }} />
              </div>
              <h2 className="cart-empty__title">Tu carrito está vacío</h2>
              <p className="cart-empty__sub">Agrega productos desde nuestros catálogos</p>
              <div className="cart-empty__btns">
                <a href="/247/todos"                     className="cart-empty__btn cart-empty__btn--solid">Ver Catálogo</a>
                <a href="/247/categoria/cigarrillos"     className="cart-empty__btn cart-empty__btn--outline">Ver Cigarrillos</a>
              </div>
            </div>
          ) : (
            <div className="cart-items">
              {items.map(item => (
                <div key={item.codigo} className="cart-item">
                  <div className="cart-item__img">📦</div>

                  <div className="cart-item__info">
                    <p className="cart-item__desc">{item.descripcion}</p>
                    {item.descuento > 0 && (
                      <span className="cart-item__badge">-{item.descuento}%</span>
                    )}
                    <p className="cart-item__unit">{fmt(item.precioFinal)} / unidad</p>
                  </div>

                  <div className="cart-item__right">
                    <div className="cart-item__ctrl">
                      <button onClick={() => cambiarCantidad(item.codigo, -1)}>−</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.codigo, +1)}>+</button>
                    </div>
                    <p className="cart-item__subtotal">{fmt(item.precioFinal * item.cantidad)}</p>
                    <button className="cart-item__del" onClick={() => eliminar(item.codigo)} aria-label="Eliminar">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha — resumen */}
        <aside className="cart-summary">
          <h2 className="cart-summary__title">Resumen del pedido</h2>

          <div className="cart-summary__row">
            <span>Productos (SKUs)</span>
            <strong>{totalSKUs}</strong>
          </div>
          <div className="cart-summary__row">
            <span>Unidades totales</span>
            <strong>{totalUnidades}</strong>
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__total-row">
            <span>Total</span>
            <strong className="cart-summary__total">{fmt(totalPrecio)}</strong>
          </div>

          <button
            className="cart-summary__btn"
            onClick={enviarPedido}
            disabled={items.length === 0}
          >
            {/* WhatsApp icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar pedido
          </button>
        </aside>
      </div>
    </div>
  );
}