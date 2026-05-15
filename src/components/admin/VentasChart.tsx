import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import type { VentaDia, VentaVendedor, PedidoRaw } from "./useAdminData";

interface Props {
  ventasPorDia: VentaDia[];
  ventasPorVendedor: VentaVendedor[];
  ventasPorMes: { mes: string; pedidos: number; monto: number }[];
  rawPedidos: PedidoRaw[];
  loading: boolean;
}

const TT = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "0.8rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

function pad(n: number) { return String(n).padStart(2, "0"); }

function isoToRaw(iso: string): { d: number; m: number; a: number } | null {
  if (!iso) return null;
  const [a, m, d] = iso.split("-").map(Number);
  return { d, m, a };
}

function rawNum(p: { d: number; m: number; a: number }): number {
  return p.a * 10000 + p.m * 100 + p.d;
}

const VEND_PHOTOS: Record<string, string> = {
  "Yohana Novarino":  "/img/vendedores/Yohana Novarino.webp",
  "Pedro Galindo":    "/img/vendedores/Pedro Galindo.png",
  "Franco Cofre":     "/img/vendedores/Franco Cofre.png",
  "Nicolas Escobar":  "/img/vendedores/Nicolas Escobar.webp",
  "Eliana Machado":   "/img/vendedores/Eliana Machado.webp",
  "Nicolas Ossman":   "/img/vendedores/Nicolas Ossman.webp",
  "Andres Mazzia":    "/img/vendedores/Andres Mazzia.png",
  "Lucas Gomez":      "/img/vendedores/Lucas Gomez.webp",
  "Emiliano Moreno":  "/img/vendedores/Emiliano Moreno.webp",
  "Federico Torres":  "/img/vendedores/Federico Torres.webp",
  "Nicolas Tabera":   "/img/vendedores/Nicolas Tavera.webp",
  "Fernando Castro":  "/img/vendedores/Fernando Castro.webp",
  "Claudio Teves":    "/img/vendedores/Claudio Tevez.webp",
  "Gustavo Martinez": "/img/vendedores/Gustavo Martinez.webp",
  "Joel Sanrame":     "/img/vendedores/Joel Sanrame.webp",
};

const VEND_COLORS = ["#2556ff","#f59e0b","#10b981","#8b5cf6","#ef4444","#0ea5e9","#ec4899","#14b8a6"];
function vendorColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return VEND_COLORS[Math.abs(h) % VEND_COLORS.length];
}
function vendorInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function ChartCard({ title, wide, children }: { title: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`chart-card ${wide ? "chart-card--wide" : ""}`}>
      <h3 className="chart-title">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="chart-empty">
      <i className="fa-solid fa-chart-bar" />
      <span>{msg}</span>
    </div>
  );
}

function Skeleton() {
  return <div className="chart-skeleton" />;
}

// ── Tabla mensual ────────────────────────────────────────────────────────────
function TablaMensual({ data }: { data: { mes: string; pedidos: number; monto: number }[] }) {
  const maxPed = Math.max(...data.map(d => d.pedidos), 1);
  return (
    <div className="tabla-mensual">
      {data.map((row) => (
        <div key={row.mes} className="tm-row">
          <span className="tm-mes">{row.mes}</span>
          <div className="tm-bar-wrap">
            <div className="tm-bar" style={{ width: `${(row.pedidos / maxPed) * 100}%` }} />
          </div>
          <span className="tm-pedidos">{row.pedidos} ped.</span>
          <span className="tm-monto">${row.monto.toLocaleString("es-AR")}</span>
        </div>
      ))}
    </div>
  );
}

