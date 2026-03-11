// src/components/247/ComboDetalle.tsx
import React, { useState, useEffect, useRef } from "react";
import Header247 from "./Header247";
import PageFooterSection from "./PageFooterSection";
import ComboCard from "./ComboCard";
import { addToCart } from "./hooks/cartStore";
import { supabaseClient } from "../../lib/supabaseClient";
import { SeleccionModal, grupoRequiereEleccion, buildContenido, type DetalleLine } from "./ComboSeleccionModal";

interface Combo {
  cod_combo: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen?: string;
  detalles: DetalleLine[];
}

const IMG_BASE = "https://wjnybucyhfbtvrerdvax.supabase.co/storage/v1/object/public/Productos/articulos";

function ComboImgDetalle({ cod_combo, nombre }: { cod_combo: string; nombre: string }) {
  const [error, setError] = React.useState(false);
  if (error) return <div className="pd__img-placeholder">🎁</div>;
  return (
    <img
      src={`${IMG_BASE}/${cod_combo}.png`}
      alt={nombre}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setError(true)}
    />
  );
}

function fmt(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function ItemRow({ item }: { item: DetalleLine }) {
  return (
    <div className="combo-item">
      <div className="combo-item__left">
        <span className="combo-item__qty">{item.cantidad}×</span>
        <div className="combo-item__info">
          {item.nombre && <span className="combo-item__name">{item.nombre}</span>}
          <span className="combo-item__code">#{item.productos}</span>
        </div>
      </div>
      {item.descuentos > 0 && <span className="combo-item__desc">-{item.descuentos}%</span>}
    </div>
  );
}

// ── Botón agregar ─────────────────────────────────────────────────────────────
interface BtnProps {
  combo: Combo;
  grupos: number[];
  gruposEleccion: number[];
}

function BtnComboAgregar({ combo, grupos, gruposEleccion }: BtnProps) {
  const [btnState, setBtnState] = React.useState<"idle" | "ok" | "pending">("idle");
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    function onConfirmed(e: Event) {
      const { codigo } = (e as CustomEvent<{ codigo: number }>).detail;
      if (codigo === -parseInt(combo.cod_combo.replace(/\D/g, ""), 10)) {
        setBtnState("ok");
        setTimeout(() => setBtnState("idle"), 1800);
      }
    }
    window.addEventListener("cart-age-confirmed", onConfirmed);
    return () => window.removeEventListener("cart-age-confirmed", onConfirmed);
  }, [combo.cod_combo]);

  function doAddToCart(cantidadesPorGrupo: Record<number, Record<string, number>> = {}) {
    const contenido = buildContenido(combo.detalles, gruposEleccion, cantidadesPorGrupo);
    const result = addToCart({
      codigo:      -parseInt(combo.cod_combo.replace(/\D/g, ""), 10),
      cod_combo:   combo.cod_combo,
      descripcion: combo.nombre,
      precioFinal: combo.precio,
      multiplo:    1,
      descuento:   0,
      tipo:        "combo",
      contenido,
    });
    setBtnState(result === "added" ? "ok" : "pending");
    setTimeout(() => setBtnState("idle"), 1800);
  }

  return (
    <>
      <button
        className={`pd__btn-agregar${btnState === "ok" ? " pd__btn-agregar--ok" : btnState === "pending" ? " pd__btn-agregar--pending" : ""}`}
        onClick={() => gruposEleccion.length > 0 ? setModalOpen(true) : doAddToCart()}
      >
        {btnState === "ok" ? "✓ ¡Agregado al carrito!" : btnState === "pending" ? "✕ No agregado" : "🛒 Agregar al carrito"}
      </button>

      {modalOpen && (
        <SeleccionModal
          combo={{ ...combo, descripcion: combo.descripcion ?? "" }}
          gruposEleccion={gruposEleccion}
          onConfirm={cantidades => { setModalOpen(false); doAddToCart(cantidades); }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ComboDetalle() {
  const [combo, setCombo]         = useState<Combo | null>(null);
  const [masCombos, setMasCombos] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const relRowRef                  = useRef<HTMLDivElement>(null);

  function scrollRel(dir: "left" | "right") {
    relRowRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  useEffect(() => {
    const cod = new URLSearchParams(window.location.search).get("cod_combo");
    if (!cod) { setError(true); setLoading(false); return; }

    Promise.all([
      supabaseClient.from("combos").select("cod_combo, nombre, precio, descripcion, imagen").eq("cod_combo", cod).single(),
      supabaseClient.from("detalles_combos").select("id, productos, cantidad, descuentos, grupo").eq("detalle_combo", cod).order("grupo"),
    ]).then(async ([comboRes, detallesRes]) => {
      if (comboRes.error || !comboRes.data) { setError(true); return; }

      const detalles = detallesRes.data ?? [];
      const codigos  = [...new Set(detalles.map((d: any) => d.productos).filter(Boolean))];
      let artMap: Record<string, string> = {};

      if (codigos.length > 0) {
        const { data: arts } = await supabaseClient
          .from("articulos").select("codigo, descripcion")
          .in("codigo", codigos.map((c: any) => parseInt(c)));
        if (arts) artMap = Object.fromEntries(arts.map((a: any) => [String(a.codigo), a.descripcion]));
      }

      setCombo({
        ...comboRes.data,
        detalles: detalles.map((d: any) => ({ ...d, nombre: artMap[String(d.productos)] ?? null })),
      });

      // Traer otros combos (excluir el actual)
      supabaseClient
        .from("combos")
        .select("cod_combo, nombre, precio, descripcion, imagen")
        .neq("cod_combo", cod)
        .limit(12)
        .then(({ data }) => {
          if (data) {
            const shuffled = [...data].sort(() => Math.random() - 0.5);
            setMasCombos(shuffled);
          }
        });

    }).catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const grupos         = combo ? [...new Set(combo.detalles.map(d => d.grupo))].sort() : [];
  const multiGrupo     = grupos.length > 1;
  const gruposEleccion = combo
    ? grupos.filter(g => grupoRequiereEleccion(combo.detalles.filter(d => d.grupo === g)))
    : [];

  return (
    <div className="app-247">
      <Header247 showBack={true} />
      <div className="shell-247">
        {loading && <div className="pd-skeleton"><div className="pd-skeleton__img" /><div className="pd-skeleton__info"><div className="pd-skeleton__line pd-skeleton__line--title" /><div className="pd-skeleton__line" /></div></div>}
        {!loading && error && <div className="pd-error"><p>Combo no encontrado.</p><button onClick={() => window.history.back()} className="pd-error__btn">← Volver</button></div>}
        {!loading && !error && combo && (
          <div className="pd">
            <nav className="pd__breadcrumb">
              <a href="/247">Inicio</a><span>›</span>
              <a href="/247/combos">Combos</a><span>›</span>
              <span>{combo.nombre}</span>
            </nav>
            <div className="pd__body">
              <div className="pd__img-col">
                <div className="pd__img-wrap">
                  <ComboImgDetalle cod_combo={combo.cod_combo} nombre={combo.nombre} />
                </div>
              </div>
              <div className="pd__info-col">
                <p className="pd__rubro">COMBO</p>
                <h1 className="pd__titulo">{combo.nombre}</h1>
                {combo.descripcion && <p style={{ fontSize:13, color:"#7a84a8" }}>{combo.descripcion}</p>}
                <div className="pd__precio-wrap">
                  <div className="pd__precio-row"><span className="pd__precio">{fmt(combo.precio)}</span></div>
                  <p className="pd__precio-unit">precio del combo</p>
                </div>

                {combo.detalles.length > 0 && (
                  <div className="combo-detalles">
                    <h2 className="combo-detalles__titulo">Contenido del combo</h2>
                    {multiGrupo
                      ? grupos.map(g => {
                          const items      = combo.detalles.filter(d => d.grupo === g);
                          const esEleccion = gruposEleccion.includes(g);
                          return (
                            <div key={g} className={`combo-grupo${esEleccion ? " combo-grupo--eleccion" : ""}`}>
                              {esEleccion && <p className="combo-grupo__elegir">Elegí {items[0]?.cantidad ?? 1}</p>}
                              {items.map(item => <ItemRow key={item.id} item={item} />)}
                            </div>
                          );
                        })
                      : combo.detalles.map(item => <ItemRow key={item.id} item={item} />)
                    }
                  </div>
                )}



                <BtnComboAgregar combo={combo} grupos={grupos} gruposEleccion={gruposEleccion} />
              </div>
            </div>
          </div>
        )}

        {!loading && !error && masCombos.length > 0 && (
          <div className="pd__relacionados">
            <div className="pd__relacionados-head">
              <h2 className="pd__relacionados-titulo">
                Más de <span>Combos</span>
              </h2>
            </div>
            <div className="home-section__row-wrap">
              <button className="home-section__arrow home-section__arrow--left" onClick={() => scrollRel("left")} aria-label="Anterior">‹</button>
              <div className="pd__relacionados-row" ref={relRowRef}>
                {masCombos.map(c => <ComboCard key={c.cod_combo} combo={c} />)}
              </div>
              <button className="home-section__arrow home-section__arrow--right" onClick={() => scrollRel("right")} aria-label="Siguiente">›</button>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && <PageFooterSection />}
    </div>
  );
}
