import type { APIRoute } from "astro";

export const prerender = false;

const WMS_BASE = "http://api.patagoniawms.com/v1";
const API_KEY = import.meta.env.DIGIP_API_KEY;
const MS_DIA = 24 * 60 * 60 * 1000;

interface DigipArticulo {
  CodigoArticulo?: string;
  Codigo?: string;
  Descripcion?: string;
  UsaVencimiento?: boolean;
  Activo?: boolean;
}

interface DigipContenidoDetalle {
  CodigoArticulo?: string;
  Codigo?: string;
  ArticuloCodigo?: string;
  Lote?: string;
  FechaVencimiento?: string;
  Vencimiento?: string;
  Unidades?: number;
  Cantidad?: number;
}

interface DigipUbicacion {
  Pasillo?: number;
  Posicion?: number;
  Nivel?: number;
  UbicacionEstado?: string;
  CodigoUbicacion?: string;
  Area?: {
    AreaTipo?: string;
    Abreviacion?: string;
  };
}

interface DigipContenedor {
  Numero?: string;
  ContenedorDetalle?: DigipContenidoDetalle[];
  ContenedorDetalles?: DigipContenidoDetalle[];
  ContenidoDetalle?: DigipContenidoDetalle[];
  ContenidoDetalles?: DigipContenidoDetalle[];
  Contenido?: DigipContenidoDetalle[];
  Detalle?: DigipContenidoDetalle[];
  Detalles?: DigipContenidoDetalle[];
  Ubicacion?: DigipUbicacion;
}

interface ProductoVencimiento {
  CodigoArticulo: string;
  Area: string;
  Ubicacion: string;
  FechaVencimiento: string;
  "Dias para vencer": number;
  Cantidad: number;
  Descripcion: string;
  Lote: string;
  Contenedor: string;
}

interface ProductoVencimientoAgrupado extends ProductoVencimiento {
  Contenedores: string[];
}

function json(data: unknown, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cache,
    },
  });
}

function errorResponse(error: string, status = 500) {
  return json({ error }, status);
}

function wmsHeaders() {
  return {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json",
  };
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const knownKeys = [
      "data",
      "Data",
      "items",
      "Items",
      "value",
      "Value",
      "result",
      "Result",
      "results",
      "Results",
      "articulos",
      "Articulos",
      "contenedores",
      "Contenedores",
    ];

    for (const key of knownKeys) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }

    const nestedArray = Object.values(obj).find(Array.isArray);
    if (nestedArray) return nestedArray as T[];

    return [obj as T];
  }
  return [];
}

