// src/lib/supabaseClient.ts
// Cliente de Supabase para uso en el BROWSER (componentes React)
// Usa la clave anon (pública) — segura para el cliente
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY no definidas");
}

export const supabaseClient = createClient(
  url ?? "https://placeholder.supabase.co",
  key ?? "placeholder"
);