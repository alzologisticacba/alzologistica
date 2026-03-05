// src/components/247/AgeGateModal.tsx
import { useEffect, useState } from "react";
import { addToCart, setAgeVerified } from "./hooks/cartStore";
import type { CartItem } from "./hooks/cartStore";

type PendingItem = Omit<CartItem, "cantidad">;

export default function AgeGateModal() {
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);

  useEffect(() => {
    function handleAgeGate(e: Event) {
      const item = (e as CustomEvent<PendingItem>).detail;
      setPendingItem(item);
    }
    window.addEventListener("cart-age-gate", handleAgeGate);
    return () => window.removeEventListener("cart-age-gate", handleAgeGate);
  }, []);

  function confirmar(esMayor: boolean) {
    if (esMayor) {
      setAgeVerified(true);
      if (pendingItem) {
        addToCart(pendingItem);
        window.dispatchEvent(new CustomEvent("cart-age-confirmed", { detail: { codigo: pendingItem.codigo } }));
      }
    }
    // Si dice "No", no guardamos nada → el modal volverá a aparecer la próxima vez
    setPendingItem(null);
  }

  if (!pendingItem) return null;

  return (
    <>
      <div className="alzomodal-backdrop" onClick={() => setPendingItem(null)} />
      <div className="alzomodal" role="dialog" aria-modal="true">
        <div className="alzomodal-card age-gate-card">
          <div className="age-gate__icon">🔞</div>
          <h3 className="alzomodal-title age-gate__title">¿Sos mayor de 18 años?</h3>
          <p className="age-gate__desc">
            Algunos de nuestros productos, como cigarrillos, están destinados exclusivamente a adultos.
          </p>
          <div className="alzomodal-actions age-gate__actions">
            <button
              className="alzomodal-btn alzomodal-btn--ghost"
              onClick={() => confirmar(false)}
            >
              No, soy menor
            </button>
            <button
              className="alzomodal-btn"
              onClick={() => confirmar(true)}
            >
              Sí, soy mayor de 18
            </button>
          </div>
          <p className="age-gate__legal">
            Al continuar confirmás que tenés 18 años o más.
          </p>
        </div>
      </div>
    </>
  );
}
