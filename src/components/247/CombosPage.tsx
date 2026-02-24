// src/components/247/CombosPage.tsx
import { useState, useEffect, useDeferredValue } from "react";
import Header247 from "./Header247";
import ComboCard from "./ComboCard";
import PageFooterSection from "./PageFooterSection";
import { supabaseClient } from "../../lib/supabaseClient";

interface Combo {
  cod_combo: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
}

export default function CombosPage() {
  const [combos, setCombos]     = useState<Combo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const deferredQ               = useDeferredValue(busqueda);

  useEffect(() => {
    supabaseClient
      .from("combos")
      .select("cod_combo, nombre, precio, descripcion, imagen")
      .eq("activo", true)
      .order("nombre", { ascending: true })
      .limit(100)
      .then(({ data }) => setCombos(data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = deferredQ
    ? combos.filter(c => c.nombre.toLowerCase().includes(deferredQ.toLowerCase()))
    : combos;

  return (
    <>
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        <h1 className="cat-page__titulo">Combos</h1>

        <div className="cat-page__search-wrap">
          <span className="cat-page__search-icon">🔍</span>
          <input
            type="search"
            className="cat-page__search"
            placeholder="Buscar combo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && <button className="cat-page__search-clear" onClick={() => setBusqueda("")}>✕</button>}
        </div>

        {loading && (
          <div className="product-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="product-card product-card--skeleton" />)}
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <p className="cat-page__msg">No hay combos disponibles.</p>
        )}

        {!loading && filtrados.length > 0 && (
          <>
            <p className="cat-page__count">{filtrados.length} combos</p>
            <div className="product-grid">
              {filtrados.map(c => <ComboCard key={c.cod_combo} combo={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
    {!loading && <PageFooterSection />}
  </>
  );
}