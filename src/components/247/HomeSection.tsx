// src/components/247/HomeSection.tsx
// Sección de la home: título + "ver todos" + fila horizontal de cards

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import ComboCard from "./ComboCard";

interface HomeSectionProps {
  titulo: string;
  endpoint: string;
  tipo: "articulo" | "combo";
  verTodosHref: string;
}

export default function HomeSection({ titulo, endpoint, tipo, verTodosHref }: HomeSectionProps) {
  const [data, setData]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vacio, setVacio]     = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(endpoint)
      .then(r => r.json())
      .then(json => {
        const items = json.data ?? [];
        setData(items);
        setVacio(items.length === 0);
      })
      .catch(() => setVacio(true))
      .finally(() => setLoading(false));
  }, [endpoint]);

  // No mostrar la sección si está vacía (ej: sin descuentos)
  if (!loading && vacio) return null;

  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2 className="home-section__titulo">{titulo}</h2>
        <a href={verTodosHref} className="home-section__ver-todos">ver todos →</a>
      </div>

      <div className="home-section__row">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="product-card product-card--skeleton home-section__card-skeleton" />
            ))
          : data.map((item, i) =>
              tipo === "combo"
                ? <ComboCard key={item.cod_combo ?? i} combo={item} />
                : <ProductCard key={item.codigo ?? i} articulo={item} compact />
            )
        }
      </div>
    </section>
  );
}