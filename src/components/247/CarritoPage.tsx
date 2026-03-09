// src/components/247/CarritoPage.tsx
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { getCart, clearCart, removeFromCart, updateQuantity } from "./hooks/cartStore";
import { supabaseClient as supabase } from "../../lib/supabaseClient";

export interface CartItem {
  codigo: number;
  cod_combo?: string;
  descripcion: string;
  precioFinal: number;
  cantidad: number;
  multiplo: number;
  descuento: number;
  tipo: "articulo" | "combo";
  rubro?: string;
  familiaNombre?: string;
}

type UserData = { nombre: string; telefono: string };
const LS_USER = "alzo_user_v1";

const SELLERS = [
  { id: "v18", nombre: "Vendedor 1", phone: "5493512260685", photo: "" },
];

const PHONE_GENERIC = "5493512260685";

function fmt(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function loadUser(): UserData | null {
  try {
    const r = JSON.parse(localStorage.getItem(LS_USER) ?? "null");
    if (r?.nombre && r?.telefono) return r;
    return null;
  } catch { return null; }
}

function saveUser(u: UserData) {
  localStorage.setItem(LS_USER, JSON.stringify(u));
}

function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

interface StepUserProps {
  onDone: (u: UserData) => void;
  onCancel: () => void;
}
function StepUser({ onDone, onCancel }: StepUserProps) {
  const [nombre, setNombre]     = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");

  async function continuar() {
    const n = nombre.trim();
    const t = telefono.replace(/\D/g, "");
    if (n.length < 2) { setErr("Ingresá un nombre válido."); return; }
    if (t.length < 8) { setErr("Ingresá un teléfono válido."); return; }
    setSaving(true);
    setErr("");
    try {
      await supabase.from("usuarios").insert({ nombre: n, numeroTelefono: t });
    } catch {}
    const u: UserData = { nombre: n, telefono: t };
    saveUser(u);
    onDone(u);
    setSaving(false);
  }

  return (
    <div className="alzomodal-form">
      <div className="alzomodal-form-header">
        <div className="alzomodal-form-icon">📋</div>
        <p className="alzomodal-form-desc">
          Tu número se usa únicamente para el seguimiento de tu pedido y te lo pediremos <span className="alzomodal-form-desc--highlight">SOLO UNA VEZ</span>
        </p>
      </div>
      {err && <div className="alzomodal-error">{err}</div>}
      <label className="alzomodal-label">
        Nombre
        <input className="alzomodal-input" value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej: Nicolás García" autoFocus />
      </label>
      <label className="alzomodal-label">
        Teléfono
        <input className="alzomodal-input" value={telefono}
          onChange={e => setTelefono(e.target.value)}
          placeholder="Ej: 351 555 5555" inputMode="tel" />
      </label>
      <div className="alzomodal-actions">
        <button className="alzomodal-btn alzomodal-btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="alzomodal-btn" onClick={continuar} disabled={saving}>
          {saving ? "Guardando..." : "Continuar →"}
        </button>
      </div>
      <p className="alzomodal-trust">🔒 Tu número no se comparte con nadie 🔒</p>
    </div>
  );
}

interface StepSellerProps {
  user: UserData;
  totalPrecio: number;
  cartMessage: string;
  onSend: (phone: string, introOverride?: string) => void;
}
function StepSeller({ user, totalPrecio, cartMessage, onSend }: StepSellerProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  function sendSpecial(tipo: "no-recuerda" | "sin-vendedor") {
    const intro = tipo === "no-recuerda"
      ? "Hola! Vengo de Alzo 24/7 y no recuerdo cual es mi vendedor, pero quiero realizar este pedido:"
      : "Hola! Vengo de Alzo 24/7 y no tengo vendedor, pero quisiera realizar este pedido:";
    onSend(PHONE_GENERIC, intro);
  }

  return (
    <div className="alzomodal-sellers">

      <div className="alzomodal-sellers__special">
        <button
          className="alzomodal-sellers__special-btn"
          onClick={() => sendSpecial("no-recuerda")}
        >
          🤔 No recuerdo cuál es mi vendedor
        </button>
        <button
          className="alzomodal-sellers__special-btn"
          onClick={() => sendSpecial("sin-vendedor")}
        >
          ➕ No tengo vendedor asignado
        </button>
      </div>

      <p className="alzomodal-sellers__label">Elegí tu vendedor</p>

      <div className="alzomodal-sellers__grid">
        {SELLERS.map(s => (
          <button key={s.id} className="alzomodal-seller-card"
            onClick={() => onSend(s.phone)}>
            <div className="alzomodal-seller-card__photo">
              {s.photo && !imgErrors[s.id]
                ? <img src={s.photo} alt={s.nombre}
                    onError={() => setImgErrors(p => ({ ...p, [s.id]: true }))} />
                : <span className="alzomodal-seller-card__initials">
                    {s.nombre.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </span>
              }
            </div>
            <div className="alzomodal-seller-card__info">
              <span className="alzomodal-seller-card__name">{s.nombre}</span>
              <WaIcon />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const IMG_BASE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";

function CartItemImg({ item }: { item: CartItem }) {
  const [error, setError] = React.useState(false);
  const imgKey = item.tipo === "combo" ? item.cod_combo : item.codigo;
  if (error || !imgKey) return <div className="cart-item__img">{item.tipo === "combo" ? "🎁" : "📦"}</div>;
  return (
    <img
      src={`${IMG_BASE}/${imgKey}.png`}
      alt=""
      className="cart-item__img cart-item__img--photo"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

const SHEETS_WEBHOOK = "https://script.google.com/macros/s/AKfycbwO9AAj5nj8vQKpEnYm30MgycWGXhdF-G4e6cn5xejlEzl8qQO1_eAgVJKhJOcJjsD7mQ/exec";

function generarNroSeguimiento(): string {
  const n = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `ALZ-${n}`;
}

export default function CarritoPage() {
  const [items, setItems]               = useState<CartItem[]>([]);
  const [modalOpen, setModalOpen]         = useState(false);
  const [confirmVaciar, setConfirmVaciar] = useState(false);
  const [step, setStep]                   = useState<"user" | "seller">("user");
  const [user, setUser]                   = useState<UserData | null>(null);
  const [tienePedidos, setTienePedidos]   = useState(false);

  useEffect(() => {
    setItems([...getCart()]);
    try {
      const p = JSON.parse(localStorage.getItem("alzo_pedidos") ?? "[]");
      setTienePedidos(Array.isArray(p) && p.length > 0);
    } catch {}
    const sync = () => setItems([...getCart()]);
    window.addEventListener("cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const MINIMO_PEDIDO = 30000;

  const totalSKUs     = items.length;
  const totalUnidades = useMemo(() => items.reduce((s, i) => s + i.cantidad, 0), [items]);
  const totalPrecio   = useMemo(() => items.reduce((s, i) => s + i.precioFinal * i.cantidad, 0), [items]);
  const faltaParaMinimo = Math.max(0, MINIMO_PEDIDO - totalPrecio);

  const cartMessage = useMemo(() => {
    if (!user) return "";
    const lineas = items
      .map(i => `• ${i.cantidad}x ${i.descripcion} — ${fmt(i.precioFinal * i.cantidad)}`)
      .join("\n");
    return `Hola! Soy *${user.nombre}* (${user.telefono}). Quiero hacer el siguiente pedido:\n\n${lineas}\n\n*Total: ${fmt(totalPrecio)}*`;
  }, [user, items, totalPrecio]);

  function cambiarCantidad(codigo: number, dir: 1 | -1) {
    const item = getCart().find(i => i.codigo === codigo);
    if (!item) return;
    const step = item.multiplo || 1;
    updateQuantity(codigo, Math.max(step, item.cantidad + dir * step));
    setItems([...getCart()]);
  }

  function eliminar(codigo: number) {
    removeFromCart(codigo);
    setItems([...getCart()]);
  }

  function vaciar() { clearCart(); setItems([]); setConfirmVaciar(false); }

  function openCheckout() {
    if (!items.length) return;
    if (faltaParaMinimo > 0) return;
    const saved = loadUser();
    if (saved) {
      setUser(saved);
      setStep("seller");
    } else {
      setUser(null);
      setStep("user");
    }
    setModalOpen(true);
  }

  function handleUserDone(u: UserData) {
    setUser(u);
    setStep("seller");
  }

  async function handleSend(phone: string, introOverride?: string) {
    const u = user ?? loadUser();
    if (!u) { setStep("user"); return; }

    const vendedorNombre = SELLERS.find(s => s.phone === phone)?.nombre ?? phone;
    const nroSeguimiento = generarNroSeguimiento();
    const lineasMsg = items.map(i => {
      const precioUnitario = fmt(i.precioFinal);
      const totalItem      = fmt(i.precioFinal * i.cantidad);
      const descLine       = i.descuento > 0 ? ` | Desc: -${i.descuento}%` : "";
      return `• [${i.codigo}] ${i.descripcion}\n  Cant: ${i.cantidad} | Precio: ${precioUnitario}${descLine} | Subtotal: ${totalItem}`;
    }).join("\n");
    const separadorMsg = "─".repeat(30);
    const intro = introOverride ?? `Hola soy *${u.nombre}*!\nHice este pedido por Alzo 24/7`;
    const msg = `${intro}\n\n${lineasMsg}\n\n${separadorMsg}\n*Total: ${fmt(totalPrecio)}*\nNumero de seguimiento: ${nroSeguimiento}`;

    const pedido = {
      nombre:          u.nombre,
      telefono:        u.telefono,
      vendedor:        vendedorNombre,
      nro_seguimiento: nroSeguimiento,
      items:           items.map(i => ({
        codigo:        i.codigo,
        descripcion:   i.descripcion,
        rubro:         i.rubro ?? "",
        familiaNombre: i.familiaNombre ?? "",
        cantidad:      i.cantidad,
        precioFinal:   i.precioFinal,
        descuento:     i.descuento,
      })),
      total: totalPrecio,
    };

    // 1. Guardar historial sincrónicamente ANTES de todo
    const pedidoConFecha = { ...pedido, created_at: new Date().toISOString() };
    try {
      const h = JSON.parse(localStorage.getItem("alzo_pedidos") ?? "[]");
      h.unshift(pedidoConFecha);
      localStorage.setItem("alzo_pedidos", JSON.stringify(h.slice(0, 20)));
    } catch {}

    // 2. Enviar a Google Sheets con sendBeacon
    try {
      const sheetPayload = {
        nro_seguimiento: nroSeguimiento,
        fecha:           new Date().toISOString(),
        cod_vendedor:    phone,
        vendedor_nombre: vendedorNombre,
        skus:            items.length,
        unidades:        items.reduce((s, i) => s + i.cantidad, 0),
        total:           totalPrecio,
        items: JSON.stringify(items.map(i => ({
          sku:      i.codigo,
          name:     i.descripcion,
          rubro:    i.rubro ?? "",
          familia:  i.familiaNombre ?? "",
          qty:      i.cantidad,
          price:    i.precioFinal,
          discount: i.descuento,
          subtotal: i.precioFinal * i.cantidad,
        }))),
      };
      const body = new URLSearchParams({ payload: JSON.stringify(sheetPayload) }).toString();
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/x-www-form-urlencoded;charset=UTF-8" });
        navigator.sendBeacon(SHEETS_WEBHOOK, blob);
      } else {
        fetch(SHEETS_WEBHOOK, {
          method:  "POST",
          mode:    "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body,
        }).catch(() => {});
      }
    } catch {}

    // 3. Supabase en background
    supabase.from("pedidos").insert(pedido).then(() => {}).catch(() => {});

    // 4. Navegar al final
    clearCart();
    setItems([]);
    setModalOpen(false);
    location.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="cart-app">
      <header className="cart-header">
        <a href="/247" className="cart-header__back">← Volver</a>
        <h1 className="cart-header__title">Tu carrito</h1>
        {items.length > 0
          ? <button className="cart-header__vaciar" onClick={() => setConfirmVaciar(true)}>🗑 Vaciar</button>
          : <div />}
      </header>

      <div className="cart-shell">
        <aside className="cart-summary">
          <h2 className="cart-summary__title">Resumen</h2>
          <div className="cart-summary__row"><span>Productos</span><strong>{totalSKUs} SKUs</strong></div>
          <div className="cart-summary__row"><span>Unidades</span><strong>{totalUnidades}</strong></div>
          <div className="cart-summary__divider" />
          <div className="cart-summary__total-row">
            <span>Total</span>
            <strong className="cart-summary__total">{fmt(totalPrecio)}</strong>
          </div>
          {faltaParaMinimo > 0 && items.length > 0 && (
            <div className="cart-summary__minimo">
              <span>Mínimo de pedido: {fmt(MINIMO_PEDIDO)}</span>
              <strong>Te faltan {fmt(faltaParaMinimo)}</strong>
            </div>
          )}
          <button className="cart-summary__btn" onClick={openCheckout} disabled={items.length === 0 || faltaParaMinimo > 0}>
            <WaIcon /> Enviar pedido
          </button>
        </aside>

        <div className="cart-items-col">
          {items.length === 0 ? (
            <div className="cart-empty">
              <img src="/img/247/bolsaCompras.png" alt=""
                style={{ width: 72, opacity: 0.22, filter: "grayscale(1)" }} />
              <h2 className="cart-empty__title">Tu carrito está vacío</h2>
              <p className="cart-empty__sub">Agrega productos desde nuestros catálogos</p>
              <div className="cart-empty__btns">
                <a href="/247" className="cart-empty__btn cart-empty__btn--solid">Volver al inicio</a>
                {tienePedidos && (
                  <a href="/247/pedidos" className="cart-empty__btn cart-empty__btn--ghost">Ver pedidos anteriores</a>
                )}
              </div>
            </div>
          ) : (
            <div className="cart-items">
              {items.map(item => (
                <div key={item.codigo} className="cart-item">
                  <CartItemImg item={item} />
                  <div className="cart-item__info">
                    <p className="cart-item__desc">{item.descripcion}</p>
                    <div className="cart-item__meta">
                      {item.descuento > 0 && <span className="cart-item__badge">-{item.descuento}%</span>}
                      <span className="cart-item__unit">{fmt(item.precioFinal)} / u</span>
                    </div>
                  </div>
                  <div className="cart-item__right">
                    <div className="cart-item__ctrl">
                      <button onClick={() => cambiarCantidad(item.codigo, -1)}>−</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.codigo, +1)}>+</button>
                    </div>
                    <p className="cart-item__subtotal">{fmt(item.precioFinal * item.cantidad)}</p>
                    <button className="cart-item__del" onClick={() => eliminar(item.codigo)} title="Eliminar">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmVaciar && (
        <>
          <div className="alzomodal-backdrop" onClick={() => setConfirmVaciar(false)} />
          <div className="alzomodal" role="dialog" aria-modal="true">
            <div className="alzomodal-card">
              <div className="alzomodal-head">
                <h3 className="alzomodal-title">¿Vaciar el carrito?</h3>
                <button className="alzomodal-close" onClick={() => setConfirmVaciar(false)}>✕</button>
              </div>
              <div className="alzomodal-body">
                <p style={{ marginBottom: "1.25rem", color: "var(--text-2, #555)" }}>
                  Se eliminarán todos los productos. Esta acción no se puede deshacer.
                </p>
                <div className="alzomodal-actions">
                  <button className="alzomodal-btn alzomodal-btn--ghost" onClick={() => setConfirmVaciar(false)}>Cancelar</button>
                  <button className="alzomodal-btn alzomodal-btn--danger" onClick={vaciar}>Sí, vaciar</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {modalOpen && (
        <>
          <div className="alzomodal-backdrop" onClick={() => setModalOpen(false)} />
          <div className="alzomodal" role="dialog" aria-modal="true">
            <div className={`alzomodal-card${step === "seller" ? " alzomodal-card--wide" : ""}`}>
              <div className="alzomodal-head">
                <div className="alzomodal-head-left">
                  <div>
                    {step === "user" && <p className="alzomodal-step-label">Paso 1 de 2</p>}
                    <h3 className="alzomodal-title">
                      {step === "user" ? "¿Quién hace el pedido?" : "¡Envia el pedido a tu vendedor!"}
                    </h3>
                  </div>
                </div>
                <button className="alzomodal-close" onClick={() => setModalOpen(false)}>✕</button>
              </div>

              <div className="alzomodal-cart-pill">
                🛒 {totalSKUs} producto{totalSKUs !== 1 ? "s" : ""} · {totalUnidades} unidades · <strong>{fmt(totalPrecio)}</strong>
              </div>
              {step === "seller" && (
                <p className="alzomodal-fiscal-hint">
                  Los precios pueden variar según corresponda
                </p>
              )}

              <div className="alzomodal-body">
                {step === "user"
                  ? <StepUser onDone={handleUserDone} onCancel={() => setModalOpen(false)} />
                  : <StepSeller
                      user={user!}
                      totalPrecio={totalPrecio}
                      cartMessage={cartMessage}
                      onSend={handleSend}
                    />
                }
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}