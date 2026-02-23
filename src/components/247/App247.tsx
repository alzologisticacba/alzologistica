// src/components/247/App247.tsx
import { useState, useDeferredValue, useEffect } from "react";
import Header247 from "./Header247";
import HomeSection from "./HomeSection";
import SearchResults from "./SearchResults";
import { getCartCount } from "./hooks/cartStore";

export default function App247() {
  const [busqueda, setBusqueda] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const deferredQ  = useDeferredValue(busqueda);
  const buscando   = deferredQ.length >= 2;

  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const SECCIONES = [
    { id: "descuentos",  titulo: "Descuentos Exclusivos", endpoint: "/api/descuentos?limit=10",                    tipo: "articulo" as const, verTodosHref: "/247/descuentos" },
    { id: "combos",      titulo: "Combos",                endpoint: "/api/combos?limit=10",                        tipo: "combo"    as const, verTodosHref: "/247/combos" },
    { id: "todos",       titulo: "Todos los productos",   endpoint: "/api/articulos?limit=10",                     tipo: "articulo" as const, verTodosHref: "/247/todos" },
    { id: "cigarrillos", titulo: "Cigarrillos",           endpoint: "/api/articulos?familia=Cigarrillos&limit=10", tipo: "articulo" as const, verTodosHref: "/247/categoria/cigarrillos" },
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
                <HomeSection key={s.id} titulo={s.titulo} endpoint={s.endpoint} tipo={s.tipo} verTodosHref={s.verTodosHref} />
              ))}
            </div>
        }
      </div>
    </div>
  );
}