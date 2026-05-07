import { f as createComponent, l as renderHead, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_DeMhYegR.mjs';
import 'piccolore';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect, useCallback } from 'react';
import { s as supabaseClient } from '../../chunks/supabaseClient_Ou7rw0NR.mjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';
import XlsxStyle from 'xlsx-js-style';
/* empty css                                        */
export { renderers } from '../../renderers.mjs';

function HeaderMayorista({ usuario, onLogout, seccion, onSeccion }) {
  const [menuOpen, setMenuOpen] = useState(false);
  function ir(s) {
    onSeccion(s);
    setMenuOpen(false);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("header", { className: "may-header", children: /* @__PURE__ */ jsxs("div", { className: "may-header__inner", children: [
      /* @__PURE__ */ jsx("span", { className: "may-header__title", children: "Portal Mayorista" }),
      /* @__PURE__ */ jsx("img", { src: "/img/alzo_logo.png", alt: "Alzo", className: "may-header__logo-img" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `may-header__burger${menuOpen ? " may-header__burger--open" : ""}`,
          onClick: () => setMenuOpen((o) => !o),
          "aria-label": "Menú",
          children: [
            /* @__PURE__ */ jsx("span", {}),
            /* @__PURE__ */ jsx("span", {}),
            /* @__PURE__ */ jsx("span", {})
          ]
        }
      )
    ] }) }),
    menuOpen && /* @__PURE__ */ jsxs("div", { className: "may-menu", children: [
      /* @__PURE__ */ jsx("div", { className: "may-menu__backdrop", onClick: () => setMenuOpen(false) }),
      /* @__PURE__ */ jsxs("div", { className: "may-menu__panel", children: [
        usuario && /* @__PURE__ */ jsx("div", { className: "may-menu__user", children: usuario }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `may-menu__item${seccion === "presupuesto" ? " may-menu__item--active" : ""}`,
            onClick: () => ir("presupuesto"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "may-menu__item-icon", children: "📋" }),
              "Presupuesto"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `may-menu__item${seccion === "uxb" ? " may-menu__item--active" : ""}`,
            onClick: () => ir("uxb"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "may-menu__item-icon", children: "🔢" }),
              "Consultar UxB"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `may-menu__item${seccion === "imagenes" ? " may-menu__item--active" : ""}`,
            onClick: () => ir("imagenes"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "may-menu__item-icon", children: "🖼️" }),
              "Ver Imágenes de prod"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `may-menu__item${seccion === "mapa" ? " may-menu__item--active" : ""}`,
            onClick: () => ir("mapa"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "may-menu__item-icon", children: "📍" }),
              "Mapa de visitas"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `may-menu__item${seccion === "lista" ? " may-menu__item--active" : ""}`,
            onClick: () => ir("lista"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "may-menu__item-icon", children: "📥" }),
              "Lista de Precios"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: `may-menu__item${seccion === "flyer" ? " may-menu__item--active" : ""}`,
            onClick: () => ir("flyer"),
            children: [
              /* @__PURE__ */ jsx("span", { className: "may-menu__item-icon", children: "🎨" }),
              "Generador de Flyers"
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "may-menu__divider" }),
        /* @__PURE__ */ jsxs("button", { className: "may-menu__item may-menu__item--logout", onClick: () => {
          onLogout?.();
          setMenuOpen(false);
        }, children: [
          /* @__PURE__ */ jsx("span", { className: "may-menu__item-icon", children: "🚪" }),
          "Salir"
        ] })
      ] })
    ] })
  ] });
}

