// src/components/mayorista/PresupuestoMayorista.tsx
import { useState, useEffect, useRef } from "react";
import { supabaseClient } from "../../lib/supabaseClient";
import ExportarPresupuesto from "./ExportarPresupuesto";

interface ArticuloMayorista {
  "Cod. Art": number;
  Descripcion: string;
  Proveedor: string;
  Rubro: string;
  Linea: string;
  "Costo Neto": number;
  "Costo Final": number;
  "Precio Vta Minimo": number;
  "Precio Vta Maximo": number;
  "Precio Vta Final": number;
  "Reco.": number;
  "Tope Dto": number;
  // aliases en minúsculas (según como guarda PG)
  descripcion?: string;
  proveedor?: string;
}

interface LineaPresupuesto {
  id: number;
  codArt: number;
  descripcion: string;
  costoFinal: number;
  cantidad: number;
  precio: number;
  descuento: number;
  subtotal: number;
  rentabilidad: number;
}

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Buscador de producto ─────────────────────────────────
function BuscadorProducto({
  onSelect,
  onClear,
}: {
  onSelect: (a: ArticuloMayorista) => void;
  onClear?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ArticuloMayorista[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState<ArticuloMayorista | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stockCodes = useRef<number[]>([]);
  const [stockLoaded, setStockLoaded] = useState(false);

  // Carga códigos con stock al montar
  useEffect(() => {
    async function fetchStock() {
      const { data, error } = await supabaseClient
        .from("stocks")
        .select("codigo")
        .gt("stock", 0);
      if (error) {
        console.error("Error cargando stocks:", error);
      }
      const codes = (data ?? []).map((s: any) => s.codigo);
      console.log(`Stocks cargados: ${codes.length} artículos con stock`);
      stockCodes.current = codes;
      setStockLoaded(true);
    }
    fetchStock();
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResultados([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const q = query.trim();
      function dedup(items: any[]): ArticuloMayorista[] {
        const seen = new Set<number | string>();
        return items.filter(item => {
          const cod = item["Cod. Art"] ?? item["cod. art"];
          if (seen.has(cod)) return false;
          seen.add(cod);
          return true;
        });
      }

      const isNum = /^\d+$/.test(q);

      // Paso 1: texto + lookup de códigos en articulos (todo en paralelo)
      const [textRes, articulosCodeRes] = await Promise.all([
        supabaseClient
          .from("articulos_mayorista")
          .select("*")
          .or(`Descripcion.ilike.%${q}%,Proveedor.ilike.%${q}%`)
          .limit(20),
        isNum
          ? supabaseClient
              .from("articulos")
              .select("codigo")
              .filter("codigo_str", "ilike", `%${q}%`)
              .limit(10)
          : Promise.resolve({ data: [] as any[], error: null }),
      ]);

      // Paso 2: con los códigos encontrados, buscar en articulos_mayorista
      const matchingCodes: number[] = (articulosCodeRes.data ?? []).map((a: any) => a.codigo);
      let codeData: any[] = [];
      if (matchingCodes.length > 0) {
        const orFilter = matchingCodes.map(c => `"Cod. Art".eq.${c}`).join(",");
        const { data } = await supabaseClient
          .from("articulos_mayorista")
          .select("*")
          .or(orFilter)
          .limit(10);
        codeData = data ?? [];
      }

      // Código primero, luego texto
      let merged = [...codeData, ...(textRes.data ?? [])];

      // Filtro de stock client-side — solo si ya cargaron
      const codes = stockCodes.current;
      if (codes.length > 0) {
        const codesSet = new Set(codes);
        merged = merged.filter((item: any) => {
          const cod = item["Cod. Art"] ?? item["cod. art"];
          return codesSet.has(cod);
        });
      }

      setResultados(dedup(merged).slice(0, 10));
      setOpen(true);
      setLoading(false);
    }, 150);
  }, [query]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  function handleSelect(a: ArticuloMayorista) {
    setSeleccionado(a);
    setQuery("");
    setOpen(false);
    setResultados([]);
    onSelect(a);
  }

  function handleClear() {
    setSeleccionado(null);
    setQuery("");
    setResultados([]);
    onClear?.();
  }

  // ── Chip de producto seleccionado ──
  if (seleccionado) {
    return (
      <div className="may-selected-chip">
        <span className="may-selected-chip__cod">
          {seleccionado["Cod. Art"]}
        </span>
        <span className="may-selected-chip__name">
          {seleccionado.Descripcion ?? seleccionado.descripcion}
        </span>
        <button className="may-selected-chip__clear" onClick={handleClear}>✕</button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="may-buscador-wrap">
      <div className="may-buscador-input-wrap">
        <span className="may-buscador-icon">🔍</span>
        <input
          type="text"
          className="may-buscador-input"
          placeholder="Buscar por código, descripción o proveedor..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => resultados.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button className="may-buscador-clear" onClick={() => setQuery("")}>✕</button>
        )}
      </div>

      {open && (
        <div className="may-buscador-dropdown">
          {loading && <div className="may-buscador-empty">Buscando…</div>}
          {!loading && resultados.length === 0 && (
            <div className="may-buscador-empty">Sin resultados para "{query}"</div>
          )}
          {resultados.map((a: any) => (
            <button
              key={a["Cod. Art"] ?? a["cod. art"]}
              className="may-buscador-item"
              onMouseDown={e => { e.preventDefault(); handleSelect(a); }}
            >
              <span className="may-buscador-item__name">{a.Descripcion ?? a.descripcion}</span>
              <span className="may-buscador-item__meta">
                <span className="may-buscador-item__cod">#{a["Cod. Art"] ?? a["cod. art"]}</span>
                {(a["Precio Vta Final"] ?? a["precio vta final"]) > 0 && (
                  <span className="may-buscador-item__price">
                    $ {(a["Precio Vta Final"] ?? a["precio vta final"]).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Presupuesto principal ────────────────────────────────
export default function PresupuestoMayorista() {
  const [articulo, setArticulo]   = useState<ArticuloMayorista | null>(null);
  const [cantidad, setCantidad]   = useState<string>("");
  const [descuento, setDescuento] = useState<string>("");
  const [precio, setPrecio]       = useState<string>("");
  const [precioBase, setPrecioBase] = useState<number>(0);
  const [multiplo, setMultiplo]   = useState<number>(0);
  const [uxbValue, setUxbValue]   = useState<number | null>(null);
  const [lineas, setLineas]       = useState<LineaPresupuesto[]>([]);
  const [buscadorKey, setBuscadorKey] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const [pactada, setPactada]           = useState(false);
  const nextId = useRef(1);

  const cant    = parseFloat(cantidad)  || 0;
  const desc    = parseFloat(descuento) || 0;
  const prec    = parseFloat(precio)    || 0;
  const costoFinal   = articulo?.["Costo Final"] ?? 0;
  const topeDto      = articulo?.["Tope Dto"] ?? 100;
  const descEfectivo = desc;

  // precio ya tiene el descuento aplicado (readonly calculado desde precioBase)
  const subtotal = prec * cant;

  // Totales acumulados del presupuesto
  const totalPedidoBase = lineas.reduce((s, l) => s + l.subtotal, 0);
  const totalCosto      = lineas.reduce((s, l) => s + l.costoFinal * l.cantidad, 0);

  // Total mostrado al cliente: pactada divide por 1.105 (precio neto sin IVA)
  const totalPedido = pactada ? totalPedidoBase / 1.105 : totalPedidoBase;

  // Profit proyectado: con pactada aplica fórmula ((precio/1.105) - costo) / (precio/1.105)
  const projBaseTotal       = totalPedidoBase + prec * cant;
  const projParaProfit      = pactada ? projBaseTotal / 1.105 : projBaseTotal;
  const projTotalCosto      = totalCosto + costoFinal * cant;
  const rentabilidad        = projParaProfit > 0
    ? ((projParaProfit - projTotalCosto) / projParaProfit) * 100
    : 0;

  // Color de rentabilidad
  function rentColor(r: number) {
    if (r >= 18) return "#22c55e";
    if (r >= 13) return "#f59e0b";
    return "#ef4444";
  }

  function handleDescuento(val: string) {
    setDescuento(val);
    if (precioBase <= 0) return;
    const d = parseFloat(val) || 0;
    setPrecio((precioBase * (1 - d / 100)).toFixed(2));
  }

  const descExcedeTope = articulo && desc > topeDto && desc > 0;
  const cantInvalida    = multiplo > 1 && cant > 0 && cant % multiplo !== 0;

  function handleCargar() {
    if (!articulo || cant <= 0 || prec <= 0) return;

    const linea: LineaPresupuesto = {
      id: nextId.current++,
      codArt: articulo["Cod. Art"],
      descripcion: articulo.Descripcion,
      costoFinal,
      cantidad: cant,
      precio: prec,
      descuento: descEfectivo,
      subtotal,
      rentabilidad,
    };

    setLineas(prev => [...prev, linea]);
    setArticulo(null);
    setPrecioBase(0);
    setCantidad("");
    setDescuento("");
    setPrecio("");
    setBuscadorKey(k => k + 1);
  }

  function handleRemove(id: number) {
    setLineas(prev => prev.filter(l => l.id !== id));
  }

  const totalParaProfit = pactada ? totalPedidoBase / 1.105 : totalPedidoBase;
  const rentTotal = totalParaProfit > 0 ? ((totalParaProfit - totalCosto) / totalParaProfit) * 100 : 0;


  const canCargar = !!articulo && cant > 0 && prec > 0 && !descExcedeTope && !cantInvalida;

  return (
    <div className="may-page">

      {/* ── Card de carga ── */}
      <div className="may-card">
        <h2 className="may-card__title">Nuevo ítem</h2>

        {/* Producto */}
        <div className="may-field may-field--full">
          <label className="may-label">Producto</label>
          <BuscadorProducto
            key={buscadorKey}
            onSelect={async a => {
              setArticulo(a);
              const base = a["Precio Vta Final"] ?? 0;
              setPrecioBase(base);
              setPrecio(base > 0 ? base.toFixed(2) : "");
              setDescuento("");
              // Fetch multiplo y uxb desde tabla articulos
              const { data } = await supabaseClient
                .from("articulos")
                .select("multiplo, uxb")
                .eq("codigo", a["Cod. Art"])
                .single();
              setMultiplo(data?.multiplo ?? 0);
              setUxbValue(data?.uxb ?? null);
            }}
            onClear={() => {
              setArticulo(null);
              setPrecioBase(0);
              setDescuento("");
              setPrecio("");
              setMultiplo(0);
              setUxbValue(null);
            }}
          />
          {uxbValue !== null && (
            <div className="may-uxb-inline">
              <span className="may-uxb-inline__label">UxB:</span>
              <span className="may-uxb-inline__val">{uxbValue}</span>
            </div>
          )}
        </div>

        {/* Cantidad / Descuento / Precio / Margen — grilla 2×2 */}
        <div className="may-grid-2x2">
          <div className="may-field">
            <label className="may-label">Cantidad</label>
            <input
              type="number"
              className={`may-input${cantInvalida ? " may-input--error" : ""}`}
              placeholder="0"
              min={multiplo > 1 ? multiplo : 1}
              step={multiplo > 1 ? multiplo : 1}
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
            />
            {multiplo > 1 && !cantInvalida && (
              <span className="may-input-hint">Múltiplo: {multiplo}</span>
            )}
            {cantInvalida && (
              <span className="may-input-error-msg">Múltiplo de {multiplo}</span>
            )}
          </div>
          <div className="may-field">
            <label className="may-label">Descuento %</label>
            <input
              type="number"
              className={`may-input${descExcedeTope ? " may-input--error" : ""}`}
              placeholder="0"
              min="0"
              value={descuento}
              onChange={e => handleDescuento(e.target.value)}
            />
            {descExcedeTope && (
              <span className="may-input-error-msg">Tope: {topeDto}%</span>
            )}
          </div>
          <div className="may-field">
            <label className="may-label">Precio Vta</label>
            <input
              type="number"
              className="may-input may-input--readonly"
              placeholder="0.00"
              value={precio}
              readOnly
            />
          </div>
          <div className="may-field">
            <label className="may-label">Profit</label>
            <div className="may-margen-display">
              <span style={{ color: cant > 0 && prec > 0 ? rentColor(rentabilidad) : "#aab0c6" }}>
                {cant > 0 && prec > 0 ? `${rentabilidad.toFixed(1)}%` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Botón cargar */}
        <button
          className={`may-btn-cargar${canCargar ? "" : " may-btn-cargar--disabled"}`}
          onClick={handleCargar}
          disabled={!canCargar}
        >
          Cargar
        </button>
      </div>

      {/* ── Lista de líneas ── */}
      {lineas.length > 0 && (
        <div className="may-card may-presup">
          <div className="may-presup__header">
            <h2 className="may-card__title">Presupuesto</h2>
            <div className="may-totales">
              <label className="may-pactada">
                <input
                  type="checkbox"
                  checked={pactada}
                  onChange={e => setPactada(e.target.checked)}
                  className="may-pactada__check"
                />
                <span className="may-pactada__label">Pactada</span>
              </label>
              <span className="may-totales__item">
                Total: <strong>$ {fmt(totalPedido)}</strong>
              </span>
              <span className="may-totales__rent" style={{ color: rentColor(rentTotal) }}>
                Profit: <strong>{rentTotal.toFixed(1)}%</strong>
              </span>
            </div>
          </div>

          <div className="may-presup__list">
            {lineas.map(l => (
              <div key={l.id} className="may-item">
                <div className="may-item__top">
                  <span className="may-item__cod">#{l.codArt}</span>
                  <button className="may-btn-remove" onClick={() => setConfirmRemoveId(l.id)}>✕</button>
                </div>
                <div className="may-item__desc">{l.descripcion}</div>
                <div className="may-item__bottom">
                  <span className="may-item__qty">
                    {l.cantidad} x $ {fmt(l.precio)}
                    {l.descuento > 0 && (
                      <span className="may-item__desc-pct" style={{ marginLeft: 6 }}>-{l.descuento}%</span>
                    )}
                  </span>
                  <div className="may-item__right">
                    <span className="may-item__total">$ {fmt(l.subtotal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón enviar */}
          <div className="may-enviar-wrap">
            {rentTotal < 13 && rentTotal > 0 && (
              <p className="may-enviar-warning">
                Profit mínimo para enviar: 13% (actual: {rentTotal.toFixed(1)}%)
              </p>
            )}
            <button
              className={`may-btn-enviar${rentTotal >= 13 ? "" : " may-btn-enviar--disabled"}`}
              onClick={() => setExportOpen(true)}
              disabled={rentTotal < 13}
            >
              Enviar pedido
            </button>
          </div>
        </div>
      )}

      {/* ── Confirmar eliminar ítem ── */}
      {confirmRemoveId !== null && (
        <div className="may-export-overlay" onClick={() => setConfirmRemoveId(null)}>
          <div className="may-export-modal" onClick={e => e.stopPropagation()}>
            <h3 className="may-export-title">¿Borrar este ítem?</h3>
            <p className="may-export-sub">
              {lineas.find(l => l.id === confirmRemoveId)?.descripcion}
            </p>
            <div className="may-export-confirm-btns">
              <button
                className="may-export-confirm-btn may-export-confirm-btn--borrar"
                onClick={() => { handleRemove(confirmRemoveId); setConfirmRemoveId(null); }}
              >
                Sí, borrar
              </button>
              <button
                className="may-export-confirm-btn may-export-confirm-btn--seguir"
                onClick={() => setConfirmRemoveId(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {exportOpen && (
        <ExportarPresupuesto
          lineas={lineas}
          totalPedido={totalPedido}
          onClose={() => setExportOpen(false)}
          onClearAndClose={() => {
            setLineas([]);
            setExportOpen(false);
          }}
        />
      )}
    </div>
  );
}
