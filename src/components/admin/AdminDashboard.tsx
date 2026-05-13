import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import KpiCards from "./KpiCards";
import VentasChart from "./VentasChart";
import TopProductos from "./TopProductos";
import ClientesTable from "./ClientesTable";
import { useAdminData } from "./useAdminData";

const ALLOWED_DOMAIN = "@alzologistica.com";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

type AuthState = "checking" | "unauthenticated" | "unauthorized" | "authorized";
type Section = "resumen" | "ventas" | "productos" | "clientes" | "reparto";

export default function AdminDashboard() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [userEmail, setUserEmail] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("resumen");
  const { data, status, lastUpdated, refetch } = useAdminData();

  useEffect(() => {
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      validateSession(session?.user?.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Sync active section con hash de URL
  useEffect(() => {
    function onHash() {
      const hash = (window.location.hash.replace("#", "") as Section) || "resumen";
      setActiveSection(hash);
    }
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Mostrar email en el header del layout
  useEffect(() => {
    const el = document.getElementById("user-email-display");
    if (el && userEmail) el.textContent = userEmail;
  }, [userEmail]);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    validateSession(session?.user?.email ?? null);
  }

  function validateSession(email: string | null) {
    if (!email) {
      setAuthState("unauthenticated");
      return;
    }
    if (!email.endsWith(ALLOWED_DOMAIN)) {
      setUserEmail(email);
      setAuthState("unauthorized");
      return;
    }
    setUserEmail(email);
    setAuthState("authorized");
  }

  async function loginWithGoogle() {
    localStorage.setItem("auth_next", "/admin");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    setAuthState("unauthenticated");
    setUserEmail("");
  }

  // ── Estados de auth ──────────────────────────────────────────────

  if (authState === "checking") {
    return (
      <div className="auth-center">
        <div className="spinner" />
        <p>Verificando sesión...</p>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="auth-center">
        <div className="login-card">
          <img src="/img/alzo_logo.png" alt="Alzo" className="login-logo" />
          <h1 className="login-title">Alzo Admin</h1>
          <p className="login-sub">Acceso exclusivo para cuentas <strong>@alzologistica.com</strong></p>
          <button className="btn-google" onClick={loginWithGoogle}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.46 14.013 17.64 11.927 17.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.861-3.048.861-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.708A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.708V4.96H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.04l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Ingresar con Google
          </button>
        </div>
      </div>
    );
  }

  if (authState === "unauthorized") {
    return (
      <div className="auth-center">
        <div className="login-card">
          <div className="denied-icon"><i className="fa-solid fa-ban"></i></div>
          <h2 className="login-title">Acceso denegado</h2>
          <p className="login-sub">
            La cuenta <strong>{userEmail}</strong> no tiene permisos.<br />
            Solo cuentas <strong>@alzologistica.com</strong> pueden acceder.
          </p>
          <button className="btn-logout-page" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────

  const isLoading = status === "loading" || status === "idle";
  const noGas = status === "no-gas";

  return (
    <>
      {noGas && (
        <div className="gas-banner">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>
            <strong>GAS no configurado:</strong> Agregá la variable <code>PUBLIC_ADMIN_GAS_URL</code> en el <code>.env</code> para ver datos reales.
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="gas-banner error-banner">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>Error al cargar datos del Google Sheet.</span>
          <button className="btn-retry" onClick={refetch}>Reintentar</button>
        </div>
      )}

      {/* Header de sección */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">
            {activeSection === "resumen" && "Resumen General"}
            {activeSection === "ventas" && "Ventas"}
            {activeSection === "productos" && "Top Productos"}
            {activeSection === "clientes" && "Cartera de Clientes"}
            {activeSection === "reparto" && "Reparto"}
          </h1>
          {lastUpdated && (
            <p className="dash-updated">
              Actualizado: {lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <button className="btn-refresh" onClick={refetch} disabled={isLoading} title="Actualizar datos">
          <i className={`fa-solid fa-rotate-right ${isLoading ? "spinning" : ""}`}></i>
        </button>
      </div>

      {/* Sección: Resumen */}
      {activeSection === "resumen" && (
        <div id="resumen">
          <KpiCards resumen={data.resumen} loading={isLoading} />
          <VentasChart
            ventasPorDia={data.ventasPorDia}
            ventasPorVendedor={data.ventasPorVendedor}
            ventasPorMes={data.ventasPorMes}
            rawPedidos={data.rawPedidos}
            loading={isLoading}
          />
          <TopProductos productos={data.topProductos.slice(0, 5)} loading={isLoading} />
        </div>
      )}

      {/* Sección: Ventas */}
      {activeSection === "ventas" && (
        <div id="ventas">
          <KpiCards resumen={data.resumen} loading={isLoading} />
          <VentasChart
            ventasPorDia={data.ventasPorDia}
            ventasPorVendedor={data.ventasPorVendedor}
            ventasPorMes={data.ventasPorMes}
            rawPedidos={data.rawPedidos}
            loading={isLoading}
          />
        </div>
      )}

      {/* Sección: Top Productos */}
      {activeSection === "productos" && (
        <div id="productos">
          <TopProductos productos={data.topProductos} loading={isLoading} />
        </div>
      )}

      {/* Sección: Clientes */}
      {activeSection === "clientes" && (
        <div id="clientes">
          <ClientesTable clientes={data.clientes} loading={isLoading} />
        </div>
      )}

      {/* Sección: Reparto */}
      {activeSection === "reparto" && (
        <div id="reparto" className="reparto-link-card">
          <i className="fa-solid fa-truck-fast"></i>
          <h3>Dashboard de Reparto</h3>
          <p>El seguimiento de reparto está en su propio módulo.</p>
          <a href="/reparto" target="_blank" className="btn-goto-reparto">
            Ir al módulo de Reparto
            <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      )}

      <style>{`
        .auth-center {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          flex-direction: column;
          gap: 16px;
          color: #64748b;
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #2556ff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .login-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          max-width: 360px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }

        .login-logo {
          width: 56px;
          height: 56px;
          object-fit: contain;
        }

        .login-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .login-sub {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        .login-sub strong {
          color: #475569;
        }

        .btn-google {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 20px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #1e293b;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: box-shadow 0.15s, border-color 0.15s;
          margin-top: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .btn-google:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .denied-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #fff1f2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f43f5e;
          font-size: 1.4rem;
        }

        .btn-logout-page {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #64748b;
          font-size: 0.85rem;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 8px;
        }

        .btn-logout-page:hover {
          background: #fff1f2;
          color: #f43f5e;
          border-color: #fecdd3;
        }

        .gas-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 0.82rem;
          color: #92400e;
        }

        .error-banner {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #9f1239;
        }

        .gas-banner code {
          background: rgba(0,0,0,0.06);
          padding: 1px 5px;
          border-radius: 4px;
          font-family: monospace;
        }

        .btn-retry {
          margin-left: auto;
          padding: 4px 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          font-size: 0.78rem;
          font-family: inherit;
          cursor: pointer;
        }

        .btn-retry:hover { background: #f1f5f9; }

        .dash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 12px;
        }

        .dash-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .dash-updated {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }

        .btn-refresh {
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        .btn-refresh:hover:not(:disabled) {
          border-color: #2556ff;
          color: #2556ff;
        }

        .btn-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        .reparto-link-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-align: center;
          color: #94a3b8;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .reparto-link-card i {
          font-size: 2.5rem;
          color: #2556ff;
        }

        .reparto-link-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .reparto-link-card p {
          font-size: 0.85rem;
          margin: 0;
        }

        .btn-goto-reparto {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 10px 20px;
          background: #2556ff;
          border-radius: 8px;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .btn-goto-reparto:hover {
          opacity: 0.85;
        }
      `}</style>
    </>
  );
}