function fmt$3(n) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function ExportarPresupuesto({ lineas, totalPedido, onClose, onClearAndClose }) {
  const previewRef = useRef(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const fecha = (/* @__PURE__ */ new Date()).toLocaleDateString("es-AR");
  function handleClose() {
    setConfirmando(true);
  }
  function exportExcel() {
    const rows = lineas.map((l) => ({
      "Código": l.codArt,
      "Descripción": l.descripcion,
      "Precio Unit.": l.precio,
      "Cantidad": l.cantidad,
      "Descuento %": l.descuento || 0,
      "Subtotal": l.subtotal
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const totalRow = lineas.length + 2;
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "TOTAL", totalPedido]], { origin: `A${totalRow}` });
    ws["!cols"] = [{ wch: 12 }, { wch: 40 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");
    XLSX.writeFile(wb, `presupuesto_${fecha.replace(/\//g, "-")}.xlsx`);
  }
  function exportPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Alzo Logística", 14, 12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Presupuesto Mayorista", 14, 20);
    doc.text(`Fecha: ${fecha}`, 150, 20);
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: 34,
      head: [["Código", "Descripción", "Precio Unit.", "Cant.", "Dto.", "Subtotal"]],
      body: lineas.map((l) => [
        l.codArt,
        l.descripcion,
        `$ ${fmt$3(l.precio)}`,
        l.cantidad,
        l.descuento > 0 ? `${l.descuento.toFixed(2)}%` : "-",
        `$ ${fmt$3(l.subtotal)}`
      ]),
      foot: [["", "", "", "", "Total", `$ ${fmt$3(totalPedido)}`]],
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [240, 242, 245], textColor: [15, 23, 42], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 18, halign: "center" },
        5: { cellWidth: 28, halign: "right" }
      }
    });
    doc.save(`presupuesto_${fecha.replace(/\//g, "-")}.pdf`);
  }
  async function exportImage() {
    if (!previewRef.current) return;
    setLoadingImg(true);
    try {
      const png = await toPng(previewRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const a = document.createElement("a");
      a.href = png;
      a.download = `presupuesto_${fecha.replace(/\//g, "-")}.png`;
      a.click();
    } finally {
      setLoadingImg(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "may-export-overlay", onClick: handleClose, children: [
    /* @__PURE__ */ jsx("div", { className: "may-export-modal", onClick: (e) => e.stopPropagation(), children: confirmando ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("h3", { className: "may-export-title", children: "¿Qué querés hacer?" }),
      /* @__PURE__ */ jsxs("p", { className: "may-export-sub", children: [
        "El presupuesto tiene ",
        lineas.length,
        " ítem",
        lineas.length !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "may-export-confirm-btns", children: [
        /* @__PURE__ */ jsx("button", { className: "may-export-confirm-btn may-export-confirm-btn--borrar", onClick: onClearAndClose, children: "Borrar presupuesto" }),
        /* @__PURE__ */ jsx("button", { className: "may-export-confirm-btn may-export-confirm-btn--seguir", onClick: onClose, children: "Seguir editando" })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("button", { className: "may-export-close", onClick: handleClose, children: "✕" }),
      /* @__PURE__ */ jsx("h3", { className: "may-export-title", children: "Exportar presupuesto" }),
      /* @__PURE__ */ jsxs("p", { className: "may-export-sub", children: [
        lineas.length,
        " ítem",
        lineas.length !== 1 ? "s" : "",
        " · Total $ ",
        fmt$3(totalPedido)
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "may-export-options", children: [
        /* @__PURE__ */ jsxs("button", { className: "may-export-btn", onClick: exportImage, disabled: loadingImg, children: [
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__icon", children: "🖼️" }),
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__label", children: loadingImg ? "Generando…" : "Imagen" }),
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__sub", children: "PNG" })
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "may-export-btn", onClick: exportPDF, children: [
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__icon", children: "📄" }),
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__label", children: "PDF" }),
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__sub", children: "A4" })
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "may-export-btn", onClick: exportExcel, children: [
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__icon", children: "📊" }),
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__label", children: "Excel" }),
          /* @__PURE__ */ jsx("span", { className: "may-export-btn__sub", children: "XLSX" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { style: { position: "fixed", left: -9999, top: 0, pointerEvents: "none" }, children: /* @__PURE__ */ jsxs("div", { ref: previewRef, style: {
      width: 640,
      background: "#fff",
      fontFamily: "Arial, sans-serif",
      borderRadius: 12,
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: { background: "#0f172a", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { style: { color: "#fff", fontSize: 20, fontWeight: 800 }, children: "Alzo Logística" }),
          /* @__PURE__ */ jsx("div", { style: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }, children: "Presupuesto Mayorista" })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { color: "rgba(255,255,255,0.6)", fontSize: 12 }, children: fecha })
      ] }),
      /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 }, children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { style: { background: "#f0f2f5" }, children: ["Código", "Descripción", "Precio Unit.", "Cant.", "Dto.", "Subtotal"].map((h) => /* @__PURE__ */ jsx("th", { style: { padding: "10px 12px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsx("tbody", { children: lineas.map((l, i) => /* @__PURE__ */ jsxs("tr", { style: { background: i % 2 === 0 ? "#fff" : "#f8f9fc", borderBottom: "1px solid #f0f2f5" }, children: [
          /* @__PURE__ */ jsx("td", { style: { padding: "10px 12px", color: "#3300ff", fontWeight: 700 }, children: l.codArt }),
          /* @__PURE__ */ jsx("td", { style: { padding: "10px 12px", color: "#1a1a2e", fontWeight: 500 }, children: l.descripcion }),
          /* @__PURE__ */ jsxs("td", { style: { padding: "10px 12px", color: "#64748b" }, children: [
            "$ ",
            fmt$3(l.precio)
          ] }),
          /* @__PURE__ */ jsx("td", { style: { padding: "10px 12px", textAlign: "center" }, children: l.cantidad }),
          /* @__PURE__ */ jsx("td", { style: { padding: "10px 12px", textAlign: "center", color: l.descuento > 0 ? "#f59e0b" : "#94a3b8" }, children: l.descuento > 0 ? `${l.descuento.toFixed(2)}%` : "-" }),
          /* @__PURE__ */ jsxs("td", { style: { padding: "10px 12px", fontWeight: 700, color: "#1a1a2e" }, children: [
            "$ ",
            fmt$3(l.subtotal)
          ] })
        ] }, l.id)) }),
        /* @__PURE__ */ jsx("tfoot", { children: /* @__PURE__ */ jsxs("tr", { style: { background: "#0f172a" }, children: [
          /* @__PURE__ */ jsx("td", { colSpan: 5, style: { padding: "14px 12px", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13 }, children: "TOTAL" }),
          /* @__PURE__ */ jsxs("td", { style: { padding: "14px 12px", color: "#fff", fontWeight: 800, fontSize: 15 }, children: [
            "$ ",
            fmt$3(totalPedido)
          ] })
        ] }) })
      ] })
    ] }) })
  ] });
}

function fmt$2(n) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function BuscadorProducto({
  onSelect,
  onClear
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);
  const stockCodes = useRef([]);
  useEffect(() => {
    async function fetchStock() {
      const { data, error } = await supabaseClient.from("stocks").select("codigo").gt("stock", 0);
      if (error) {
        console.error("Error cargando stocks:", error);
      }
      const codes = (data ?? []).map((s) => s.codigo);
      console.log(`Stocks cargados: ${codes.length} artículos con stock`);
      stockCodes.current = codes;
    }
    fetchStock();
  }, []);
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const q = query.trim();
      function dedup(items) {
        const seen = /* @__PURE__ */ new Set();
        return items.filter((item) => {
          const cod = item["Cod. Art"] ?? item["cod. art"];
          if (seen.has(cod)) return false;
          seen.add(cod);
          return true;
        });
      }
      const isNum = /^\d+$/.test(q);
      const [textRes, articulosCodeRes] = await Promise.all([
        supabaseClient.from("articulos_mayorista").select("*").or(`Descripcion.ilike.%${q}%,Proveedor.ilike.%${q}%`).limit(20),
        isNum ? supabaseClient.from("articulos").select("codigo").filter("codigo_str", "ilike", `%${q}%`).limit(10) : Promise.resolve({ data: [], error: null })
      ]);
      const matchingCodes = (articulosCodeRes.data ?? []).map((a) => a.codigo);
      let codeData = [];
      if (matchingCodes.length > 0) {
        const orFilter = matchingCodes.map((c) => `"Cod. Art".eq.${c}`).join(",");
        const { data } = await supabaseClient.from("articulos_mayorista").select("*").or(orFilter).limit(10);
        codeData = data ?? [];
      }
      let merged = [...codeData, ...textRes.data ?? []];
      const codes = stockCodes.current;
      if (codes.length > 0) {
        const codesSet = new Set(codes);
        merged = merged.filter((item) => {
          const cod = item["Cod. Art"] ?? item["cod. art"];
          return codesSet.has(cod);
        });
      }
      setResultados(dedup(merged).slice(0, 10));
      setOpen(true);
      setLoading(false);
    }, 150);
  }, [query]);
  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  function handleSelect(a) {
    setSeleccionado(a);
    setQuery("");
    setOpen(false);
    setResultados([]);
    onSelect(a);
  }
  function handleClear() {
    setSeleccionado(null);
    setQuery("");
    setResultados([]);
    onClear?.();
  }
  if (seleccionado) {
    return /* @__PURE__ */ jsxs("div", { className: "may-selected-chip", children: [
      /* @__PURE__ */ jsx("span", { className: "may-selected-chip__cod", children: seleccionado["Cod. Art"] }),
      /* @__PURE__ */ jsx("span", { className: "may-selected-chip__name", children: seleccionado.Descripcion ?? seleccionado.descripcion }),
      /* @__PURE__ */ jsx("button", { className: "may-selected-chip__clear", onClick: handleClear, children: "✕" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { ref: wrapRef, className: "may-buscador-wrap", children: [
    /* @__PURE__ */ jsxs("div", { className: "may-buscador-input-wrap", children: [
      /* @__PURE__ */ jsx("span", { className: "may-buscador-icon", children: "🔍" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "may-buscador-input",
          placeholder: "Buscar por código, descripción o proveedor...",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          onFocus: () => resultados.length > 0 && setOpen(true),
          autoComplete: "off"
        }
      ),
      query && /* @__PURE__ */ jsx("button", { className: "may-buscador-clear", onClick: () => setQuery(""), children: "✕" })
    ] }),
    open && /* @__PURE__ */ jsxs("div", { className: "may-buscador-dropdown", children: [
      loading && /* @__PURE__ */ jsx("div", { className: "may-buscador-empty", children: "Buscando…" }),
      !loading && resultados.length === 0 && /* @__PURE__ */ jsxs("div", { className: "may-buscador-empty", children: [
        'Sin resultados para "',
        query,
        '"'
      ] }),
      resultados.map((a) => /* @__PURE__ */ jsxs(
        "button",
        {
          className: "may-buscador-item",
          onMouseDown: (e) => {
            e.preventDefault();
            handleSelect(a);
          },
          children: [
            /* @__PURE__ */ jsx("span", { className: "may-buscador-item__name", children: a.Descripcion ?? a.descripcion }),
            /* @__PURE__ */ jsxs("span", { className: "may-buscador-item__meta", children: [
              /* @__PURE__ */ jsxs("span", { className: "may-buscador-item__cod", children: [
                "#",
                a["Cod. Art"] ?? a["cod. art"]
              ] }),
              (a["Precio Vta Final"] ?? a["precio vta final"]) > 0 && /* @__PURE__ */ jsxs("span", { className: "may-buscador-item__price", children: [
                "$ ",
                (a["Precio Vta Final"] ?? a["precio vta final"]).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              ] })
            ] })
          ]
        },
        a["Cod. Art"] ?? a["cod. art"]
      ))
    ] })
  ] });
}
function PresupuestoMayorista() {
  const [articulo, setArticulo] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [descuento, setDescuento] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioBase, setPrecioBase] = useState(0);
  const [multiplo, setMultiplo] = useState(0);
  const [uxbValue, setUxbValue] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [buscadorKey, setBuscadorKey] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [pactada, setPactada] = useState(false);
  const nextId = useRef(1);
  const cant = parseFloat(cantidad) || 0;
  const prec = parseFloat(precio) || 0;
  const costoFinal = articulo?.["Costo Final"] ?? 0;
  const topeDto = articulo?.["Tope Dto"] ?? 100;
  const descCalculado = precioBase > 0 && prec > 0 ? (1 - prec / precioBase) * 100 : 0;
  const descEfectivo = descCalculado;
  const subtotal = prec * cant;
  const totalPedidoBase = lineas.reduce((s, l) => s + l.subtotal, 0);
  const totalCosto = lineas.reduce((s, l) => s + l.costoFinal * l.cantidad, 0);
  const totalPedido = totalPedidoBase;
  const projBaseTotal = totalPedidoBase + prec * cant;
  const projTotalCosto = totalCosto + costoFinal * cant;
  const rentabilidad = projBaseTotal > 0 ? pactada ? (projBaseTotal - projTotalCosto / 1.105) / projBaseTotal * 100 : (projBaseTotal - projTotalCosto) / projBaseTotal * 100 : 0;
  function rentColor(r) {
    if (r >= 18) return "#22c55e";
    if (r >= 13) return "#f59e0b";
    return "#ef4444";
  }
  function handleDescuento(val) {
    setDescuento(val);
    if (precioBase <= 0) return;
    const d = parseFloat(val) || 0;
    setPrecio((precioBase * (1 - d / 100)).toFixed(2));
  }
  function handlePrecio(val) {
    setPrecio(val);
    const parsed = parseFloat(val);
    if (precioBase > 0 && !isNaN(parsed) && parsed > 0) {
      setDescuento(((1 - parsed / precioBase) * 100).toFixed(2));
    } else {
      setDescuento("");
    }
  }
  const descExcedeTope = articulo && (parseFloat(descuento) || 0) > topeDto && (parseFloat(descuento) || 0) > 0;
  const cantInvalida = multiplo > 1 && cant > 0 && cant % multiplo !== 0;
  function handleCargar() {
    if (!articulo || cant <= 0 || prec <= 0) return;
    const id = nextId.current++;
    const linea = {
      id,
      codArt: articulo["Cod. Art"],
      descripcion: articulo.Descripcion,
      costoFinal,
      cantidad: cant,
      multiplo: multiplo > 0 ? multiplo : 1,
      precio: prec,
      precioBase,
      topeDto,
      descuento: descEfectivo,
      subtotal,
      rentabilidad
    };
    setLineas((prev) => [...prev, linea]);
    setArticulo(null);
    setPrecioBase(0);
    setCantidad("");
    setDescuento("");
    setPrecio("");
    setBuscadorKey((k) => k + 1);
  }
  function handleRemove(id) {
    setLineas((prev) => prev.filter((l) => l.id !== id));
  }
  const rentTotal = totalPedidoBase > 0 ? pactada ? (totalPedidoBase - totalCosto / 1.105) / totalPedidoBase * 100 : (totalPedidoBase - totalCosto) / totalPedidoBase * 100 : 0;
  const canCargar = !!articulo && cant > 0 && prec > 0 && !cantInvalida;
  return /* @__PURE__ */ jsxs("div", { className: "may-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "may-card", children: [
      /* @__PURE__ */ jsx("h2", { className: "may-card__title", children: "Nuevo ítem" }),
      /* @__PURE__ */ jsxs("div", { className: "may-field may-field--full", children: [
        /* @__PURE__ */ jsx("label", { className: "may-label", children: "Producto" }),
        /* @__PURE__ */ jsx(
          BuscadorProducto,
          {
            onSelect: async (a) => {
              setArticulo(a);
              const base = a["Precio Vta Final"] ?? 0;
              setPrecioBase(base);
              setPrecio(base > 0 ? base.toFixed(2) : "");
              setDescuento(base > 0 ? "0.00" : "");
              const { data } = await supabaseClient.from("articulos").select("multiplo, uxb").eq("codigo", a["Cod. Art"]).single();
              setMultiplo(data?.multiplo ?? 0);
              setUxbValue(data?.uxb ?? null);
            },
            onClear: () => {
              setArticulo(null);
              setPrecioBase(0);
              setDescuento("");
              setPrecio("");
              setMultiplo(0);
              setUxbValue(null);
            }
          },
          buscadorKey
        ),
        uxbValue !== null && /* @__PURE__ */ jsxs("div", { className: "may-uxb-inline", children: [
          /* @__PURE__ */ jsx("span", { className: "may-uxb-inline__label", children: "UxB:" }),
          /* @__PURE__ */ jsx("span", { className: "may-uxb-inline__val", children: uxbValue })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "may-grid-2x2", children: [
        /* @__PURE__ */ jsxs("div", { className: "may-field", children: [
          /* @__PURE__ */ jsx("label", { className: "may-label", children: "Cantidad" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              className: `may-input${cantInvalida ? " may-input--error" : ""}`,
              placeholder: "0",
              min: multiplo > 1 ? multiplo : 1,
              step: multiplo > 1 ? multiplo : 1,
              value: cantidad,
              onChange: (e) => setCantidad(e.target.value)
            }
          ),
          multiplo > 1 && !cantInvalida && /* @__PURE__ */ jsxs("span", { className: "may-input-hint", children: [
            "Múltiplo: ",
            multiplo
          ] }),
          cantInvalida && /* @__PURE__ */ jsxs("span", { className: "may-input-error-msg", children: [
            "Múltiplo de ",
            multiplo
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "may-field", children: [
          /* @__PURE__ */ jsx("label", { className: "may-label", children: "Descuento %" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              className: `may-input${descExcedeTope ? " may-input--error" : ""}`,
              placeholder: "0",
              min: "0",
              value: descuento,
              onChange: (e) => handleDescuento(e.target.value)
            }
          ),
          descExcedeTope && /* @__PURE__ */ jsxs("span", { className: "may-input-error-msg", children: [
            "Tope: ",
            topeDto,
            "%"
          ] }),
          articulo && !descExcedeTope && /* @__PURE__ */ jsxs("span", { className: "may-input-hint", children: [
            "Tope sugerido: ",
            topeDto,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "may-field", children: [
          /* @__PURE__ */ jsx("label", { className: "may-label", children: "Precio Vta" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              className: "may-input",
              placeholder: "0.00",
              min: "0",
              value: precio,
              onChange: (e) => handlePrecio(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "may-field", children: [
          /* @__PURE__ */ jsx("label", { className: "may-label", children: "Profit" }),
          /* @__PURE__ */ jsx("div", { className: "may-margen-display", children: /* @__PURE__ */ jsx("span", { style: { color: cant > 0 && prec > 0 ? rentColor(rentabilidad) : "#aab0c6" }, children: cant > 0 && prec > 0 ? `${rentabilidad.toFixed(1)}%` : "—" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `may-btn-cargar${canCargar ? "" : " may-btn-cargar--disabled"}`,
          onClick: handleCargar,
          disabled: !canCargar,
          children: "Cargar"
        }
      )
    ] }),
    lineas.length > 0 && /* @__PURE__ */ jsxs("div", { className: "may-card may-presup", children: [
      /* @__PURE__ */ jsxs("div", { className: "may-presup__header", children: [
        /* @__PURE__ */ jsx("h2", { className: "may-card__title", children: "Presupuesto" }),
        /* @__PURE__ */ jsxs("div", { className: "may-totales", children: [
          /* @__PURE__ */ jsxs("label", { className: "may-pactada", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: pactada,
                onChange: (e) => setPactada(e.target.checked),
                className: "may-pactada__check"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "may-pactada__label", children: "Pactada" })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "may-totales__item", children: [
            "Total: ",
            /* @__PURE__ */ jsxs("strong", { children: [
              "$ ",
              fmt$2(totalPedido)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "may-totales__rent", style: { color: rentColor(rentTotal) }, children: [
            "Profit: ",
            /* @__PURE__ */ jsxs("strong", { children: [
              rentTotal.toFixed(1),
              "%"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "may-presup__list", children: lineas.map((l) => /* @__PURE__ */ jsxs("div", { className: "may-item", children: [
        /* @__PURE__ */ jsxs("div", { className: "may-item__top", children: [
          /* @__PURE__ */ jsxs("span", { className: "may-item__cod", children: [
            "#",
            l.codArt
          ] }),
          /* @__PURE__ */ jsx("button", { className: "may-btn-remove", onClick: () => setConfirmRemoveId(l.id), children: "✕" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "may-item__desc", children: l.descripcion }),
        /* @__PURE__ */ jsxs("div", { className: "may-item__bottom", children: [
          /* @__PURE__ */ jsxs("span", { className: "may-item__qty", children: [
            l.cantidad,
            " x $ ",
            fmt$2(l.precio),
            l.descuento > 0 && /* @__PURE__ */ jsxs("span", { className: "may-item__desc-pct", style: { marginLeft: 6 }, children: [
              "-",
              l.descuento.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "may-item__right", children: /* @__PURE__ */ jsxs("span", { className: "may-item__total", children: [
            "$ ",
            fmt$2(l.subtotal)
          ] }) })
        ] })
      ] }, l.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "may-enviar-wrap", children: [
        rentTotal < 13 && rentTotal > 0 && /* @__PURE__ */ jsxs("p", { className: "may-enviar-warning", children: [
          "Profit mínimo para enviar: 13% (actual: ",
          rentTotal.toFixed(1),
          "%)"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `may-btn-enviar${rentTotal >= 13 ? "" : " may-btn-enviar--disabled"}`,
            onClick: () => setExportOpen(true),
            disabled: rentTotal < 13,
            children: "Enviar pedido"
          }
        )
      ] })
    ] }),
    confirmRemoveId !== null && /* @__PURE__ */ jsx("div", { className: "may-export-overlay", onClick: () => setConfirmRemoveId(null), children: /* @__PURE__ */ jsxs("div", { className: "may-export-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("h3", { className: "may-export-title", children: "¿Borrar este ítem?" }),
      /* @__PURE__ */ jsx("p", { className: "may-export-sub", children: lineas.find((l) => l.id === confirmRemoveId)?.descripcion }),
      /* @__PURE__ */ jsxs("div", { className: "may-export-confirm-btns", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "may-export-confirm-btn may-export-confirm-btn--borrar",
            onClick: () => {
              handleRemove(confirmRemoveId);
              setConfirmRemoveId(null);
            },
            children: "Sí, borrar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "may-export-confirm-btn may-export-confirm-btn--seguir",
            onClick: () => setConfirmRemoveId(null),
            children: "Cancelar"
          }
        )
      ] })
    ] }) }),
    exportOpen && /* @__PURE__ */ jsx(
      ExportarPresupuesto,
      {
        lineas,
        totalPedido,
        onClose: () => setExportOpen(false),
        onClearAndClose: () => {
          setLineas([]);
          setExportOpen(false);
        }
      }
    )
  ] });
}

function ConsultaUxB() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const q = query.trim();
      const isNum = /^\d+$/.test(q);
      const promises = [
        supabaseClient.from("articulos").select("codigo, descripcion, proveedor, uxb, precioFinal").ilike("descripcion", `%${q}%`).limit(15),
        supabaseClient.from("articulos").select("codigo, descripcion, proveedor, uxb, precioFinal").ilike("proveedor", `%${q}%`).limit(8)
      ];
      if (isNum) {
        promises.push(
          supabaseClient.from("articulos").select("codigo, descripcion, proveedor, uxb, precioFinal").ilike("codigo_str", `%${q}%`).limit(5)
        );
      }
      const results = await Promise.all(promises);
      const seen = /* @__PURE__ */ new Set();
      const merged = [];
      for (const { data } of results) {
        for (const item of data ?? []) {
          if (!seen.has(item.codigo)) {
            seen.add(item.codigo);
            merged.push(item);
          }
        }
      }
      setResultados(merged.slice(0, 15));
      setLoading(false);
    }, 200);
  }, [query]);
  return /* @__PURE__ */ jsx("div", { className: "may-page", children: /* @__PURE__ */ jsxs("div", { className: "may-card", children: [
    /* @__PURE__ */ jsx("h2", { className: "may-card__title", children: "Consultar UxB" }),
    /* @__PURE__ */ jsxs("div", { className: "may-field may-field--full", children: [
      /* @__PURE__ */ jsx("label", { className: "may-label", children: "Buscar producto" }),
      /* @__PURE__ */ jsxs("div", { className: "may-buscador-input-wrap", children: [
        /* @__PURE__ */ jsx("span", { className: "may-buscador-icon", children: "🔍" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "may-buscador-input",
            placeholder: "Descripción, proveedor o código...",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            autoComplete: "off"
          }
        ),
        query && /* @__PURE__ */ jsx("button", { className: "may-buscador-clear", onClick: () => {
          setQuery("");
          setResultados([]);
        }, children: "✕" })
      ] })
    ] }),
    loading && /* @__PURE__ */ jsx("div", { className: "may-uxb-empty", children: "Buscando…" }),
    !loading && query.length >= 2 && resultados.length === 0 && /* @__PURE__ */ jsxs("div", { className: "may-uxb-empty", children: [
      'Sin resultados para "',
      query,
      '"'
    ] }),
    resultados.length > 0 && /* @__PURE__ */ jsx("div", { className: "may-uxb-list", children: resultados.map((a) => /* @__PURE__ */ jsxs("div", { className: "may-uxb-item", children: [
      /* @__PURE__ */ jsxs("div", { className: "may-uxb-item__top", children: [
        /* @__PURE__ */ jsxs("span", { className: "may-uxb-item__cod", children: [
          "#",
          a.codigo
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "may-uxb-item__uxb", children: [
          /* @__PURE__ */ jsx("span", { className: "may-uxb-item__uxb-label", children: "UxB" }),
          /* @__PURE__ */ jsx("span", { className: "may-uxb-item__uxb-val", children: a.uxb ?? "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "may-uxb-item__desc", children: a.descripcion })
    ] }, a.codigo)) })
  ] }) });
}

const IMG_BASE$1 = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";
function ProductImg({ codigo, descripcion }) {
  const [err, setErr] = useState(false);
  if (err) {
    return /* @__PURE__ */ jsxs("div", { className: "may-img-placeholder", children: [
      /* @__PURE__ */ jsx("span", { children: "📦" }),
      /* @__PURE__ */ jsx("span", { children: "Sin imagen" })
    ] });
  }
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: `${IMG_BASE$1}/${codigo}.png`,
      alt: descripcion,
      className: "may-img-photo",
      onError: () => setErr(true),
      loading: "lazy"
    }
  );
}
function ImagenesProducto() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const q = query.trim();
      const isNum = /^\d+$/.test(q);
      const promises = [
        supabaseClient.from("articulos").select("codigo, descripcion, proveedor").ilike("descripcion", `%${q}%`).limit(12),
        supabaseClient.from("articulos").select("codigo, descripcion, proveedor").ilike("proveedor", `%${q}%`).limit(8)
      ];
      if (isNum) {
        promises.push(
          supabaseClient.from("articulos").select("codigo, descripcion, proveedor").ilike("codigo_str", `%${q}%`).limit(5)
        );
      }
      const results = await Promise.all(promises);
      const seen = /* @__PURE__ */ new Set();
      const merged = [];
      for (const { data } of results) {
        for (const item of data ?? []) {
          if (!seen.has(item.codigo)) {
            seen.add(item.codigo);
            merged.push(item);
          }
        }
      }
      setResultados(merged.slice(0, 12));
      setLoading(false);
    }, 200);
  }, [query]);
  return /* @__PURE__ */ jsxs("div", { className: "may-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "may-card", children: [
      /* @__PURE__ */ jsx("h2", { className: "may-card__title", children: "Ver Imágenes de prod" }),
      /* @__PURE__ */ jsxs("div", { className: "may-field may-field--full", children: [
        /* @__PURE__ */ jsx("label", { className: "may-label", children: "Buscar producto" }),
        /* @__PURE__ */ jsxs("div", { className: "may-buscador-input-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "may-buscador-icon", children: "🔍" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "may-buscador-input",
              placeholder: "Descripción, proveedor o código...",
              value: query,
              onChange: (e) => {
                setQuery(e.target.value);
                setSelected(null);
              },
              autoComplete: "off"
            }
          ),
          query && /* @__PURE__ */ jsx("button", { className: "may-buscador-clear", onClick: () => {
            setQuery("");
            setResultados([]);
            setSelected(null);
          }, children: "✕" })
        ] })
      ] }),
      loading && /* @__PURE__ */ jsx("div", { className: "may-uxb-empty", children: "Buscando…" }),
      !loading && query.length >= 2 && resultados.length === 0 && /* @__PURE__ */ jsxs("div", { className: "may-uxb-empty", children: [
        'Sin resultados para "',
        query,
        '"'
      ] })
    ] }),
    resultados.length > 0 && !selected && /* @__PURE__ */ jsx("div", { className: "may-card", children: /* @__PURE__ */ jsx("div", { className: "may-img-grid", children: resultados.map((a) => /* @__PURE__ */ jsxs("button", { className: "may-img-card", onClick: () => setSelected(a), children: [
      /* @__PURE__ */ jsx(ProductImg, { codigo: a.codigo, descripcion: a.descripcion }),
      /* @__PURE__ */ jsxs("div", { className: "may-img-card__info", children: [
        /* @__PURE__ */ jsxs("span", { className: "may-img-card__cod", children: [
          "#",
          a.codigo
        ] }),
        /* @__PURE__ */ jsx("span", { className: "may-img-card__name", children: a.descripcion })
      ] })
    ] }, a.codigo)) }) }),
    selected && /* @__PURE__ */ jsxs("div", { className: "may-card", children: [
      /* @__PURE__ */ jsx("button", { className: "may-img-back", onClick: () => setSelected(null), children: "← Volver" }),
      /* @__PURE__ */ jsxs("div", { className: "may-img-detail", children: [
        /* @__PURE__ */ jsx(ProductImg, { codigo: selected.codigo, descripcion: selected.descripcion }),
        /* @__PURE__ */ jsxs("div", { className: "may-img-detail__info", children: [
          /* @__PURE__ */ jsxs("span", { className: "may-img-card__cod", children: [
            "#",
            selected.codigo
          ] }),
          /* @__PURE__ */ jsx("span", { className: "may-img-detail__name", children: selected.descripcion })
        ] })
      ] })
    ] })
  ] });
}

const COLORES_PBI = [
  "#118DFF",
  "#E66C37",
  "#6B007B",
  "#E044A7",
  "#744EC2",
  "#D9B300",
  "#D64550",
  "#00B7C3",
  "#10B46D",
  "#F4511E"
];
function emailToColor(email) {
  let hash = 0;
  for (const c of email) hash = Math.imul(31, hash) + c.charCodeAt(0) | 0;
  return COLORES_PBI[Math.abs(hash) % COLORES_PBI.length];
}
function IconGPS() {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" }),
        /* @__PURE__ */ jsx("path", { d: "M12 2v3M12 19v3M2 12h3M19 12h3" }),
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "8", strokeOpacity: "0.4" })
      ]
    }
  );
}
function MapaVentas({ usuario }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersMap = useRef(/* @__PURE__ */ new Map());
  const LRef = useRef(null);
  const visitasRef = useRef([]);
  const [visitas, setVisitas] = useState([]);
  const [pendingPos, setPendingPos] = useState(null);
  const pendingMarkerRef = useRef(null);
  const [etiqueta, setEtiqueta] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [ubicandoGPS, setUbicandoGPS] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then((mod) => {
      const Lf = mod.default ?? mod;
      LRef.current = Lf;
      const map = Lf.map(mapRef.current, {
        center: [-31.4135, -64.1811],
        // Córdoba, Argentina
        zoom: 13,
        zoomControl: true
      });
      Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);
      map.on("click", (e) => {
        if (pendingMarkerRef.current) {
          map.removeLayer(pendingMarkerRef.current);
          pendingMarkerRef.current = null;
        }
        const pos = { lat: e.latlng.lat, lng: e.latlng.lng };
        const miColor2 = emailToColor(usuario);
        const m = Lf.circleMarker([pos.lat, pos.lng], {
          radius: 11,
          fillColor: miColor2,
          color: "#fff",
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.55,
          className: "may-mapa-pending-marker"
        }).addTo(map);
        pendingMarkerRef.current = m;
        setPendingPos(pos);
        setEtiqueta("");
        setErrorMsg("");
      });
      mapInstance.current = map;
      addMarkersToMap(Lf, map, visitasRef.current);
      leerPuntoDeURL(Lf, map);
    });
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);
  useEffect(() => {
    supabaseClient.from("visitas_mapa").select("*").order("created_at", { ascending: true }).then(({ data }) => {
      const rows = data ?? [];
      visitasRef.current = rows;
      setVisitas(rows);
    });
    const ch = supabaseClient.channel("visitas_mapa_rt").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "visitas_mapa" },
      (p) => {
        const v = p.new;
        visitasRef.current = [...visitasRef.current, v];
        setVisitas((prev) => [...prev, v]);
      }
    ).on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "visitas_mapa" },
      (p) => {
        const id = p.old.id;
        visitasRef.current = visitasRef.current.filter((x) => x.id !== id);
        setVisitas((prev) => prev.filter((x) => x.id !== id));
      }
    ).subscribe();
    return () => {
      supabaseClient.removeChannel(ch);
    };
  }, []);
  useEffect(() => {
    const map = mapInstance.current;
    const Lf = LRef.current;
    if (!map || !Lf) return;
    addMarkersToMap(Lf, map, visitas);
    markersMap.current.forEach((m, id) => {
      if (!visitas.find((v) => v.id === id)) {
        map.removeLayer(m);
        markersMap.current.delete(id);
      }
    });
  }, [visitas]);
  function addMarkersToMap(Lf, map, list) {
    list.forEach((v) => {
      if (markersMap.current.has(v.id)) return;
      const color = emailToColor(v.usuario);
      const esMio = v.usuario === usuario;
      const fecha = new Date(v.created_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
      const mapsUrl = `https://www.google.com/maps?q=${v.lat},${v.lng}`;
      const portalUrl = `${window.location.origin}/247/mayorista?punto=${v.lat},${v.lng}`;
      const popupHtml = `
        <div class="may-mapa-popup">
          <span class="may-mapa-popup__user" style="color:${color}">${v.usuario.split("@")[0]}</span>
          ${v.etiqueta ? `<span class="may-mapa-popup__label">${v.etiqueta}</span>` : ""}
          <span class="may-mapa-popup__date">${fecha}</span>
          <div class="may-mapa-popup__actions">
            <button id="share-${v.id}" class="may-mapa-popup__share">&#x1F4E4; Compartir</button>
            <a href="${mapsUrl}" target="_blank" rel="noopener" class="may-mapa-popup__maps">&#x1F5FA; Maps</a>
            ${esMio ? `<button id="del-${v.id}" class="may-mapa-popup__del">Eliminar</button>` : ""}
          </div>
        </div>`;
      const m = Lf.circleMarker([v.lat, v.lng], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).bindPopup(popupHtml, { minWidth: 180 });
      m.on("popupopen", () => {
        setTimeout(() => {
          document.getElementById(`share-${v.id}`)?.addEventListener("click", () => {
            const titulo = v.etiqueta ?? `Visita de ${v.usuario.split("@")[0]}`;
            const texto = v.etiqueta ? `${v.etiqueta} — Ver en el portal: ${portalUrl}` : `Visita de ${v.usuario.split("@")[0]} — Ver en el portal: ${portalUrl}`;
            if (navigator.share) {
              navigator.share({ title: titulo, text: texto, url: portalUrl });
            } else {
              navigator.clipboard.writeText(portalUrl).then(() => {
                const btn = document.getElementById(`share-${v.id}`);
                if (btn) {
                  btn.textContent = "✓ Copiado!";
                  setTimeout(() => {
                    btn.textContent = "📤 Compartir";
                  }, 1800);
                }
              });
            }
          });
          if (esMio) {
            document.getElementById(`del-${v.id}`)?.addEventListener("click", () => borrarVisita(v.id));
          }
        }, 50);
      });
      m.addTo(map);
      markersMap.current.set(v.id, m);
    });
  }
  function leerPuntoDeURL(Lf, map) {
    const params = new URLSearchParams(window.location.search);
    const punto = params.get("punto");
    if (!punto) return;
    const [latStr, lngStr] = punto.split(",");
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) return;
    map.setView([lat, lng], 17);
    const ring = Lf.circleMarker([lat, lng], {
      radius: 22,
      fillColor: "transparent",
      color: "#118DFF",
      weight: 3,
      opacity: 1,
      fillOpacity: 0,
      className: "may-mapa-highlight-ring"
    }).addTo(map);
    setTimeout(() => {
      map.removeLayer(ring);
    }, 4e3);
    const url = new URL(window.location.href);
    url.searchParams.delete("punto");
    window.history.replaceState({}, "", url.toString());
  }
  function usarGPS() {
    if (!navigator.geolocation) {
      setErrorMsg("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setUbicandoGPS(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        if (pendingMarkerRef.current && mapInstance.current) {
          mapInstance.current.removeLayer(pendingMarkerRef.current);
          pendingMarkerRef.current = null;
        }
        if (LRef.current && mapInstance.current) {
          const miColor2 = emailToColor(usuario);
          const m = LRef.current.circleMarker([pos.lat, pos.lng], {
            radius: 11,
            fillColor: miColor2,
            color: "#fff",
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.55
          }).addTo(mapInstance.current);
          pendingMarkerRef.current = m;
        }
        setPendingPos(pos);
        setEtiqueta("");
        setErrorMsg("");
        setUbicandoGPS(false);
        mapInstance.current?.setView([pos.lat, pos.lng], 16);
      },
      () => {
        setErrorMsg("No se pudo obtener tu ubicación. Revisá los permisos.");
        setUbicandoGPS(false);
      },
      { enableHighAccuracy: true, timeout: 12e3 }
    );
  }
  async function guardarVisita() {
    if (!pendingPos) return;
    setGuardando(true);
    setErrorMsg("");
    const { error } = await supabaseClient.from("visitas_mapa").insert({
      usuario,
      lat: pendingPos.lat,
      lng: pendingPos.lng,
      etiqueta: etiqueta.trim() || null
    });
    setGuardando(false);
    if (error) {
      setErrorMsg("No se pudo guardar. Intentá de nuevo.");
      return;
    }
    if (pendingMarkerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(pendingMarkerRef.current);
      pendingMarkerRef.current = null;
    }
    setPendingPos(null);
    setEtiqueta("");
  }
  function cancelarPending() {
    if (pendingMarkerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(pendingMarkerRef.current);
      pendingMarkerRef.current = null;
    }
    setPendingPos(null);
    setEtiqueta("");
    setErrorMsg("");
  }
  async function borrarVisita(id) {
    await supabaseClient.from("visitas_mapa").delete().eq("id", id);
  }
  const usuariosUnicos = [...new Map(visitas.map((v) => [v.usuario, emailToColor(v.usuario)])).entries()];
  const miColor = emailToColor(usuario);
  return /* @__PURE__ */ jsxs("div", { className: "may-mapa-wrap", children: [
    /* @__PURE__ */ jsxs("div", { className: "may-mapa-toolbar", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "may-mapa-btn-gps",
          onClick: usarGPS,
          disabled: ubicandoGPS,
          children: ubicandoGPS ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "may-mapa-spinner" }),
            " Ubicando…"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(IconGPS, {}),
            " Usar mi ubicación"
          ] })
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "may-mapa-hint", children: pendingPos ? "Confirmá el punto abajo" : "o tocá el mapa para marcar una visita" })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: mapRef, className: "may-mapa-container" }),
    usuariosUnicos.length > 0 && /* @__PURE__ */ jsx("div", { className: "may-mapa-leyenda", children: usuariosUnicos.map(([email, color]) => /* @__PURE__ */ jsxs("div", { className: "may-mapa-leyenda__item", children: [
      /* @__PURE__ */ jsx("span", { className: "may-mapa-leyenda__dot", style: { background: color } }),
      /* @__PURE__ */ jsx("span", { className: "may-mapa-leyenda__label", children: email.split("@")[0] })
    ] }, email)) }),
    pendingPos && /* @__PURE__ */ jsxs("div", { className: "may-mapa-confirm", children: [
      /* @__PURE__ */ jsxs("div", { className: "may-mapa-confirm__header", children: [
        /* @__PURE__ */ jsx("span", { className: "may-mapa-confirm__dot", style: { background: miColor } }),
        /* @__PURE__ */ jsx("span", { className: "may-mapa-confirm__title", children: "Nueva visita" }),
        /* @__PURE__ */ jsxs("span", { className: "may-mapa-confirm__coords", children: [
          pendingPos.lat.toFixed(5),
          ", ",
          pendingPos.lng.toFixed(5)
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "may-mapa-confirm__input",
          type: "text",
          placeholder: "Etiqueta (opcional) — ej: Cliente García",
          value: etiqueta,
          onChange: (e) => setEtiqueta(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && !guardando && guardarVisita(),
          maxLength: 80,
          autoFocus: true
        }
      ),
      errorMsg && /* @__PURE__ */ jsx("p", { className: "may-mapa-confirm__error", children: errorMsg }),
      /* @__PURE__ */ jsxs("div", { className: "may-mapa-confirm__btns", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "may-mapa-btn-cancel",
            onClick: cancelarPending,
            disabled: guardando,
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "may-mapa-btn-save",
            onClick: guardarVisita,
            disabled: guardando,
            style: { background: miColor },
            children: guardando ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "may-mapa-spinner" }),
              " Guardando…"
            ] }) : "Guardar visita"
          }
        )
      ] })
    ] })
  ] });
}

function fmt$1(n) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
const NAVY = "0F172A";
const BLUE = "1E40AF";
const LBLUE = "EFF6FF";
const WHITE = "FFFFFF";
const GREY = "64748B";
const COBALT = "3300FF";
function cell(v, s = {}) {
  return { v, t: typeof v === "number" ? "n" : "s", s };
}
const sHeader = (align = "center") => ({
  fill: { fgColor: { rgb: NAVY } },
  font: { bold: true, color: { rgb: WHITE }, sz: 11, name: "Calibri" },
  alignment: { horizontal: align, vertical: "center", wrapText: false },
  border: { bottom: { style: "medium", color: { rgb: BLUE } } }
});
const sTitle = {
  font: { bold: true, sz: 14, color: { rgb: NAVY }, name: "Calibri" },
  alignment: { horizontal: "left", vertical: "center" }
};
const sDate = {
  font: { sz: 10, color: { rgb: GREY }, name: "Calibri" },
  alignment: { horizontal: "right" }
};
const sData = (even, align = "center", bold = false, color = "1A1A2E") => ({
  fill: { fgColor: { rgb: even ? WHITE : LBLUE } },
  font: { sz: 10, color: { rgb: color }, bold, name: "Calibri" },
  alignment: { horizontal: align, vertical: "center" },
  border: { bottom: { style: "hair", color: { rgb: "E2E8F0" } } }
});
function ListaExcel() {
  const [proveedores, setProveedores] = useState([]);
  const [seleccion, setSeleccion] = useState(/* @__PURE__ */ new Set());
  const [reconocimientos, setReconocimientos] = useState(false);
  const [recoInput, setRecoInput] = useState(10);
  const [generando, setGenerando] = useState(false);
  const [exportado, setExportado] = useState(null);
  useEffect(() => {
    supabaseClient.from("articulos_mayorista").select("Proveedor").then(({ data }) => {
      if (!data) return;
      const uniq = [...new Set(
        data.map((d) => d.Proveedor).filter(Boolean)
      )].sort();
      setProveedores(uniq);
    });
  }, []);
  function toggleProveedor(p) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
    setExportado(null);
  }
  function toggleTodos() {
    setSeleccion(/* @__PURE__ */ new Set());
    setExportado(null);
  }
  const todosSeleccionados = seleccion.size === 0;
  async function generarExcel() {
    setGenerando(true);
    setExportado(null);
    try {
      let q = supabaseClient.from("articulos_mayorista").select('"Cod. Art", Descripcion, Proveedor, "Precio Vta Final", "Reco."').limit(5e3);
      if (seleccion.size === 1) {
        q = q.eq("Proveedor", [...seleccion][0]);
      } else if (seleccion.size > 1) {
        q = q.in("Proveedor", [...seleccion]);
      }
      const { data: artMay } = await q;
      const arts = artMay ?? [];
      const codes = arts.map((a) => a["Cod. Art"]).filter(Boolean);
      const uxbMap = /* @__PURE__ */ new Map();
      const CHUNK = 500;
      for (let i = 0; i < codes.length; i += CHUNK) {
        const { data } = await supabaseClient.from("articulos").select("codigo, uxb").in("codigo", codes.slice(i, i + CHUNK));
        for (const a of data ?? []) uxbMap.set(a.codigo, a.uxb);
      }
      const ws = {};
      const fechaStr = (/* @__PURE__ */ new Date()).toLocaleDateString("es-AR");
      let R = 0;
      ws[XlsxStyle.utils.encode_cell({ r: R, c: 0 })] = cell("Alzo Logística — Lista de Precios", sTitle);
      ws[XlsxStyle.utils.encode_cell({ r: R, c: 3 })] = cell(`Fecha: ${fechaStr}`, sDate);
      R++;
      R++;
      const headers = ["Código", "Descripción", "UxB", "Precio Final"];
      const hAlign = ["center", "left", "center", "center"];
      headers.forEach((h, c) => {
        ws[XlsxStyle.utils.encode_cell({ r: R, c })] = cell(h, sHeader(hAlign[c]));
      });
      R++;
      arts.forEach((art, i) => {
        const even = i % 2 === 0;
        const uxb = uxbMap.get(art["Cod. Art"]);
        const base = art["Precio Vta Final"] ?? 0;
        const recoPct = art["Reco."] ?? 0;
        const dtoPct = reconocimientos ? recoPct + recoInput : 0;
        const prec = base * (1 - dtoPct / 100);
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 0 })] = cell(art["Cod. Art"] ?? "", sData(even, "center", true, COBALT));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 1 })] = cell(art.Descripcion ?? "", sData(even, "left", false));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 2 })] = cell(uxb != null ? uxb : "—", sData(even, "center"));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 3 })] = cell(prec > 0 ? `$ ${fmt$1(prec)}` : "—", sData(even, "center", true));
        R++;
      });
      R++;
      ws["!ref"] = XlsxStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: R, c: 3 } });
      ws["!cols"] = [{ wch: 11 }, { wch: 50 }, { wch: 8 }, { wch: 18 }];
      ws["!rows"] = [{ hpt: 24 }, { hpt: 8 }, { hpt: 22 }];
      const wb = XlsxStyle.utils.book_new();
      XlsxStyle.utils.book_append_sheet(wb, ws, "Lista de Precios");
      const pSlug = todosSeleccionados ? "todos" : [...seleccion].map((p) => p.replace(/\s+/g, "_").slice(0, 15)).join("-").slice(0, 50);
      XlsxStyle.writeFile(wb, `alzo_lista_precios_${pSlug}_${fechaStr.replace(/\//g, "-")}.xlsx`);
      setExportado(arts.length);
    } finally {
      setGenerando(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "may-page", children: /* @__PURE__ */ jsxs("div", { className: "may-card", children: [
    /* @__PURE__ */ jsx("h2", { className: "may-card__title", children: "Lista de Precios" }),
    /* @__PURE__ */ jsx("p", { className: "may-excel-sub", children: "Generá un Excel con código, descripción, UxB y precio final." }),
    /* @__PURE__ */ jsxs("div", { className: "may-field may-field--full", children: [
      /* @__PURE__ */ jsxs("label", { className: "may-label", children: [
        "Proveedores",
        /* @__PURE__ */ jsx("span", { className: "may-excel-prov-count", children: todosSeleccionados ? "Todos" : `${seleccion.size} seleccionado${seleccion.size !== 1 ? "s" : ""}` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "may-excel-prov-list", children: [
        /* @__PURE__ */ jsxs("label", { className: `may-excel-prov-item${todosSeleccionados ? " may-excel-prov-item--active" : ""}`, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: todosSeleccionados,
              onChange: toggleTodos,
              className: "may-excel-prov-check"
            }
          ),
          /* @__PURE__ */ jsx("span", { children: "Todos los proveedores" })
        ] }),
        proveedores.map((p) => /* @__PURE__ */ jsxs(
          "label",
          {
            className: `may-excel-prov-item${seleccion.has(p) ? " may-excel-prov-item--active" : ""}`,
            children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: seleccion.has(p),
                  onChange: () => toggleProveedor(p),
                  className: "may-excel-prov-check"
                }
              ),
              /* @__PURE__ */ jsx("span", { children: p })
            ]
          },
          p
        ))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "may-reco-wrap", children: [
      /* @__PURE__ */ jsxs("label", { className: "may-pactada", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: reconocimientos,
            onChange: (e) => {
              setReconocimientos(e.target.checked);
              setExportado(null);
            },
            className: "may-pactada__check"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "may-pactada__label", children: "Reconocimientos" })
      ] }),
      reconocimientos && /* @__PURE__ */ jsxs("div", { className: "may-reco-slider-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "may-reco-slider-labels", children: [
          /* @__PURE__ */ jsx("span", { children: "0%" }),
          /* @__PURE__ */ jsxs("span", { className: "may-reco-slider-val", children: [
            "+",
            recoInput,
            "% ",
            /* @__PURE__ */ jsx("span", { className: "may-reco-slider-pct", children: "sobre el Reconocimiento" })
          ] }),
          /* @__PURE__ */ jsx("span", { children: "10%" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            className: "may-reco-slider",
            min: 0,
            max: 10,
            step: 1,
            value: recoInput,
            style: { "--val": `${recoInput * 10}%` },
            onChange: (e) => {
              setRecoInput(parseInt(e.target.value));
              setExportado(null);
            }
          }
        )
      ] })
    ] }),
    exportado !== null && /* @__PURE__ */ jsxs("div", { className: "may-excel-ok", children: [
      "✓ ",
      exportado,
      " artículos exportados correctamente"
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "may-excel-btn",
        onClick: generarExcel,
        disabled: generando,
        children: generando ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "may-excel-btn__spinner" }),
          " Generando…"
        ] }) : /* @__PURE__ */ jsx(Fragment, { children: "📥 Generar Excel" })
      }
    )
  ] }) });
}

