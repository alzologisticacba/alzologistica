// src/components/mayorista/AppMayorista.tsx
import { useState, useEffect } from "react";
import { supabaseClient } from "../../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import HeaderMayorista from "./HeaderMayorista";
import PresupuestoMayorista from "./PresupuestoMayorista";
import ConsultaUxB from "./ConsultaUxB";
import ImagenesProducto from "./ImagenesProducto";
import MapaVentas from "./MapaVentas";
import ListaExcel from "./ListaExcel";
import GeneradorFlyer from "./GeneradorFlyer";

// ─── Login Screen ─────────────────────────────────────────
function LoginMayorista() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleGoogle() {
    setLoading(true);
    setError("");
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/247/mayorista${window.location.search}`,
      },
    });
    if (error) {
      setError("No se pudo iniciar sesión. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="rep-login-wrap">
      <div className="rep-login-card" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <img src="/img/alzo_logo.png" alt="Alzo Logística" className="rep-login-card__logo" style={{ height: 180, marginBottom: 8 }} />
        <p className="rep-login-card__title" style={{ marginBottom: 20 }}>Portal Mayorista</p>

        {error && (
          <p style={{ color: "#fca5a5", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            width: "100%",
            padding: "14px 20px",
            border: "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: 14,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "Montserrat, sans-serif",
            transition: "background .2s, border-color .2s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <span>Redirigiendo…</span>
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

// ─── App principal ────────────────────────────────────────
export default function AppMayorista() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Si viene ?punto= en la URL, abrir directamente el mapa
  const [seccion, setSeccion] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.has("punto")) return "mapa";
    }
    return "presupuesto";
  });

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabaseClient.auth.signOut();
  }

  if (loading) {
    return (
      <div className="rep-login-wrap">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div className="rep-spinner" />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>Cargando…</span>
        </div>
      </div>
    );
  }

  if (!session) return <LoginMayorista />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f0f2f5" }}>
      <HeaderMayorista
        usuario={session.user.email ?? ""}
        onLogout={handleLogout}
        seccion={seccion}
        onSeccion={setSeccion}
      />
      <main style={{ flex: 1 }}>
        {seccion === "presupuesto" && <PresupuestoMayorista />}
        {seccion === "uxb"         && <ConsultaUxB />}
        {seccion === "imagenes"    && <ImagenesProducto />}
        {seccion === "mapa"        && <MapaVentas usuario={session.user.email ?? ""} />}
        {seccion === "lista"       && <ListaExcel />}
        {seccion === "flyer"       && <GeneradorFlyer />}
      </main>
    </div>
  );
}
