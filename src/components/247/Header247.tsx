// src/components/247/Header247.tsx
import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

function readCartCount(): number {
  try {
    return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]")
      .reduce((s: number, i: any) => s + i.cantidad, 0);
  } catch { return 0; }
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
  const [count, setCount]       = useState(0);
  const [familias, setFamilias] = useState<string[]>([]);
  const [ddOpen, setDdOpen]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ddRef                   = useRef<HTMLDivElement>(null);

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
    <header className="header-247-wrap">
      <div className="header-247-inner">

        {showSearch ? (
          <div className="header-247 header-247--search">
            <Logo />
            <div className="header-247__search-wrap">
              <span className="header-247__search-icon">🔍</span>
              <input
                type="search"
                className="header-247__search-input"
                placeholder="Buscar productos, combos, y más..."
                value={busqueda}
                onChange={e => onBusquedaChange?.(e.target.value)}
              />
              {busqueda && <button className="header-247__search-clear" onClick={onBusquedaClear}>✕</button>}
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
  );
}