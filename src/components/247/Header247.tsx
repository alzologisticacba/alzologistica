// src/components/247/Header247.tsx
import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../lib/supabaseClient";
import SearchSuggestions from "./SearchSuggestions";

function readCartCount(): number {
  try {
    return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]")
      .reduce((s: number, i: any) => s + i.cantidad, 0);
  } catch { return 0; }
}

function readCartItems(): any[] {
  try { return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]"); }
  catch { return []; }
}

function fmtPrice(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  cartCount?: number;
  busqueda?: string;
  onBusquedaChange?: (v: string) => void;
  onBusquedaClear?: () => void;
  showSearch?: boolean;
  showBack?: boolean;
}

export default function Header247({
  cartCount: cartCountProp,
  busqueda = "",
  onBusquedaChange,
  onBusquedaClear,
  showSearch = false,
  showBack = false,
}: Props) {
  // Lazy init desde localStorage para evitar falso "0 → N" en la carga
  const [count, setCount]       = useState(readCartCount);
  const [familias, setFamilias] = useState<string[]>([]);
  const [ddOpen, setDdOpen]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ddRef                   = useRef<HTMLDivElement>(null);
  const [showSugg, setShowSugg] = useState(false);
  // Floating cart state
  const [fcVisible, setFcVisible]     = useState(false);
  const [fcDropping, setFcDropping]   = useState(false);
  const [fcBumping, setFcBumping]     = useState(false);
  const [fcModalOpen, setFcModalOpen] = useState(false);
  const [cartItems, setCartItems]     = useState<any[]>([]);
  const [headerVisible, setHeaderVisible] = useState(true);
  const prevCountRef  = useRef(-1); // -1 = no inicializado
  const hasDroppedRef = useRef(false);
  const headerRef     = useRef<HTMLElement>(null);

  useEffect(() => {
    setCount(cartCountProp ?? readCartCount());
    if (cartCountProp !== undefined) return;
    const sync = () => setCount(readCartCount());
    window.addEventListener("cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (cartCountProp !== undefined) setCount(cartCountProp);
  }, [cartCountProp]);

  // Lógica del floating cart
  useEffect(() => {
    if (prevCountRef.current === -1) {
      // Primera sincronización: solo mostrar/ocultar sin animar
      prevCountRef.current = count;
      setFcVisible(count > 0);
      return;
    }
    const prev = prevCountRef.current;
    prevCountRef.current = count;

    if (prev === 0 && count > 0) {
      // Carrito pasó de vacío a tener items
      setFcVisible(true);
      if (!hasDroppedRef.current) {
        hasDroppedRef.current = true;
        setFcDropping(true);
        const t = setTimeout(() => setFcDropping(false), 1000);
        return () => clearTimeout(t);
      }
    } else if (count === 0 && prev > 0) {
      // Carrito vaciado
      setFcVisible(false);
      setFcDropping(false);
      setFcBumping(false);
      hasDroppedRef.current = false; // reset para próxima vez
    } else if (count > prev && prev > 0) {
      // Se agregó otro item al carrito ya visible
      setFcBumping(true);
      const t = setTimeout(() => setFcBumping(false), 500);
      return () => clearTimeout(t);
    }
  }, [count]);

  // Observar visibilidad del header
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHeaderVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Cargar items cuando se abre el modal
  useEffect(() => {
    if (!fcModalOpen) return;
    setCartItems(readCartItems());
    const sync = () => setCartItems(readCartItems());
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, [fcModalOpen]);

  // Bloquear scroll cuando modal abierto
  useEffect(() => {
    if (fcModalOpen) document.body.style.overflow = "hidden";
    else if (!menuOpen) document.body.style.overflow = "";
  }, [fcModalOpen, menuOpen]);

  useEffect(() => {
    supabaseClient
      .from("articulos").select("familiaNombre").gt("stock", 0)
      .then(({ data }) => {
        const u = [...new Set((data ?? []).map((r: any) => r.familiaNombre as string))]
          .filter(Boolean).sort();
        setFamilias(u);
      });
  }, []);

  // Cerrar dropdown al clickear afuera
  useEffect(() => {
    if (!ddOpen) return;
    const fn = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ddOpen]);

  // Bloquear scroll del body cuando menú abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function toSlug(f: string) {
    return f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  }

  const Logo = () => (
    <a href="/247" className="header-247__logo-link">
      <img src="/img/247/logoAlzo247.png" alt="Alzo 24/7" className="header-247__logo-img" />
    </a>
  );

  const CartBtn = () => (
    <button className="header-247__cart-btn" onClick={() => { window.location.href = "/247/carrito"; }} aria-label="Carrito">
      <img src="/img/247/bolsaCompras.png" alt="" className="header-247__cart-icon" />
      {count > 0 && <span className="header-247__cart-badge">{count}</span>}
    </button>
  );

  return (
    <>
    {fcVisible && !headerVisible && (
      <button
        className={`floating-cart${fcDropping ? " floating-cart--drop" : ""}${fcBumping ? " floating-cart--bump" : ""}`}
        onClick={() => setFcModalOpen(true)}
        aria-label="Ver carrito"
      >
        <img src="/img/247/bolsaCompras.png" alt="" className="floating-cart__img" />
        <span className="floating-cart__badge">{count}</span>
      </button>
    )}

    {fcModalOpen && (
      <div className="fc-modal-overlay" onClick={() => setFcModalOpen(false)}>
        <div className="fc-modal" onClick={e => e.stopPropagation()}>
          <div className="fc-modal__head">
            <h2 className="fc-modal__title">Mi carrito</h2>
            <button className="fc-modal__close" onClick={() => setFcModalOpen(false)}>✕</button>
          </div>
          <div className="fc-modal__body">
            {cartItems.length === 0 ? (
              <p className="fc-modal__empty">Tu carrito está vacío</p>
            ) : (
              cartItems.map((item, i) => (
                <div key={i} className="fc-modal__item">
                  <div className="fc-modal__item-name">{item.descripcion ?? item.nombre}</div>
                  <span className="fc-modal__item-qty">x{item.cantidad}</span>
                  <span className="fc-modal__item-price">$ {fmtPrice(item.precioFinal * item.cantidad)}</span>
                </div>
              ))
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="fc-modal__footer">
              <div className="fc-modal__total">
                <span className="fc-modal__total-label">Total</span>
                <span className="fc-modal__total-amount">
                  $ {fmtPrice(cartItems.reduce((s, i) => s + i.precioFinal * i.cantidad, 0))}
                </span>
              </div>
              <button className="fc-modal__btn" onClick={() => { window.location.href = "/247/carrito"; }}>
                Finalizar pedido →
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    <header ref={headerRef} className="header-247-wrap">
      <div className="header-247-inner">

        {showSearch ? (
          <div className="header-247 header-247--search">
            <Logo />
            <div className="header-247__search-wrap" style={{ position: "relative" }}>
              <span className="header-247__search-icon">🔍</span>
              <input
                type="search"
                className="header-247__search-input"
                placeholder="Buscar productos, combos, y más..."
                value={busqueda}
                onChange={e => { onBusquedaChange?.(e.target.value); setShowSugg(true); }}
                onFocus={() => setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              />
              {busqueda && <button className="header-247__search-clear" onClick={() => { onBusquedaClear?.(); setShowSugg(false); }}>✕</button>}
              <SearchSuggestions
                query={busqueda}
                visible={showSugg}
                onSelect={v => { onBusquedaChange?.(v); setShowSugg(false); }}
                onClose={() => setShowSugg(false)}
              />
            </div>
            <CartBtn />
          </div>
        ) : (
          <div className="header-247 header-247--simple">
            <div className="header-247__left">
              {showBack && <button className="header-247__back-btn" onClick={() => window.history.back()}>←</button>}
            </div>
            <Logo />
            <div className="header-247__right"><CartBtn /></div>
          </div>
        )}

        {/* ── Navbar desktop ── */}
        <nav className="header-247-nav header-247-nav--desktop">
          <a href="/247" className="h247nav-btn">Inicio</a>
          <a href="/247/pedidos" className="h247nav-btn">Tus Pedidos</a>
          <div className="h247nav-dd" ref={ddRef}>
            <button className={`h247nav-btn${ddOpen ? " h247nav-btn--open" : ""}`} onClick={() => setDdOpen(o => !o)}>
              Categorías
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                style={{ transform: ddOpen ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {ddOpen && familias.length > 0 && (
              <div className="h247nav-dropdown">
                {familias.map(f => (
                  <a key={f} href={`/247/categoria/${toSlug(f)}`} className="h247nav-dropdown__item" onClick={() => setDdOpen(false)}>
                    {f}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="/247/descuentos" className="h247nav-btn">Descuentos</a>
          <a href="/247/combos"     className="h247nav-btn">Combos</a>
        </nav>

        {/* ── Hamburger mobile ── */}
        <button
          className="header-247-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menú"
        >
          <span className={`hamburger-bar${menuOpen ? " hamburger-bar--open" : ""}`} />
          <span className={`hamburger-bar${menuOpen ? " hamburger-bar--open" : ""}`} />
          <span className={`hamburger-bar${menuOpen ? " hamburger-bar--open" : ""}`} />
        </button>

      </div>

      {/* ── Menú mobile overlay ── */}
      {menuOpen && (
        <div className="h247-mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="h247-mobile-menu__panel" onClick={e => e.stopPropagation()}>
            <div className="h247-mobile-menu__head">
              <span className="h247-mobile-menu__title">Menú</span>
              <button className="h247-mobile-menu__close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <nav className="h247-mobile-menu__nav">
              <a href="/247"           className="h247-mobile-menu__link" onClick={() => setMenuOpen(false)}>🏠 Inicio</a>
              <a href="/247/pedidos"   className="h247-mobile-menu__link" onClick={() => setMenuOpen(false)}>📦 Tus Pedidos</a>
              <a href="/247/descuentos" className="h247-mobile-menu__link" onClick={() => setMenuOpen(false)}>🏷️ Descuentos</a>
              <a href="/247/combos"    className="h247-mobile-menu__link" onClick={() => setMenuOpen(false)}>🎁 Combos</a>
              <div className="h247-mobile-menu__separator">Categorías</div>
              {familias.map(f => (
                <a key={f} href={`/247/categoria/${toSlug(f)}`} className="h247-mobile-menu__link h247-mobile-menu__link--cat" onClick={() => setMenuOpen(false)}>
                  {f}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
    </>
  );
}