// ── Export principal ────────────────────────────────────────────────────────
export default function VentasChart({ ventasPorDia, ventasPorVendedor, ventasPorMes, rawPedidos, loading }: Props) {
  const hoy = new Date();
  const primerDiaMes = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-01`;
  const hoyIso = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;

  const [desde, setDesde] = useState(primerDiaMes);
  const [hasta, setHasta] = useState(hoyIso);
  const [vista, setVista] = useState<"pedidos" | "monto">("pedidos");

  const usarFiltro = rawPedidos.length > 0;

  // ── Pedidos filtrados por rango ──
  const pedidosFiltrados = useMemo(() => {
    if (!usarFiltro) return [];
    const d = isoToRaw(desde);
    const h = isoToRaw(hasta);
    if (!d || !h) return rawPedidos;
    const dN = rawNum(d);
    const hN = rawNum(h);
    return rawPedidos.filter(p => {
      const n = rawNum(p);
      return n >= dN && n <= hN;
    });
  }, [rawPedidos, desde, hasta, usarFiltro]);

  // ── KPIs del rango ──
  const kpisRango = useMemo(() => {
    const totalPedidos = pedidosFiltrados.length;
    const totalMonto = pedidosFiltrados.reduce((s, p) => s + p.t, 0);
    const ticket = totalPedidos > 0 ? totalMonto / totalPedidos : 0;
    return { totalPedidos, totalMonto, ticket };
  }, [pedidosFiltrados]);

  // ── Pedidos por día (del rango, no del mes hardcoded) ──
  const porDiaRango = useMemo(() => {
    if (!usarFiltro) return ventasPorDia;
    const map: Record<string, { fecha: string; pedidos: number; monto: number; _ord: number }> = {};
    pedidosFiltrados.forEach(p => {
      const k = `${pad(p.d)}/${pad(p.m)}`;
      if (!map[k]) map[k] = { fecha: k, pedidos: 0, monto: 0, _ord: rawNum(p) };
      map[k].pedidos++;
      map[k].monto += p.t;
    });
    return Object.values(map)
      .sort((a, b) => a._ord - b._ord)
      .map(({ fecha, pedidos, monto }) => ({ fecha, pedidos, monto }));
  }, [pedidosFiltrados, ventasPorDia, usarFiltro]);

  // ── Vendedores del rango ──
  const vendedoresRango = useMemo(() => {
    if (!usarFiltro) return ventasPorVendedor;
    const map: Record<string, { vendedor: string; pedidos: number; monto: number }> = {};
    pedidosFiltrados.forEach(p => {
      const v = p.v || "Sin asignar";
      if (!map[v]) map[v] = { vendedor: v, pedidos: 0, monto: 0 };
      map[v].pedidos++;
      map[v].monto += p.t;
    });
    return Object.values(map).sort((a, b) => b.pedidos - a.pedidos);
  }, [pedidosFiltrados, ventasPorVendedor, usarFiltro]);

  const chartVendedores = vendedoresRango.map(v => ({
    vendedor: v.vendedor.split(" ")[0],
    pedidos: v.pedidos,
    monto: Math.round(v.monto),
    _fullName: v.vendedor,
  }));
  const chartH = Math.max(200, chartVendedores.length * 36);

  return (
    <>
      {/* ── Filtro global de rango ── */}
      <div className="rango-bar">
        <div className="rango-controls">
          <div className="date-range">
            <label>Desde</label>
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="date-input"
              disabled={!usarFiltro}
            />
            <label>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="date-input"
              disabled={!usarFiltro}
            />
          </div>
          <div className="presets">
            <button onClick={() => { setDesde(hoyIso); setHasta(hoyIso); }} disabled={!usarFiltro}>Hoy</button>
            <button onClick={() => {
              const d = new Date(); d.setDate(d.getDate() - 6);
              setDesde(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
              setHasta(hoyIso);
            }} disabled={!usarFiltro}>7 días</button>
            <button onClick={() => { setDesde(primerDiaMes); setHasta(hoyIso); }} disabled={!usarFiltro}>Este mes</button>
          </div>
        </div>

        <div className="rango-kpis">
          <div className="rk-item">
            <span className="rk-label">Pedidos</span>
            <span className="rk-value">{kpisRango.totalPedidos}</span>
          </div>
          <div className="rk-item">
            <span className="rk-label">Facturado</span>
            <span className="rk-value rk-money">{money(kpisRango.totalMonto)}</span>
          </div>
          <div className="rk-item">
            <span className="rk-label">Ticket medio</span>
            <span className="rk-value rk-money">{money(kpisRango.ticket)}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">

        {/* Pedidos por día (del rango) */}
        <ChartCard title="Pedidos por día (rango seleccionado)">
          {loading ? <Skeleton /> : porDiaRango.length === 0
            ? <Empty msg="Sin pedidos en el período seleccionado" />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={porDiaRango} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={TT} formatter={(v: number) => [v, "Pedidos"]} />
                  <Bar dataKey="pedidos" fill="#2556ff" radius={[4, 4, 0, 0]} name="Pedidos" />
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        {/* Pedidos por mes (NO se filtra: histórico 12 meses) */}
        <ChartCard title="Pedidos por mes (últimos 12)">
          {loading ? <Skeleton /> : ventasPorMes.length === 0
            ? <Empty msg="Sin datos mensuales" />
            : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={ventasPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={TT} formatter={(v: number) => [v, "Pedidos"]} />
                    <Line
                      type="monotone"
                      dataKey="pedidos"
                      stroke="#2cc6bb"
                      strokeWidth={2}
                      dot={{ fill: "#2cc6bb", r: 3 }}
                      name="Pedidos"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <TablaMensual data={ventasPorMes} />
              </>
            )}
        </ChartCard>

        {/* Pedidos por vendedor (del rango) */}
        <ChartCard title="Pedidos por vendedor (rango seleccionado)" wide>
          {loading ? <Skeleton /> : vendedoresRango.length === 0 ? (
            <Empty msg="Sin pedidos en el período seleccionado" />
          ) : (
            <>
              <div className="vend-vista-toggle">
                <div className="vista-toggle">
                  <button
                    className={vista === "pedidos" ? "active" : ""}
                    onClick={() => setVista("pedidos")}
                  >
                    Pedidos
                  </button>
                  <button
                    className={vista === "monto" ? "active" : ""}
                    onClick={() => setVista("monto")}
                  >
                    Monto
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={chartVendedores} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={v => vista === "monto" ? `$${(v / 1000).toFixed(0)}k` : String(v)}
                  />
                  <YAxis
                    dataKey="vendedor"
                    type="category"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={TT}
                    formatter={(v: number) =>
                      vista === "monto"
                        ? [`$${v.toLocaleString("es-AR")}`, "Monto"]
                        : [v, "Pedidos"]
                    }
                    labelFormatter={(label, payload) => payload?.[0]?.payload?._fullName ?? label}
                  />
                  <Bar
                    dataKey={vista}
                    fill={vista === "pedidos" ? "#f59e0b" : "#2cc6bb"}
                    radius={[0, 4, 4, 0]}
                    name={vista === "pedidos" ? "Pedidos" : "Monto"}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="vend-tabla">
                <div className="vend-tabla-header">
                  <span>Vendedor</span>
                  <span>Pedidos</span>
                  <span>Monto</span>
                  <span>% pedidos</span>
                </div>
                {(() => {
                  const totalPed = vendedoresRango.reduce((s, v) => s + v.pedidos, 0);
                  return vendedoresRango.map(v => (
                    <div key={v.vendedor} className="vend-tabla-row">
                      <span className="vend-nombre">
                        {VEND_PHOTOS[v.vendedor] ? (
                          <img
                            src={VEND_PHOTOS[v.vendedor]}
                            alt={v.vendedor}
                            className="vend-photo"
                          />
                        ) : (
                          <span
                            className="vend-avatar"
                            style={{ background: vendorColor(v.vendedor) }}
                          >
                            {vendorInitials(v.vendedor)}
                          </span>
                        )}
                        {v.vendedor}
                      </span>
                      <span className="vend-num">{v.pedidos}</span>
                      <span className="vend-monto">${Math.round(v.monto).toLocaleString("es-AR")}</span>
                      <span className="vend-pct">
                        {totalPed > 0 ? ((v.pedidos / totalPed) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </>
          )}
        </ChartCard>

      </div>

      <style>{`
        .rango-bar {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .rango-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .date-range label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .date-input {
          padding: 6px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #0f172a;
          font-size: 0.82rem;
          font-family: inherit;
          outline: none;
          cursor: pointer;
        }
        .date-input:focus { border-color: #2556ff; background: #fff; }
        .date-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .presets {
          display: flex;
          gap: 4px;
          padding-left: 8px;
          border-left: 1px solid #e2e8f0;
        }

        .presets button {
          padding: 5px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          font-size: 0.75rem;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }

        .presets button:hover:not(:disabled) {
          background: #eff6ff;
          border-color: #2556ff;
          color: #2556ff;
        }

        .presets button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .rango-kpis {
          display: flex;
          gap: 18px;
          padding-left: 16px;
          border-left: 1px solid #e2e8f0;
        }

        .rk-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rk-label {
          font-size: 0.66rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }

        .rk-value {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
        }

        .rk-money {
          color: #10b981;
        }

        .vend-vista-toggle {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 12px;
        }

        .vista-toggle {
          display: flex;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .vista-toggle button {
          padding: 6px 14px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.78rem;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }
        .vista-toggle button.active {
          background: #2556ff;
          color: #fff;
        }

        .vend-tabla {
          margin-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        .vend-tabla-header {
          display: grid;
          grid-template-columns: 1fr 70px 110px 70px;
          padding: 8px 4px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .vend-tabla-row {
          display: grid;
          grid-template-columns: 1fr 70px 110px 70px;
          padding: 8px 4px;
          border-top: 1px solid #f1f5f9;
          font-size: 0.82rem;
          align-items: center;
        }
        .vend-tabla-row:hover { background: #f8fafc; }
        .vend-nombre {
          color: #0f172a;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vend-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .vend-photo {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid #e2e8f0;
        }
        .vend-num    { color: #f59e0b; font-weight: 600; }
        .vend-monto  { color: #0ea5e9; font-weight: 600; }
        .vend-pct    { color: #94a3b8; }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .chart-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .chart-card--wide {
          grid-column: 1 / -1;
        }

        .chart-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          margin: 0 0 16px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .chart-skeleton {
          height: 220px;
          border-radius: 8px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }

        .chart-empty {
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #cbd5e1;
        }
        .chart-empty i { font-size: 2rem; }
        .chart-empty span { font-size: 0.8rem; text-align: center; max-width: 220px; }

        .tabla-mensual {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          max-height: 220px;
          overflow-y: auto;
        }
        .tm-row {
          display: grid;
          grid-template-columns: 48px 1fr 64px 90px;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
        }
        .tm-mes { color: #94a3b8; font-weight: 600; font-size: 0.75rem; }
        .tm-bar-wrap { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
        .tm-bar { height: 100%; background: #2556ff; border-radius: 3px; transition: width 0.4s ease; }
        .tm-pedidos { color: #0f172a; font-weight: 600; text-align: right; }
        .tm-monto { color: #10b981; font-weight: 600; text-align: right; font-size: 0.75rem; }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
