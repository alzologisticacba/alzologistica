import { useState, useEffect, useRef, useCallback } from "react";
import QrScanner from "qr-scanner";
import { supabaseClient } from "../../lib/supabaseClient";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { getPedidosPorContenedor, getContenedoresDePedido } from "../../lib/digip";

type TipoPatente = "mercosur" | "vieja" | null;

/** Detecta el tipo según el patrón:
 *  Mercosur (2015): LL NNN LL  → 2 letras, 3 dígitos, 2 letras
 *  Vieja    (1994): LLL NNN    → 3 letras, 3 dígitos
 */
function detectTipo(p: string): TipoPatente {
  if (p.length < 2) return null;
  if (/^[A-Z]{2}\d/.test(p)) return "mercosur";
  if (/^[A-Z]{3}/.test(p)) return "vieja";
  return null;
}


/* ── Input con forma de patente ── */
function PlateInput({
  value,
  hasError,
  onChange,
}: {
  value: string;
  hasError: boolean;
  onChange: (v: string) => void;
}) {
  const clean = value.replace(/\s/g, "").toUpperCase();
  const tipo = detectTipo(clean);
  const errorClass = hasError ? " rep-plate--error" : "";

  return (
    <div className={`rep-plate rep-plate--${tipo ?? "neutral"}${errorClass}`}>
      {/* Header — siempre presente, contenido cambia sin remountar el input */}
      <div className="rep-plate__header">
        {tipo === "mercosur" && (
          <>
            <span className="rep-plate__stars">★ ★ ★ ★</span>
            <span className="rep-plate__pais">REPÚBLICA ARGENTINA</span>
            <img src="/img/arg_flag.png" alt="" className="rep-plate__flag"
              onError={(e) => (e.currentTarget.style.display = "none")} />
          </>
        )}
        {tipo === "vieja" && (
          <>
            <img src="/img/arg_escudo.png" alt="" className="rep-plate__escudo"
              onError={(e) => (e.currentTarget.style.display = "none")} />
            <span className="rep-plate__pais">ARGENTINA</span>
          </>
        )}
      </div>

      {/* Input — siempre en la misma posición del DOM → nunca pierde foco */}
      <input
        id="patente"
        type="text"
        className="rep-plate__input"
        placeholder="AA111AA"
        value={value}
        maxLength={10}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />

      {/* Footer */}
      <div className="rep-plate__footer">
        {tipo === "mercosur" && "MERCOSUR"}
      </div>
    </div>
  );
}

interface OperativeSession {
  repartidor: string;
  patente: string;
}

const SESSION_KEY = "reparto_session";

