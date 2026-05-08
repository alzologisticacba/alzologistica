// src/components/247/ShareButton.tsx
import React, { useState } from "react";

interface Props {
  productName: string;
  productUrl: string;
}

type State = "idle" | "copied";

export default function ShareButton({ productName, productUrl }: Props) {
  const [state, setState] = useState<State>("idle");

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: productName, url: productUrl });
      } else {
        await navigator.clipboard.writeText(productUrl);
        setState("copied");
        setTimeout(() => setState("idle"), 1800);
      }
    } catch {
      // usuario canceló
    }
  }

  return (
    <button
      className={`pd__btn-share${state === "copied" ? " pd__btn-share--copied" : ""}`}
      onClick={handleShare}
      aria-label={state === "copied" ? "¡Link copiado!" : "Compartir producto"}
      title={state === "copied" ? "¡Link copiado!" : "Compartir"}
    >
      {state === "copied" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  );
}
