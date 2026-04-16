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

const sSub = {
  font: { italic: true, sz: 10, color: { rgb: BLUE }, name: "Calibri" },
};

const sData = (even: boolean, align = "center", bold = false, color = "1A1A2E") => ({
  fill: { fgColor: { rgb: even ? WHITE : LBLUE } },
  font: { sz: 10, color: { rgb: color }, bold, name: "Calibri" },
  alignment: { horizontal: align, vertical: "center" },
  border: { bottom: { style: "hair", color: { rgb: "E2E8F0" } } },
});

const sFootLabel = {
  font: { bold: true, sz: 10, color: { rgb: GREY }, name: "Calibri" },
  alignment: { horizontal: "right" },
};

const sFootVal = {
  font: { bold: true, sz: 10, color: { rgb: NAVY }, name: "Calibri" },
  alignment: { horizontal: "center" },
};

// ────────────────────────────────────────────────────────────
export default function ListaExcel() {
  const [proveedores, setProveedores]         = useState<string[]>([]);
  const [proveedor, setProveedor]             = useState("todos");
  const [reconocimientos, setReconocimientos] = useState(false);
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

  async function generarExcel() {
    setGenerando(true);
    setExportado(null);
    try {
      // ── 1. Artículos ────────────────────────────────────
      let q = supabaseClient
        .from("articulos_mayorista")
        .select('"Cod. Art", Descripcion, Proveedor, "Precio Vta Final", "Reco."')
        .limit(5000);

      if (proveedor !== "todos") q = q.eq("Proveedor", proveedor);
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
      let R = 0; // fila actual (0-based)

      // Fila 0: título + fecha
      ws[XlsxStyle.utils.encode_cell({ r: R, c: 0 })] = cell("Alzo Logística — Lista de Precios", sTitle);
      ws[XlsxStyle.utils.encode_cell({ r: R, c: 3 })] = cell(`Fecha: ${fechaStr}`, sDate);
      R++;

      // Fila 1: vacía (separador)
      R++;

      // Fila 3: encabezados de tabla
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
        const prec  = reconocimientos && reco > 0 ? base * (1 - reco / 100) : base;

        ws[XlsxStyle.utils.encode_cell({ r: R, c: 0 })] = cell(art["Cod. Art"] ?? "", sData(even, "center", true, COBALT));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 1 })] = cell(art.Descripcion ?? "", sData(even, "left", false));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 2 })] = cell(uxb != null ? uxb : "—", sData(even, "center"));
        ws[XlsxStyle.utils.encode_cell({ r: R, c: 3 })] = cell(prec > 0 ? `$ ${fmt(prec)}` : "—", sData(even, "center", true));
        R++;
      });

      R++;

      // Rango de la hoja
      ws["!ref"] = XlsxStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: R, c: 3 } });

      // Anchos de columna
      ws["!cols"] = [
        { wch: 11 },
        { wch: 50 },
        { wch: 8  },
        { wch: 18 },
      ];

      // Altura de filas especiales
      ws["!rows"] = [
        { hpt: 24 }, // título
        { hpt: 8  }, // separador
        { hpt: 22 }, // header tabla
      ];

      // ── 4. Workbook y descarga ────────────────────────────
      const wb = XlsxStyle.utils.book_new();
      XlsxStyle.utils.book_append_sheet(wb, ws, "Lista de Precios");

      const pSlug = proveedor === "todos"
        ? "todos"
        : proveedor.replace(/\s+/g, "_").slice(0, 30);

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

        <div className="may-field may-field--full">
          <label className="may-label">Proveedor</label>
          <select
            className="may-input may-excel-select"
            value={proveedor}
            onChange={e => { setProveedor(e.target.value); setExportado(null); }}
          >
            <option value="todos">— Todos los proveedores —</option>
            {proveedores.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <label className="may-pactada" style={{ marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={reconocimientos}
            onChange={e => { setReconocimientos(e.target.checked); setExportado(null); }}
            className="may-pactada__check"
          />
          <span className="may-pactada__label">Reconocimientos</span>
        </label>

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
