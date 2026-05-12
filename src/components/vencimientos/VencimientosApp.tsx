// src/components/vencimientos/VencimientosApp.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { toPng } from "html-to-image";
import { supabaseClient } from "../../lib/supabaseClient";

interface Producto {
  CodigoArticulo: string;
  Area: string;
  Ubicacion: string;
  FechaVencimiento: string;
  "Dias para vencer": number;
  Cantidad: number;
  Descripcion: string;
  Lote?: string;
  Contenedor?: string;
}

type Filtro = "todos" | "rojo" | "naranja" | "verde";

const DOMINIO_PERMITIDO = "@alzologistica.com";
const POR_PAGINA = 30;
const MAX_SELECCION = 10;

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

function selKey(p: Producto) {
  return `${p.CodigoArticulo}|${p.FechaVencimiento}`;
}

// ─── Login ────────────────────────────────────────────────
function LoginScreen({ errorDominio }: { errorDominio?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorDominio ?? "");

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    localStorage.setItem("auth_next", window.location.pathname);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { hd: "alzologistica.com", prompt: "select_account" },
      },
    });
    if (error) {
      setError("Error al iniciar sesión. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="venc-login-wrap">
      <div className="venc-login-card">
        <img src="/img/alzo_logo.png" alt="Alzo" className="venc-login-card__logo" />
        <h1>Control de Vencimientos</h1>
        <p>Iniciá sesión con tu cuenta @alzologistica.com</p>

        <button className="venc-btn-google" onClick={handleGoogleLogin} disabled={loading}>
          <svg className="venc-btn-google__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Redirigiendo..." : "Continuar con Google"}
        </button>

        {error && <p className="venc-login-error venc-login-error--visible">{error}</p>}
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

  return (
    <div className="venc-paginador">
      <button
        className="venc-pag-btn venc-pag-btn--nav"
        disabled={pagina === 1}
        onClick={() => onChange(pagina - 1)}
      >
        ← Anterior
      </button>
      <span className="venc-pag-info">
        {pagina} <span className="venc-pag-de">de</span> {totalPags}
      </span>
      <button
        className="venc-pag-btn venc-pag-btn--nav"
        disabled={pagina === totalPags}
        onClick={() => onChange(pagina + 1)}
      >
        Siguiente →
      </button>
    </div>
  );
}

