const BASE = "/api/reparto/digip";

async function get<T>(endpoint: string, token: string): Promise<T> {
  const qs = new URLSearchParams({ endpoint });
  const res = await fetch(`${BASE}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Error ${res.status}`);
  }
  return res.json();
}

export interface PedidoPorContenedor {
  Codigo: string;
  CodigoClienteUbicacion: string;
  PedidoEstado: string;
  Fecha: string;
  FechaEstimadaEntrega: string;
  Observacion: string;
  Importe: number;
  CodigoDespacho: string;
  CodigoDeEnvio: string;
  ServicioDeEnvioTipo: string;
  OrdenPreparacion: number;
}

export function getPedidosPorContenedor(numeroContenedor: string, token: string) {
  return get<PedidoPorContenedor[]>(
    `/Pedidos/PorContenedor/${encodeURIComponent(numeroContenedor)}`,
    token
  );
}

export interface ContenedorDePedido {
  Numero: string;
  CantidadBulto: number;
  Observacion: string;
  Preparacion_Id: number;
}

export function getContenedoresDePedido(codigo: string, token: string) {
  return get<ContenedorDePedido[]>(
    `/Pedidos/${encodeURIComponent(codigo)}/Contenedores`,
    token
  );
}

export interface Cliente {
  Codigo: string;
  Descripcion: string;
  IdentificadorFiscal: string;
  Activo: boolean;
}

export function getCliente(codigo: string, token: string) {
  return get<Cliente>(`/Clientes/${encodeURIComponent(codigo)}`, token);
}
