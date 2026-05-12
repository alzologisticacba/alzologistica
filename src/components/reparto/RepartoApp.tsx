import { useState, useEffect, useRef, useCallback } from "react";
import QrScanner from "qr-scanner";
import { supabaseClient } from "../../lib/supabaseClient";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { getPedidosPorContenedor, getContenedoresDePedido, getCliente } from "../../lib/digip";
import AdminDashboard from "./AdminDashboard";

type TipoPatente = "mercosur" | "vieja" | null;

function detectTipo(p: string): TipoPatente {
  if (p.length < 2) return null;
  if (/^[A-Z]{2}\d/.test(p)) return "mercosur";
  if (/^[A-Z]{3}/.test(p)) return "vieja";
  return null;
}

function fechaArgentina(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
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
      <div className="rep-plate__footer">
        {tipo === "mercosur" && "MERCOSUR"}
      </div>
    </div>
  );
}

interface OperativeSession {
  repartidor: string;
  patente: string;
  sesionId: string;
}

interface ItemReparto {
  id: string;
  contenedor: string;
  codigo_pedido: string;
  codigo_cliente: string;
  cliente_nombre: string;
  cant_bultos: number;
  estado: "pendiente" | "entregado";
  hora_carga: string;
  hora_egreso: string | null;
}

interface BultoMode {
  contenedor: string;
  clienteNombre: string;
  totalBultos: number;
  escaneados: number;
  tipo: "carga" | "entrega";
  item?: ItemReparto;
  codigoPedido?: string;
  codigoCliente?: string;
}

type FeedbackTipo = "ok" | "warn" | "error";

const SESSION_KEY = "reparto_session";

/* ─────────────────────────────────────────
   ROOT
───────────────────────────────────────── */
export default function RepartoApp() {
  const [authSession, setAuthSession] = useState<SupabaseSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [role, setRole] = useState<"admin" | "repartidor" | null>(null);
  const [opSession, setOpSession] = useState<OperativeSession | null>(null);

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

  useEffect(() => {
    if (!authSession) return;

    setCheckingAdmin(true);
    supabaseClient
      .from("admins")
      .select("email")
      .eq("email", authSession.user.email ?? "")
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data);
        setCheckingAdmin(false);
      });

    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.sesionId) {
          sessionStorage.removeItem(SESSION_KEY);
          return;
        }
        setOpSession(parsed);
      } catch { /* ignore */ }
    }
  }, [authSession]);

  async function handleGoogleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setOpSession(null);
    setRole(null);
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

  if (authLoading || checkingAdmin) return <LoadingScreen />;
  if (!authSession) return <GoogleLoginScreen />;
  if (isAdmin && !role) return <RoleSelector onSelect={setRole} onGoogleLogout={handleGoogleLogout} />;
  if (role === "admin") return <AdminDashboard authSession={authSession} onBack={() => setRole(null)} onGoogleLogout={handleGoogleLogout} />;
  if (!opSession) return <LoginScreen onLogin={handleOpLogin} onGoogleLogout={handleGoogleLogout} />;
  return <Dashboard session={opSession} authToken={authSession.access_token} onLogout={handleOpLogout} onGoogleLogout={handleGoogleLogout} />;
}

