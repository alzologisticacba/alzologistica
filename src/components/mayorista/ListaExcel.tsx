// src/components/mayorista/ListaExcel.tsx
import { useState, useEffect } from "react";
import { supabaseClient } from "../../lib/supabaseClient";
import XlsxStyle from "xlsx-js-style";

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Helpers de estilo ────────────────────────────────────────
const NAVY   = "0F172A";
const BLUE   = "1E40AF";
const LBLUE  = "EFF6FF";
const WHITE  = "FFFFFF";
const GREY   = "64748B";
const COBALT = "3300FF";

function cell(v: string | number, s: any = {}) {
  return { v, t: typeof v === "number" ? "n" : "s", s };
}

const sHeader = (align = "center") => ({
  fill: { fgColor: { rgb: NAVY } },
  font: { bold: true, color: { rgb: WHITE }, sz: 11, name: "Calibri" },
  alignment: { horizontal: align, vertical: "center", wrapText: false },
  border: { bottom: { style: "medium", color: { rgb: BLUE } } },
});

const sTitle = {
  font: { bold: true, sz: 14, color: { rgb: NAVY }, name: "Calibri" },
  alignment: { horizontal: "left", vertical: "center" },
};

const sDate = {
  font: { sz: 10, color: { rgb: GREY }, name: "Calibri" },
  alignment: { horizontal: "right" },
};

const sData = (even: boolean, align = "center", bold = false, color = "1A1A2E") => ({
  fill: { fgColor: { rgb: even ? WHITE : LBLUE } },
  font: { sz: 10, color: { rgb: color }, bold, name: "Calibri" },
  alignment: { horizontal: align, vertical: "center" },
  border: { bottom: { style: "hair", color: { rgb: "E2E8F0" } } },
});

