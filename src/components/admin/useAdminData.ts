import { useState, useEffect } from "react";

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
  codigo: string;
  nombre: string;
  diaVenta: string;
  diaReparto: string;
  vendedor: string;
  ultimoPedido: string;
  montoPedido: number;
}

// Pedido liviano para filtrado por fechas en el cliente
export interface PedidoRaw {
  d: number; // dia
  m: number; // mes (1-12)
  a: number; // anio
  v: string; // vendedor
  t: number; // total/monto
}

export interface AdminData {
  resumen: KpiResumen;
  ventasPorDia: VentaDia[];
  ventasPorVendedor: VentaVendedor[];
  ventasPorMes: { mes: string; pedidos: number; monto: number }[];
  topProductos: ProductoTop[];
  clientes: Cliente[];
  rawPedidos: PedidoRaw[]; // todos los pedidos últimos 12 meses
}

const MOCK_DATA: AdminData = {
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
};

type Status = "idle" | "loading" | "ok" | "error" | "no-gas";

export function useAdminData() {
  const [data, setData] = useState<AdminData>(MOCK_DATA);
  const [status, setStatus] = useState<Status>("idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const gasUrl = import.meta.env.PUBLIC_ADMIN_GAS_URL as string | undefined;

  async function fetchData() {
    if (!gasUrl) {
      setStatus("no-gas");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`${gasUrl}?action=dashboard`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AdminData = await res.json();
      // Compatibilidad: si el GAS no devuelve rawPedidos aún, usar array vacío
      if (!json.rawPedidos) json.rawPedidos = [];
      setData(json);
      setLastUpdated(new Date());
      setStatus("ok");
    } catch (err) {
      console.error("useAdminData error:", err);
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return { data, status, lastUpdated, refetch: fetchData };
}
