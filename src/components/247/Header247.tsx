// src/components/247/Header247.tsx



interface Header247Props {
  onCartClick?: () => void;
  cartCount?: number;
  busqueda?: string;
  onBusquedaChange?: (v: string) => void;
  onBusquedaClear?: () => void;
  showSearch?: boolean;
  showBack?: boolean;
}

export default function Header247({
  onCartClick,
  cartCount = 0,
  busqueda = "",
  onBusquedaChange,
  onBusquedaClear,
  showSearch = false,
  showBack = false,
}: Header247Props) {
  const headerClass = `header-247${showSearch ? " header-247--search" : ""}`;

  const CartBtn = () => (
    <button type="button" className="header-247__cart-btn" onClick={() => { onCartClick?.(); window.location.href = "/247/carrito"; }} aria-label="Ver carrito">
      <img src="/img/247/bolsaCompras.png" alt="Carrito" className="header-247__cart-icon" />
      {cartCount > 0 && <span className="header-247__cart-badge">{cartCount}</span>}
    </button>
  );

  return (
    <header className={headerClass}>

      {/* MODO NORMAL: izquierda | logo centro | carrito derecha */}
      {!showSearch && (
        <>
          <div className="header-247__left">
            {showBack && (
              <button className="header-247__back-btn" onClick={() => window.history.back()} aria-label="Volver">←</button>
            )}
          </div>
          <a href="/247" className="header-247__logo-link">
            <img src="/img/247/logoAlzo247.png" alt="Alzo 24/7" className="header-247__logo-img" />
          </a>
          <div className="header-247__right">
            <CartBtn />
          </div>
        </>
      )}

      {/* MODO HOME: logo | buscador expandido | carrito */}
      {showSearch && (
        <>
          <a href="/247" className="header-247__logo-link">
            <img src="/img/247/logoAlzo247.png" alt="Alzo 24/7" className="header-247__logo-img" />
          </a>
          <div className="header-247__search-wrap">
            <span className="header-247__search-icon">🔍</span>
            <input
              type="search"
              className="header-247__search-input"
              placeholder="Buscar productos, combos, y más..."
              value={busqueda}
              onChange={(e) => onBusquedaChange?.(e.target.value)}
            />
            {busqueda && (
              <button className="header-247__search-clear" onClick={onBusquedaClear}>✕</button>
            )}
          </div>
          <div className="header-247__right">
            <CartBtn />
          </div>
        </>
      )}

    </header>
  );
}