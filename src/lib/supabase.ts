// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;

// En build estático sin variables, exportar cliente dummy para no romper el build
if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️  SUPABASE_URL o SUPABASE_SERVICE_KEY no definidas — modo build estático");
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseKey ?? "placeholder-key"
);