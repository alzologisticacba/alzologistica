// src/components/247/CarritoPage.tsx
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { getCart, clearCart, removeFromCart, updateQuantity } from "./hooks/cartStore";
import { supabaseClient as supabase } from "../../lib/supabaseClient";

export interface CartItem {
  codigo: number;
  descripcion: string;
  precioFinal: number;
  cantidad: number;
  multiplo: number;
  descuento: number;
  tipo: "articulo" | "combo";
}

type UserData = { nombre: string; telefono: string };
const LS_USER = "alzo_user_v1";

const SELLERS = [
  { id: "v3",  nombre: "Federico Torres",  phone: "5493518561081", photo: "/img/vendedores/Federico Torres.webp" },
  { id: "v4",  nombre: "Nicolas Tabera",   phone: "5493515138800", photo: "/img/vendedores/Nicolas Tavera.webp" },
  { id: "v5",  nombre: "Claudio Tevez",    phone: "5493517680109", photo: "/img/vendedores/Claudio Tevez.webp" },
  { id: "v6",  nombre: "Gustavo Martinez", phone: "5493518561704", photo: "/img/vendedores/Gustavo Martinez.webp" },
  { id: "v7",  nombre: "Joel Sanrame",     phone: "5493516316971", photo: "/img/vendedores/Joel Sanrame.webp" },
  { id: "v8",  nombre: "Nicolas Escobar",  phone: "5493515303045", photo: "/img/vendedores/Nicolas Escobar.webp" },
  { id: "v9",  nombre: "Nicolas Ossman",   phone: "5493517024074", photo: "/img/vendedores/Nicolas Ossman.webp" },
  { id: "v10", nombre: "Matias Dominguez", phone: "5493518559471", photo: "/img/vendedores/Matias Dominguez.png" },
  { id: "v11", nombre: "Franco Cofre",     phone: "5493513276820", photo: "/img/vendedores/Franco Cofre.png" },
  { id: "v12", nombre: "Daniel Rodriguez", phone: "5493518559685", photo: "/img/vendedores/Daniel Rodriguez.webp" },
  { id: "v13", nombre: "Eliana Machado",   phone: "5493518560195", photo: "/img/vendedores/Eliana Machado.webp" },
  { id: "v14", nombre: "Fernando Castro",  phone: "5493517680109", photo: "/img/vendedores/Fernando Castro.webp" },
  { id: "v15", nombre: "German Maidana",   phone: "5493518560368", photo: "/img/vendedores/German Maidana.webp" },
  { id: "v16", nombre: "Andres Mazzia",    phone: "5493518560488", photo: "/img/vendedores/Andres Mazzia.png" },
  { id: "v17", nombre: "Lucas Gomez",      phone: "5493518560586", photo: "/img/vendedores/Lucas Gomez.webp" },
  { id: "v18", nombre: "Prueba",      phone: "5493512260685", photo: "" },
];

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

// ── Sub-componentes del modal ──────────────────────────────────────────────

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
    if (n.length < 2)   { setErr("Ingresá un nombre válido."); return; }
    if (t.length < 8)   { setErr("Ingresá un teléfono válido."); return; }
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
        <div className="alzomodal-form-icon">👤</div>
        <p className="alzomodal-form-desc">Necesitamos tus datos una sola vez para identificar tu pedido.</p>
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

      <p className="alzomodal-hint">🔒 Solo lo usamos para identificar tu pedido. No lo compartimos.</p>
    </div>
  );
}

