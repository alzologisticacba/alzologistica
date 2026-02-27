// src/components/247/CategoriesSection.tsx
import { useState, useEffect } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

// Íconos emoji por familia — agregá/modificá según tus familias reales
const FAMILIA_ICONS: Record<string, string> = {
  // Familias exactas de la BD
  "Almacen":           "🛒",
  "Bebidas":           "🥤",
  "Chocolates":        "🍫",
  "Cigarrillos":       "🚬",
  "Cuidado del Hogar": "🧹",
  "Cuidado Personal":  "🧴",
  "Golosinas":         "🍬",
  "Harinas":           "🌾",
  "Libreria":          "📚",
  "Varios":            "📦",
  // Extras por si agregan más
  "Bebidas con Alcohol": "🍺",
  "Snacks":            "🍿",
  "Lácteos":           "🥛",
  "Conservas":         "🥫",
  "Panadería":         "🍞",
  "Congelados":        "🧊",
  "Farmacia":          "💊",
  "Caramelos Masticables": "🍬",
  "Chicles":           "🫧",
  "Mascotas":          "🐾",
};

function getIcon(familia: string) {
  // Buscar coincidencia exacta primero, luego parcial
  if (FAMILIA_ICONS[familia]) return FAMILIA_ICONS[familia];
  const key = Object.keys(FAMILIA_ICONS).find(k =>
    familia.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(familia.toLowerCase())
  );
  return key ? FAMILIA_ICONS[key] : "📦";
}

function toSlug(f: string) {
  return f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}

// Paleta de colores que rota por categoría
const PALETA = [
  { bg: "#eef0ff", icon: "#3300ff" },
  { bg: "#fff0e6", icon: "#ff6b00" },
  { bg: "#e6f7ee", icon: "#00a650" },
  { bg: "#fff5e6", icon: "#f59e0b" },
  { bg: "#fce8f3", icon: "#d946a8" },
  { bg: "#e8f4fd", icon: "#0284c7" },
  { bg: "#f0fdf4", icon: "#16a34a" },
  { bg: "#fef9c3", icon: "#ca8a04" },
];

interface CatProps { brandBg?: string; brandText?: string; }

export default function CategoriesSection({ brandBg, brandText }: CatProps = {}) {
  const [familias, setFamilias] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabaseClient
      .from("articulos").select("familiaNombre").gt("stock", 0)
      .then(({ data }) => {
        const u = [...new Set((data ?? []).map((r: any) => r.familiaNombre as string))]
          .filter(Boolean).sort();
        setFamilias(u);
        setLoading(false);
      });
  }, []);

  const sectionStyle = brandBg ? { backgroundColor: brandBg } : {};
  const titleStyle   = brandText ? { color: brandText } : {};

  if (loading) return (
    <div className="cat-section" style={sectionStyle}>
      <div className="cat-section__head">
        <h2 className="cat-section__title" style={titleStyle}>Categorías</h2>
      </div>
      <div className="cat-section__grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="cat-section__card cat-section__card--skeleton" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="cat-section" style={sectionStyle}>
      <div className="cat-section__head">
        <h2 className="cat-section__title" style={titleStyle}>Categorías</h2>
        <a href="/247/todos" className="cat-section__ver-todas" style={brandText ? { color: brandText } : {}}>Ver todos los productos →</a>
      </div>

      <div className="cat-section__grid">
        {familias.map((f, i) => {
          const color = PALETA[i % PALETA.length];
          return (
            <a key={f} href={`/247/categoria/${toSlug(f)}`} className="cat-section__card">
              <div className="cat-section__card-icon" style={{ background: color.bg }}>
                <span style={{ fontSize: 28 }}>{getIcon(f)}</span>
              </div>
              <span className="cat-section__card-name">{f}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}