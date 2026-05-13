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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="chart-card">
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

// ── Vendedores con filtro de fecha ───────────────────────────────────────────
function VendedorFiltrado({ rawPedidos, vendedoresMes }: {
  rawPedidos: PedidoRaw[];
  vendedoresMes: VentaVendedor[];
}) {
  const hoy = new Date();
  const primerDiaMes = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-01`;
  const hoyIso = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;

  const [desde, setDesde] = useState(primerDiaMes);
  const [hasta, setHasta] = useState(hoyIso);
  const [vista, setVista] = useState<"pedidos" | "monto">("pedidos");

  const usarFiltro = rawPedidos.length > 0;

  const vendedores = useMemo(() => {
    if (!usarFiltro) return vendedoresMes;

    const d = isoToRaw(desde);
    const h = isoToRaw(hasta);
    if (!d || !h) return vendedoresMes;

    const dNum = d.a * 10000 + d.m * 100 + d.d;
    const hNum = h.a * 10000 + h.m * 100 + h.d;

    const filtrados = rawPedidos.filter(p => {
      const n = p.a * 10000 + p.m * 100 + p.d;
      return n >= dNum && n <= hNum;
    });

    const map: Record<string, { vendedor: string; pedidos: number; monto: number }> = {};
    filtrados.forEach(p => {
      const v = p.v || "Sin asignar";
      if (!map[v]) map[v] = { vendedor: v, pedidos: 0, monto: 0 };
      map[v].pedidos++;
      map[v].monto += p.t;
    });

    return Object.values(map).sort((a, b) => b.pedidos - a.pedidos);
  }, [rawPedidos, desde, hasta, vendedoresMes, usarFiltro]);

  const chartData = vendedores.map(v => ({
    vendedor: v.vendedor.split(" ")[0], // primer nombre para que entre en el eje
    pedidos: v.pedidos,
    monto: Math.round(v.monto),
    _fullName: v.vendedor,
  }));

  const chartH = Math.max(200, chartData.length * 36);

  return (
    <>
      <div className="vend-controls">
        <div className="date-range">
          <label>Desde</label>
          <input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="date-input"
          />
          <label>Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
            className="date-input"
          />
        </div>
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

      {vendedores.length === 0 ? (
        <Empty msg="Sin pedidos en el período seleccionado" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={chartData} layout="vertical" barSize={14}>
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

          {/* Tabla resumen debajo del gráfico */}
          <div className="vend-tabla">
            <div className="vend-tabla-header">
              <span>Vendedor</span>
              <span>Pedidos</span>
              <span>Monto</span>
              <span>% pedidos</span>
            </div>
            {(() => {
              const totalPed = vendedores.reduce((s, v) => s + v.pedidos, 0);
              return vendedores.map(v => (
                <div key={v.vendedor} className="vend-tabla-row">
                  <span className="vend-nombre">{v.vendedor}</span>
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

      <style>{`
        .vend-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
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
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #0f172a;
          font-size: 0.82rem;
          font-family: inherit;
          outline: none;
          cursor: pointer;
        }
        .date-input:focus { border-color: #2556ff; }
        .date-input::-webkit-calendar-picker-indicator { filter: none; opacity: 0.5; }
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
        .vend-nombre { color: #0f172a; font-weight: 500; }
        .vend-num    { color: #f59e0b; font-weight: 600; }
        .vend-monto  { color: #0ea5e9; font-weight: 600; }
        .vend-pct    { color: #94a3b8; }
      `}</style>
    </>
  );
}

// ── Export principal ─────────────────────────────────────────────────────────
export default function VentasChart({ ventasPorDia, ventasPorVendedor, ventasPorMes, rawPedidos, loading }: Props) {
  return (
    <>
      <div className="charts-grid">

        {/* Pedidos por día */}
        <ChartCard title="Pedidos por día (mes actual)">
          {loading ? <Skeleton /> : ventasPorDia.length === 0
            ? <Empty msg="Sin datos de pedidos diarios" />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ventasPorDia} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={TT} formatter={(v: number) => [v, "Pedidos"]} />
                  <Bar dataKey="pedidos" fill="#2556ff" radius={[4, 4, 0, 0]} name="Pedidos" />
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        {/* Pedidos por mes — gráfico + tabla */}
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

        {/* Pedidos por vendedor con filtro de fecha */}
        <div className="chart-card chart-card--wide">
          <h3 className="chart-title">Pedidos por vendedor</h3>
          {loading
            ? <Skeleton />
            : <VendedorFiltrado rawPedidos={rawPedidos} vendedoresMes={ventasPorVendedor} />
          }
        </div>

      </div>

      <style>{`
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

        /* Tabla mensual */
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

        .tm-mes {
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .tm-bar-wrap {
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          overflow: hidden;
        }

        .tm-bar {
          height: 100%;
          background: #2556ff;
          border-radius: 3px;
          transition: width 0.4s ease;
        }

        .tm-pedidos {
          color: #0f172a;
          font-weight: 600;
          text-align: right;
        }

        .tm-monto {
          color: #10b981;
          font-weight: 600;
          text-align: right;
          font-size: 0.75rem;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
