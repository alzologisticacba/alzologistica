import { useState } from "react";
import type { InversionMovimiento } from "./useAdminData";

interface Props {
  metaMensual: number;
  inversiones: InversionMovimiento[];
  inversionMes: number;
  inversionTotal: number;
  saveMeta: (value: number) => Promise<void>;
  addInversion: (mov: { fecha: string; monto: number; descripcion?: string }) => Promise<void>;
  deleteInversion: (id: string) => Promise<void>;
  loading: boolean;
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fechaCorta(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export default function ConfigSection({
  metaMensual,
  inversiones,
  inversionMes,
  inversionTotal,
  saveMeta,
  addInversion,
  deleteInversion,
  loading,
}: Props) {
  // ── Meta mensual ──
  const [metaInput, setMetaInput] = useState<string>(metaMensual ? String(metaMensual) : "");
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaMsg, setMetaMsg] = useState<string | null>(null);

  // ── Form inversión ──
  const [fecha, setFecha] = useState(todayIso());
  const [monto, setMonto] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [invSaving, setInvSaving] = useState(false);
  const [invMsg, setInvMsg] = useState<string | null>(null);

  async function handleSaveMeta() {
    const value = Number(metaInput);
    if (!isFinite(value) || value < 0) {
      setMetaMsg("Ingresá un número válido");
      return;
    }
    setMetaSaving(true);
    setMetaMsg(null);
    try {
      await saveMeta(value);
      setMetaMsg("✓ Guardado");
      setTimeout(() => setMetaMsg(null), 2000);
    } catch (e: any) {
      setMetaMsg(`Error: ${e.message ?? "no se pudo guardar"}`);
    } finally {
      setMetaSaving(false);
    }
  }

  async function handleAddInversion(e: React.FormEvent) {
    e.preventDefault();
    const m = Number(monto);
    if (!isFinite(m) || m <= 0) {
      setInvMsg("Monto inválido");
      return;
    }
    if (!fecha) {
      setInvMsg("Fecha inválida");
      return;
    }
    setInvSaving(true);
    setInvMsg(null);
    try {
      await addInversion({ fecha, monto: m, descripcion: desc.trim() || undefined });
      setMonto("");
      setDesc("");
      setFecha(todayIso());
      setInvMsg("✓ Movimiento agregado");
      setTimeout(() => setInvMsg(null), 2000);
    } catch (e: any) {
      setInvMsg(`Error: ${e.message ?? "no se pudo guardar"}`);
    } finally {
      setInvSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    try {
      await deleteInversion(id);
    } catch (e: any) {
      alert(`Error: ${e.message ?? "no se pudo eliminar"}`);
    }
  }

  return (
    <>
      <div className="cfg-grid">
        {/* ── Objetivo mensual ── */}
        <div className="cfg-card">
          <div className="cfg-card-header">
            <i className="fa-solid fa-bullseye"></i>
            <h3>Objetivo mensual</h3>
          </div>
          <p className="cfg-help">
            Meta de facturación bruta que esperás alcanzar cada mes. El dashboard calcula el % cumplido y cuánto falta.
          </p>
          <div className="cfg-row">
            <label htmlFor="meta-input">Colocar objetivo mensual:</label>
            <div className="cfg-input-wrap">
              <span className="cfg-prefix">$</span>
              <input
                id="meta-input"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={metaInput}
                onChange={(e) => setMetaInput(e.target.value)}
                disabled={loading || metaSaving}
              />
            </div>
            <button
              className="cfg-btn cfg-btn-primary"
              onClick={handleSaveMeta}
              disabled={loading || metaSaving || metaInput === String(metaMensual)}
            >
              {metaSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
          {metaMsg && <p className={`cfg-msg ${metaMsg.startsWith("✓") ? "ok" : "err"}`}>{metaMsg}</p>}
          <p className="cfg-current">
            Actual: <strong>{metaMensual > 0 ? money(metaMensual) : "—"}</strong>
          </p>
        </div>

        {/* ── Inversión publicidad ── */}
        <div className="cfg-card">
          <div className="cfg-card-header">
            <i className="fa-solid fa-bullhorn"></i>
            <h3>Inversión publicitaria</h3>
          </div>
          <p className="cfg-help">
            Cargá cada movimiento de inversión en pauta (Meta, Google, etc). Se acumula por mes y total para calcular ROAS.
          </p>

          <div className="cfg-totales">
            <div className="cfg-total-item">
              <span className="cfg-total-label">Mes actual</span>
              <span className="cfg-total-value">{money(inversionMes)}</span>
            </div>
            <div className="cfg-total-item">
              <span className="cfg-total-label">Total acumulado</span>
              <span className="cfg-total-value">{money(inversionTotal)}</span>
            </div>
          </div>

          <form className="cfg-inv-form" onSubmit={handleAddInversion}>
            <div className="cfg-form-row">
              <div>
                <label>Colocar inversión:</label>
                <div className="cfg-input-wrap">
                  <span className="cfg-prefix">$</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="0"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    disabled={invSaving}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Fecha</label>
                <input
                  type="date"
                  className="cfg-date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  disabled={invSaving}
                  required
                />
              </div>
            </div>
            <div className="cfg-form-row">
              <div style={{ flex: 1 }}>
                <label>Descripción (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Campaña Meta Ads cigarrillos"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  disabled={invSaving}
                />
              </div>
              <button
                type="submit"
                className="cfg-btn cfg-btn-primary cfg-btn-add"
                disabled={invSaving}
              >
                {invSaving ? "..." : "+ Agregar"}
              </button>
            </div>
          </form>
          {invMsg && <p className={`cfg-msg ${invMsg.startsWith("✓") ? "ok" : "err"}`}>{invMsg}</p>}

          {/* Listado */}
          <div className="cfg-list">
            <div className="cfg-list-header">
              Movimientos ({inversiones.length})
            </div>
            {inversiones.length === 0 ? (
              <p className="cfg-empty">Sin movimientos cargados</p>
            ) : (
              <div className="cfg-list-rows">
                {inversiones.map((i) => (
                  <div key={i.id} className="cfg-list-row">
                    <span className="inv-fecha">{fechaCorta(i.fecha)}</span>
                    <span className="inv-monto">{money(Number(i.monto))}</span>
                    <span className="inv-desc">{i.descripcion || "—"}</span>
                    <button
                      className="inv-del"
                      onClick={() => handleDelete(i.id)}
                      title="Eliminar"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cfg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 20px;
        }

        .cfg-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .cfg-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .cfg-card-header i {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #eff6ff;
          color: #2556ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .cfg-card-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .cfg-help {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0 0 16px;
          line-height: 1.5;
        }

        .cfg-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cfg-row label {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 6px;
          width: 100%;
        }

        .cfg-input-wrap {
          position: relative;
          flex: 1;
          min-width: 140px;
        }

        .cfg-prefix {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .cfg-input-wrap input {
          width: 100%;
          padding: 9px 10px 9px 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #0f172a;
          font-size: 0.92rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }

        .cfg-date {
          padding: 9px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #0f172a;
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
        }

        .cfg-input-wrap input:focus,
        .cfg-date:focus {
          border-color: #2556ff;
          background: #fff;
        }

        .cfg-input-wrap input:disabled,
        .cfg-date:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cfg-form-row input[type="text"] {
          width: 100%;
          padding: 9px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #0f172a;
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
        }

        .cfg-form-row input[type="text"]:focus {
          border-color: #2556ff;
          background: #fff;
        }

        .cfg-btn {
          padding: 9px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          color: #64748b;
          font-size: 0.88rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }

        .cfg-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .cfg-btn-primary {
          background: #2556ff;
          border-color: #2556ff;
          color: #fff;
        }

        .cfg-btn-primary:hover:not(:disabled) {
          background: #1e47d6;
        }

        .cfg-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cfg-btn-add {
          align-self: flex-end;
          white-space: nowrap;
          min-width: 110px;
        }

        .cfg-msg {
          font-size: 0.8rem;
          margin: 10px 0 0;
        }

        .cfg-msg.ok { color: #10b981; font-weight: 600; }
        .cfg-msg.err { color: #f43f5e; font-weight: 500; }

        .cfg-current {
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 14px 0 0;
        }

        .cfg-current strong {
          color: #0f172a;
        }

        .cfg-totales {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }

        .cfg-total-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cfg-total-label {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .cfg-total-value {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .cfg-inv-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .cfg-form-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .cfg-form-row > div {
          display: flex;
          flex-direction: column;
          min-width: 140px;
        }

        .cfg-form-row label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .cfg-list {
          border-top: 1px solid #e2e8f0;
          padding-top: 14px;
        }

        .cfg-list-header {
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }

        .cfg-empty {
          font-size: 0.82rem;
          color: #cbd5e1;
          text-align: center;
          padding: 16px;
          margin: 0;
        }

        .cfg-list-rows {
          display: flex;
          flex-direction: column;
          max-height: 280px;
          overflow-y: auto;
        }

        .cfg-list-row {
          display: grid;
          grid-template-columns: 70px 100px 1fr 32px;
          align-items: center;
          gap: 10px;
          padding: 8px 4px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.82rem;
        }

        .cfg-list-row:last-child {
          border-bottom: none;
        }

        .inv-fecha {
          color: #94a3b8;
          font-size: 0.78rem;
        }

        .inv-monto {
          font-weight: 600;
          color: #ef4444;
        }

        .inv-desc {
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .inv-del {
          padding: 4px 8px;
          background: transparent;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .inv-del:hover {
          background: #fff1f2;
          color: #f43f5e;
        }
      `}</style>
    </>
  );
}
