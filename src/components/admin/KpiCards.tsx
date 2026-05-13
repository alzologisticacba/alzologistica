import type { KpiResumen } from "./useAdminData";

interface Props {
  resumen: KpiResumen;
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
}

function KpiCard({ icon, label, value, sub, trend, color, loading }: CardProps) {
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
      </div>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("es-AR");
}

function money(n: number) {
  return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
}

export default function KpiCards({ resumen, loading }: Props) {
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
          label="Clientes activos"
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

        .kpi-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #94a3b8;
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

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
