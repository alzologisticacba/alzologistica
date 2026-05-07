export { renderers } from '../../../renderers.mjs';

const prerender = false;
const WMS_BASE = "http://api.patagoniawms.com/v1";
const API_KEY = "a98791c3-9a27-42d4-bd6a-334ad864a708";
const MS_DIA = 24 * 60 * 60 * 1e3;
function json(data, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cache
    }
  });
}
function errorResponse(error, status = 500) {
  return json({ error }, status);
}
function wmsHeaders() {
  return {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
  };
}
function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const obj = value;
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
      "Contenedores"
    ];
    for (const key of knownKeys) {
      if (Array.isArray(obj[key])) return obj[key];
    }
    const nestedArray = Object.values(obj).find(Array.isArray);
    if (nestedArray) return nestedArray;
    return [obj];
  }
  return [];
}
function getValue(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== void 0 && obj[key] !== null) return obj[key];
  }
  return void 0;
}
function getText(obj, keys) {
  const value = getValue(obj, keys);
  return value === void 0 ? "" : String(value);
}
function getNumber(obj, keys) {
  const value = getValue(obj, keys);
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}
function sampleKeys(value) {
  if (!value || typeof value !== "object") return [];
  return Object.keys(value);
}
async function wmsGet(endpoint) {
  const res = await fetch(`${WMS_BASE}${endpoint}`, { headers: wmsHeaders() });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`WMS ${endpoint}: ${res.status} ${text}`);
  }
  const parsed = text ? JSON.parse(text) : [];
  return asArray(parsed);
}
function inicioDelDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}
function diasParaVencer(fechaVencimiento) {
  const fecha = new Date(fechaVencimiento);
  if (Number.isNaN(fecha.getTime())) return null;
  const hoy = inicioDelDia(/* @__PURE__ */ new Date());
  const vencimiento = inicioDelDia(fecha);
  return Math.ceil((vencimiento.getTime() - hoy.getTime()) / MS_DIA);
}
function ubicacionTexto(ubicacion) {
  if (!ubicacion) return "";
  if (ubicacion.CodigoUbicacion) return ubicacion.CodigoUbicacion;
  const partes = [
    ubicacion.Pasillo != null ? `P${ubicacion.Pasillo}` : "",
    ubicacion.Posicion != null ? `Pos ${ubicacion.Posicion}` : "",
    ubicacion.Nivel != null ? `N${ubicacion.Nivel}` : ""
  ].filter(Boolean);
  return partes.join(" - ");
}
function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function areaTexto(ubicacion) {
  return [ubicacion?.Area?.Abreviacion, ubicacion?.Area?.AreaTipo].filter(Boolean).join(" ");
}
function esAreaPermitida(ubicacion) {
  const area = normalizarTexto(areaTexto(ubicacion));
  return area.includes("picking") || area.includes("pick") || area.includes("deposito") || area.includes("depo") || area === "dep";
}
function contarAreas(contenedores) {
  const areas = /* @__PURE__ */ new Map();
  for (const contenedor of contenedores) {
    const area = areaTexto(contenedor.Ubicacion) || "Sin area";
    areas.set(area, (areas.get(area) ?? 0) + 1);
  }
  return Array.from(areas.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([area, cantidad]) => ({ area, cantidad }));
}
const GET = async ({ url }) => {
  const debug = url.searchParams.get("debug") === "1";
  try {
    const [articulos, contenedores] = await Promise.all([
      wmsGet("/Articulos"),
      wmsGet("/Deposito/Contenedores")
    ]);
    console.info("[vencimientos/digip] respuesta WMS", {
      articulos: articulos.length,
      contenedores: contenedores.length,
      primerArticuloKeys: sampleKeys(articulos[0]),
      primerContenedorKeys: sampleKeys(contenedores[0]),
      areas: contarAreas(contenedores)
    });
    const articulosPorCodigo = /* @__PURE__ */ new Map();
    for (const articulo of articulos) {
      const articuloObj = articulo;
      const codigo = getText(articuloObj, ["CodigoArticulo", "Codigo", "ArticuloCodigo"]);
      if (codigo) articulosPorCodigo.set(codigo, articulo);
    }
    const productosPorClave = /* @__PURE__ */ new Map();
    const descartados = {
      sinDetalle: 0,
      sinCodigo: 0,
      noUsaVencimiento: 0,
      inactivo: 0,
      sinFecha: 0,
      fechaInvalida: 0,
      sinCantidad: 0,
      areaNoPermitida: 0
    };
    let detallesLeidos = 0;
    for (const contenedor of contenedores) {
      if (!esAreaPermitida(contenedor.Ubicacion)) {
        descartados.areaNoPermitida++;
        continue;
      }
      const contenedorObj = contenedor;
      const detalles = asArray(
        getValue(contenedorObj, [
          "ContenedorDetalle",
          "ContenedorDetalles",
          "ContenidoDetalle",
          "ContenidoDetalles",
          "Contenido",
          "Detalle",
          "Detalles"
        ])
      );
      if (detalles.length === 0) descartados.sinDetalle++;
      for (const detalle of detalles) {
        detallesLeidos++;
        const detalleObj = detalle;
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
          Contenedores: numeroContenedor ? [numeroContenedor] : []
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
        asArray(
          getValue(contenedores[0], [
            "ContenedorDetalle",
            "ContenedorDetalles",
            "ContenidoDetalle",
            "ContenidoDetalles",
            "Contenido",
            "Detalle",
            "Detalles"
          ])
        )[0]
      ),
      primerProducto: productos[0] ?? null
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
              asArray(
                getValue(contenedores[0], [
                  "ContenedorDetalle",
                  "ContenedorDetalles",
                  "ContenidoDetalle",
                  "ContenidoDetalles",
                  "Contenido",
                  "Detalle",
                  "Detalles"
                ])
              )[0]
            ),
            primerProducto: productos[0] ?? null
          }
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