// ─── Imagen exportable ────────────────────────────────────
function ImagenVencimientos({ productos }: { productos: Producto[] }) {
  const borderColor = (p: Producto) => {
    const d = p["Dias para vencer"];
    return d <= 31 ? "#EF4444" : d <= 60 ? "#F59E0B" : "#10B981";
  };

  return (
    <div style={{ width: 660, background: "#fff", fontFamily: "system-ui, -apple-system, sans-serif", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", padding: "22px 28px" }}>
        <div style={{ color: "#fff", fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>Lista de Vencimientos</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 3 }}>
          {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Tabla header */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px", padding: "10px 20px", background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
        {["Código", "Descripción", "Vencimiento"].map((h) => (
          <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{h}</div>
        ))}
      </div>

      {/* Filas */}
      {productos.map((p, i) => (
        <div key={selKey(p)} style={{
          display: "grid",
          gridTemplateColumns: "100px 1fr 110px",
          padding: "13px 20px",
          background: i % 2 === 0 ? "#fff" : "#F8FAFC",
          borderLeft: `4px solid ${borderColor(p)}`,
          borderBottom: "1px solid #F1F5F9",
          alignItems: "center",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e3a8a" }}>{p.CodigoArticulo}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#111827", paddingRight: 12, lineHeight: 1.3 }}>{p.Descripcion}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{formatFecha(p.FechaVencimiento)}</div>
        </div>
      ))}

    </div>
  );
}

// ─── App principal ────────────────────────────────────────
export default function VencimientosApp() {
  const [session, setSession]           = useState<Session | null>(null);
  const [authReady, setAuthReady]       = useState(false);
  const [errorDominio, setErrorDominio] = useState("");
  const [productos, setProductos]       = useState<Producto[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [busqueda, setBusqueda]         = useState("");
  const [filtro, setFiltro]             = useState<Filtro>("todos");
  const [areaFiltro]                    = useState("todas");
  const [pagina, setPagina]             = useState(1);
  const [expandido, setExpandido]       = useState<string | null>(null);

  // Selección
  const [seleccionando, setSeleccionando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [descargando, setDescargando]     = useState(false);
  const imagenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session && !emailPermitido(session.user.email)) {
        supabaseClient.auth.signOut();
        setErrorDominio(`Solo se permiten cuentas ${DOMINIO_PERMITIDO}`);
        setAuthReady(true);
        return;
      }
      setSession(session);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session && !emailPermitido(session.user.email)) {
        supabaseClient.auth.signOut();
        setErrorDominio(`Solo se permiten cuentas ${DOMINIO_PERMITIDO}`);
        setSession(null);
        return;
      }
      setErrorDominio("");
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchProductos();
  }, [session]);

  useEffect(() => { setPagina(1); }, [busqueda, filtro, areaFiltro]);

  function emailPermitido(email?: string | null) {
    return email?.toLowerCase().endsWith(DOMINIO_PERMITIDO) ?? false;
  }

  async function fetchProductos() {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/vencimientos/digip?t=${Date.now()}`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
      setProductos(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    setSession(null);
    setProductos([]);
  }

  function iniciarSeleccion() {
    setExpandido(null);
    setSeleccionados([]);
    setSeleccionando(true);
  }

  function cancelarSeleccion() {
    setSeleccionando(false);
    setSeleccionados([]);
  }

  function toggleSeleccion(p: Producto) {
    const key = selKey(p);
    setSeleccionados((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_SELECCION) return prev;
      return [...prev, key];
    });
  }

  async function descargarImagen() {
    if (!imagenRef.current || seleccionados.length === 0) return;
    setDescargando(true);
    try {
      const dataUrl = await toPng(imagenRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `vencimientos-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // silencioso
    } finally {
      setDescargando(false);
    }
  }

  const vendedor =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email || "";

  const productosFiltrados = useMemo(() => {
    let list = productos;
    if (filtro !== "todos")
      list = list.filter((p) => estadoProducto(p["Dias para vencer"]) === filtro);
    if (areaFiltro !== "todas")
      list = list.filter((p) => p.Area === areaFiltro);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      list = list.filter(
        (p) => p.Descripcion?.toLowerCase().includes(q) || String(p.CodigoArticulo).includes(q)
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

  const productosSeleccionados = useMemo(
    () => productosFiltrados.filter((p) => seleccionados.includes(selKey(p))),
    [productosFiltrados, seleccionados]
  );

  if (!authReady) return null;
  if (!session) return <LoginScreen errorDominio={errorDominio} />;

  const inicio = (pagina - 1) * POR_PAGINA + 1;
  const fin    = Math.min(pagina * POR_PAGINA, productosFiltrados.length);

  return (
    <div className="venc-page">
      {/* Header */}
      <header className="venc-header">
        <div className="venc-header__logo">
          <img src="/img/alzo_logo.png" alt="Alzo" />
          <span>Vencimientos</span>
        </div>
        <div className="venc-header__right">
          {vendedor && (
            <>
              <div className="venc-header__avatar">{vendedor.charAt(0)}</div>
              <span className="venc-header__vendedor">{vendedor}</span>
            </>
          )}
          <button className="venc-header__logout" onClick={handleLogout}>Salir</button>
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

        <button className="venc-refresh-btn" onClick={fetchProductos} title="Actualizar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Actualizar
        </button>

        {!seleccionando && (
          <button className="venc-select-toggle" onClick={iniciarSeleccion}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Seleccionar
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="venc-list-outer">
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
            <div className="venc-card-list">
              {productosFiltrados.length === 0 ? (
                <div className="venc-empty">
                  {productos.length === 0 ? "Sin productos en la base de datos." : "No hay resultados para este filtro."}
                </div>
              ) : (
                paginaActual.map((p, i) => {
                  const estado          = estadoProducto(p["Dias para vencer"]);
                  const rowKey          = `${p.CodigoArticulo}-${i}`;
                  const abierto         = expandido === rowKey;
                  const estaSeleccionado = seleccionados.includes(selKey(p));
                  const maxAlcanzado    = seleccionados.length >= MAX_SELECCION && !estaSeleccionado;
                  const diasLabel =
                    p["Dias para vencer"] < 0
                      ? `Hace ${Math.abs(p["Dias para vencer"])}d`
                      : p["Dias para vencer"] === 0
                      ? "Hoy"
                      : `${p["Dias para vencer"]}d`;

                  return (
                    <div
                      key={rowKey}
                      className={[
                        "venc-card",
                        `venc-card--${estado}`,
                        seleccionando ? "venc-card--selectable" : "",
                        estaSeleccionado ? "venc-card--selected" : "",
                        maxAlcanzado ? "venc-card--disabled" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => {
                        if (seleccionando) {
                          if (!maxAlcanzado) toggleSeleccion(p);
                        } else {
                          setExpandido(abierto ? null : rowKey);
                        }
                      }}
                    >
                      <div className="venc-card__main">
                        {seleccionando && (
                          <div className={`venc-check ${estaSeleccionado ? "venc-check--on" : ""}`}>
                            {estaSeleccionado && (
                              <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            )}
                          </div>
                        )}
                        <span className={`venc-dias-badge venc-dias-badge--${estado}`}>{diasLabel}</span>
                        <div className="venc-card__info">
                          <span className="venc-card__desc">{p.Descripcion}</span>
                          <div className="venc-card__meta">
                            <span className="venc-card__codigo">{p.CodigoArticulo}</span>
                            <span className="venc-card__sep">·</span>
                            <span className="venc-card__fecha">{p.Cantidad} uni</span>
                          </div>
                        </div>
                        <span className="venc-card__cant">{formatFecha(p.FechaVencimiento)}</span>
                      </div>

                      {abierto && !seleccionando && (
                        <div className="venc-card__detail">
                          <div>
                            <span>Vencimiento</span>
                            <strong>{formatFecha(p.FechaVencimiento)}</strong>
                          </div>
                          <div>
                            <span>Días restantes</span>
                            <strong>{diasLabel}</strong>
                          </div>
                          <div>
                            <span>Cantidad</span>
                            <strong>{p.Cantidad}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
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

      {/* Barra flotante de selección */}
      {seleccionando && (
        <div className="venc-sel-bar">
          <button className="venc-sel-bar__cancel" onClick={cancelarSeleccion}>
            Cancelar
          </button>
          <span className="venc-sel-bar__count">
            <strong>{seleccionados.length}</strong>
            <span> / {MAX_SELECCION}</span>
          </span>
          <button
            className="venc-sel-bar__btn"
            disabled={seleccionados.length === 0 || descargando}
            onClick={descargarImagen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {descargando ? "Generando..." : "Descargar"}
          </button>
        </div>
      )}

      {/* Plantilla de imagen (oculta, fuera de pantalla) */}
      <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1 }}>
        <div ref={imagenRef}>
          <ImagenVencimientos productos={productosSeleccionados} />
        </div>
      </div>
    </div>
  );
}
