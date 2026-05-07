import { useState, useEffect } from "react";
import { supabaseClient } from "../../lib/supabaseClient";
import type { Session as SupabaseSession } from "@supabase/supabase-js";

type Periodo = "dia" | "mes" | "anio";

interface ItemAdmin {
  id: string;
  estado: "pendiente" | "entregado";
  cant_bultos: number;
  hora_carga: string;
  hora_egreso: string | null;
  cliente_nombre: string;
}

interface SesionConItems {
  id: string;
  fecha: string;
  repartidor: string;
  patente: string;
  items_reparto: ItemAdmin[];
}

interface RepartidorStats {
  repartidor: string;
  sesiones: number;
  pedidos: number;
  entregados: number;
  pendientes: number;
  bultos: number;
  bultosEntregados: number;
}

function getDateRange(periodo: Periodo): { start: string; end: string } {
  const hoy = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const [year, month] = hoy.split("-").map(Number);

  if (periodo === "dia") return { start: hoy, end: hoy };
  if (periodo === "mes") {
    const lastDay = new Date(year, month, 0).getDate();
    return {
      start: `${year}-${String(month).padStart(2, "0")}-01`,
      end: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
    };
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

export default function AdminDashboard({
  authSession,
  onBack,
  onGoogleLogout,
}: {
  authSession: SupabaseSession;
  onBack: () => void;
  onGoogleLogout: () => void;
}) {
  const [periodo, setPeriodo] = useState<Periodo>("dia");
  const [sesiones, setSesiones] = useState<SesionConItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [periodo]);

  async function loadData() {
    setLoading(true);
    const { start, end } = getDateRange(periodo);

    const { data } = await supabaseClient
      .from("sesiones_reparto")
      .select(`
        id, fecha, repartidor, patente,
        items_reparto (id, estado, cant_bultos, hora_carga, hora_egreso, cliente_nombre)
      `)
      .gte("fecha", start)
      .lte("fecha", end)
      .order("fecha", { ascending: false });

    setSesiones((data as SesionConItems[]) ?? []);
    setLoading(false);
  }

  const allItems = sesiones.flatMap((s) => s.items_reparto);
  const totalPedidos = allItems.length;
  const totalEntregados = allItems.filter((i) => i.estado === "entregado").length;
  const totalPendientes = allItems.filter((i) => i.estado === "pendiente").length;
  const totalBultos = allItems.reduce((sum, i) => sum + i.cant_bultos, 0);
  const bultosEntregados = allItems
    .filter((i) => i.estado === "entregado")
    .reduce((sum, i) => sum + i.cant_bultos, 0);
  const pctEntregados =
    totalPedidos > 0 ? Math.round((totalEntregados / totalPedidos) * 100) : 0;
  const totalRutas = sesiones.length;

  const byRepartidor: RepartidorStats[] = Object.values(
    sesiones.reduce(
      (acc, s) => {
        const key = s.repartidor;
        if (!acc[key]) {
          acc[key] = {
            repartidor: s.repartidor,
            sesiones: 0,
            pedidos: 0,
            entregados: 0,
            pendientes: 0,
            bultos: 0,
            bultosEntregados: 0,
          };
        }
        acc[key].sesiones++;
        s.items_reparto.forEach((i) => {
          acc[key].pedidos++;
          acc[key].bultos += i.cant_bultos;
          if (i.estado === "entregado") {
            acc[key].entregados++;
            acc[key].bultosEntregados += i.cant_bultos;
          } else {
            acc[key].pendientes++;
          }
        });
        return acc;
      },
      {} as Record<string, RepartidorStats>
    )
  ).sort((a, b) => b.pedidos - a.pedidos);

  const periodoLabel: Record<Periodo, string> = {
    dia: "Hoy",
    mes: "Este mes",
    anio: "Este año",
  };

  return (
    <div className="rep-page">
      <header className="rep-header">
        <div className="rep-header__logo">
          <img src="/img/alzo_logo.png" alt="Alzo" />
          <span>Administrador</span>
        </div>
        <div className="rep-header__right">
          <button className="rep-header__logout" onClick={onBack}>
            Cambiar vista
          </button>
          <button className="rep-header__logout" onClick={onGoogleLogout}>
            Salir
          </button>
        </div>
      </header>

      <main className="rep-main">
        {/* Selector de período */}
        <div className="rep-periodo-tabs">
          {(["dia", "mes", "anio"] as Periodo[]).map((p) => (
            <button
              key={p}
              className={`rep-periodo-tab${periodo === p ? " rep-periodo-tab--active" : ""}`}
              onClick={() => setPeriodo(p)}
            >
              {periodoLabel[p]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rep-ocr-processing" style={{ paddingTop: 60 }}>
            <span
              className="rep-spinner"
              style={{ borderColor: "#dbeafe", borderTopColor: "#2556ff", width: 32, height: 32, borderWidth: 3 }}
            />
            <p>Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            {/* Tarjetas resumen */}
            <div className="rep-admin-summary">
              <div className="rep-admin-card">
                <span className="rep-admin-card__num">{totalRutas}</span>
                <span className="rep-admin-card__label">Rutas</span>
              </div>
              <div className="rep-admin-card">
                <span className="rep-admin-card__num">{totalPedidos}</span>
                <span className="rep-admin-card__label">Pedidos</span>
              </div>
              <div className="rep-admin-card rep-admin-card--done">
                <span className="rep-admin-card__num">{totalEntregados}</span>
                <span className="rep-admin-card__label">Entregados</span>
              </div>
              <div className="rep-admin-card rep-admin-card--pending">
                <span className="rep-admin-card__num">{totalPendientes}</span>
                <span className="rep-admin-card__label">Pendientes</span>
              </div>
              <div className="rep-admin-card rep-admin-card--highlight">
                <span className="rep-admin-card__num">{pctEntregados}%</span>
                <span className="rep-admin-card__label">Completado</span>
              </div>
              <div className="rep-admin-card">
                <span className="rep-admin-card__num">{totalBultos}</span>
                <span className="rep-admin-card__label">Bultos totales</span>
              </div>
              <div className="rep-admin-card rep-admin-card--done">
                <span className="rep-admin-card__num">{bultosEntregados}</span>
                <span className="rep-admin-card__label">Bultos entregados</span>
              </div>
            </div>

            {/* Tabla por repartidor */}
            <section className="rep-section">
              <h2 className="rep-section__title">
                Por repartidor
                {byRepartidor.length > 0 && (
                  <span className="rep-section__count">{byRepartidor.length}</span>
                )}
              </h2>

              {byRepartidor.length === 0 ? (
                <p className="rep-empty">Sin actividad en este período.</p>
              ) : (
                <div className="rep-admin-table-wrap">
                  <table className="rep-admin-table">
                    <thead>
                      <tr>
                        <th>Repartidor</th>
                        <th>Pedidos</th>
                        <th>Entregados</th>
                        <th>Pendientes</th>
                        <th>Bultos</th>
                        <th>Progreso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byRepartidor.map((r) => {
                        const pct =
                          r.pedidos > 0
                            ? Math.round((r.entregados / r.pedidos) * 100)
                            : 0;
                        return (
                          <tr key={r.repartidor}>
                            <td className="rep-admin-table__name">{r.repartidor}</td>
                            <td>{r.pedidos}</td>
                            <td className="rep-admin-table__done">{r.entregados}</td>
                            <td className={r.pendientes > 0 ? "rep-admin-table__pending" : ""}>
                              {r.pendientes}
                            </td>
                            <td>{r.bultos}</td>
                            <td>
                              <div className="rep-admin-pct">
                                <div className="rep-admin-pct__track">
                                  <div
                                    className="rep-admin-pct__bar"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="rep-admin-pct__label">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
