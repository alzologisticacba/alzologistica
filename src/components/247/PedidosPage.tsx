// src/components/247/PedidosPage.tsx
import { useState, useEffect } from "react";
import Header247 from "./Header247";
import PageFooterSection from "./PageFooterSection";
import { supabaseClient } from "../../lib/supabaseClient";
import { addToCart } from "./hooks/cartStore";

interface PedidoItem {
  codigo: number;
  cod_combo?: string;
  tipo?: string;
  descripcion: string;
  cantidad: number;
  precioFinal: number;
  descuento: number;
}

interface Pedido {
  id: string;
  created_at: string;
  vendedor: string;
  items: PedidoItem[];
  total: number;
}

function fmt(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function fmtFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const esCombo = (item: PedidoItem) =>
  item.tipo === "combo" || (item.tipo == null && item.codigo < 0);

function PedidoCard({ pedido }: { pedido: Pedido }) {
  const [open,     setOpen]     = useState(false);
  const [repetido, setRepetido] = useState(false);
  const [checking, setChecking] = useState(false);

  async function repetirPedido(e: React.MouseEvent) {
    e.stopPropagation();
    setChecking(true);

    const combos    = pedido.items.filter(esCombo);
    const articulos = pedido.items.filter(i => !esCombo(i));

    // Verificar stock solo de artículos
    let articulosConStock: PedidoItem[] = [];
    if (articulos.length > 0) {
      const { data } = await supabaseClient
        .from("articulos")
        .select("codigo, stock")
        .in("codigo", articulos.map(i => i.codigo))
        .gt("stock", 0);

      const codigosConStock = new Set((data ?? []).map((r: any) => r.codigo));
      articulosConStock = articulos.filter(i => codigosConStock.has(i.codigo));
    }

    // Agregar combos (siempre) + artículos con stock
    const aAgregar = [...combos, ...articulosConStock];
    aAgregar.forEach(item => addToCart({
      codigo:      item.codigo,
      cod_combo:   item.cod_combo,
      descripcion: item.descripcion,
      precioFinal: item.precioFinal,
      multiplo:    item.cantidad,
      descuento:   item.descuento,
      tipo:        esCombo(item) ? "combo" : "articulo",
    }));

    setRepetido(true);
    setChecking(false);
    setTimeout(() => { window.location.href = "/247/carrito"; }, 800);
  }

  return (
    <div className="pedido-card">
      <div className="pedido-card__header" onClick={() => setOpen(o => !o)}>
        <div className="pedido-card__header-left">
          <span className="pedido-card__fecha">{fmtFecha(pedido.created_at)}</span>
          <span className="pedido-card__vendedor">Vendedor: {pedido.vendedor}</span>
        </div>
        <div className="pedido-card__header-right">
          <span className="pedido-card__total">{fmt(pedido.total)}</span>
          <span className="pedido-card__toggle">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div className="pedido-card__items">
          {pedido.items.map((item, i) => (
            <div key={i} className="pedido-card__item">
              <div className="pedido-card__item-info">
                <span className="pedido-card__item-desc">{item.descripcion}</span>
                {item.descuento > 0 && <span className="pedido-card__item-badge">-{item.descuento}%</span>}
              </div>
              <div className="pedido-card__item-right">
                <span className="pedido-card__item-qty">{item.cantidad}x</span>
                <span className="pedido-card__item-precio">{fmt(item.precioFinal * item.cantidad)}</span>
              </div>
            </div>
          ))}
          <div className="pedido-card__footer">
            <span>{pedido.items.length} producto{pedido.items.length !== 1 ? "s" : ""}</span>
            <div className="pedido-card__footer-right">
              <strong>{fmt(pedido.total)}</strong>
              <button
                className={`pedido-card__repetir${repetido ? " pedido-card__repetir--ok" : ""}`}
                onClick={repetirPedido}
                disabled={checking || repetido}
              >
                {repetido ? "✓ Agregado" : checking ? "Verificando..." : "🔁 Repetir pedido"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre,  setNombre]  = useState<string>("");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("alzo_user_v1") ?? "null");
      if (u?.nombre) setNombre(u.nombre);

      const local = JSON.parse(localStorage.getItem("alzo_pedidos") ?? "[]");
      if (local.length > 0) {
        setPedidos(local);
        setLoading(false);
      }

      if (u?.telefono) {
        supabaseClient
          .from("pedidos")
          .select("id, created_at, vendedor, items, total")
          .eq("telefono", u.telefono)
          .order("created_at", { ascending: false })
          .limit(50)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const supaIds  = new Set(data.map((p: any) => p.created_at));
              const soloLocal = local.filter((p: any) => !supaIds.has(p.created_at));
              const merged = [...data, ...soloLocal]
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 50);
              setPedidos(merged as Pedido[]);
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <>
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        <div className="pedidos-page">

          <h1 className="pedidos-page__titulo">
            {nombre ? `¡Hola, ${nombre}!` : "Tus Pedidos"}
          </h1>
          {nombre && <p className="pedidos-page__subtitulo">Estos son tus pedidos anteriores</p>}

          {loading && (
            <div className="pedidos-page__loading">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="pedido-card pedido-card--skeleton" />
              ))}
            </div>
          )}

          {!loading && pedidos.length === 0 && (
            <div className="pedidos-page__empty">
              <div className="pedidos-page__empty-icon">🛍️</div>
              <p className="pedidos-page__empty-title">Aún no tenés pedidos</p>
              <p className="pedidos-page__empty-sub">Cuando realices un pedido vas a poder verlo acá</p>
              <a href="/247" className="pedidos-page__empty-btn">Ver productos</a>
            </div>
          )}

          {!loading && pedidos.length > 0 && (
            <div className="pedidos-page__lista">
              {pedidos.map(p => <PedidoCard key={p.id ?? p.created_at} pedido={p} />)}
            </div>
          )}

        </div>
      </div>
    </div>
    {!loading && <PageFooterSection />}
    </>
  );
}
