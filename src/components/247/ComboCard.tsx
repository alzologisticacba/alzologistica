// src/components/247/ComboCard.tsx
import React, { useState } from "react";
import { useComboAgregar } from "./ComboSeleccionModal";

interface Combo {
  cod_combo: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
}

const IMG_BASE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";

function ComboImg({ cod_combo }: { cod_combo: string }) {
  const [error, setError] = React.useState(false);
  if (error) return <div className="product-card__img-placeholder">🎁</div>;
  return (
    <img
      src={`${IMG_BASE}/${cod_combo}.png`}
      alt=""
      className="combo-card__img"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

function formatPrecio(precio: number) {
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

export default function ComboCard({ combo }: { combo: Combo }) {
  const [btnState, setBtnState] = useState<"idle" | "ok">("idle");

  const { agregar, loading, modal } = useComboAgregar({
    onAdded: () => {
      setBtnState("ok");
      setTimeout(() => setBtnState("idle"), 1500);
    },
  });

  function handleAgregar(e: React.MouseEvent) {
    e.stopPropagation();
    agregar(combo);
  }

  return (
    <>
      <article
        className="product-card combo-card"
        onClick={() => window.location.href = `/247/combo/?cod_combo=${combo.cod_combo}`}
        style={{ cursor: "pointer" }}
      >
        <div className="product-card__img-wrap">
          <ComboImg cod_combo={combo.cod_combo} />
        </div>
        <div className="product-card__info">
          <p className="product-card__desc">{combo.nombre}</p>
          {combo.descripcion && <p className="product-card__rubro">{combo.descripcion}</p>}
          <p className="product-card__precio">{formatPrecio(combo.precio)}</p>
        </div>
        <button
          type="button"
          className={`product-card__btn${btnState === "ok" ? " product-card__btn--ok" : ""}`}
          onClick={handleAgregar}
          disabled={loading}
        >
          {loading ? "..." : btnState === "ok" ? "✓ Agregado" : "Agregar"}
        </button>
      </article>

      {modal}
    </>
  );
}