// ────────────────────────────────────────────────────────────
export default function ListaExcel() {
  const [proveedores, setProveedores]         = useState<string[]>([]);
  const [seleccion, setSeleccion]             = useState<Set<string>>(new Set()); // vacío = todos
  const [reconocimientos, setReconocimientos] = useState(false);
  const [recoInput, setRecoInput]             = useState(10); // 0-10, default 10 = 100% del Reco.
  const [generando, setGenerando]             = useState(false);
  const [exportado, setExportado]             = useState<number | null>(null);

  useEffect(() => {
    supabaseClient
      .from("articulos_mayorista")
      .select("Proveedor")
      .then(({ data }) => {
        if (!data) return;
        const uniq = [...new Set(
          data.map((d: any) => d.Proveedor).filter(Boolean)
        )].sort() as string[];
        setProveedores(uniq);
      });
  }, []);

  function toggleProveedor(p: string) {
    setSeleccion(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
    setExportado(null);
  }

  function toggleTodos() {
    setSeleccion(new Set());
    setExportado(null);
  }

  const todosSeleccionados = seleccion.size === 0;

  async function generarExcel() {
    setGenerando(true);
    setExportado(null);
    try {
      // ── 1. Artículos ────────────────────────────────────
      let q = supabaseClient
        .from("articulos_mayorista")
        .select('"Cod. Art", Descripcion, Proveedor, "Precio Vta Final", "Reco."')
        .limit(5000);

      if (seleccion.size === 1) {
        q = q.eq("Proveedor", [...seleccion][0]);
      } else if (seleccion.size > 1) {
        q = q.in("Proveedor", [...seleccion]);
      }

      const { data: artMay } = await q;
      const arts: any[] = artMay ?? [];

      // ── 2. UxB (chunks de 500) ───────────────────────────
      const codes: number[] = arts.map(a => a["Cod. Art"]).filter(Boolean);
      const uxbMap = new Map<number, number | null>();
      const CHUNK = 500;
      for (let i = 0; i < codes.length; i += CHUNK) {
        const { data } = await supabaseClient
          .from("articulos")
          .select("codigo, uxb")
          .in("codigo", codes.slice(i, i + CHUNK));
        for (const a of data ?? []) uxbMap.set(a.codigo, a.uxb);
      }

      // ── 3. Armar hoja ────────────────────────────────────
      const ws: any = {};
      const fechaStr = new Date().toLocaleDateString("es-AR");
      let R = 0;

      ws[XlsxStyle.utils.encode_cell({ r: R, c: 0 })] = cell("Alzo Logística — Lista de Precios", sTitle);
      ws[XlsxStyle.utils.encode_cell({ r: R, c: 3 })] = cell(`Fecha: ${fechaStr}`, sDate);
      R++;
      R++; // separador

      // Encabezados
      const headers = ["Código", "Descripción", "UxB", "Precio Final"];
      const hAlign  = ["center", "left", "center", "center"];
      headers.forEach((h, c) => {
        ws[XlsxStyle.utils.encode_cell({ r: R, c })] = cell(h, sHeader(hAlign[c]));
      });
      R++;

      // Filas de datos
      arts.forEach((art, i) => {
        const even  = i % 2 === 0;
        const uxb   = uxbMap.get(art["Cod. Art"]);
        const base  = art["Precio Vta Final"] ?? 0;
        const reco  = art["Reco."] ?? 0;
        // descuento efectivo = (recoInput/10) × Reco.%
        const dtoPct = reconocimientos && reco > 0 ? (recoInput / 10) * reco : 0;
        const prec   = base * (1 - dtoPct / 100);

        ws[XlsxStyle.utils.encode_cell({ r: R, c: 0 })] = cell(art["Cod. Art"] ?? "", sData(even, "center", true, COBALT));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 1 })] = cell(art.Descripcion ?? "", sData(even, "left", false));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 2 })] = cell(uxb != null ? uxb : "—", sData(even, "center"));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 3 })] = cell(prec > 0 ? `$ ${fmt(prec)}` : "—", sData(even, "center", true));
        R++;
      });
      R++;

      ws["!ref"]  = XlsxStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: R, c: 3 } });
      ws["!cols"] = [{ wch: 11 }, { wch: 50 }, { wch: 8 }, { wch: 18 }];
      ws["!rows"] = [{ hpt: 24 }, { hpt: 8 }, { hpt: 22 }];

      const wb = XlsxStyle.utils.book_new();
      XlsxStyle.utils.book_append_sheet(wb, ws, "Lista de Precios");

      const pSlug = todosSeleccionados
        ? "todos"
        : [...seleccion].map(p => p.replace(/\s+/g, "_").slice(0, 15)).join("-").slice(0, 50);

      XlsxStyle.writeFile(wb, `alzo_lista_precios_${pSlug}_${fechaStr.replace(/\//g, "-")}.xlsx`);
      setExportado(arts.length);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="may-page">
      <div className="may-card">
        <h2 className="may-card__title">Lista de Precios</h2>
        <p className="may-excel-sub">
          Generá un Excel con código, descripción, UxB y precio final.
        </p>

        {/* Selector de proveedores */}
        <div className="may-field may-field--full">
          <label className="may-label">
            Proveedores
            <span className="may-excel-prov-count">
              {todosSeleccionados ? "Todos" : `${seleccion.size} seleccionado${seleccion.size !== 1 ? "s" : ""}`}
            </span>
          </label>
          <div className="may-excel-prov-list">
            {/* Opción "Todos" */}
            <label className={`may-excel-prov-item${todosSeleccionados ? " may-excel-prov-item--active" : ""}`}>
              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={toggleTodos}
                className="may-excel-prov-check"
              />
              <span>Todos los proveedores</span>
            </label>
            {/* Cada proveedor */}
            {proveedores.map(p => (
              <label
                key={p}
                className={`may-excel-prov-item${seleccion.has(p) ? " may-excel-prov-item--active" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={seleccion.has(p)}
                  onChange={() => toggleProveedor(p)}
                  className="may-excel-prov-check"
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reconocimientos */}
        <div className="may-reco-wrap">
          <label className="may-pactada">
            <input
              type="checkbox"
              checked={reconocimientos}
              onChange={e => { setReconocimientos(e.target.checked); setExportado(null); }}
              className="may-pactada__check"
            />
            <span className="may-pactada__label">Reconocimientos</span>
          </label>
          {reconocimientos && (
            <div className="may-reco-slider-wrap">
              <div className="may-reco-slider-labels">
                <span>0</span>
                <span className="may-reco-slider-val">{recoInput} <span className="may-reco-slider-pct">({recoInput * 10}% del Reco.)</span></span>
                <span>10</span>
              </div>
              <input
                type="range"
                className="may-reco-slider"
                min={0}
                max={10}
                step={1}
                value={recoInput}
                style={{ "--val": `${recoInput * 10}%` } as any}
                onChange={e => { setRecoInput(parseInt(e.target.value)); setExportado(null); }}
              />
            </div>
          )}
        </div>

        {exportado !== null && (
          <div className="may-excel-ok">
            ✓ {exportado} artículos exportados correctamente
          </div>
        )}

        <button
          className="may-excel-btn"
          onClick={generarExcel}
          disabled={generando}
        >
          {generando
            ? <><span className="may-excel-btn__spinner" /> Generando…</>
            : <>📥 Generar Excel</>}
        </button>
      </div>
    </div>
  );
}
