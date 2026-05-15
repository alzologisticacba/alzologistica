import { useState, useMemo } from "react";
import type { Cliente } from "./useAdminData";

interface Props {
  clientes: Cliente[];
  loading: boolean;
}

type SortKey = "pedidos" | "montoTotal" | "ticketPromedio" | "ultimoPedido";

function money(n: number) {
  if (!n) return "—";
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function waLink(tel: string) {
  const limpio = tel.replace(/\D/g, "");
  return `https://wa.me/${limpio}`;
}

function recurrenciaLabel(pedidos: number) {
  if (pedidos === 1) return { label: "1 vez", cls: "rec-unica" };
  if (pedidos <= 3) return { label: `${pedidos} veces`, cls: "rec-baja" };
  if (pedidos <= 9) return { label: `${pedidos} veces`, cls: "rec-media" };
  return { label: `${pedidos} veces`, cls: "rec-alta" };
}

export default function ClientesTable({ clientes, loading }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [vendedorFiltro, setVendedorFiltro] = useState("Todos");
  const [recFiltro, setRecFiltro] = useState("Todos");
  const [sortKey, setSortKey] = useState<SortKey>("pedidos");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 20;

  const vendedores = ["Todos", ...Array.from(new Set(clientes.map((c) => c.vendedor).filter(Boolean))).sort()];

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
    setPagina(1);
  }

  const filtrados = useMemo(() => {
    return clientes
      .filter((c) => {
        const matchBusqueda = busqueda === "" || c.telefono.includes(busqueda) || c.vendedor.toLowerCase().includes(busqueda.toLowerCase());
        const matchVendedor = vendedorFiltro === "Todos" || c.vendedor === vendedorFiltro;
        const matchRec =
          recFiltro === "Todos" ? true :
          recFiltro === "1 vez" ? c.pedidos === 1 :
          recFiltro === "2-5" ? c.pedidos >= 2 && c.pedidos <= 5 :
          recFiltro === "6-9" ? c.pedidos >= 6 && c.pedidos <= 9 :
          c.pedidos >= 10;
        return matchBusqueda && matchVendedor && matchRec;
      })
      .sort((a, b) => {
        const mult = sortDir === "desc" ? -1 : 1;
        if (sortKey === "ultimoPedido") {
          return mult * a.ultimoPedido.localeCompare(b.ultimoPedido);
        }
        return mult * (a[sortKey] - b[sortKey]);
      });
  }, [clientes, busqueda, vendedorFiltro, recFiltro, sortKey, sortDir]);

  // KPIs rápidos
  const kpis = useMemo(() => {
    const total = clientes.length;
    const unicos = clientes.filter(c => c.pedidos === 1).length;
    const recurrentes = clientes.filter(c => c.pedidos >= 2).length;
    const vip = clientes.filter(c => c.pedidos >= 10).length;
    return { total, unicos, recurrentes, vip };
  }, [clientes]);

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginated = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <i className="fa-solid fa-sort sort-icon muted" />;
    return <i className={`fa-solid fa-sort-${sortDir === "desc" ? "down" : "up"} sort-icon`} />;
  }

  return (
    <>
      {/* KPIs de recurrencia */}
      {!loading && clientes.length > 0 && (
        <div className="rec-kpis">
          <div className="rec-kpi">
            <span className="rec-kpi-val">{kpis.total}</span>
            <span className="rec-kpi-label">Total clientes</span>
          </div>
          <div className="rec-kpi">
            <span className="rec-kpi-val rec-unica">{kpis.unicos}</span>
            <span className="rec-kpi-label">Compraron 1 vez</span>
          </div>
          <div className="rec-kpi">
            <span className="rec-kpi-val rec-media">{kpis.recurrentes}</span>
            <span className="rec-kpi-label">Recurrentes (2+)</span>
          </div>
          <div className="rec-kpi">
            <span className="rec-kpi-val rec-alta">{kpis.vip}</span>
            <span className="rec-kpi-label">VIP (10+ pedidos)</span>
          </div>
        </div>
      )}

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
              placeholder="Buscar por teléfono o vendedor..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              className="search-input"
            />
          </div>
          <select value={vendedorFiltro} onChange={(e) => { setVendedorFiltro(e.target.value); setPagina(1); }} className="filter-select">
            {vendedores.map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={recFiltro} onChange={(e) => { setRecFiltro(e.target.value); setPagina(1); }} className="filter-select">
            {["Todos", "1 vez", "2-5", "6-9", "10+"].map((r) => <option key={r}>{r}</option>)}
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
            <p>Sin datos — actualizá el GAS y recargá</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="clientes-table">
                <thead>
                  <tr>
                    <th>Teléfono</th>
                    <th>Vendedor</th>
                    <th className="th-sort" onClick={() => toggleSort("pedidos")}>
                      Pedidos <SortIcon k="pedidos" />
                    </th>
                    <th className="th-sort" onClick={() => toggleSort("montoTotal")}>
                      Facturado <SortIcon k="montoTotal" />
                    </th>
                    <th className="th-sort" onClick={() => toggleSort("ticketPromedio")}>
                      Ticket prom. <SortIcon k="ticketPromedio" />
                    </th>
                    <th className="th-sort" onClick={() => toggleSort("ultimoPedido")}>
                      Último pedido <SortIcon k="ultimoPedido" />
                    </th>
                    <th>WA</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="no-results">Sin resultados</td>
                    </tr>
                  ) : (
                    paginated.map((c) => {
                      const rec = recurrenciaLabel(c.pedidos);
                      return (
                        <tr key={c.telefono}>
                          <td className="td-tel">{c.telefono}</td>
                          <td className="td-vendedor">{c.vendedor || "—"}</td>
                          <td>
                            <span className={`rec-badge ${rec.cls}`}>{rec.label}</span>
                          </td>
                          <td className="td-monto">{money(c.montoTotal)}</td>
                          <td className="td-ticket">{money(c.ticketPromedio)}</td>
                          <td className="td-fecha">{c.ultimoPedido || "—"}</td>
                          <td>
                            <a href={waLink(c.telefono)} target="_blank" rel="noreferrer" className="wa-btn" title="Abrir WhatsApp">
                              <i className="fa-brands fa-whatsapp"></i>
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <span className="page-info">{pagina} / {totalPaginas}</span>
                <button className="page-btn" disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .rec-kpis {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .rec-kpi {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .rec-kpi-val {
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
        }

        .rec-kpi-label {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 500;
        }

        .rec-unica  { color: #94a3b8; }
        .rec-baja   { color: #2556ff; }
        .rec-media  { color: #f59e0b; }
        .rec-alta   { color: #10b981; }

        .clientes-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .clientes-header { margin-bottom: 16px; }

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

        .search-wrap { position: relative; flex: 1; min-width: 200px; }

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
        }

        .search-input::placeholder { color: #cbd5e1; }
        .search-input:focus { border-color: #2556ff; background: #fff; }

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

        .table-wrap { overflow-x: auto; }

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

        .th-sort {
          cursor: pointer;
          user-select: none;
        }

        .th-sort:hover { color: #0f172a; }

        .sort-icon { margin-left: 4px; font-size: 0.7rem; }
        .sort-icon.muted { opacity: 0.3; }

        .clientes-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .clientes-table tr:hover td { background: #f8fafc; }

        .td-tel   { font-family: monospace; font-size: 0.85rem; color: #0f172a !important; font-weight: 500; }
        .td-vendedor { color: #64748b !important; }
        .td-fecha { color: #94a3b8 !important; white-space: nowrap; }
        .td-monto { font-weight: 600; color: #10b981 !important; white-space: nowrap; }
        .td-ticket { font-weight: 500; color: #0ea5e9 !important; white-space: nowrap; }

        .rec-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
          background: #f1f5f9;
        }

        .rec-badge.rec-unica  { background: #f1f5f9; color: #94a3b8; }
        .rec-badge.rec-baja   { background: #eff6ff; color: #2556ff; }
        .rec-badge.rec-media  { background: #fffbeb; color: #d97706; }
        .rec-badge.rec-alta   { background: #ecfdf5; color: #059669; }

        .wa-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #ecfdf5;
          color: #25d366;
          font-size: 0.9rem;
          text-decoration: none;
          transition: background 0.15s;
        }

        .wa-btn:hover { background: #bbf7d0; }

        .no-results { text-align: center; color: #cbd5e1 !important; padding: 32px !important; }

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

        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .page-btn:not(:disabled):hover { background: #e2e8f0; color: #0f172a; }
        .page-info { font-size: 0.8rem; color: #94a3b8; }

        .table-skeleton { display: flex; flex-direction: column; gap: 8px; }

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

        .clientes-empty i { font-size: 2rem; }
        .clientes-empty p { font-size: 0.8rem; margin: 0; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
