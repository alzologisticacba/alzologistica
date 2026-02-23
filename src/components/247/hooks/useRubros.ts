// src/components/247/hooks/useRubros.ts

import { useState, useEffect } from "react";

export function useRubros(familia?: string) {
  const [rubros, setRubros]   = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familia) return;
    setLoading(true);

    const params = new URLSearchParams({ familia });
    fetch(`/api/rubros?${params}`)
      .then((r) => r.json())
      .then((json) => setRubros(json.data ?? []))
      .finally(() => setLoading(false));
  }, [familia]);

  return { rubros, loading };
}