const IMG_BASE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";
function fmt(n) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
let nextId = 1;
const SIZES = [
  { img: 320, desc: 22, cod: 14, price: 38 },
  // 1 producto
  { img: 240, desc: 18, cod: 13, price: 32 },
  // 2 productos
  { img: 180, desc: 15, cod: 11, price: 26 },
  // 3 productos
  { img: 150, desc: 13, cod: 10, price: 22 },
  // 4 productos
  { img: 120, desc: 12, cod: 10, price: 19 }
  // 5 productos
];
function FlyerRow({ producto, count }) {
  const [imgError, setImgError] = useState(false);
  const src = `${IMG_BASE}/${producto.codigo}.png`;
  const s = SIZES[Math.min(count - 1, 4)];
  return /* @__PURE__ */ jsxs("div", { className: "may-flyer-row", style: { flex: 1 }, children: [
    /* @__PURE__ */ jsx("div", { className: "may-flyer-row__img-wrap", style: { height: s.img, flexShrink: 0 }, children: imgError ? /* @__PURE__ */ jsx("div", { className: "may-flyer-row__img-placeholder", style: { height: s.img } }) : /* @__PURE__ */ jsx(
      "img",
      {
        src,
        alt: producto.descripcion,
        className: "may-flyer-row__img",
        style: { height: s.img },
        crossOrigin: "anonymous",
        onError: () => setImgError(true)
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "may-flyer-row__bottom", children: [
      /* @__PURE__ */ jsx("span", { className: "may-flyer-row__desc", style: { fontSize: s.desc }, children: producto.descripcion.toUpperCase() }),
      /* @__PURE__ */ jsxs("span", { className: "may-flyer-row__precio", style: { fontSize: s.price }, children: [
        "$",
        producto.precio || "—"
      ] })
    ] })
  ] });
}
function GeneradorFlyer() {
  const [productos, setProductos] = useState([]);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const flyerRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const buscar = useCallback(async (q) => {
    if (!q.trim()) {
      setResultados([]);
      setDropdownOpen(false);
      return;
    }
    setBuscando(true);
    const { data } = await supabaseClient.from("articulos_mayorista").select('"Cod. Art", "Descripcion", "Precio Vta Final"').ilike("Descripcion", `%${q.trim()}%`).limit(20);
    setBuscando(false);
    if (data) {
      const mapped = data.map((r) => ({
        codigo: r["Cod. Art"],
        descripcion: r["Descripcion"],
        precio: r["Precio Vta Final"]
      }));
      setResultados(mapped);
      setDropdownOpen(true);
    }
  }, []);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(query), 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, buscar]);
  useEffect(() => {
    function onMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);
  function seleccionar(r) {
    if (productos.length >= 5) return;
    const nuevo = {
      id: nextId++,
      codigo: r.codigo,
      descripcion: r.descripcion,
      precio: fmt(r.precio)
    };
    setProductos((prev) => [...prev, nuevo]);
    setQuery("");
    setResultados([]);
    setDropdownOpen(false);
  }
  function remover(id) {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }
  function actualizarPrecio(id, valor) {
    setProductos(
      (prev) => prev.map((p) => p.id === id ? { ...p, precio: valor } : p)
    );
  }
  async function descargar() {
    if (!flyerRef.current || productos.length === 0) return;
    setDescargando(true);
    try {
      const dataUrl = await toPng(flyerRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "flyer_alzo.png";
      link.href = dataUrl;
      link.click();
    } finally {
      setDescargando(false);
    }
  }
  const maxAlcanzado = productos.length >= 5;
  return /* @__PURE__ */ jsxs("div", { className: "may-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "may-card", children: [
      /* @__PURE__ */ jsx("p", { className: "may-card__title", children: "Generador de Flyers" }),
      productos.length > 0 && /* @__PURE__ */ jsx("div", { className: "may-flyer-chips", children: productos.map((p) => /* @__PURE__ */ jsxs("div", { className: "may-flyer-chip", children: [
        /* @__PURE__ */ jsx("span", { className: "may-flyer-chip__desc", children: p.descripcion }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "may-flyer-chip__precio",
            value: p.precio,
            onChange: (e) => actualizarPrecio(p.id, e.target.value),
            placeholder: "Precio"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "may-flyer-chip__remove",
            onClick: () => remover(p.id),
            "aria-label": "Quitar",
            children: "✕"
          }
        )
      ] }, p.id)) }),
      !maxAlcanzado && /* @__PURE__ */ jsxs("div", { className: "may-buscador-wrap", ref: wrapperRef, children: [
        /* @__PURE__ */ jsxs("div", { className: "may-buscador-input-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "may-buscador-icon", children: "🔍" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "may-buscador-input",
              placeholder: "Buscar producto para agregar al flyer…",
              value: query,
              onChange: (e) => setQuery(e.target.value),
              onFocus: () => {
                if (resultados.length > 0) setDropdownOpen(true);
              }
            }
          ),
          buscando && /* @__PURE__ */ jsx("span", { className: "rep-spinner", style: { marginRight: 4 } }),
          query && /* @__PURE__ */ jsx(
            "button",
            {
              className: "may-buscador-clear",
              onClick: () => {
                setQuery("");
                setResultados([]);
                setDropdownOpen(false);
              },
              children: "✕"
            }
          )
        ] }),
        dropdownOpen && /* @__PURE__ */ jsx("div", { className: "may-buscador-dropdown", children: resultados.length === 0 ? /* @__PURE__ */ jsx("div", { className: "may-buscador-empty", children: "Sin resultados" }) : resultados.map((r) => /* @__PURE__ */ jsxs(
          "button",
          {
            className: "may-buscador-item",
            onMouseDown: () => seleccionar(r),
            children: [
              /* @__PURE__ */ jsx("span", { className: "may-buscador-item__name", children: r.descripcion }),
              /* @__PURE__ */ jsxs("span", { className: "may-buscador-item__meta", children: [
                /* @__PURE__ */ jsxs("span", { className: "may-buscador-item__cod", children: [
                  "COD. ",
                  r.codigo
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "may-buscador-item__price", children: [
                  "$",
                  fmt(r.precio)
                ] })
              ] })
            ]
          },
          r.codigo
        )) })
      ] }),
      maxAlcanzado && /* @__PURE__ */ jsx("p", { className: "may-flyer-max-hint", children: "Máximo de 5 productos alcanzado." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "may-flyer-canvas-wrap", children: /* @__PURE__ */ jsxs(
      "div",
      {
        ref: flyerRef,
        className: "may-flyer-canvas",
        style: { width: 540, height: 960 },
        children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/img/247/baseFlyer.png",
              alt: "",
              className: "may-flyer-base",
              crossOrigin: "anonymous"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "may-flyer-products", children: productos.length === 0 ? /* @__PURE__ */ jsx("div", { className: "may-flyer-empty-hint", children: "Agregá productos para previsualizar el flyer" }) : productos.map((p) => /* @__PURE__ */ jsx(FlyerRow, { producto: p, count: productos.length }, p.id)) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "may-flyer-actions", children: /* @__PURE__ */ jsx(
      "button",
      {
        className: `may-btn-cargar${productos.length === 0 || descargando ? " may-btn-cargar--disabled" : ""}`,
        onClick: descargar,
        disabled: productos.length === 0 || descargando,
        children: descargando ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "rep-spinner", style: { width: 14, height: 14, marginRight: 8, verticalAlign: "middle" } }),
          "Generando…"
        ] }) : "Descargar Flyer"
      }
    ) })
  ] });
}

