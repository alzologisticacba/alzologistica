// src/components/mayorista/ExportarPresupuesto.tsx
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";

interface LineaPresupuesto {
  id: number;
  codArt: number;
  descripcion: string;
  cantidad: number;
  precio: number;
  descuento: number;
  subtotal: number;
}

interface Props {
  lineas: LineaPresupuesto[];
  totalPedido: number;
  onClose: () => void;
  onClearAndClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ExportarPresupuesto({ lineas, totalPedido, onClose, onClearAndClose }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const fecha = new Date().toLocaleDateString("es-AR");

  function handleClose() {
    setConfirmando(true);
  }

  // ── Excel ──────────────────────────────────────────────
  function exportExcel() {
    const rows = lineas.map(l => ({
      "Código":      l.codArt,
      "Descripción": l.descripcion,
      "Precio Unit.": l.precio,
      "Cantidad":    l.cantidad,
      "Descuento %": l.descuento || 0,
      "Subtotal":    l.subtotal,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Fila de total
    const totalRow = lineas.length + 2;
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "TOTAL", totalPedido]], { origin: `A${totalRow}` });

    // Ancho de columnas
    ws["!cols"] = [{ wch: 12 }, { wch: 40 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");
    XLSX.writeFile(wb, `presupuesto_${fecha.replace(/\//g, "-")}.xlsx`);
  }

  // ── PDF ────────────────────────────────────────────────
  function exportPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Encabezado
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
      body: lineas.map(l => [
        l.codArt,
        l.descripcion,
        `$ ${fmt(l.precio)}`,
        l.cantidad,
        l.descuento > 0 ? `${l.descuento}%` : "-",
        `$ ${fmt(l.subtotal)}`,
      ]),
      foot: [["", "", "", "", "Total", `$ ${fmt(totalPedido)}`]],
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [240, 242, 245], textColor: [15, 23, 42], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 18, halign: "center" },
        5: { cellWidth: 28, halign: "right" },
      },
    });

    doc.save(`presupuesto_${fecha.replace(/\//g, "-")}.pdf`);
  }

  // ── Imagen ─────────────────────────────────────────────
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

  return (
    <div className="may-export-overlay" onClick={handleClose}>
      <div className="may-export-modal" onClick={e => e.stopPropagation()}>

        {/* ── Pantalla de confirmación ── */}
        {confirmando ? (
          <>
            <h3 className="may-export-title">¿Qué querés hacer?</h3>
            <p className="may-export-sub">El presupuesto tiene {lineas.length} ítem{lineas.length !== 1 ? "s" : ""}</p>
            <div className="may-export-confirm-btns">
              <button className="may-export-confirm-btn may-export-confirm-btn--borrar" onClick={onClearAndClose}>
                Borrar presupuesto
              </button>
              <button className="may-export-confirm-btn may-export-confirm-btn--seguir" onClick={onClose}>
                Seguir editando
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="may-export-close" onClick={handleClose}>✕</button>
            <h3 className="may-export-title">Exportar presupuesto</h3>
            <p className="may-export-sub">
              {lineas.length} ítem{lineas.length !== 1 ? "s" : ""} · Total $ {fmt(totalPedido)}
            </p>

            <div className="may-export-options">
              <button className="may-export-btn" onClick={exportImage} disabled={loadingImg}>
                <span className="may-export-btn__icon">🖼️</span>
                <span className="may-export-btn__label">{loadingImg ? "Generando…" : "Imagen"}</span>
                <span className="may-export-btn__sub">PNG</span>
              </button>
              <button className="may-export-btn" onClick={exportPDF}>
                <span className="may-export-btn__icon">📄</span>
                <span className="may-export-btn__label">PDF</span>
                <span className="may-export-btn__sub">A4</span>
              </button>
              <button className="may-export-btn" onClick={exportExcel}>
                <span className="may-export-btn__icon">📊</span>
                <span className="may-export-btn__label">Excel</span>
                <span className="may-export-btn__sub">XLSX</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Div oculto para captura de imagen */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
        <div ref={previewRef} style={{
          width: 640,
          background: "#fff",
          fontFamily: "Arial, sans-serif",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: "#0f172a", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>Alzo Logística</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>Presupuesto Mayorista</div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{fecha}</div>
          </div>

          {/* Tabla */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f0f2f5" }}>
                {["Código", "Descripción", "Precio Unit.", "Cant.", "Dto.", "Subtotal"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineas.map((l, i) => (
                <tr key={l.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fc", borderBottom: "1px solid #f0f2f5" }}>
                  <td style={{ padding: "10px 12px", color: "#3300ff", fontWeight: 700 }}>{l.codArt}</td>
                  <td style={{ padding: "10px 12px", color: "#1a1a2e", fontWeight: 500 }}>{l.descripcion}</td>
                  <td style={{ padding: "10px 12px", color: "#64748b" }}>$ {fmt(l.precio)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>{l.cantidad}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", color: l.descuento > 0 ? "#f59e0b" : "#94a3b8" }}>
                    {l.descuento > 0 ? `${l.descuento}%` : "-"}
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "#1a1a2e" }}>$ {fmt(l.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#0f172a" }}>
                <td colSpan={5} style={{ padding: "14px 12px", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13 }}>TOTAL</td>
                <td style={{ padding: "14px 12px", color: "#fff", fontWeight: 800, fontSize: 15 }}>$ {fmt(totalPedido)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
