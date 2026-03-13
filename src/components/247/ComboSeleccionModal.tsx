// src/components/247/ComboSeleccionModal.tsx
// Modal de selección de opciones para combos + hook useComboAgregar
import React, { useState } from "react";
import { addToCart } from "./hooks/cartStore";
import { supabaseClient } from "../../lib/supabaseClient";

export interface DetalleLine {
  id: number;
  productos: string;
  nombre: string | null;
  cantidad: number;
  descuentos: number;
  grupo: number;
}

export interface ComboBase {
  cod_combo: string;
  nombre: string;
  precio: number;
}

export interface ComboConDetalles extends ComboBase {
  detalles: DetalleLine[];
}

// Un grupo requiere elección cuando tiene más de 1 ítem
export function grupoRequiereEleccion(items: DetalleLine[]): boolean {
  return items.length > 1;
}

// Total de unidades permitidas en un grupo (= cantidad del primer ítem)
function totalPermitidoGrupo(detalles: DetalleLine[], g: number): number {
  return detalles.find(d => d.grupo === g)?.cantidad ?? 1;
}

// Construye el contenido del carrito a partir de detalles + elegidos por grupo
export function buildContenido(
  detalles: DetalleLine[],
  gruposEleccion: number[],
  cantidadesPorGrupo: Record<number, Record<string, number>>
) {
  const grupos = [...new Set(detalles.map(d => d.grupo))].sort();
  return grupos.flatMap(g => {
    const items = detalles.filter(d => d.grupo === g);
    if (gruposEleccion.includes(g)) {
      return items
        .filter(d => (cantidadesPorGrupo[g]?.[d.productos] ?? 0) > 0)
        .map(d => ({
          producto:   d.productos,
          nombre:     d.nombre,
          cantidad:   cantidadesPorGrupo[g][d.productos],
          elegido:    true as const,
          descuentos: d.descuentos,
        }));
    }
    return items.map(d => ({
      producto:   d.productos,
      nombre:     d.nombre,
      cantidad:   d.cantidad,
      elegido:    false as const,
      descuentos: d.descuentos,
    }));
  });
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface SeleccionModalProps {
  combo: ComboConDetalles;
  gruposEleccion: number[];
  onConfirm: (cantidadesPorGrupo: Record<number, Record<string, number>>) => void;
  onClose: () => void;
}

export function SeleccionModal({ combo, gruposEleccion, onConfirm, onClose }: SeleccionModalProps) {
  // Bloquea el scroll del fondo mientras el modal está abierto
  React.useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  const [cantidades, setCantidades] = useState<Record<number, Record<string, number>>>(() => {
    const init: Record<number, Record<string, number>> = {};
    gruposEleccion.forEach(g => {
      const opciones = combo.detalles.filter(d => d.grupo === g);
      init[g] = Object.fromEntries(opciones.map(o => [o.productos, 0]));
    });
    return init;
  });

  function totalElegido(g: number): number {
    return Object.values(cantidades[g] ?? {}).reduce((s, v) => s + v, 0);
  }

  function inc(g: number, producto: string) {
    if (totalElegido(g) >= totalPermitidoGrupo(combo.detalles, g)) return;
    setCantidades(prev => ({ ...prev, [g]: { ...prev[g], [producto]: (prev[g][producto] ?? 0) + 1 } }));
  }

  function dec(g: number, producto: string) {
    setCantidades(prev => ({ ...prev, [g]: { ...prev[g], [producto]: Math.max(0, (prev[g][producto] ?? 0) - 1) } }));
  }

  const todosCompletos = gruposEleccion.every(
    g => totalElegido(g) === totalPermitidoGrupo(combo.detalles, g)
  );

  return (
    <>
      <div className="alzomodal-backdrop" onClick={onClose} />
      <div className="alzomodal" role="dialog" aria-modal="true">
        <div className="alzomodal-card alzomodal-card--wide">
          <div className="alzomodal-head">
            <div>
              <h2 className="alzomodal-title">Personalizar combo</h2>
              <p className="alzomodal-head-sub">{combo.nombre}</p>
            </div>
            <button className="alzomodal-close" onClick={onClose}>✕</button>
          </div>

          <div className="alzomodal-body seleccion-body">
            {gruposEleccion.map((g, idx) => {
              const opciones  = combo.detalles.filter(d => d.grupo === g);
              const permitido = totalPermitidoGrupo(combo.detalles, g);
              const elegido   = totalElegido(g);
              const restante  = permitido - elegido;
              return (
                <div key={g} className="seleccion-grupo">
                  <div className="seleccion-grupo__header">
                    <p className="seleccion-grupo__label">Opción {idx + 1}</p>
                    <span className={`seleccion-grupo__contador${restante === 0 ? " seleccion-grupo__contador--ok" : ""}`}>
                      {restante === 0 ? "✓ Completo" : `Faltan ${restante}`}
                    </span>
                  </div>
                  <div className="seleccion-grupo__items">
                    {opciones.map(op => {
                      const qty = cantidades[g]?.[op.productos] ?? 0;
                      return (
                        <div key={op.id} className={`seleccion-opcion${qty > 0 ? " seleccion-opcion--activa" : ""}`}>
                          <span className="seleccion-opcion__nombre">{op.nombre ?? op.productos}</span>
                          <div className="seleccion-opcion__ctrl">
                            <button
                              className="seleccion-opcion__btn"
                              onClick={() => dec(g, op.productos)}
                              disabled={qty === 0}
                            >−</button>
                            <span className="seleccion-opcion__qty">{qty}</span>
                            <button
                              className="seleccion-opcion__btn"
                              onClick={() => inc(g, op.productos)}
                              disabled={restante === 0}
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="alzomodal-actions">
            <button className="alzomodal-btn alzomodal-btn--secondary" onClick={onClose}>Cancelar</button>
            <button
              className="alzomodal-btn alzomodal-btn--primary"
              onClick={() => onConfirm(cantidades)}
              disabled={!todosCompletos}
            >
              Confirmar y agregar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Hook useComboAgregar ──────────────────────────────────────────────────────
// Maneja la lógica completa: fetch de detalles, modal si hay opciones, addToCart
interface UseComboAgregarOptions {
  onAdded?: () => void;
}

export function useComboAgregar({ onAdded }: UseComboAgregarOptions = {}) {
  const [modalCombo, setModalCombo] = useState<ComboConDetalles | null>(null);
  const [loading,    setLoading]    = useState(false);

  async function fetchDetalles(cod_combo: string): Promise<DetalleLine[]> {
    const [detallesRes, articulosRes] = await Promise.all([
      supabaseClient
        .from("detalles_combos")
        .select("id, productos, cantidad, descuentos, grupo")
        .eq("detalle_combo", cod_combo)
        .order("grupo"),
      supabaseClient
        .from("articulos")
        .select("codigo, descripcion"),
    ]);

    const detalles = detallesRes.data ?? [];
    const codigos  = [...new Set(detalles.map((d: any) => d.productos).filter(Boolean))];
    let artMap: Record<string, string> = {};

    if (codigos.length > 0) {
      const { data: arts } = await supabaseClient
        .from("articulos").select("codigo, descripcion")
        .in("codigo", codigos.map((c: any) => parseInt(c)));
      if (arts) artMap = Object.fromEntries(arts.map((a: any) => [String(a.codigo), a.descripcion]));
    }

    return detalles.map((d: any) => ({ ...d, nombre: artMap[String(d.productos)] ?? null }));
  }

  function doAdd(combo: ComboBase, detalles: DetalleLine[], cantidadesPorGrupo: Record<number, Record<string, number>>) {
    const grupos         = [...new Set(detalles.map(d => d.grupo))].sort();
    const gruposEleccion = grupos.filter(g => grupoRequiereEleccion(detalles.filter(d => d.grupo === g)));
    const contenido      = buildContenido(detalles, gruposEleccion, cantidadesPorGrupo);

    addToCart({
      codigo:      -parseInt(combo.cod_combo.replace(/\D/g, ""), 10),
      cod_combo:   combo.cod_combo,
      descripcion: combo.nombre,
      precioFinal: combo.precio,
      multiplo:    1,
      descuento:   0,
      tipo:        "combo",
      contenido,
    });
    onAdded?.();
  }

  async function agregar(combo: ComboBase) {
    setLoading(true);
    try {
      const detalles       = await fetchDetalles(combo.cod_combo);
      const grupos         = [...new Set(detalles.map(d => d.grupo))].sort();
      const gruposEleccion = grupos.filter(g => grupoRequiereEleccion(detalles.filter(d => d.grupo === g)));

      if (gruposEleccion.length > 0) {
        setModalCombo({ ...combo, descripcion: "", detalles });
      } else {
        doAdd(combo, detalles, {});
      }
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm(cantidadesPorGrupo: Record<number, Record<string, number>>) {
    if (!modalCombo) return;
    const grupos         = [...new Set(modalCombo.detalles.map(d => d.grupo))].sort();
    const gruposEleccion = grupos.filter(g => grupoRequiereEleccion(modalCombo.detalles.filter(d => d.grupo === g)));
    doAdd(modalCombo, modalCombo.detalles, cantidadesPorGrupo);
    setModalCombo(null);
  }

  const modal = modalCombo ? (
    <SeleccionModal
      combo={modalCombo}
      gruposEleccion={
        [...new Set(modalCombo.detalles.map(d => d.grupo))].sort()
          .filter(g => grupoRequiereEleccion(modalCombo.detalles.filter(d => d.grupo === g)))
      }
      onConfirm={handleConfirm}
      onClose={() => setModalCombo(null)}
    />
  ) : null;

  return { agregar, loading, modal };
}
