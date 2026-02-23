// src/components/247/hooks/useFamilias.ts
// Trae los familiaNombre únicos desde /api/familias

import { useState, useEffect } from "react";

interface UseFamiliasResult {
  familias: string[];
  loading: boolean;
  error: string | null;
}

export function useFamilias(): UseFamiliasResult {
  const [familias, setFamilias] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/familias")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setFamilias(json.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { familias, loading, error };
}