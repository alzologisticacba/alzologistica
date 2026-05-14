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

interface InitialSections {
  descuentos?:  any[];
  combos?:      any[];
  todos?:       any[];
  cigarrillos?: any[];
}

interface Props {
  initialSections?: InitialSections;
  initialFamilias?: string[];
}

export default function App247({ initialSections, initialFamilias }: Props = {}) {
  const [busqueda, setBusqueda] = useState("");
  const [cartCount, setCartCount] = useState(() => { try { return JSON.parse(localStorage.getItem("alzo_cart") ?? "[]").reduce((s: number, i: any) => s + i.cantidad, 0); } catch { return 0; } });
  const [familiasUltimoPedido, setFamiliasUltimoPedido] = useState<string[]>([]);
  const [familiasVistos, setFamiliasVistos] = useState<string[]>([]);
  const [familiasOpuestas, setFamiliasOpuestas] = useState<string[]>([]);
  const [marcas, setMarcas]   = useState<{seccion: string; titulo: string}[]>([]);
  const [mounted, setMounted] = useState(false);
  const deferredQ = useDeferredValue(busqueda);
  const buscando  = deferredQ.length >= 2;

  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", sync);

    try {
      const pedidos = JSON.parse(localStorage.getItem("alzo_pedidos") ?? "[]");
      if (pedidos.length > 0) {
        const items = pedidos[0].items ?? [];
        const familias = [...new Set<string>(items.map((i: any) => i.familiaNombre).filter(Boolean))];
        if (familias.length > 0) {
          setFamiliasUltimoPedido(familias);
        } else if (items.length > 0) {
          const codigos = items.map((i: any) => i.codigo).filter(Boolean);
          if (codigos.length > 0) setFamiliasUltimoPedido(["__codigos__:" + codigos.join(",")]);
        }
      }
    } catch {}

    try {
      const ultimoVisto = localStorage.getItem("alzo_ultimo_visto");
      if (ultimoVisto) {
        setFamiliasVistos([ultimoVisto]);
        const EXCLUIR = ["Cigarrillos", "Tabaco", "Tabacos", "Cigarros", "Cigarette"];
        supabaseClient
          .from("articulos")
          .select("familiaNombre")
          .gt("stock", 0)
          .not("familiaNombre", "is", null)
          .neq("familiaNombre", "")
          .neq("familiaNombre", ultimoVisto)
          .not("familiaNombre", "in", `(${EXCLUIR.join(",")})`)
          .then(({ data }) => {
            if (!data) return;
            const familias = [...new Set(data.map((r: any) => r.familiaNombre).filter(Boolean))] as string[];
            if (familias.length > 0) {
              const elegida = familias[Math.floor(Math.random() * familias.length)];
              setFamiliasOpuestas([elegida]);
            }
          });
      }
    } catch {}

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
        for (let i = todas.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [todas[i], todas[j]] = [todas[j], todas[i]];
        }
        setMarcas(todas);
      });

    setMounted(true);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const marcasRandom = marcas.slice(0, 3);

  return (
    <div className="app-247">
      <Header247
        showSearch={true}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onBusquedaClear={() => setBusqueda("")}
        cartCount={cartCount}
        initialFamilias={initialFamilias}
      />
      <div className="shell-247">
        {buscando
          ? <SearchResults q={deferredQ} />
          : <div className="home-sections">
              <div className="sr-only">
                <h1>Alzo 24/7 — Tu mayorista online en Córdoba</h1>
                <p>Golosinas, bebidas, almacén, cigarrillos y más · Sin registros · 24 horas</p>
              </div>

              {/* 1. Descuentos — pre-renderizado */}
              <HomeSection
                id="descuentos"
                titulo="Descuentos Exclusivos"
                filtro={{ descuento: true }}
                verTodosHref="/247/descuentos"
                banner="/img/247/secciones/descuentosExlusivosBanner.png"
                initialItems={initialSections?.descuentos}
              />

              {/* 2. Inspirado en lo último que viste — personalizado */}
              {mounted && familiasVistos.length > 0 && (
                <HomeSection
                  id="vistos"
                  titulo="Inspirado en lo último que viste"
                  filtro={{ familias: familiasVistos }}
                  verTodosHref={`/247/vistos/?familias=${encodeURIComponent(familiasVistos.join(","))}`}
                />
              )}

              {/* 3. Marca 1 — random */}
              {mounted && marcasRandom[0] && (
                <BrandSection seccion={marcasRandom[0].seccion} titulo={marcasRandom[0].titulo} />
              )}

              {/* 4. Te puede interesar — personalizado */}
              {mounted && familiasOpuestas.length > 0 && (
                <HomeSection
                  id="te-puede-interesar"
                  titulo="Te puede interesar"
                  filtro={{ familias: familiasOpuestas }}
                  verTodosHref={`/247/categoria/${familiasOpuestas[0].toLowerCase().replace(/\s+/g, "-")}`}
                />
              )}

              {/* 5. Combos — pre-renderizado */}
              <HomeSection
                id="combos"
                titulo="Combos"
                filtro={{ combos: true }}
                verTodosHref="/247/combos"
                banner="/img/247/secciones/combosBanner.png"
                initialItems={initialSections?.combos}
              />

              {/* 6. Según tu último pedido — personalizado */}
              {mounted && familiasUltimoPedido.length > 0 && (
                <HomeSection
                  id="ultimo-pedido"
                  titulo="Según tu último pedido"
                  filtro={{ familias: familiasUltimoPedido, grid2x2: true }}
                  verTodosHref={`/247/ultimo-pedido/?familias=${encodeURIComponent(familiasUltimoPedido.join(","))}`}
                />
              )}

              {/* 7. Marca 2 */}
              {mounted && marcasRandom[1] && (
                <BrandSection seccion={marcasRandom[1].seccion} titulo={marcasRandom[1].titulo} />
              )}

              {/* 8. Todos — pre-renderizado */}
              <HomeSection
                id="todos"
                titulo="Todos los productos"
                filtro={{}}
                verTodosHref="/247/todos"
                initialItems={initialSections?.todos}
              />

              {/* 9. Marca 3 */}
              {mounted && marcasRandom[2] && (
                <BrandSection seccion={marcasRandom[2].seccion} titulo={marcasRandom[2].titulo} />
              )}

              {/* 10. Banner canal de difusión */}
              <a
                href="https://whatsapp.com/channel/0029VbC00Vd3QxS30oAEN60G"
                target="_blank"
                rel="noopener noreferrer"
                className="home-canal-dif-banner"
              >
                <img src="/img/247/secciones/canalDeDifBanner.png" alt="Canal de difusión Alzo" />
              </a>

              {/* 11. Cigarrillos — pre-renderizado */}
              <HomeSection
                id="cigarrillos"
                titulo="Cigarrillos"
                filtro={{ familia: "Cigarrillos" }}
                verTodosHref="/247/categoria/cigarrillos"
                initialItems={initialSections?.cigarrillos}
              />

              <CategoriesSection initialFamilias={initialFamilias} />
            </div>
        }
      </div>
      <Footer247 />
    </div>
  );
}