function getValue(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

function getText(obj: Record<string, unknown>, keys: string[]) {
  const value = getValue(obj, keys);
  return value === undefined ? "" : String(value);
}

function getNumber(obj: Record<string, unknown>, keys: string[]) {
  const value = getValue(obj, keys);
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function sampleKeys(value: unknown) {
  if (!value || typeof value !== "object") return [];
  return Object.keys(value as Record<string, unknown>);
}

async function wmsGet<T>(endpoint: string, intentos = 3): Promise<T[]> {
  let ultimoError: Error | null = null;

  for (let i = 0; i < intentos; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1000 * i));

    try {
      const res = await fetch(`${WMS_BASE}${endpoint}`, { headers: wmsHeaders() });
      const text = await res.text();

      if (!res.ok) {
        ultimoError = new Error(`El servidor WMS no está disponible (${res.status}). Intentá de nuevo en unos minutos.`);
        if (res.status >= 500) continue;
        throw ultimoError;
      }

      const parsed = text ? JSON.parse(text) : [];
      return asArray<T>(parsed);
    } catch (e) {
      ultimoError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw ultimoError ?? new Error("Error al conectar con el WMS.");
}

function inicioDelDia(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function diasParaVencer(fechaVencimiento: string) {
  const fecha = new Date(fechaVencimiento);
  if (Number.isNaN(fecha.getTime())) return null;

  const hoy = inicioDelDia(new Date());
  const vencimiento = inicioDelDia(fecha);
  return Math.ceil((vencimiento.getTime() - hoy.getTime()) / MS_DIA);
}

function ubicacionTexto(ubicacion?: DigipUbicacion) {
  if (!ubicacion) return "";
  if (ubicacion.CodigoUbicacion) return ubicacion.CodigoUbicacion;

  const partes = [
    ubicacion.Pasillo != null ? `P${ubicacion.Pasillo}` : "",
    ubicacion.Posicion != null ? `Pos ${ubicacion.Posicion}` : "",
    ubicacion.Nivel != null ? `N${ubicacion.Nivel}` : "",
  ].filter(Boolean);

  return partes.join(" - ");
}

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function areaTexto(ubicacion?: DigipUbicacion) {
  return [ubicacion?.Area?.Abreviacion, ubicacion?.Area?.AreaTipo]
    .filter(Boolean)
    .join(" ");
}

function esAreaPermitida(ubicacion?: DigipUbicacion) {
  const area = normalizarTexto(areaTexto(ubicacion));
  return (
    area.includes("picking") ||
    area.includes("pick") ||
    area.includes("deposito") ||
    area.includes("depo") ||
    area === "dep"
  );
}

function contarAreas(contenedores: DigipContenedor[]) {
  const areas = new Map<string, number>();

  for (const contenedor of contenedores) {
    const area = areaTexto(contenedor.Ubicacion) || "Sin area";
    areas.set(area, (areas.get(area) ?? 0) + 1);
  }

  return Array.from(areas.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([area, cantidad]) => ({ area, cantidad }));
}

export const GET: APIRoute = async ({ url }) => {
  if (!API_KEY) return errorResponse("DIGIP_API_KEY no configurada", 500);
  const debug = url.searchParams.get("debug") === "1";

  try {
    const [articulos, contenedores] = await Promise.all([
      wmsGet<DigipArticulo>("/Articulos"),
      wmsGet<DigipContenedor>("/Deposito/Contenedores"),
    ]);

    console.info("[vencimientos/digip] respuesta WMS", {
      articulos: articulos.length,
      contenedores: contenedores.length,
      primerArticuloKeys: sampleKeys(articulos[0]),
      primerContenedorKeys: sampleKeys(contenedores[0]),
      areas: contarAreas(contenedores),
    });

    const articulosPorCodigo = new Map<string, DigipArticulo>();
    for (const articulo of articulos) {
      const articuloObj = articulo as Record<string, unknown>;
      const codigo = getText(articuloObj, ["CodigoArticulo", "Codigo", "ArticuloCodigo"]);
      if (codigo) articulosPorCodigo.set(codigo, articulo);
    }

    const productosPorClave = new Map<string, ProductoVencimientoAgrupado>();
    const descartados = {
      sinDetalle: 0,
      sinCodigo: 0,
      noUsaVencimiento: 0,
      inactivo: 0,
      sinFecha: 0,
      fechaInvalida: 0,
      sinCantidad: 0,
      areaNoPermitida: 0,
    };
    let detallesLeidos = 0;

    for (const contenedor of contenedores) {
      if (!esAreaPermitida(contenedor.Ubicacion)) {
        descartados.areaNoPermitida++;
        continue;
      }

      const contenedorObj = contenedor as Record<string, unknown>;
      const detalles = asArray<DigipContenidoDetalle>(
        getValue(contenedorObj, [
          "ContenedorDetalle",
          "ContenedorDetalles",
          "ContenidoDetalle",
          "ContenidoDetalles",
          "Contenido",
          "Detalle",
          "Detalles",
        ])
      );

      if (detalles.length === 0) descartados.sinDetalle++;

      for (const detalle of detalles) {
        detallesLeidos++;
        const detalleObj = detalle as Record<string, unknown>;
        const codigo = getText(detalleObj, ["CodigoArticulo", "Codigo", "ArticuloCodigo"]);
        const articulo = articulosPorCodigo.get(codigo);
        const usaVencimiento = articulo?.UsaVencimiento ?? true;
        const activo = articulo?.Activo ?? true;
        const fechaVencimiento = getText(detalleObj, ["FechaVencimiento", "Vencimiento"]);
        const dias = fechaVencimiento ? diasParaVencer(fechaVencimiento) : null;
        const cantidad = getNumber(detalleObj, ["Unidades", "Cantidad"]);

        if (!codigo) {
          descartados.sinCodigo++;
          continue;
        }
        if (!usaVencimiento) {
          descartados.noUsaVencimiento++;
          continue;
        }
        if (!activo) {
          descartados.inactivo++;
          continue;
        }
        if (!fechaVencimiento) {
          descartados.sinFecha++;
          continue;
        }
        if (dias === null) {
          descartados.fechaInvalida++;
          continue;
        }
        if (cantidad <= 0) {
          descartados.sinCantidad++;
          continue;
        }

        const area = areaTexto(contenedor.Ubicacion) || "Sin area";
        const ubicacion = ubicacionTexto(contenedor.Ubicacion);
        const lote = getText(detalleObj, ["Lote"]);
        const numeroContenedor = contenedor.Numero ?? "";
        const clave = [codigo, fechaVencimiento, lote, area, ubicacion].join("|");
        const existente = productosPorClave.get(clave);

        if (existente) {
          existente.Cantidad += cantidad;
          if (numeroContenedor && !existente.Contenedores.includes(numeroContenedor)) {
            existente.Contenedores.push(numeroContenedor);
            existente.Contenedor = existente.Contenedores.join(", ");
          }
          continue;
        }

        productosPorClave.set(clave, {
          CodigoArticulo: codigo,
          Area: area,
          Ubicacion: ubicacion,
          FechaVencimiento: fechaVencimiento,
          "Dias para vencer": dias,
          Cantidad: cantidad,
          Descripcion: articulo?.Descripcion ?? codigo,
          Lote: lote,
          Contenedor: numeroContenedor,
          Contenedores: numeroContenedor ? [numeroContenedor] : [],
        });
      }
    }

    const productos = Array.from(productosPorClave.values());
    productos.sort((a, b) => a["Dias para vencer"] - b["Dias para vencer"]);

    console.info("[vencimientos/digip] vencimientos calculados", {
      detallesLeidos,
      productos: productos.length,
      descartados,
      primerDetalleKeys: sampleKeys(
        asArray<DigipContenidoDetalle>(
          getValue(contenedores[0] as Record<string, unknown>, [
            "ContenedorDetalle",
            "ContenedorDetalles",
            "ContenidoDetalle",
            "ContenidoDetalles",
            "Contenido",
            "Detalle",
            "Detalles",
          ])
        )[0]
      ),
      primerProducto: productos[0] ?? null,
    });

    if (debug) {
      return json(
        {
          productos,
          debug: {
            articulos: articulos.length,
            contenedores: contenedores.length,
            detallesLeidos,
            descartados,
            primerArticuloKeys: sampleKeys(articulos[0]),
            primerContenedorKeys: sampleKeys(contenedores[0]),
            primerDetalleKeys: sampleKeys(
              asArray<DigipContenidoDetalle>(
                getValue(contenedores[0] as Record<string, unknown>, [
                  "ContenedorDetalle",
                  "ContenedorDetalles",
                  "ContenidoDetalle",
                  "ContenidoDetalles",
                  "Contenido",
                  "Detalle",
                  "Detalles",
                ])
              )[0]
            ),
            primerProducto: productos[0] ?? null,
          },
        },
        200,
        "no-store"
      );
    }

    return json(productos, 200, "private, max-age=300");
  } catch (err) {
    console.error("[vencimientos/digip] error", err);
    return errorResponse(err instanceof Error ? err.message : "Error al consultar Digip");
  }
};
