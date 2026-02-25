// src/components/247/App247.tsx
import { useState, useDeferredValue, useEffect } from "react";
import Header247 from "./Header247";
import HomeSection from "./HomeSection";
import CategoriesSection from "./CategoriesSection";
import SearchResults from "./SearchResults";
import { getCartCount } from "./hooks/cartStore";
import Footer247 from "./Footer247";

export default function App247() {
  const [busqueda, setBusqueda] = useState("");
  const [cartCount, setCartCount] = useState(() => { try { return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]").reduce((s: number, i: any) => s + i.cantidad, 0); } catch { return 0; } });
  const [familiasUltimoPedido, setFamiliasUltimoPedido] = useState<string[]>([]);
  const [familiasVistos, setFamiliasVistos] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const deferredQ = useDeferredValue(busqueda);
  const buscando  = deferredQ.length >= 2;

  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", sync);

    // Leer familias del último pedido
    try {
      const pedidos = JSON.parse(localStorage.getItem("alzo_pedidos") ?? "[]");
      if (pedidos.length > 0) {
        const familias = [...new Set<string>(
          (pedidos[0].items ?? []).map((i: any) => i.familiaNombre).filter(Boolean)
        )];
        setFamiliasUltimoPedido(familias);
      }
    } catch {}

    // Leer la familia del último producto visto
    try {
      const ultimoVisto = localStorage.getItem("alzo_ultimo_visto");
      if (ultimoVisto) setFamiliasVistos([ultimoVisto]);
    } catch {}

    setMounted(true);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const SECCIONES = [
    { id: "descuentos",  titulo: "Descuentos Exclusivos",          filtro: { descuento: true },                                    verTodosHref: "/247/descuentos" },
    ...(familiasVistos.length > 0 ? [{
      id: "vistos",
      titulo: "Inspirado en lo último que viste",
      filtro: { familias: familiasVistos },
      verTodosHref: "/247/todos",
    }] : []),
    { id: "combos",      titulo: "Combos",                         filtro: { combos: true },                                      verTodosHref: "/247/combos" },
    ...(familiasUltimoPedido.length > 0 ? [{
      id: "ultimo-pedido",
      titulo: "Según tu último pedido",
      filtro: { familias: familiasUltimoPedido, grid2x2: true },
      verTodosHref: "/247/todos",
    }] : []),
    { id: "todos",       titulo: "Todos los productos",            filtro: {},                                                    verTodosHref: "/247/todos" },
    { id: "cigarrillos", titulo: "Cigarrillos",                    filtro: { familia: "Cigarrillos" },                           verTodosHref: "/247/categoria/cigarrillos" },
  ];

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
              {mounted && SECCIONES.map(s => (
                <HomeSection key={s.id} id={s.id} titulo={s.titulo} filtro={s.filtro} verTodosHref={s.verTodosHref} />
              ))}
              <CategoriesSection />
            </div>
        }
      </div>
      <Footer247 />
    </div>
  );
}