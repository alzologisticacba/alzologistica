import { useState } from "react";
import type { ProductoTop } from "./useAdminData";

interface Props {
  productos: ProductoTop[];
  loading: boolean;
}

export default function TopProductos({ productos, loading }: Props) {
  const [filtro, setFiltro] = useState<"todos" | "varios" | "cigarrillos">("todos");

  const filtrados = productos.filter((p) => filtro === "todos" || p.categoria === filtro);

  const maxBultos = Math.max(...filtrados.map((p) => p.cantidadBultos), 1);

  return (
    <>
      <div className="top-card">
        <div className="top-header">
          <h3 className="section-title">
            <i className="fa-solid fa-ranking-star"></i>
            Top Productos
          </h3>
          <div className="top-filters">
            {(["todos", "varios", "cigarrillos"] as const).map((f) => (
              <button
                key={f}
                className={`filter-btn ${filtro === f ? "active" : ""}`}
                onClick={() => setFiltro(f)}
              >
                {f === "todos" ? "Todos" : f === "varios" ? "Varios" : "Cigarrillos"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="top-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="top-empty">
            <i className="fa-solid fa-box-open"></i>
            <p>Sin datos de productos — configurá el GAS para ver el ranking</p>
          </div>
        ) : (
          <div className="top-list">
            {filtrados.map((p, i) => (
              <div key={p.codigo} className="top-row">
                <span className={`rank ${i < 3 ? "rank-top" : ""}`}>{i + 1}</span>
                <div className="prod-info">
                  <span className="prod-nombre">{p.nombre}</span>
                  <span className="prod-codigo">{p.codigo}</span>
                </div>
                <div className="prod-bar-wrap">
                  <div
                    className="prod-bar"
                    style={{
                      width: `${(p.cantidadBultos / maxBultos) * 100}%`,
                      background: p.categoria === "cigarrillos" ? "#f59e0b" : "#2556ff",
                    }}
                  />
                </div>
                <div className="prod-nums">
                  <span className="prod-bultos">{p.cantidadBultos.toLocaleString("es-AR")} blt</span>
                  <span className="prod-pedidos">{p.cantidadPedidos} ped.</span>
                </div>
                <span className={`cat-badge cat-${p.categoria}`}>
                  {p.categoria === "cigarrillos" ? "Cig." : "Var."}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .top-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .top-filters {
          display: flex;
          gap: 6px;
        }

        .filter-btn {
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #94a3b8;
          font-size: 0.78rem;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }

        .filter-btn.active {
          background: #2556ff;
          border-color: #2556ff;
          color: #fff;
        }

        .top-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .top-row {
          display: grid;
          grid-template-columns: 28px 1fr 120px 90px 52px;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .top-row:last-child {
          border-bottom: none;
        }

        .rank {
          font-size: 0.8rem;
          font-weight: 700;
          color: #cbd5e1;
          text-align: center;
        }

        .rank-top {
          color: #f59e0b;
        }

        .prod-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .prod-nombre {
          font-size: 0.85rem;
          font-weight: 500;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prod-codigo {
          font-size: 0.72rem;
          color: #94a3b8;
        }

        .prod-bar-wrap {
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          overflow: hidden;
        }

        .prod-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .prod-nums {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .prod-bultos {
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
        }

        .prod-pedidos {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .cat-badge {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 3px 7px;
          border-radius: 10px;
          text-align: center;
        }

        .cat-varios {
          background: #eff6ff;
          color: #2556ff;
        }

        .cat-cigarrillos {
          background: #fffbeb;
          color: #d97706;
        }

        .top-skeleton {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-row {
          height: 40px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }

        .top-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 40px;
          color: #cbd5e1;
          text-align: center;
        }

        .top-empty i {
          font-size: 2rem;
        }

        .top-empty p {
          font-size: 0.8rem;
          margin: 0;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 600px) {
          .top-row {
            grid-template-columns: 24px 1fr 70px;
          }
          .prod-bar-wrap,
          .cat-badge {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
