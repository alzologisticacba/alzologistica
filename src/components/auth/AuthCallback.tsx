import { useEffect } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    const next = localStorage.getItem("auth_next") ?? "/";
    localStorage.removeItem("auth_next");

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const hasHashToken = window.location.hash.includes("access_token=");

    if (code) {
      // PKCE flow
      supabaseClient.auth
        .exchangeCodeForSession(code)
        .finally(() => window.location.replace(next));
    } else if (hasHashToken) {
      // Implicit flow — Supabase auto-detecta el hash, esperamos el evento
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          subscription.unsubscribe();
          window.location.replace(next);
        }
      });
      // Por si la sesión ya fue procesada antes de que se registrara el listener
      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          subscription.unsubscribe();
          window.location.replace(next);
        }
      });
    } else {
      window.location.replace(next);
    }
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "system-ui, sans-serif", color: "#374151" }}>
      <p>Autenticando...</p>
    </div>
  );
}
