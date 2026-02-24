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
  // ⚠️ SIEMPRE 0 en SSR para evitar hydration mismatch
  const [count, setCount]       = useState(0);
  const [familias, setFamilias] = useState<string[]>([]);
  const [open, setOpen]         = useState(false);
  const ddRef                   = useRef<HTMLDivElement>(null);

  // Leer localStorage SOLO en cliente, después del mount
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

  // Cuando App247 actualiza cartCount desde afuera
  useEffect(() => {
    if (cartCountProp !== undefined) setCount(cartCountProp);
  }, [cartCountProp]);

  // Familias para el dropdown
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
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

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

        {/* Navbar */}
        <nav className="header-247-nav">
          <div className="h247nav-dd" ref={ddRef}>
            <button className={`h247nav-btn${open ? " h247nav-btn--open" : ""}`} onClick={() => setOpen(o => !o)}>
              Categorías
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {open && familias.length > 0 && (
              <div className="h247nav-dropdown">
                {familias.map(f => (
                  <a key={f} href={`/247/categoria/${toSlug(f)}`} className="h247nav-dropdown__item" onClick={() => setOpen(false)}>
                    {f}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="/247/descuentos" className="h247nav-btn">Descuentos</a>
          <a href="/247/combos"     className="h247nav-btn">Combos</a>
          <a href="/247/todos"      className="h247nav-btn">Todos</a>
        </nav>

      </div>
    </header>
  );
}