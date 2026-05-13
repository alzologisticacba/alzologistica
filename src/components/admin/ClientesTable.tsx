import { useState } from "react";
import type { Cliente } from "./useAdminData";

interface Props {
  clientes: Cliente[];
  loading: boolean;
}

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function ClientesTable({ clientes, loading }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [vendedorFiltro, setVendedorFiltro] = useState("Todos");
  const [diaFiltro, setDiaFiltro] = useState("Todos");
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 15;

  const vendedores = ["Todos", ...Array.from(new Set(clientes.map((c) => c.vendedor))).sort()];
  const dias = ["Todos", ...DIAS.filter((d) => clientes.some((c) => c.diaVenta === d))];

  const filtrados = clientes.filter((c) => {
    const matchBusqueda =
      busqueda === "" ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchVendedor = vendedorFiltro === "Todos" || c.vendedor === vendedorFiltro;
    const matchDia = diaFiltro === "Todos" || c.diaVenta === diaFiltro;
    return matchBusqueda && matchVendedor && matchDia;
  });

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginated = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function money(n: number) {
    if (!n) return "—";
    return `$${n.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
  }

  return (
    <>
      <div className="clientes-card">
        <div className="clientes-header">
          <h3 className="section-title">
            <i className="fa-solid fa-users"></i>
            Cartera de Clientes
            <span className="badge-count">{filtrados.length}</span>
          </h3>
        </div>

        <div className="clientes-filters">
          <div className="search-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              className="search-input"
            />
          </div>
          <select
            value={vendedorFiltro}
            onChange={(e) => { setVendedorFiltro(e.target.value); setPagina(1); }}
            className="filter-select"
          >
            {vendedores.map((v) => <option key={v}>{v}</option>)}
          </select>
          <select
            value={diaFiltro}
            onChange={(e) => { setDiaFiltro(e.target.value); setPagina(1); }}
            className="filter-select"
          >
            {dias.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="table-skeleton">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        ) : filtrados.length === 0 && clientes.length === 0 ? (
          <div className="clientes-empty">
            <i className="fa-solid fa-users-slash"></i>
            <p>Sin datos — configurá el GAS para ver tu cartera de clientes</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="clientes-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Día venta</th>
                    <th>Día reparto</th>
                    <th>Vendedor</th>
                    <th>Último pedido</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="no-results">Sin resultados para los filtros aplicados</td>
                    </tr>
                  ) : (
                    paginated.map((c) => (
                      <tr key={c.codigo}>
                        <td className="td-codigo">{c.codigo}</td>
                        <td className="td-nombre">{c.nombre}</td>
                        <td><span className="dia-badge">{c.diaVenta || "—"}</span></td>
                        <td><span className="dia-badge dia-reparto">{c.diaReparto || "—"}</span></td>
                        <td className="td-vendedor">{c.vendedor || "—"}</td>
                        <td className="td-fecha">{c.ultimoPedido || "—"}</td>
                        <td className="td-monto">{money(c.montoPedido)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={pagina === 1}
                  onClick={() => setPagina(pagina - 1)}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <span className="page-info">{pagina} / {totalPaginas}</span>
                <button
                  className="page-btn"
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina(pagina + 1)}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .clientes-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .clientes-header {
          margin-bottom: 16px;
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

        .badge-count {
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
        }

        .clientes-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .search-input {
          width: 100%;
          padding: 8px 10px 8px 32px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #0f172a;
          font-size: 0.82rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }

        .search-input::placeholder { color: #cbd5e1; }

        .search-input:focus {
          border-color: #2556ff;
          background: #ffffff;
        }

        .filter-select {
          padding: 8px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #64748b;
          font-size: 0.82rem;
          font-family: inherit;
          outline: none;
          cursor: pointer;
        }

        .filter-select:focus { border-color: #2556ff; }

        .table-wrap {
          overflow-x: auto;
        }

        .clientes-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }

        .clientes-table th {
          padding: 10px 12px;
          text-align: left;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
          background: #f8fafc;
        }

        .clientes-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .clientes-table tr:hover td {
          background: #f8fafc;
        }

        .td-codigo {
          font-family: monospace;
          font-size: 0.78rem;
          color: #94a3b8 !important;
        }

        .td-nombre {
          font-weight: 500;
          color: #0f172a !important;
        }

        .td-vendedor {
          color: #64748b !important;
        }

        .td-fecha {
          color: #94a3b8 !important;
          white-space: nowrap;
        }

        .td-monto {
          font-weight: 600;
          color: #10b981 !important;
          white-space: nowrap;
        }

        .dia-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.72rem;
          white-space: nowrap;
        }

        .dia-reparto {
          background: #ecfdf5;
          color: #059669;
        }

        .no-results {
          text-align: center;
          color: #cbd5e1 !important;
          padding: 32px !important;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 16px;
        }

        .page-btn {
          padding: 6px 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          transition: background 0.15s;
        }

        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-btn:not(:disabled):hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .page-info {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .table-skeleton {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-row {
          height: 40px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }

        .clientes-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 48px;
          color: #cbd5e1;
          text-align: center;
        }

        .clientes-empty i {
          font-size: 2rem;
        }

        .clientes-empty p {
          font-size: 0.8rem;
          margin: 0;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
