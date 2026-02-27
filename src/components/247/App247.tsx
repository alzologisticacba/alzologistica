// src/components/247/App247.tsx
import { useState, useDeferredValue, useEffect } from "react";
import Header247 from "./Header247";
import HomeSection from "./HomeSection";
import CategoriesSection from "./CategoriesSection";
import SearchResults from "./SearchResults";
import { getCartCount } from "./hooks/cartStore";
import Footer247 from "./Footer247";
import BrandSection from "./BrandSection";
import { supabaseClient } from "../../lib/supabaseClient";

export default function App247() {
  const [busqueda, setBusqueda] = useState("");
  const [cartCount, setCartCount] = useState(() => { try { return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]").reduce((s: number, i: any) => s + i.cantidad, 0); } catch { return 0; } });
  const [familiasUltimoPedido, setFamiliasUltimoPedido] = useState<string[]>([]);
  const [familiasVistos, setFamiliasVistos] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [marcas, setMarcas]   = useState<{seccion: string; titulo: string}[]>([]);
  const deferredQ = useDeferredValue(busqueda);
  const buscando  = deferredQ.length >= 2;

  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", sync);

    // Leer familias del último pedido
    try {
      const pedidos = JSON.parse(localStorage.getItem("alzo_pedidos") ?? "[]");
      if (pedidos.length > 0) {
        const items = pedidos[0].items ?? [];
        const familias = [...new Set<string>(items.map((i: any) => i.familiaNombre).filter(Boolean))];
        if (familias.length > 0) {
          setFamiliasUltimoPedido(familias);
        } else if (items.length > 0) {
          // Fallback: si no hay familiaNombre, usar los rubros o marcar con codigos
          const codigos = items.map((i: any) => i.codigo).filter(Boolean);
          if (codigos.length > 0) setFamiliasUltimoPedido(["__codigos__:" + codigos.join(",")]);
        }
      }
    } catch {}

    // Leer la familia del último producto visto
    try {
      const ultimoVisto = localStorage.getItem("alzo_ultimo_visto");
      if (ultimoVisto) setFamiliasVistos([ultimoVisto]);
    } catch {}

    // Cargar marcas con secciones activas
    supabaseClient
      .from("articulos")
      .select("seccion")
      .gt("stock", 0)
      .not("seccion", "is", null)
      .neq("seccion", "")
      .then(({ data }) => {
        if (!data) return;
        const slugs = [...new Set(data.map((r: any) => r.seccion).filter(Boolean))] as string[];
        const todas = slugs.map(s => ({
          seccion: s,
          titulo: s.charAt(0).toUpperCase() + s.slice(1),
        }));
        // Shuffle Fisher-Yates para mostrar 3 random cada vez
        for (let i = todas.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [todas[i], todas[j]] = [todas[j], todas[i]];
        }
        setMarcas(todas);
      });

    setMounted(true);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  // 3 marcas random del total disponible
  const marcasRandom = marcas.slice(0, 3); // ya vienen shuffleadas al cargar

  return (
    <div className="app-247">
      <Header247
        showSearch={true}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onBusquedaClear={() => setBusqueda("")}
        cartCount={cartCount}
      />
      <div className="shell-247">
        {buscando
          ? <SearchResults q={deferredQ} />
          : <div className="home-sections">
              {mounted && <>
                {/* 1. Descuentos */}
                <HomeSection id="descuentos" titulo="Descuentos Exclusivos" filtro={{ descuento: true }} verTodosHref="/247/descuentos" />
                {/* 2. Inspirado en lo último que viste */}
                {familiasVistos.length > 0 && <HomeSection id="vistos" titulo="Inspirado en lo último que viste" filtro={{ familias: familiasVistos }} verTodosHref="/247/todos" />}
                {/* 3. Sección marca 1 */}
                {marcasRandom[0] && <BrandSection seccion={marcasRandom[0].seccion} titulo={marcasRandom[0].titulo} />}
                {/* 4. Combos */}
                <HomeSection id="combos" titulo="Combos" filtro={{ combos: true }} verTodosHref="/247/combos" />
                {/* 5. Según tu último pedido */}
                {familiasUltimoPedido.length > 0 && <HomeSection id="ultimo-pedido" titulo="Según tu último pedido" filtro={{ familias: familiasUltimoPedido, grid2x2: true }} verTodosHref="/247/todos" />}
                {/* 6. Sección marca 2 */}
                {marcasRandom[1] && <BrandSection seccion={marcasRandom[1].seccion} titulo={marcasRandom[1].titulo} />}
                {/* 7. Todos los productos */}
                <HomeSection id="todos" titulo="Todos los productos" filtro={{}} verTodosHref="/247/todos" />
                {/* 8. Sección marca 3 */}
                {marcasRandom[2] && <BrandSection seccion={marcasRandom[2].seccion} titulo={marcasRandom[2].titulo} />}
                {/* 9. Cigarrillos */}
                <HomeSection id="cigarrillos" titulo="Cigarrillos" filtro={{ familia: "Cigarrillos" }} verTodosHref="/247/categoria/cigarrillos" />
              </>}
              <CategoriesSection />
            </div>
        }
      </div>
      <Footer247 />
    </div>
  );
}