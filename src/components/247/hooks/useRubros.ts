// src/components/247/hooks/useRubros.ts
import { useState, useEffect } from "react";
import { supabaseClient } from "../../../lib/supabaseClient";

export function useRubros(familia?: string) {
  const [rubros, setRubros]   = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familia) { setLoading(false); return; }
    setLoading(true);

    supabaseClient
      .from("articulos")
      .select("rubro")
      .gt("stock", 0)
      .ilike("familiaNombre", familia)
      .then(({ data }) => {
        const unicos = [...new Set((data ?? []).map((r: any) => r.rubro as string))]
          .filter(Boolean).sort();
        setRubros(unicos);
      })
      .finally(() => setLoading(false));
  }, [familia]);

  return { rubros, loading };
}