/* ─────────────────────────────────────────
   SELECTOR DE ROL
───────────────────────────────────────── */
function RoleSelector({ onSelect, onGoogleLogout }: { onSelect: (role: "admin" | "repartidor") => void; onGoogleLogout: () => void }) {
  return (
    <div className="rep-login-wrap">
      <div className="rep-login-card">
        <img src="/img/alzo_logo.png" alt="Alzo Logística" className="rep-login-card__logo" />
        <p className="rep-login-card__title">¿Cómo querés ingresar?</p>

        <div className="rep-role-btns">
          <button className="rep-role-btn" onClick={() => onSelect("admin")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="rep-role-btn__title">Administrador</span>
            <span className="rep-role-btn__sub">Estadísticas y control</span>
          </button>

          <button className="rep-role-btn" onClick={() => onSelect("repartidor")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span className="rep-role-btn__title">Repartidor</span>
            <span className="rep-role-btn__sub">Control de ruta</span>
          </button>
        </div>

        <button type="button" className="rep-btn-salir-google" onClick={onGoogleLogout}>
          Cerrar sesión de Google
        </button>
      </div>
    </div>
  );
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
    localStorage.setItem("auth_next", "/reparto");
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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

    // Verificar patente
    const { data: patenteData } = await supabaseClient
      .from("patentes")
      .select("nroPatente")
      .eq("nroPatente", patenteClean)
      .maybeSingle();

    if (!patenteData) {
      setPatenteError(true);
      setError("Patente no encontrada. Verificá el número ingresado.");
      setLoading(false);
      return;
    }

    // Verificar o crear sesión del día
    const hoy = fechaArgentina();
    const { data: sesionExistente } = await supabaseClient
      .from("sesiones_reparto")
      .select("id, patente")
      .eq("repartidor", repartidor)
      .eq("fecha", hoy)
      .maybeSingle();

    let sesionId: string;

    if (sesionExistente) {
      if (sesionExistente.patente !== patenteClean) {
        setError(`${repartidor} ya tiene una sesión activa hoy con la patente ${sesionExistente.patente}.`);
        setLoading(false);
        return;
      }
      sesionId = sesionExistente.id;
    } else {
      const { data: nueva, error: insertError } = await supabaseClient
        .from("sesiones_reparto")
        .insert({ fecha: hoy, repartidor, patente: patenteClean })
        .select("id")
        .single();

      if (insertError || !nueva) {
        setError("Error al crear la sesión. Intentá de nuevo.");
        setLoading(false);
        return;
      }
      sesionId = nueva.id;
    }

    setLoading(false);
    onLogin({ repartidor, patente: patenteClean, sesionId });
  }

  return (
    <div className="rep-login-wrap">
      <div className="rep-login-card">
        <img src="/img/alzo_logo.png" alt="Alzo Logística" className="rep-login-card__logo" />
        <p className="rep-login-card__title">Herramienta para reparto</p>

        <form className="rep-form" onSubmit={handleSubmit} noValidate>
          <div className="rep-field">
            <label className="rep-label" htmlFor="patente">Número de patente</label>
            <PlateInput
              value={patente}
              hasError={patenteError}
              onChange={(v) => { setPatenteError(false); setError(""); setPatente(v); }}
            />
          </div>

          <div className="rep-field">
            <label className="rep-label" htmlFor="repartidor">Seleccioná tu perfil</label>
            <div className="rep-select-wrap">
              <select
                id="repartidor"
                className={`rep-select${selectError ? " rep-select--error" : ""}`}
                value={repartidor}
                disabled={loadingOptions}
                onChange={(e) => { setSelectError(false); setError(""); setRepartidor(e.target.value); }}
              >
                <option value="">{loadingOptions ? "Cargando..." : "Seleccioná tu perfil"}</option>
                {repartidores.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <svg className="rep-select-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <p className="rep-error-msg">{error}</p>

          <button type="submit" className="rep-btn-ingresar" disabled={loading}>
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
function QrReader({ onResult, autoOpen = false }: { onResult: (contenedor: string) => void; autoOpen?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const handledRef = useRef(false);
  const [active, setActive] = useState(autoOpen);
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    scannerRef.current?.stop();
    scannerRef.current?.destroy();
    scannerRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => () => { stop(); }, [stop]);

  useEffect(() => {
    if (!active) { handledRef.current = false; return; }
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (handledRef.current) return;
        handledRef.current = true;
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
            <video ref={videoRef} className="rep-qr-video" autoPlay playsInline muted />
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
   FINALIZAR DÍA
───────────────────────────────────────── */
function FinalizarScreen({
  session,
  items,
  onCancel,
  onConfirm,
}: {
  session: OperativeSession;
  items: ItemReparto[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const entregados = items.filter((i) => i.estado === "entregado");
  const pendientes = items.filter((i) => i.estado === "pendiente");
  const bultosEntregados = entregados.reduce((sum, i) => sum + i.cant_bultos, 0);
  const totalBultos = items.reduce((sum, i) => sum + i.cant_bultos, 0);

  return (
    <div className="rep-finalizar-overlay">
      <div className="rep-finalizar-card">
        <div className="rep-finalizar-header">
          <p className="rep-finalizar-fecha">{new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Argentina/Buenos_Aires" })}</p>
          <h2 className="rep-finalizar-title">Resumen del día</h2>
          <p className="rep-finalizar-sub">{session.repartidor} · Patente {session.patente}</p>
        </div>

        <div className="rep-finalizar-stats">
          <div className="rep-finalizar-stat">
            <span className="rep-finalizar-stat__num rep-finalizar-stat__num--done">{entregados.length}</span>
            <span className="rep-finalizar-stat__label">Entregados</span>
          </div>
          <div className="rep-finalizar-stat">
            <span className={`rep-finalizar-stat__num${pendientes.length > 0 ? " rep-finalizar-stat__num--pending" : ""}`}>{pendientes.length}</span>
            <span className="rep-finalizar-stat__label">Pendientes</span>
          </div>
          <div className="rep-finalizar-stat">
            <span className="rep-finalizar-stat__num">{totalBultos}</span>
            <span className="rep-finalizar-stat__label">Bultos totales</span>
          </div>
          <div className="rep-finalizar-stat">
            <span className="rep-finalizar-stat__num rep-finalizar-stat__num--done">{bultosEntregados}</span>
            <span className="rep-finalizar-stat__label">Bultos entregados</span>
          </div>
        </div>

        {pendientes.length > 0 && (
          <div className="rep-finalizar-warning">
            ⚠️ Quedan {pendientes.length} pedido{pendientes.length !== 1 ? "s" : ""} sin entregar
          </div>
        )}

        <div className="rep-finalizar-actions">
          <button className="rep-btn-confirmar-finalizar" onClick={onConfirm}>
            Confirmar y finalizar día
          </button>
          <button className="rep-btn-volver" onClick={onCancel}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ITEM CARD
───────────────────────────────────────── */
function ItemCard({
  item,
  onEntregar,
  isDeliveryTarget,
  onCancelDelivery,
  onCancelEntrega,
}: {
  item: ItemReparto;
  onEntregar: () => void;
  isDeliveryTarget: boolean;
  onCancelDelivery: () => void;
  onCancelEntrega: () => void;
}) {
  const entregado = item.estado === "entregado";
  return (
    <div className={`rep-item-card${entregado ? " rep-item-card--entregado" : ""}${isDeliveryTarget ? " rep-item-card--scanning" : ""}`}>
      <div className="rep-item-card__header">
        <span className="rep-item-card__cliente">{item.cliente_nombre}</span>
        <span className={`rep-badge rep-badge--${item.estado}`}>
          {entregado ? "Entregado" : isDeliveryTarget ? "Escaneando..." : "Pendiente"}
        </span>
      </div>
      <div className="rep-item-card__body">
        <span className="rep-item-card__detail">
          <span className="rep-item-card__detail-label">Pedido</span>
          {item.codigo_pedido}
        </span>
        <span className="rep-item-card__detail">
          <span className="rep-item-card__detail-label">Bultos</span>
          {item.cant_bultos}
        </span>
      </div>
      {entregado ? (
        <div className="rep-item-card__footer rep-item-card__footer--entregado">
          {item.hora_egreso && (
            <span className="rep-item-card__hora">✓ Entregado a las {horaCorta(item.hora_egreso)}</span>
          )}
          <button className="rep-btn-cancelar-entrega-sm" onClick={onCancelEntrega}>
            Cancelar entrega
          </button>
        </div>
      ) : isDeliveryTarget ? (
        <button className="rep-btn-cancelar-entrega" onClick={onCancelDelivery}>
          Cancelar entrega
        </button>
      ) : (
        <button className="rep-btn-entregar-full" onClick={onEntregar}>
          Entregar
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD
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
  const [items, setItems] = useState<ItemReparto[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingApi, setLoadingApi] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; tipo: FeedbackTipo } | null>(null);
  const [deliveryTarget, setDeliveryTarget] = useState<ItemReparto | null>(null);
  const [bultoMode, setBultoMode] = useState<BultoMode | null>(null);
  const [scannerKey, setScannerKey] = useState(0);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scannerSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    supabaseClient
      .from("items_reparto")
      .select("*")
      .eq("sesion_id", session.sesionId)
      .order("hora_carga", { ascending: true })
      .then(({ data }) => {
        setItems((data as ItemReparto[]) ?? []);
        setLoadingItems(false);
      });
  }, [session.sesionId]);

  function showFeedback(msg: string, tipo: FeedbackTipo) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ msg, tipo });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
  }

  async function cancelarEntrega(item: ItemReparto) {
    const { error } = await supabaseClient
      .from("items_reparto")
      .update({ estado: "pendiente", hora_egreso: null })
      .eq("id", item.id);
    if (!error) {
      setItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, estado: "pendiente", hora_egreso: null } : i)
      );
      showFeedback(`Entrega cancelada: ${item.cliente_nombre}`, "warn");
    }
  }

  async function marcarEntregado(item: ItemReparto) {
    const horaEgreso = new Date().toISOString();
    const { error } = await supabaseClient
      .from("items_reparto")
      .update({ estado: "entregado", hora_egreso: horaEgreso })
      .eq("id", item.id);
    if (!error) {
      setItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, estado: "entregado", hora_egreso: horaEgreso } : i)
      );
      showFeedback(`Entregado: ${item.cliente_nombre}`, "ok");
    }
  }

  function scrollToScanner() {
    setTimeout(() => {
      scannerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleEntregarClick(item: ItemReparto) {
    setDeliveryTarget(item);
    setBultoMode(null);
    setScannerKey((k) => k + 1);
    scrollToScanner();
  }

  async function handleScan(contenedor: string) {
    // ── MODO BULTOS (escaneo uno por uno) ──
    if (bultoMode) {
      if (contenedor !== bultoMode.contenedor) {
        showFeedback(`Bulto incorrecto. Escaneá uno de ${bultoMode.clienteNombre}.`, "error");
        setScannerKey((k) => k + 1);
        return;
      }

      const siguiente = bultoMode.escaneados + 1;

      if (siguiente < bultoMode.totalBultos) {
        setBultoMode((prev) => prev ? { ...prev, escaneados: siguiente } : null);
        setTimeout(() => setScannerKey((k) => k + 1), 1500);
        return;
      }

      // ¡Todos los bultos escaneados!
      const modoFinal = bultoMode;
      setBultoMode(null);
      setLoadingApi(true);
      try {
        if (modoFinal.tipo === "carga") {
          const { data: nuevo, error: insertError } = await supabaseClient
            .from("items_reparto")
            .insert({
              sesion_id: session.sesionId,
              contenedor: modoFinal.contenedor,
              codigo_pedido: modoFinal.codigoPedido!,
              codigo_cliente: modoFinal.codigoCliente!,
              cliente_nombre: modoFinal.clienteNombre,
              cant_bultos: modoFinal.totalBultos,
              estado: "pendiente",
            })
            .select()
            .single();
          if (!insertError && nuevo) {
            setItems((prev) => [...prev, nuevo as ItemReparto]);
            showFeedback(`✓ ${modoFinal.clienteNombre} — ${modoFinal.totalBultos} bultos cargados`, "ok");
          }
        } else if (modoFinal.item) {
          await marcarEntregado(modoFinal.item);
        }
      } catch {
        showFeedback("Error al guardar. Intentá de nuevo.", "error");
      }
      setLoadingApi(false);
      return;
    }

    // ── MODO ENTREGA (primer escaneo identifica el contenedor) ──
    if (deliveryTarget) {
      if (contenedor !== deliveryTarget.contenedor) {
        showFeedback(`Contenedor incorrecto para ${deliveryTarget.cliente_nombre}.`, "error");
        setDeliveryTarget(null);
        return;
      }
      setDeliveryTarget(null);
      if (deliveryTarget.cant_bultos <= 1) {
        await marcarEntregado(deliveryTarget);
      } else {
        setBultoMode({
          contenedor,
          clienteNombre: deliveryTarget.cliente_nombre,
          totalBultos: deliveryTarget.cant_bultos,
          escaneados: 1,
          tipo: "entrega",
          item: deliveryTarget,
        });
        setScannerKey((k) => k + 1);
      }
      return;
    }

    // ── ESCANEO NORMAL ──
    const existing = items.find((i) => i.contenedor === contenedor);
    if (existing) {
      if (existing.estado === "entregado") {
        showFeedback(`Ya estaba entregado: ${existing.cliente_nombre}`, "warn");
        return;
      }
      // Re-escaneo de un pendiente → inicia entrega por bultos
      if (existing.cant_bultos <= 1) {
        await marcarEntregado(existing);
      } else {
        setBultoMode({
          contenedor,
          clienteNombre: existing.cliente_nombre,
          totalBultos: existing.cant_bultos,
          escaneados: 1,
          tipo: "entrega",
          item: existing,
        });
        setScannerKey((k) => k + 1);
      }
      return;
    }

    // ── CONTENEDOR NUEVO → consulta WMS ──
    setLoadingApi(true);
    try {
      const pedidos = await getPedidosPorContenedor(contenedor, authToken);
      const lista = Array.isArray(pedidos) ? pedidos : [pedidos];
      const pedido = lista[0];
      if (!pedido?.Codigo) throw new Error("No se encontró un pedido para este contenedor.");

      const [contenedoresResult, clienteResult] = await Promise.allSettled([
        getContenedoresDePedido(pedido.Codigo, authToken),
        getCliente(pedido.CodigoClienteUbicacion, authToken),
      ]);

      const contenedoresList = contenedoresResult.status === "fulfilled" ? contenedoresResult.value : [];
      const clienteNombre = clienteResult.status === "fulfilled"
        ? clienteResult.value.Descripcion
        : pedido.CodigoClienteUbicacion;
      const totalBultos = Array.isArray(contenedoresList)
        ? contenedoresList.reduce((sum, c) => sum + (c.CantidadBulto ?? 0), 0)
        : 0;

      setLoadingApi(false);

      if (totalBultos <= 1) {
        const { data: nuevo, error: insertError } = await supabaseClient
          .from("items_reparto")
          .insert({
            sesion_id: session.sesionId,
            contenedor,
            codigo_pedido: pedido.Codigo,
            codigo_cliente: pedido.CodigoClienteUbicacion,
            cliente_nombre: clienteNombre,
            cant_bultos: totalBultos,
            estado: "pendiente",
          })
          .select()
          .single();
        if (!insertError && nuevo) {
          setItems((prev) => [...prev, nuevo as ItemReparto]);
          showFeedback(`Cargado: ${clienteNombre} — 1 bulto`, "ok");
        }
      } else {
        setBultoMode({
          contenedor,
          clienteNombre,
          totalBultos,
          escaneados: 1,
          tipo: "carga",
          codigoPedido: pedido.Codigo,
          codigoCliente: pedido.CodigoClienteUbicacion,
        });
        setScannerKey((k) => k + 1);
      }
    } catch (e) {
      setLoadingApi(false);
      showFeedback(e instanceof Error ? e.message : "Error al consultar el WMS", "error");
    }
  }

  const pendientes = items.filter((i) => i.estado === "pendiente");
  const entregados = items.filter((i) => i.estado === "entregado");
  const totalBultos = items.reduce((sum, i) => sum + i.cant_bultos, 0);

  return (
    <div className="rep-page">
      <header className="rep-header">
        <div className="rep-header__logo">
          <img src="/img/alzo_logo.png" alt="Alzo" />
          <span>Reparto</span>
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
        {/* Resumen del día */}
        <div className="rep-summary">
          <div className="rep-summary__card">
            <span className="rep-summary__num">{items.length}</span>
            <span className="rep-summary__label">Pedidos</span>
          </div>
          <div className="rep-summary__card">
            <span className="rep-summary__num rep-summary__num--pending">{pendientes.length}</span>
            <span className="rep-summary__label">Pendientes</span>
          </div>
          <div className="rep-summary__card">
            <span className="rep-summary__num rep-summary__num--done">{entregados.length}</span>
            <span className="rep-summary__label">Entregados</span>
          </div>
          <div className="rep-summary__card">
            <span className="rep-summary__num">{totalBultos}</span>
            <span className="rep-summary__label">Bultos</span>
          </div>
        </div>

        {/* Escáner */}
        <section className="rep-section" ref={scannerSectionRef as React.RefObject<HTMLElement>}>
          <h2 className="rep-section__title">
            {bultoMode
              ? (bultoMode.tipo === "carga" ? "Cargando bultos" : "Entregando bultos")
              : deliveryTarget ? "Confirmar entrega"
              : "Escanear contenedor"}
          </h2>

          {bultoMode && (
            <div className="rep-bulto-counter">
              <p className="rep-bulto-counter__nombre">
                {bultoMode.tipo === "carga" ? "Cargando:" : "Entregando:"} <strong>{bultoMode.clienteNombre}</strong>
              </p>
              <div className="rep-bulto-counter__display">
                <span className="rep-bulto-counter__current">{bultoMode.escaneados}</span>
                <span className="rep-bulto-counter__sep">/</span>
                <span className="rep-bulto-counter__total">{bultoMode.totalBultos}</span>
              </div>
              <p className="rep-bulto-counter__hint">Escaneá el siguiente bulto</p>
              <button className="rep-btn-cancel-delivery" onClick={() => setBultoMode(null)}>
                Cancelar
              </button>
            </div>
          )}

          {deliveryTarget && !bultoMode && (
            <div className="rep-delivery-banner">
              <div className="rep-delivery-banner__text">
                <span>Escaneá el contenedor de:</span>
                <strong>{deliveryTarget.cliente_nombre}</strong>
              </div>
              <button className="rep-btn-cancel-delivery" onClick={() => setDeliveryTarget(null)}>
                Cancelar
              </button>
            </div>
          )}

          <QrReader key={scannerKey} onResult={handleScan} autoOpen={!!deliveryTarget || !!bultoMode} />

          {loadingApi && (
            <div className="rep-ocr-processing" style={{ paddingTop: 20 }}>
              <span className="rep-spinner" style={{ borderColor: "#dbeafe", borderTopColor: "#2556ff" }} />
              <p>Consultando WMS...</p>
            </div>
          )}

          {!loadingApi && feedback && (
            <div className={`rep-feedback rep-feedback--${feedback.tipo}`}>
              {feedback.msg}
            </div>
          )}
        </section>

        {/* Finalizar día */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <button className="rep-btn-finalizar" onClick={() => setShowFinalizar(true)}>
            Finalizar día
          </button>
        </div>

        {/* Lista de pedidos del día */}
        <section className="rep-section">
          <h2 className="rep-section__title">
            Pedidos del día
            {items.length > 0 && (
              <span className="rep-section__count">{items.length}</span>
            )}
          </h2>

          {loadingItems ? (
            <div className="rep-ocr-processing">
              <span className="rep-spinner" style={{ borderColor: "#dbeafe", borderTopColor: "#2556ff" }} />
              <p>Cargando pedidos...</p>
            </div>
          ) : items.length === 0 ? (
            <p className="rep-empty">
              Aún no hay pedidos escaneados. Escaneá el primer contenedor para comenzar.
            </p>
          ) : (
            <div className="rep-items-list">
              {pendientes.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isDeliveryTarget={deliveryTarget?.id === item.id}
                  onEntregar={() => handleEntregarClick(item)}
                  onCancelDelivery={() => setDeliveryTarget(null)}
                  onCancelEntrega={() => cancelarEntrega(item)}
                />
              ))}
              {entregados.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isDeliveryTarget={false}
                  onEntregar={() => handleEntregarClick(item)}
                  onCancelDelivery={() => setDeliveryTarget(null)}
                  onCancelEntrega={() => cancelarEntrega(item)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showFinalizar && (
        <FinalizarScreen
          session={session}
          items={items}
          onCancel={() => setShowFinalizar(false)}
          onConfirm={onLogout}
        />
      )}
    </div>
  );
}
