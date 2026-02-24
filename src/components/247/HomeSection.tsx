// src/components/247/HomeSection.tsx
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import ComboCard from "./ComboCard";
import { supabaseClient } from "../../lib/supabaseClient";

interface Filtro {
  familia?: string;
  descuento?: boolean;
  combos?: boolean;
}

interface Props {
  titulo: string;
  filtro: Filtro;
  verTodosHref: string;
}

export default function HomeSection({ titulo, filtro, verTodosHref }: Props) {
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (filtro.combos) {
          const { data } = await supabaseClient
            .from("combos")
            .select("cod_combo, nombre, precio, descripcion, imagen")
            .eq("activo", true)
            .limit(10);
          setItems(data ?? []);
        } else {
          let query = supabaseClient
            .from("articulos")
            .select("codigo, descripcion, rubro, precioFinal, descuento, multiplo, familiaNombre, stock")
            .gt("stock", 0)
            .order("orden", { ascending: true })
            .limit(10);

          if (filtro.familia)   query = query.ilike("familiaNombre", filtro.familia);
          if (filtro.descuento) query = query.gt("descuento", 0).order("descuento", { ascending: false });

          const { data } = await query;
          setItems(data ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2 className="home-section__titulo">{titulo}</h2>
        <a href={verTodosHref} className="home-section__ver-todos">ver todos →</a>
      </div>
      <div className="home-section__row">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)
          : filtro.combos
            ? items.map(c => <ComboCard key={c.cod_combo} combo={c} />)
            : items.map(a => <ProductCard key={a.codigo} articulo={a} />)
        }
      </div>
    </section>
  );
}