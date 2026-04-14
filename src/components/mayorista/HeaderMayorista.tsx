// src/components/mayorista/HeaderMayorista.tsx
import { useState } from "react";

interface Props {
  usuario?: string;
  onLogout?: () => void;
  seccion: string;
  onSeccion: (s: string) => void;
}

export default function HeaderMayorista({ usuario, onLogout, seccion, onSeccion }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  function ir(s: string) {
    onSeccion(s);
    setMenuOpen(false);
  }

  return (
    <>
      <header className="may-header">
        <div className="may-header__inner">
          <span className="may-header__title">Portal Mayorista</span>
          <img src="/img/alzo_logo.png" alt="Alzo" className="may-header__logo-img" />
          <button
            className={`may-header__burger${menuOpen ? " may-header__burger--open" : ""}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menú"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Menú desplegable */}
      {menuOpen && (
        <div className="may-menu">
          <div className="may-menu__backdrop" onClick={() => setMenuOpen(false)} />
          <div className="may-menu__panel">
            {usuario && <div className="may-menu__user">{usuario}</div>}

            <button
              className={`may-menu__item${seccion === "presupuesto" ? " may-menu__item--active" : ""}`}
              onClick={() => ir("presupuesto")}
            >
              <span className="may-menu__item-icon">📋</span>
              Presupuesto
            </button>
            <button
              className={`may-menu__item${seccion === "uxb" ? " may-menu__item--active" : ""}`}
              onClick={() => ir("uxb")}
            >
              <span className="may-menu__item-icon">🔢</span>
              Consultar UxB
            </button>
            <button
              className={`may-menu__item${seccion === "imagenes" ? " may-menu__item--active" : ""}`}
              onClick={() => ir("imagenes")}
            >
              <span className="may-menu__item-icon">🖼️</span>
              Ver Imágenes de prod
            </button>
            <button
              className={`may-menu__item${seccion === "mapa" ? " may-menu__item--active" : ""}`}
              onClick={() => ir("mapa")}
            >
              <span className="may-menu__item-icon">📍</span>
              Mapa de visitas
            </button>

            <div className="may-menu__divider" />

            <button className="may-menu__item may-menu__item--logout" onClick={() => { onLogout?.(); setMenuOpen(false); }}>
              <span className="may-menu__item-icon">🚪</span>
              Salir
            </button>
          </div>
        </div>
      )}
    </>
  );
}
