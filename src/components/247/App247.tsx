// src/components/247/App247.tsx
import { useState, useDeferredValue, useEffect } from "react";
import Header247 from "./Header247";
import HomeSection from "./HomeSection";
import CategoriesSection from "./CategoriesSection";
import SearchResults from "./SearchResults";
import Footer247 from "./Footer247";
import { getCartCount } from "./hooks/cartStore";

export default function App247() {
  const [busqueda, setBusqueda] = useState("");
  const [cartCount, setCartCount] = useState(() => { try { return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]").reduce((s: number, i: any) => s + i.cantidad, 0); } catch { return 0; } });
  const deferredQ = useDeferredValue(busqueda);
  const buscando  = deferredQ.length >= 2;

  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const SECCIONES = [
    { id: "descuentos",  titulo: "Descuentos Exclusivos", filtro: { descuento: true },               verTodosHref: "/247/descuentos" },
    { id: "combos",      titulo: "Combos",                filtro: { combos: true },                  verTodosHref: "/247/combos" },
    { id: "todos",       titulo: "Todos los productos",   filtro: {},                                verTodosHref: "/247/todos" },
    { id: "cigarrillos", titulo: "Cigarrillos",           filtro: { familia: "Cigarrillos" },        verTodosHref: "/247/categoria/cigarrillos" },
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
              {SECCIONES.map(s => (
                <HomeSection key={s.id} titulo={s.titulo} filtro={s.filtro} verTodosHref={s.verTodosHref} />
              ))}
              <CategoriesSection />
            </div>
        }
      </div>
      <Footer247 />
    </div>
  );
}