import type { KpiResumen } from "./useAdminData";

interface Props {
  resumen: KpiResumen;
  metaMensual: number;
  facturadoMes: number;
  inversionMes: number;
  loading: boolean;
}

interface CardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  color: string;
  loading: boolean;
  children?: React.ReactNode;
}

function KpiCard({ icon, label, value, sub, trend, color, loading, children }: CardProps) {
  return (
    <div className="kpi-card" style={{ "--accent": color } as React.CSSProperties}>
      <div className="kpi-icon">
        <i className={icon}></i>
      </div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        {loading ? (
          <div className="kpi-skeleton" />
        ) : (
          <span className="kpi-value">{value}</span>
        )}
        {!loading && (sub || trend !== undefined) && (
          <span className="kpi-sub">
            {trend !== undefined && (
              <span className={trend >= 0 ? "trend-up" : "trend-down"}>
                <i className={trend >= 0 ? "fa-solid fa-arrow-trend-up" : "fa-solid fa-arrow-trend-down"}></i>
                {Math.abs(trend)}%
              </span>
            )}
            {sub && <span>{sub}</span>}
          </span>
        )}
        {!loading && children}
      </div>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("es-AR");
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function moneyShort(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function diasRestantesDelMes(): number {
  const hoy = new Date();
  const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  return ultimo - hoy.getDate();
}

export default function KpiCards({ resumen, metaMensual, facturadoMes, inversionMes, loading }: Props) {
  const pctMeta = metaMensual > 0 ? Math.min(100, (resumen.totalPedidosMes / metaMensual) * 100) : 0;
  const falta = Math.max(0, metaMensual - resumen.totalPedidosMes);
  const diasFalta = diasRestantesDelMes();
  const roas = inversionMes > 0 ? facturadoMes / inversionMes : 0;

  return (
    <>
      <div className="kpi-grid">
        <KpiCard
          icon="fa-solid fa-cart-shopping"
          label="Pedidos hoy"
          value={fmt(resumen.totalPedidosHoy)}
          color="#2556ff"
          loading={loading}
        />
        <KpiCard
          icon="fa-solid fa-calendar-check"
          label="Pedidos este mes"
          value={fmt(resumen.totalPedidosMes)}
          trend={resumen.variacionPedidosMes}
          sub="vs mes anterior"
          color="#2cc6bb"
          loading={loading}
        />
        <KpiCard
          icon="fa-solid fa-users"
          label="Clientes únicos del mes"
          value={fmt(resumen.clientesActivos)}
          trend={resumen.variacionClientes}
          sub="vs mes anterior"
          color="#f59e0b"
          loading={loading}
        />
        <KpiCard
          icon="fa-solid fa-receipt"
          label="Ticket promedio"
          value={money(resumen.ticketPromedio)}
          color="#10b981"
          loading={loading}
        />

        {/* Card grande: Objetivo del mes */}
        <div
          className="kpi-card kpi-card--wide"
          style={{ "--accent": "#8b5cf6" } as React.CSSProperties}
        >
          <div className="kpi-icon">
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <div className="kpi-body" style={{ width: "100%" }}>
            <span className="kpi-label">Objetivo del mes</span>
            {loading ? (
              <div className="kpi-skeleton" />
            ) : metaMensual <= 0 ? (
              <span className="kpi-empty-msg">
                Sin meta cargada — definila en <strong>Configuración</strong>
              </span>
            ) : (
              <>
                <span className="kpi-value">
                  {fmt(resumen.totalPedidosMes)}{" "}
                  <span className="kpi-of">/ {fmt(metaMensual)} ped.</span>
                </span>
                <div className="meta-bar">
                  <div
                    className="meta-bar-fill"
                    style={{ width: `${pctMeta}%` }}
                  />
                </div>
                <span className="kpi-sub">
                  <span className={pctMeta >= 100 ? "trend-up" : ""}>
                    <strong>{pctMeta.toFixed(0)}%</strong> cumplido
                  </span>
                  {falta > 0 && (
                    <span>
                      · Faltan <strong>{Math.round(falta)} ped.</strong> en {diasFalta} días
                    </span>
                  )}
                  {falta === 0 && metaMensual > 0 && (
                    <span className="trend-up"> · 🎯 Objetivo alcanzado</span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card grande: Inversión publicidad + ROAS */}
        <div
          className="kpi-card kpi-card--wide"
          style={{ "--accent": "#ef4444" } as React.CSSProperties}
        >
          <div className="kpi-icon">
            <i className="fa-solid fa-bullhorn"></i>
          </div>
          <div className="kpi-body" style={{ width: "100%" }}>
            <span className="kpi-label">Inversión publicidad (mes)</span>
            {loading ? (
              <div className="kpi-skeleton" />
            ) : (
              <>
                <span className="kpi-value">{money(inversionMes)}</span>
                <span className="kpi-sub">
                  {roas > 0 && (
                    <span>
                      ROAS <strong className={roas >= 1 ? "trend-up" : "trend-down"}>{roas.toFixed(2)}x</strong>
                    </span>
                  )}
                  {inversionMes === 0 && (
                    <span>Cargá movimientos en <strong>Configuración</strong></span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: box-shadow 0.15s, border-color 0.15s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .kpi-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .kpi-card--wide {
          grid-column: span 2;
        }

        @media (max-width: 640px) {
          .kpi-card--wide { grid-column: span 1; }
        }

        .kpi-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          font-size: 1rem;
          flex-shrink: 0;
        }

        .kpi-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .kpi-label {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .kpi-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.1;
        }

        .kpi-of {
          font-size: 1rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .kpi-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #94a3b8;
          flex-wrap: wrap;
        }

        .kpi-empty-msg {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.4;
        }

        .kpi-empty-msg strong {
          color: var(--accent);
        }

        .trend-up { color: #10b981; font-weight: 600; }
        .trend-down { color: #f43f5e; font-weight: 600; }

        .kpi-skeleton {
          height: 32px;
          width: 80px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }

        .meta-bar {
          width: 100%;
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 6px;
        }

        .meta-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
