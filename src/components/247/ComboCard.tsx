// src/components/247/ComboCard.tsx
interface Combo {
  cod_combo: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
}

function formatPrecio(precio: number) {
  return precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

export default function ComboCard({ combo }: { combo: Combo }) {
  return (
    <article
      className="product-card combo-card"
      onClick={() => window.location.href = `/247/combo/${combo.cod_combo}`}
      style={{ cursor: "pointer" }}
    >
      <div className="product-card__img-wrap">
        {combo.imagen
          ? <img src={combo.imagen} alt={combo.nombre} className="combo-card__img" />
          : <div className="product-card__img-placeholder">🎁</div>
        }
      </div>
      <div className="product-card__info">
        <p className="product-card__desc">{combo.nombre}</p>
        {combo.descripcion && <p className="product-card__rubro">{combo.descripcion}</p>}
        <p className="product-card__precio">{formatPrecio(combo.precio)}</p>
      </div>
      <button
        type="button"
        className="product-card__btn"
        onClick={(e) => { e.stopPropagation(); }}
      >Agregar</button>
    </article>
  );
}