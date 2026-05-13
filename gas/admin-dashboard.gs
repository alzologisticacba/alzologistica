// ══════════════════════════════════════════════════════
//  ALZO 24/7 — Google Apps Script Webhook
//  Instrucciones:
//  1. Abrí tu Google Sheet → Extensiones → Apps Script
//  2. Borrá todo y pegá este código
//  3. Guardá (Ctrl+S)
//  4. Implementar → Nueva implementación → Aplicación web
//  5. Ejecutar como: Yo | Acceso: Cualquier persona
//  6. Copiá la URL → pegala en CarritoPage.tsx como SHEETS_WEBHOOK
//  ⚠️  Cada vez que edites el código hacé NUEVA implementación
// ══════════════════════════════════════════════════════

const SHEET_INFORMACION = "informacion";
const SHEET_DETALLE     = "detalle_info";

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    let body = {};

    // Mismo patrón que PellaClick: payload viene como URLSearchParams
    if (e.parameter && e.parameter.payload) {
      body = JSON.parse(e.parameter.payload);
    } else if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else {
      throw new Error("No payload found");
    }

    const now      = new Date(body.fecha || new Date());
    const fechaStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
    const dia      = now.getDate();
    const mes      = now.getMonth() + 1;
    const anio     = now.getFullYear();

    // ── Hoja "informacion": una fila por pedido ──
    const sheetInfo = ss.getSheetByName(SHEET_INFORMACION) || ss.insertSheet(SHEET_INFORMACION);
    sheetInfo.appendRow([
      fechaStr,
      body.cod_vendedor    || "",
      body.vendedor_nombre || "",
      Number(body.skus)    || 0,
      Number(body.unidades)|| 0,
      Number(body.total)   || 0,
      body.nro_seguimiento || "",
      dia,
      mes,
      anio,
      body.telefono_cliente || "",
    ]);

    // ── Hoja "detalle_info": una fila por item ──
    const sheetDetalle = ss.getSheetByName(SHEET_DETALLE) || ss.insertSheet(SHEET_DETALLE);
    const items = JSON.parse(body.items || "[]");

    items.forEach(function(item) {
      sheetDetalle.appendRow([
        body.nro_seguimiento || "",
        fechaStr,
        body.cod_vendedor    || "",
        body.vendedor_nombre || "",
        item.sku      || "",
        item.name     || "",
        item.rubro    || "",
        item.familia  || "",
        Number(item.qty)      || 0,
        Number(item.price)    || 0,
        Number(item.discount) || 0,
        Number(item.subtotal) || 0,
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testWebhook() {
  const fakeItems = [
    { sku: 101729, name: "TOA.CALIPSO 8UN", rubro: "Toallitas", familia: "Cuidado Personal", qty: 3, price: 875.51, discount: 25, subtotal: 2626.53 },
    { sku: 201001, name: "CHO.MISKY 20X8GR", rubro: "Chocolates", familia: "Golosinas", qty: 2, price: 5308.10, discount: 0, subtotal: 10616.20 },
  ];
  const fake = {
    parameter: {
      payload: JSON.stringify({
        nro_seguimiento: "ALZ-00001",
        fecha:           new Date().toISOString(),
        cod_vendedor:    "5493512260685",
        vendedor_nombre: "Prueba",
        skus:            2,
        unidades:        5,
        total:           13242.73,
        items:           JSON.stringify(fakeItems),
      })
    }
  };
  const result = doPost(fake);
  Logger.log(result.getContent());
}

// ════════════════════════════════════════════════════════════════════
//  ALZO ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════════════

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "ping";
  let payload;
  try {
    if (action === "dashboard") {
      payload = getDashboardData();
    } else {
      payload = { ok: true, mensaje: "GAS Alzo Admin activo" };
    }
  } catch (err) {
    payload = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getDashboardData() {
  const ss         = SpreadsheetApp.getActiveSpreadsheet();
  const hoy        = new Date();
  const mesActual  = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();
  const diaActual  = hoy.getDate();

  const I = { fecha:0, cod_vendedor:1, vendedor:2, skus:3, unidades:4, total:5, nro:6, dia:7, mes:8, anio:9, telefono:10 };
  const D = { nro:0, fecha:1, cod_vendedor:2, vendedor:3, sku:4, name:5, rubro:6, familia:7, qty:8, price:9, discount:10, subtotal:11 };

  const shInfo    = ss.getSheetByName("informacion");
  const shDetalle = ss.getSheetByName("detalle_info");
  const rawInfo    = shInfo    ? shInfo.getDataRange().getValues()    : [];
  const rawDetalle = shDetalle ? shDetalle.getDataRange().getValues() : [];

  const pedidosTodos  = rawInfo.filter(r => r[I.mes] && r[I.anio]);
  const mesPrev       = mesActual === 1 ? 12 : mesActual - 1;
  const anioPrev      = mesActual === 1 ? anioActual - 1 : anioActual;
  const pedidosMes    = pedidosTodos.filter(r => Number(r[I.mes]) === mesActual && Number(r[I.anio]) === anioActual);
  const pedidosMesAnt = pedidosTodos.filter(r => Number(r[I.mes]) === mesPrev   && Number(r[I.anio]) === anioPrev);
  const pedidosHoy    = pedidosMes.filter(r => Number(r[I.dia]) === diaActual);

  const totalMes       = pedidosMes.reduce((s, r) => s + gNum(r[I.total]), 0);
  const ticketPromedio = pedidosMes.length > 0 ? Math.round(totalMes / pedidosMes.length) : 0;
  const telsMes        = new Set(pedidosMes.map(r => r[I.telefono]).filter(Boolean));
  const telsMesAnt     = new Set(pedidosMesAnt.map(r => r[I.telefono]).filter(Boolean));
  const varPedidos     = pedidosMesAnt.length > 0 ? Math.round(((pedidosMes.length - pedidosMesAnt.length) / pedidosMesAnt.length) * 100) : 0;
  const varClientes    = telsMesAnt.size > 0 ? Math.round(((telsMes.size - telsMesAnt.size) / telsMesAnt.size) * 100) : 0;

  const mapDia = {};
  pedidosMes.forEach(r => {
    const k = pad(r[I.dia]) + "/" + pad(r[I.mes]);
    if (!mapDia[k]) mapDia[k] = { fecha: k, pedidos: 0, monto: 0 };
    mapDia[k].pedidos++;
    mapDia[k].monto += gNum(r[I.total]);
  });
  const ventasPorDia = Object.values(mapDia).sort((a, b) => a.fecha.localeCompare(b.fecha));

  const mapVend = {};
  pedidosMes.forEach(r => {
    const v = r[I.vendedor] || "Sin asignar";
    if (!mapVend[v]) mapVend[v] = { vendedor: v, pedidos: 0, monto: 0, _tels: new Set() };
    mapVend[v].pedidos++;
    mapVend[v].monto += gNum(r[I.total]);
    if (r[I.telefono]) mapVend[v]._tels.add(r[I.telefono]);
  });
  const ventasPorVendedor = Object.values(mapVend)
    .map(v => ({ vendedor: v.vendedor, pedidos: v.pedidos, monto: Math.round(v.monto), clientes: v._tels.size }))
    .sort((a, b) => b.pedidos - a.pedidos);

  const mapMes = {};
  pedidosTodos.forEach(r => {
    const m = Number(r[I.mes]), a = Number(r[I.anio]);
    if (!m || !a) return;
    const atras = (anioActual - a) * 12 + (mesActual - m);
    if (atras < 0 || atras >= 12) return;
    const k = pad(m) + "/" + String(a).slice(2);
    if (!mapMes[k]) mapMes[k] = { mes: k, pedidos: 0, monto: 0, _ord: a * 100 + m };
    mapMes[k].pedidos++;
    mapMes[k].monto += gNum(r[I.total]);
  });
  const ventasPorMes = Object.values(mapMes)
    .sort((a, b) => a._ord - b._ord)
    .map(({ mes, pedidos, monto }) => ({ mes, pedidos, monto: Math.round(monto) }));

  const detalleMes = rawDetalle.filter(r => {
    if (!r[D.fecha]) return false;
    let f;
    if (r[D.fecha] instanceof Date) {
      f = r[D.fecha];
    } else {
      const p = String(r[D.fecha]).split(/[\/\s]/);
      if (p.length < 3) return false;
      f = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
    }
    return f.getMonth() + 1 === mesActual && f.getFullYear() === anioActual;
  });

  const mapProd = {};
  detalleMes.forEach(r => {
    const sku = String(r[D.sku]);
    if (!sku || sku === "0" || sku === "") return;
    if (!mapProd[sku]) mapProd[sku] = { codigo: sku, nombre: r[D.name] || sku, categoria: esCigarrillo(r[D.rubro]) ? "cigarrillos" : "varios", cantidadBultos: 0, _nros: new Set() };
    mapProd[sku].cantidadBultos += gNum(r[D.qty]);
    if (r[D.nro]) mapProd[sku]._nros.add(r[D.nro]);
  });
  const topProductos = Object.values(mapProd)
    .map(p => ({ codigo: p.codigo, nombre: p.nombre, categoria: p.categoria, cantidadBultos: p.cantidadBultos, cantidadPedidos: p._nros.size }))
    .sort((a, b) => b.cantidadBultos - a.cantidadBultos)
    .slice(0, 30);

  // Pedidos livianos para filtrado por fecha en el browser (últimos 12 meses)
  const rawPedidos = pedidosTodos
    .filter(r => {
      const atras = (anioActual - Number(r[I.anio])) * 12 + (mesActual - Number(r[I.mes]));
      return atras >= 0 && atras < 12;
    })
    .map(r => ({
      d: Number(r[I.dia]),
      m: Number(r[I.mes]),
      a: Number(r[I.anio]),
      v: r[I.vendedor] || "",
      t: gNum(r[I.total]),
    }));

  return {
    resumen: { totalPedidosHoy: pedidosHoy.length, totalPedidosMes: pedidosMes.length, clientesActivos: telsMes.size, ticketPromedio, variacionPedidosMes: varPedidos, variacionClientes: varClientes },
    ventasPorDia, ventasPorVendedor, ventasPorMes, topProductos, clientes: [],
    rawPedidos,
  };
}

function esCigarrillo(rubro) {
  const r = String(rubro || "").toLowerCase();
  return r.includes("cigarr") || r.includes("tabac");
}

function gNum(val) {
  const n = parseFloat(String(val).replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function pad(n) { return String(n).padStart(2, "0"); }

function testDashboard() {
  const r = getDashboardData();
  Logger.log("Pedidos hoy: "  + r.resumen.totalPedidosHoy);
  Logger.log("Pedidos mes: "  + r.resumen.totalPedidosMes);
  Logger.log("Clientes: "     + r.resumen.clientesActivos);
  Logger.log("Ticket prom: $" + r.resumen.ticketPromedio);
  Logger.log("Top prod: "     + (r.topProductos[0] ? r.topProductos[0].nombre : "—"));
  Logger.log("Raw pedidos: "  + r.rawPedidos.length);
}
