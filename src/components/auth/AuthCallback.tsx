import { useEffect } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const next = params.get("next") ?? "/";

    if (code) {
      supabaseClient.auth
        .exchangeCodeForSession(code)
        .finally(() => {
          window.location.replace(next);
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
