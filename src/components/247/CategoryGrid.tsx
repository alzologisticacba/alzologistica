// src/components/247/CategoryGrid.tsx
// Las categorías vienen dinámicamente de familiaNombre en la BD

import { useFamilias } from "./hooks/useFamilias";
import CategoryCard from "./CategoryCard";

// Mapa opcional: familiaNombre → imagen local
// Ir completando a medida que tengas imágenes
const IMAGEN_POR_FAMILIA: Record<string, string> = {
  // "CIGARRILLOS": "/img/247/cigarrillos.jpg",
};

// Colores de fallback asignados por índice
const COLORES_FALLBACK = [
  "#1a2a4a", "#2a1a4a", "#1a3a2a", "#3a1a2a",
  "#1a3a3a", "#3a2a1a", "#2a3a1a", "#3a1a3a",
];

export default function CategoryGrid() {
  const { familias, loading, error } = useFamilias();

  if (loading) {
    return (
      <section className="category-section">
        <h2 className="category-section__title">Categorías</h2>
        <div className="category-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="category-card category-card--skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="category-section">
        <h2 className="category-section__title">Categorías</h2>
        <p style={{ color: "#fff", opacity: 0.7 }}>
          No se pudieron cargar las categorías.
        </p>
      </section>
    );
  }

  return (
    <section className="category-section">
      <h2 className="category-section__title">Categorías</h2>
      <div className="category-grid">
        {familias.map((familia, i) => {
          const id       = familia.toLowerCase().replace(/\s+/g, "-");
          const imageSrc = IMAGEN_POR_FAMILIA[familia.toUpperCase()];
          const color    = COLORES_FALLBACK[i % COLORES_FALLBACK.length];

          return (
            <CategoryCard
              key={id}
              id={id}
              label={familia}
              imageSrc={imageSrc}
              fallbackColor={color}
              href={`/247/categoria/${id}`}
            />
          );
        })}
      </div>
    </section>
  );
}