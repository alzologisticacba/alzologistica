import { useState, useEffect } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

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

interface Session {
  repartidor: string;
  patente: string;
}

const SESSION_KEY = "reparto_session";

export default function RepartoApp() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try { setSession(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  function handleLogin(s: Session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  if (!session) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard session={session} onLogout={handleLogout} />;
}

/* ─────────────────────────────────────────
   PANTALLA DE INGRESO
───────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: (s: Session) => void }) {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD (post-login)
───────────────────────────────────────── */
function Dashboard({
  session,
  onLogout,
}: {
  session: Session;
  onLogout: () => void;
}) {
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
          <button className="rep-header__logout" onClick={onLogout}>
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

        <div className="rep-placeholder">
          <p>Próximamente — herramientas de reparto</p>
        </div>
      </main>
    </div>
  );
}
