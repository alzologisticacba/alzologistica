// src/components/vencimientos/VencimientosApp.tsx
import { useState, useEffect, useMemo } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

interface Producto {
  CodigoArticulo: number;
  Area: string;
  Ubicacion: string;
  FechaVencimiento: string;
  "Dias para vencer": number;
  Cantidad: number;
  Descripcion: string;
}

type Filtro = "todos" | "rojo" | "naranja" | "verde";

const SESSION_KEY  = "venc_auth";
const DIAS_PROXIMO = 30;
const POR_PAGINA   = 30;

function estadoProducto(dias: number): "rojo" | "naranja" | "verde" {
  if (dias <= 31) return "rojo";
  if (dias <= 60) return "naranja";
  return "verde";
}

function formatFecha(f: string): string {
  if (!f) return "—";
  if (f.includes("/")) return f;
  const [y, m, d] = f.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

// ─── Login ────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (nombre: string) => void }) {
  const [codigo, setCodigo]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    setLoading(true);
    setError("");
    try {
      const codigoNum = Number(codigo.trim());
      if (isNaN(codigoNum)) throw new Error("invalid");

      const { data, error } = await supabaseClient
        .from("vendedores")
        .select("nombre")
        .eq("codigoVendedor", codigoNum)
        .maybeSingle();

      if (error || !data) {
        setError("Código incorrecto. Intentá de nuevo.");
        setCodigo("");
        setTimeout(() => setError(""), 2000);
      } else {
        sessionStorage.setItem(SESSION_KEY, "1");
        onLogin(data.nombre ?? "");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="venc-login-wrap">
      <div className="venc-login-card">
        <img src="/img/247/logoAlzo247.png" alt="Alzo" className="venc-login-card__logo" />
        <h1>Control de Vencimientos</h1>
        <p>Ingresá tu código de vendedor para continuar</p>
        <form className="venc-login-form" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="venc-input-label" htmlFor="codigo">Código de vendedor</label>
            <input
              id="codigo"
              className={`venc-input${error ? " venc-input--error" : ""}`}
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="••••"
              autoFocus
              disabled={loading}
            />
          </div>
          <p className="venc-login-error">{error || "\u00a0"}</p>
          <button type="submit" className="venc-btn-login" disabled={loading}>
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Paginador ────────────────────────────────────────────
function Paginador({
  pagina, total, porPagina, onChange,
}: { pagina: number; total: number; porPagina: number; onChange: (p: number) => void }) {
  const totalPags = Math.ceil(total / porPagina);
  if (totalPags <= 1) return null;

  // Genera rango de páginas visibles (máx 5 botones)
  function rango(): (number | "…")[] {
    if (totalPags <= 5) return Array.from({ length: totalPags }, (_, i) => i + 1);
    const items: (number | "…")[] = [1];
    if (pagina > 3) items.push("…");
    for (let i = Math.max(2, pagina - 1); i <= Math.min(totalPags - 1, pagina + 1); i++) items.push(i);
    if (pagina < totalPags - 2) items.push("…");
    items.push(totalPags);
    return items;
  }

  return (
    <div className="venc-paginador">
      <button
        className="venc-pag-btn"
        disabled={pagina === 1}
        onClick={() => onChange(pagina - 1)}
        aria-label="Anterior"
      >
        ←
      </button>

      {rango().map((item, i) =>
        item === "…" ? (
          <span key={`dots-${i}`} className="venc-pag-dots">…</span>
        ) : (
          <button
            key={item}
            className={`venc-pag-btn ${pagina === item ? "active" : ""}`}
            onClick={() => onChange(item as number)}
          >
            {item}
          </button>
        )
      )}

      <button
        className="venc-pag-btn"
        disabled={pagina === totalPags}
        onClick={() => onChange(pagina + 1)}
        aria-label="Siguiente"
      >
        →
      </button>
    </div>
  );
}

// ─── App principal ────────────────────────────────────────
export default function VencimientosApp() {
  const [autenticado, setAutenticado] = useState(false);
  const [vendedor, setVendedor]       = useState("");
  const [productos, setProductos]     = useState<Producto[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [busqueda, setBusqueda]       = useState("");
  const [filtro, setFiltro]           = useState<Filtro>("todos");
  const [areaFiltro, setAreaFiltro]   = useState("todas");
  const [pagina, setPagina]           = useState(1);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAutenticado(true);
  }, []);

  useEffect(() => {
    if (autenticado) fetchProductos();
  }, [autenticado]);

  // Resetear página al cambiar filtros
  useEffect(() => { setPagina(1); }, [busqueda, filtro, areaFiltro]);

  async function fetchProductos() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabaseClient
        .from("vencimientos")
        .select(`CodigoArticulo, Area, Ubicacion, FechaVencimiento, "Dias para vencer", Cantidad, Descripcion`)
        .order("Dias para vencer", { ascending: true });

      if (error) throw new Error(error.message);
      setProductos(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAutenticado(false);
    setProductos([]);
  }

  const areas = useMemo(() => {
    const set = new Set(productos.map((p) => p.Area).filter(Boolean));
    return Array.from(set).sort();
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let list = productos;
    if (filtro !== "todos")
      list = list.filter((p) => estadoProducto(p["Dias para vencer"]) === filtro);
    if (areaFiltro !== "todas")
      list = list.filter((p) => p.Area === areaFiltro);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.Descripcion?.toLowerCase().includes(q) ||
          String(p.CodigoArticulo).includes(q)
      );
    }
    return list;
  }, [productos, filtro, areaFiltro, busqueda]);

  const paginaActual = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA;
    return productosFiltrados.slice(inicio, inicio + POR_PAGINA);
  }, [productosFiltrados, pagina]);

  const stats = useMemo(() => ({
    rojo: productos.filter((p) => estadoProducto(p["Dias para vencer"]) === "rojo").length,
  }), [productos]);

  if (!autenticado) return (
    <LoginScreen onLogin={(nombre) => { setAutenticado(true); setVendedor(nombre); }} />
  );

  const totalPags = Math.ceil(productosFiltrados.length / POR_PAGINA);
  const inicio    = (pagina - 1) * POR_PAGINA + 1;
  const fin       = Math.min(pagina * POR_PAGINA, productosFiltrados.length);

  return (
    <div className="venc-page">
      {/* Header */}
      <header className="venc-header">
        <div className="venc-header__logo">
          <img src="/img/247/logoAlzo247.png" alt="Alzo" />
          <span>Vencimientos</span>
        </div>
        <div className="venc-header__right">
          {vendedor && <span className="venc-header__vendedor">{vendedor}</span>}
          <button className="venc-header__logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="venc-hero">
        <h1 className="venc-hero__title">Vencimientos</h1>
        <div className="venc-hero__search-wrap">
          <svg className="venc-hero__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="venc-hero__search"
            type="search"
            placeholder="Buscar productos"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Controles */}
      <div className="venc-controls">
        <button
          className={`venc-chip-30 ${filtro === "rojo" ? "active" : ""}`}
          onClick={() => setFiltro(filtro === "rojo" ? "todos" : "rojo")}
        >
          <span className="venc-chip-30__num">{stats.rojo}</span>
          <span className="venc-chip-30__label">Menos de 31 días</span>
        </button>

        <select
          className="venc-select"
          value={areaFiltro}
          onChange={(e) => setAreaFiltro(e.target.value)}
        >
          <option value="todas">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <button className="venc-refresh-btn" onClick={fetchProductos} title="Actualizar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Actualizar
        </button>
      </div>

      {/* Contenido */}
      <div className="venc-table-outer">
        {loading && (
          <div className="venc-loading">
            <div className="venc-spinner" />
            <span>Cargando productos...</span>
          </div>
        )}

        {error && (
          <div className="venc-error">
            <strong>Error:</strong> {error}
            <button onClick={fetchProductos}>Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="venc-table-wrap">
              {productosFiltrados.length === 0 ? (
                <div className="venc-empty">
                  {productos.length === 0 ? "Sin productos en la base de datos." : "No hay resultados para este filtro."}
                </div>
              ) : (
                <table className="venc-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th className="venc-th-fecha">Vencimiento</th>
                      <th>Días</th>
                      <th className="venc-th-cant">Cant.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginaActual.map((p, i) => {
                      const estado = estadoProducto(p["Dias para vencer"]);
                      return (
                        <tr key={`${p.CodigoArticulo}-${i}`} data-estado={estado}>
                          <td className="venc-td-codigo">{p.CodigoArticulo}</td>
                          <td className="venc-td-desc">{p.Descripcion}</td>
                          <td className="venc-td-fecha venc-th-fecha">{formatFecha(p.FechaVencimiento)}</td>
                          <td className="venc-td-dias">
                            <span className={`venc-dias-badge venc-dias-badge--${estado}`}>
                              {p["Dias para vencer"] < 0
                                ? `Hace ${Math.abs(p["Dias para vencer"])}d`
                                : p["Dias para vencer"] === 0
                                ? "Hoy"
                                : `${p["Dias para vencer"]}d`}
                            </span>
                          </td>
                          <td className="venc-td-cant venc-th-cant">{p.Cantidad}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {productosFiltrados.length > 0 && (
              <div className="venc-footer-bar">
                <span className="venc-footer-info">
                  {inicio}–{fin} de {productosFiltrados.length} productos
                </span>
                <Paginador
                  pagina={pagina}
                  total={productosFiltrados.length}
                  porPagina={POR_PAGINA}
                  onChange={(p) => { setPagina(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