interface StepSellerProps {
  user: UserData;
  totalPrecio: number;
  cartMessage: string;
  onSend: (phone: string) => void;
}
function StepSeller({ user, totalPrecio, cartMessage, onSend }: StepSellerProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="alzomodal-sellers">


      <p className="alzomodal-sellers__label">Elegí tu vendedor</p>

      <div className="alzomodal-sellers__grid">
        {SELLERS.map(s => (
          <button key={s.id} className="alzomodal-seller-card"
            onClick={() => onSend(s.phone)}>
            <div className="alzomodal-seller-card__photo">
              {!imgErrors[s.id]
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

// ── Componente principal ───────────────────────────────────────────────────


const IMG_BASE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";

function CartItemImg({ codigo }: { codigo: number }) {
  const [error, setError] = React.useState(false);
  if (error) return <div className="cart-item__img">📦</div>;
  return (
    <img
      src={`${IMG_BASE}/${codigo}.png`}
      alt=""
      className="cart-item__img cart-item__img--photo"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

export default function CarritoPage() {
  const [items, setItems]         = useState<CartItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep]           = useState<"user" | "seller">("user");
  const [user, setUser]           = useState<UserData | null>(null);
  const [tienePedidos, setTienePedidos] = useState(false);

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

  const totalSKUs     = items.length;
  const totalUnidades = useMemo(() => items.reduce((s, i) => s + i.cantidad, 0), [items]);
  const totalPrecio   = useMemo(() => items.reduce((s, i) => s + i.precioFinal * i.cantidad, 0), [items]);

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

  function vaciar() { clearCart(); setItems([]); }

  function openCheckout() {
    if (!items.length) return;
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

  async function handleSend(phone: string) {
    const u = user ?? loadUser();
    if (!u) { setStep("user"); return; }

    const vendedorNombre = SELLERS.find(s => s.phone === phone)?.nombre ?? phone;
    const msg = `Hola! Soy *${u.nombre}* (${u.telefono}). Quiero hacer el siguiente pedido:\n\n${items.map(i => `• ${i.cantidad}x ${i.descripcion} — ${fmt(i.precioFinal * i.cantidad)}`).join("\n")}\n\n*Total: ${fmt(totalPrecio)}*`;

    const pedido = {
      nombre:   u.nombre,
      telefono: u.telefono,
      vendedor: vendedorNombre,
      items:    items.map(i => ({ codigo: i.codigo, descripcion: i.descripcion, cantidad: i.cantidad, precioFinal: i.precioFinal, descuento: i.descuento })),
      total:    totalPrecio,
    };

    try { await supabase.from("pedidos").insert(pedido); } catch {}

    try {
      const h = JSON.parse(localStorage.getItem("alzo_pedidos") ?? "[]");
      h.unshift({ ...pedido, created_at: new Date().toISOString() });
      localStorage.setItem("alzo_pedidos", JSON.stringify(h.slice(0, 20)));
      setTienePedidos(true);
    } catch {}

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    clearCart();
    setItems([]);
    setModalOpen(false);
  }

  return (
    <div className="cart-app">
      {/* Header */}
      <header className="cart-header">
        <a href="/247" className="cart-header__back">← Volver</a>
        <h1 className="cart-header__title">Tu carrito</h1>
        {items.length > 0
          ? <button className="cart-header__vaciar" onClick={vaciar}>🗑 Vaciar</button>
          : <div />}
      </header>

      <div className="cart-shell">
        {/* Items */}
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
                  <CartItemImg codigo={item.codigo} />
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

        {/* Resumen */}
        <aside className="cart-summary">
          <h2 className="cart-summary__title">Resumen</h2>
          <div className="cart-summary__row"><span>Productos</span><strong>{totalSKUs} SKUs</strong></div>
          <div className="cart-summary__row"><span>Unidades</span><strong>{totalUnidades}</strong></div>
          <div className="cart-summary__divider" />
          <div className="cart-summary__total-row">
            <span>Total</span>
            <strong className="cart-summary__total">{fmt(totalPrecio)}</strong>
          </div>
          <button className="cart-summary__btn" onClick={openCheckout} disabled={items.length === 0}>
            <WaIcon /> Enviar pedido
          </button>
        </aside>
      </div>

      {/* Modal */}
      {modalOpen && (
        <>
          <div className="alzomodal-backdrop" onClick={() => setModalOpen(false)} />
          <div className="alzomodal" role="dialog" aria-modal="true">
            <div className={`alzomodal-card${step === "seller" ? " alzomodal-card--wide" : ""}`}>
              
              {/* Header del modal */}
              <div className="alzomodal-head">
                <div className="alzomodal-head-left">
  
                  <div>
                    {step === "user" && (
                    <p className="alzomodal-step-label">Paso 1 de 2</p>
                  )}
                    <h3 className="alzomodal-title">
                      {step === "user" ? "¿Quién hace el pedido?" : "¿Con quién hablás?"}
                    </h3>
                  </div>
                </div>
                <button className="alzomodal-close" onClick={() => setModalOpen(false)}>✕</button>
              </div>

              {/* Resumen mini del carrito */}
              <div className="alzomodal-cart-pill">
                🛒 {totalSKUs} producto{totalSKUs !== 1 ? "s" : ""} · {totalUnidades} unidades · <strong>{fmt(totalPrecio)}</strong>
              </div>

              {/* Contenido por paso */}
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