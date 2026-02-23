// src/lib/supabase.ts
// ⚠️  Este archivo solo se ejecuta en el SERVIDOR (Astro API routes)
// Nunca importar desde componentes React del cliente

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos basados en tu tabla `articulos`
export interface Articulo {
  codigo: number;
  descripcion: string;
  proveedor: string;
  rubro: string;
  precioFinal: number;
  descuento: number;
  multiplo: number;
  orden: number;
  tiempoExclusivo: boolean;
  fechaInicio: string | null;
  fechaFinal: string | null;
  familiaNombre: string;
  stock: number;
}