function LoginMayorista() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleGoogle() {
    setLoading(true);
    setError("");
    const { error: error2 } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/247/mayorista${window.location.search}`
      }
    });
    if (error2) {
      setError("No se pudo iniciar sesión. Intentá de nuevo.");
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "rep-login-wrap", children: /* @__PURE__ */ jsxs("div", { className: "rep-login-card", style: { paddingTop: 32, paddingBottom: 32 }, children: [
    /* @__PURE__ */ jsx("img", { src: "/img/alzo_logo.png", alt: "Alzo Logística", className: "rep-login-card__logo", style: { height: 180, marginBottom: 8 } }),
    /* @__PURE__ */ jsx("p", { className: "rep-login-card__title", style: { marginBottom: 20 }, children: "Portal Mayorista" }),
    error && /* @__PURE__ */ jsx("p", { style: { color: "#fca5a5", fontSize: 13, fontWeight: 600, marginBottom: 16 }, children: error }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleGoogle,
        disabled: loading,
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          width: "100%",
          padding: "14px 20px",
          border: "1.5px solid rgba(255,255,255,0.25)",
          borderRadius: 14,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "Montserrat, sans-serif",
          transition: "background .2s, border-color .2s",
          opacity: loading ? 0.7 : 1
        },
        children: loading ? /* @__PURE__ */ jsx("span", { children: "Redirigiendo…" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("svg", { width: "20", height: "20", viewBox: "0 0 48 48", fill: "none", children: [
            /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M44.5 20H24v8.5h11.8C34.7 33.9 30 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" }),
            /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" }),
            /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M24 46c5.8 0 10.8-1.9 14.8-5.2l-6.8-5.6C29.9 36.8 27.1 38 24 38c-5.9 0-10.9-3.8-12.7-9.1l-7 5.4C7.9 41.5 15.4 46 24 46z" }),
            /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M44.5 20H24v8.5h11.8c-.9 2.8-2.7 5.1-5.1 6.7l6.8 5.6c4-3.7 6.5-9.2 6.5-16.8 0-1.3-.2-2.7-.5-4z" })
          ] }),
          "Iniciar sesión con Google"
        ] })
      }
    )
  ] }) });
}
function AppMayorista() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.has("punto")) return "mapa";
    }
    return "presupuesto";
  });
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session2) => {
      setSession(session2);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function handleLogout() {
    await supabaseClient.auth.signOut();
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "rep-login-wrap", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }, children: [
      /* @__PURE__ */ jsx("div", { className: "rep-spinner" }),
      /* @__PURE__ */ jsx("span", { style: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }, children: "Cargando…" })
    ] }) });
  }
  if (!session) return /* @__PURE__ */ jsx(LoginMayorista, {});
  return /* @__PURE__ */ jsxs("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f0f2f5" }, children: [
    /* @__PURE__ */ jsx(
      HeaderMayorista,
      {
        usuario: session.user.email ?? "",
        onLogout: handleLogout,
        seccion,
        onSeccion: setSeccion
      }
    ),
    /* @__PURE__ */ jsxs("main", { style: { flex: 1 }, children: [
      seccion === "presupuesto" && /* @__PURE__ */ jsx(PresupuestoMayorista, {}),
      seccion === "uxb" && /* @__PURE__ */ jsx(ConsultaUxB, {}),
      seccion === "imagenes" && /* @__PURE__ */ jsx(ImagenesProducto, {}),
      seccion === "mapa" && /* @__PURE__ */ jsx(MapaVentas, { usuario: session.user.email ?? "" }),
      seccion === "lista" && /* @__PURE__ */ jsx(ListaExcel, {}),
      seccion === "flyer" && /* @__PURE__ */ jsx(GeneradorFlyer, {})
    ] })
  ] });
}

const $$Mayorista = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Alzo 24/7 — Portal Mayorista</title><meta name="robots" content="noindex, nofollow"><link rel="icon" type="image/png" href="/img/alzo_logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">${renderHead()}</head> <body> ${renderComponent($$result, "AppMayorista", AppMayorista, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/workspace/alzologistica/src/components/mayorista/AppMayorista", "client:component-export": "default" })} </body></html>`;
}, "C:/workspace/alzologistica/src/pages/247/mayorista.astro", void 0);

const $$file = "C:/workspace/alzologistica/src/pages/247/mayorista.astro";
const $$url = "/247/mayorista";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Mayorista,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
