import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "../../lib/supabaseClient";

export interface KpiResumen {
  totalPedidosHoy: number;
  totalPedidosMes: number;
  clientesActivos: number;
  ticketPromedio: number;
  variacionPedidosMes: number;
  variacionClientes: number;
}

export interface VentaDia {
  fecha: string; // "DD/MM"
  pedidos: number;
  monto: number;
}

export interface VentaVendedor {
  vendedor: string;
  pedidos: number;
  monto: number;
  clientes: number;
}

export interface ProductoTop {
  nombre: string;
  codigo: string;
  categoria: "varios" | "cigarrillos";
  cantidadBultos: number;
  cantidadPedidos: number;
}

export interface Cliente {
  telefono: string;
  vendedor: string;
  pedidos: number;
  montoTotal: number;
  ticketPromedio: number;
  ultimoPedido: string;
}

// Pedido liviano para filtrado por fechas en el cliente
export interface PedidoRaw {
  d: number; // dia
  m: number; // mes (1-12)
  a: number; // anio
  v: string; // vendedor
  t: number; // total/monto
}

export interface InversionMovimiento {
  id: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  descripcion: string | null;
  created_at: string;
}

export interface AdminData {
  resumen: KpiResumen;
  ventasPorDia: VentaDia[];
  ventasPorVendedor: VentaVendedor[];
  ventasPorMes: { mes: string; pedidos: number; monto: number }[];
  topProductos: ProductoTop[];
  clientes: Cliente[];
  rawPedidos: PedidoRaw[]; // todos los pedidos últimos 12 meses
  // Config Supabase
  metaMensual: number;
  inversiones: InversionMovimiento[];
  inversionMes: number;
  inversionTotal: number;
  facturadoMes: number; // derivado de pedidosMes para calcular ROAS
}

const EMPTY_DATA: AdminData = {
  resumen: {
    totalPedidosHoy: 0,
    totalPedidosMes: 0,
    clientesActivos: 0,
    ticketPromedio: 0,
    variacionPedidosMes: 0,
    variacionClientes: 0,
  },
  ventasPorDia: [],
  ventasPorVendedor: [],
  ventasPorMes: [],
  topProductos: [],
  clientes: [],
  rawPedidos: [],
  metaMensual: 0,
  inversiones: [],
  inversionMes: 0,
  inversionTotal: 0,
  facturadoMes: 0,
};

type Status = "idle" | "loading" | "ok" | "error" | "no-gas";

function facturadoMesFromRaw(rawPedidos: PedidoRaw[]): number {
  const hoy = new Date();
  const m = hoy.getMonth() + 1;
  const a = hoy.getFullYear();
  return rawPedidos
    .filter((p) => p.m === m && p.a === a)
    .reduce((s, p) => s + p.t, 0);
}

function sumInversionMes(invs: InversionMovimiento[]): number {
  const hoy = new Date();
  const m = hoy.getMonth() + 1;
  const a = hoy.getFullYear();
  return invs.reduce((s, i) => {
    const [ya, ym] = i.fecha.split("-").map(Number);
    return ya === a && ym === m ? s + Number(i.monto) : s;
  }, 0);
}

export function useAdminData() {
  const [data, setData] = useState<AdminData>(EMPTY_DATA);
  const [status, setStatus] = useState<Status>("idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const gasUrl = import.meta.env.PUBLIC_ADMIN_GAS_URL as string | undefined;

  const fetchData = useCallback(async () => {
    setStatus("loading");

    // ── Supabase: config + inversiones (en paralelo) ──
    const [cfgRes, invRes] = await Promise.all([
      supabaseClient.from("admin_config").select("key, value"),
      supabaseClient
        .from("admin_inversiones")
        .select("id, fecha, monto, descripcion, created_at")
        .order("fecha", { ascending: false }),
    ]);

    const metaMensual = Number(
      cfgRes.data?.find((r: any) => r.key === "meta_mensual")?.value ?? 0
    );
    const inversiones: InversionMovimiento[] = (invRes.data ?? []) as any;
    const inversionTotal = inversiones.reduce((s, i) => s + Number(i.monto), 0);
    const inversionMes = sumInversionMes(inversiones);

    // ── GAS (si está configurado) ──
    if (!gasUrl) {
      setData({
        ...EMPTY_DATA,
        metaMensual,
        inversiones,
        inversionMes,
        inversionTotal,
      });
      setStatus("no-gas");
      return;
    }

    try {
      const res = await fetch(`${gasUrl}?action=dashboard`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: Partial<AdminData> = await res.json();
      if (!json.rawPedidos) json.rawPedidos = [];

      const facturadoMes = facturadoMesFromRaw(json.rawPedidos);

      setData({
        ...EMPTY_DATA,
        ...(json as AdminData),
        metaMensual,
        inversiones,
        inversionMes,
        inversionTotal,
        facturadoMes,
      });
      setLastUpdated(new Date());
      setStatus("ok");
    } catch (err) {
      console.error("useAdminData error:", err);
      setStatus("error");
    }
  }, [gasUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Mutaciones config ──

  const saveMeta = useCallback(
    async (value: number) => {
      const { error } = await supabaseClient
        .from("admin_config")
        .upsert({ key: "meta_mensual", value, updated_at: new Date().toISOString() });
      if (error) throw error;
      setData((d) => ({ ...d, metaMensual: value }));
    },
    []
  );

  const addInversion = useCallback(
    async (mov: { fecha: string; monto: number; descripcion?: string }) => {
      const { data: inserted, error } = await supabaseClient
        .from("admin_inversiones")
        .insert({
          fecha: mov.fecha,
          monto: mov.monto,
          descripcion: mov.descripcion ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      setData((d) => {
        const inversiones = [inserted as InversionMovimiento, ...d.inversiones];
        return {
          ...d,
          inversiones,
          inversionMes: sumInversionMes(inversiones),
          inversionTotal: d.inversionTotal + Number(mov.monto),
        };
      });
    },
    []
  );

  const deleteInversion = useCallback(async (id: string) => {
    const { error } = await supabaseClient
      .from("admin_inversiones")
      .delete()
      .eq("id", id);
    if (error) throw error;
    setData((d) => {
      const inversiones = d.inversiones.filter((i) => i.id !== id);
      return {
        ...d,
        inversiones,
        inversionMes: sumInversionMes(inversiones),
        inversionTotal: inversiones.reduce((s, i) => s + Number(i.monto), 0),
      };
    });
  }, []);

  return {
    data,
    status,
    lastUpdated,
    refetch: fetchData,
    saveMeta,
    addInversion,
    deleteInversion,
  };
}