export default function RepartoApp() {
  const [authSession, setAuthSession] = useState<SupabaseSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [opSession, setOpSession] = useState<OperativeSession | null>(null);

  // Supabase Auth
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setAuthSession(data.session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_e, s) => {
      setAuthSession(s);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sesión operativa (patente + repartidor)
  useEffect(() => {
    if (!authSession) return;
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try { setOpSession(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, [authSession]);

  async function handleGoogleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setOpSession(null);
    await supabaseClient.auth.signOut();
  }

  function handleOpLogin(s: OperativeSession) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setOpSession(s);
  }

  function handleOpLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setOpSession(null);
  }

  if (authLoading) return <LoadingScreen />;
  if (!authSession) return <GoogleLoginScreen />;
  if (!opSession) return <LoginScreen onLogin={handleOpLogin} onGoogleLogout={handleGoogleLogout} />;
  return <Dashboard session={opSession} authToken={authSession.access_token} onLogout={handleOpLogout} onGoogleLogout={handleGoogleLogout} />;
}

/* ─────────────────────────────────────────
   LOADING
───────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="rep-login-wrap">
      <span className="rep-spinner" style={{ width: 36, height: 36, borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#fff" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   GOOGLE LOGIN
───────────────────────────────────────── */
function GoogleLoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading(true);
    setError("");
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/reparto` },
    });
    if (error) {
      setError("No se pudo iniciar sesión. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="rep-login-wrap">
      <div className="rep-login-card">
        <img src="/img/alzo_logo.png" alt="Alzo Logística" className="rep-login-card__logo" />
        <p className="rep-login-card__title">Herramienta para reparto</p>

        {error && <p style={{ color: "#fca5a5", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{error}</p>}

        <button className="rep-btn-google" onClick={handleGoogle} disabled={loading}>
          {loading ? (
            <><span className="rep-spinner" />Redirigiendo...</>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
                <path fill="#FBBC05" d="M24 46c5.8 0 10.8-1.9 14.8-5.2l-6.8-5.6C29.9 36.8 27.1 38 24 38c-5.9 0-10.9-3.8-12.7-9.1l-7 5.4C7.9 41.5 15.4 46 24 46z"/>
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.8-2.7 5.1-5.1 6.7l6.8 5.6c4-3.7 6.5-9.2 6.5-16.8 0-1.3-.2-2.7-.5-4z"/>
              </svg>
              Iniciar sesión con Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PANTALLA DE INGRESO
───────────────────────────────────────── */
function LoginScreen({ onLogin, onGoogleLogout }: { onLogin: (s: OperativeSession) => void; onGoogleLogout: () => void }) {
  const [patente, setPatente] = useState("");
  const [repartidor, setRepartidor] = useState("");
  const [repartidores, setRepartidores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");
  const [patenteError, setPatenteError] = useState(false);
  const [selectError, setSelectError] = useState(false);

  useEffect(() => {
    supabaseClient
      .from("repartidores")
      .select("repartidor")
      .order("repartidor", { ascending: true })
      .then(({ data }) => {
        setRepartidores(data?.map((r) => r.repartidor) ?? []);
        setLoadingOptions(false);
      });
  }, []);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPatenteError(false);
    setSelectError(false);

    const patenteClean = patente.trim().replace(/\s+/g, "").toUpperCase();

    if (!patenteClean) {
      setPatenteError(true);
      setError("Ingresá el número de patente.");
      return;
    }
    if (!repartidor) {
      setSelectError(true);
      setError("Seleccioná tu perfil.");
      return;
    }

    setLoading(true);
    const { data } = await supabaseClient
      .from("patentes")
      .select("nroPatente")
      .eq("nroPatente", patenteClean)
      .maybeSingle();
    setLoading(false);

    if (!data) {
      setPatenteError(true);
      setError("Patente no encontrada. Verificá el número ingresado.");
      return;
    }

    onLogin({ repartidor, patente: patenteClean });
  }

  return (
    <div className="rep-login-wrap">
      <div className="rep-login-card">
        <img
          src="/img/alzo_logo.png"
          alt="Alzo Logística"
          className="rep-login-card__logo"
        />
        <p className="rep-login-card__title">Herramienta para reparto</p>

        <form className="rep-form" onSubmit={handleSubmit} noValidate>
          {/* Patente */}
          <div className="rep-field">
            <label className="rep-label" htmlFor="patente">
              Número de patente
            </label>
            <PlateInput
              value={patente}
              hasError={patenteError}
              onChange={(v) => {
                setPatenteError(false);
                setError("");
                setPatente(v);
              }}
            />
          </div>

          {/* Repartidor */}
          <div className="rep-field">
            <label className="rep-label" htmlFor="repartidor">
              Seleccioná tu perfil
            </label>
            <div className="rep-select-wrap">
              <select
                id="repartidor"
                className={`rep-select${selectError ? " rep-select--error" : ""}`}
                value={repartidor}
                disabled={loadingOptions}
                onChange={(e) => {
                  setSelectError(false);
                  setError("");
                  setRepartidor(e.target.value);
                }}
              >
                <option value="">
                  {loadingOptions ? "Cargando..." : "Seleccioná tu perfil"}
                </option>
                {repartidores.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {/* Ícono chevron */}
              <svg
                className="rep-select-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Error */}
          <p className="rep-error-msg">{error}</p>

          {/* Botón */}
          <button
            type="submit"
            className="rep-btn-ingresar"
            disabled={loading}
          >
            {loading && <span className="rep-spinner" />}
            {loading ? "Verificando..." : "Ingresar"}
          </button>

          <button type="button" className="rep-btn-salir-google" onClick={onGoogleLogout}>
            Cerrar sesión de Google
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   LECTOR QR
───────────────────────────────────────── */
function QrReader({ onResult }: { onResult: (contenedor: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    scannerRef.current?.stop();
    scannerRef.current?.destroy();
    scannerRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => () => { stop(); }, [stop]);

  // Inicia el scanner cuando el video ya está en el DOM
  useEffect(() => {
    if (!active || !videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        onResult(result.data);
        stop();
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
      }
    );

    scannerRef.current = scanner;
    scanner.start().catch(() => {
      setError("No se pudo acceder a la cámara. Verificá los permisos.");
      setActive(false);
    });

    return () => { scanner.stop(); scanner.destroy(); };
  }, [active, onResult, stop]);

  return (
    <div className="rep-qr-wrap">
      {!active ? (
        <button className="rep-qr-btn" onClick={() => { setError(""); setActive(true); }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h2v2h-2zM14 18h2v2h-2zM18 14h2v2h-2zM18 18h2v2h-2z" />
          </svg>
          Escanear contenedor
        </button>
      ) : (
        <div className="rep-qr-scanner">
          <div className="rep-qr-viewfinder">
            <video ref={videoRef} className="rep-qr-video" />
            <div className="rep-scan-zone rep-scan-zone--square">
              <div className="rep-scan-zone__corner rep-scan-zone__corner--tl" />
              <div className="rep-scan-zone__corner rep-scan-zone__corner--tr" />
              <div className="rep-scan-zone__corner rep-scan-zone__corner--bl" />
              <div className="rep-scan-zone__corner rep-scan-zone__corner--br" />
              <div className="rep-scan-zone__line" />
            </div>
          </div>
          <p className="rep-qr-hint">Apuntá al código QR del contenedor</p>
          <button className="rep-qr-cancel" onClick={stop}>Cancelar</button>
        </div>
      )}
      {error && <p className="rep-error-msg" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD (post-login)
───────────────────────────────────────── */
function Dashboard({
  session,
  authToken,
  onLogout,
  onGoogleLogout,
}: {
  session: OperativeSession;
  authToken: string;
  onLogout: () => void;
  onGoogleLogout: () => void;
}) {
  const [bultos, setBultos] = useState<number | null>(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [apiError, setApiError] = useState("");

  async function handleScan(contenedor: string) {
    setBultos(null);
    setApiError("");
    setLoadingApi(true);
    try {
      // 1. Obtener el código del pedido por contenedor
      const pedidos = await getPedidosPorContenedor(contenedor, authToken);
      const lista = Array.isArray(pedidos) ? pedidos : [pedidos];
      const codigo = lista[0]?.Codigo;
      if (!codigo) throw new Error("No se encontró un pedido para este contenedor.");

      // 2. Obtener los contenedores del pedido y sumar bultos
      const contenedores = await getContenedoresDePedido(codigo, authToken);
      const totalBultos = Array.isArray(contenedores)
        ? contenedores.reduce((sum, c) => sum + (c.CantidadBulto ?? 0), 0)
        : (contenedores as { CantidadBulto?: number }).CantidadBulto ?? 0;

      setBultos(totalBultos);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Error al consultar el WMS");
    }
    setLoadingApi(false);
  }

  return (
    <div className="rep-page">
      <header className="rep-header">
        <div className="rep-header__logo">
          <img src="/img/alzo_logo.png" alt="Alzo" />
          <span>Reparto</span>
          <span className="rep-header__badge">Beta</span>
        </div>
        <div className="rep-header__right">
          <div className="rep-header__info">
            {session.repartidor}
            <small>Patente: {session.patente}</small>
          </div>
          <button className="rep-header__logout" onClick={onLogout} title="Cambiar patente/perfil">
            Cambiar
          </button>
          <button className="rep-header__logout" onClick={onGoogleLogout} title="Cerrar sesión">
            Salir
          </button>
        </div>
      </header>

      <main className="rep-main">
        <div className="rep-welcome">
          <h1 className="rep-welcome__title">
            Bienvenido, {session.repartidor.split(" ")[0]}
          </h1>
          <p className="rep-welcome__sub">Patente: {session.patente}</p>
        </div>

        <section className="rep-section">
          <h2 className="rep-section__title">Escanear contenedor</h2>
          <QrReader onResult={handleScan} />

          {loadingApi && (
            <div className="rep-ocr-processing" style={{ paddingTop: 20 }}>
              <span className="rep-spinner" style={{ borderColor: "#dbeafe", borderTopColor: "#2556ff" }} />
              <p>Consultando WMS...</p>
            </div>
          )}

          {!loadingApi && apiError && (
            <p className="rep-error-msg" style={{ marginTop: 16 }}>{apiError}</p>
          )}

          {!loadingApi && bultos !== null && (
            <div className="rep-scan-result" style={{ marginTop: 20 }}>
              <p className="rep-scan-result__label">Cantidad de bultos</p>
              <p className="rep-scan-result__value" style={{ fontSize: 32, fontWeight: 900 }}>
                {bultos}
              </p>
              <button className="rep-scan-result__clear" onClick={() => setBultos(null)}>
                Limpiar
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
