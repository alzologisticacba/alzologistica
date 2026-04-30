// src/components/247/FiguritasHero.tsx
import { useState, useEffect } from "react";

const FONDOS_DESKTOP = [
  "/img/247/figuritasFondo.webp",
  "/img/247/figuritasFondo1.webp",
  "/img/247/figuritasFondo2.webp",
];
const FONDOS_MOBILE = [
  "/img/247/figuritasFondo.webp",
  "/img/247/figuritasFondo1.webp",
  "/img/247/figuritasFondo2.webp",
];

export default function FiguritasHero() {
  const [idx, setIdx]         = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [fading, setFading]   = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const fondos = isDesktop ? FONDOS_DESKTOP : FONDOS_MOBILE;
    const interval = setInterval(() => {
      const next = (idx + 1) % fondos.length;
      setNextIdx(next);
      setFading(true);
      setTimeout(() => {
        setIdx(next);
        setFading(false);
      }, 700);
    }, 5000);
    return () => clearInterval(interval);
  }, [isDesktop, idx]);

  const fondos = isDesktop ? FONDOS_DESKTOP : FONDOS_MOBILE;

  return (
    <section className="figuritas-hero">
      {/* Capa actual */}
      <div
        className="figuritas-hero__bg-layer"
        style={{ backgroundImage: `url("${fondos[idx]}")`, opacity: fading ? 0 : 1 }}
      />
      {/* Capa siguiente (pre-cargada debajo) */}
      <div
        className="figuritas-hero__bg-layer"
        style={{ backgroundImage: `url("${fondos[nextIdx]}")`, opacity: 1, zIndex: 0 }}
      />

      <div className="figuritas-hero__content">
        <img
          src="/img/247/figuritasPaquete.png"
          alt="Paquete de figuritas"
          className="figuritas-hero__paquete"
        />
        <h1 className="figuritas-hero__title">FIGURITAS</h1>
        <p className="figuritas-hero__subtitle">MUNDIAL 2026</p>
        <a
          href="#figuritas"
          className="figuritas-hero__cta"
          onClick={(e) => {
            e.preventDefault();
            const section   = document.getElementById("figuritas");
            const paqueteEl = document.querySelector(".figuritas-hero__paquete") as HTMLElement | null;
            if (!section || !paqueteEl) return;

            // Snapshot posición actual del paquete en viewport
            const pRect = paqueteEl.getBoundingClientRect();

            // Clon fijo que "vuela" independiente del scroll
            const clone = document.createElement("img");
            clone.src = "/img/247/figuritasPaquete.png";
            clone.setAttribute("aria-hidden", "true");
            clone.style.cssText = `
              position:fixed;left:${pRect.left}px;top:${pRect.top}px;
              width:${pRect.width}px;height:${pRect.height}px;
              z-index:9999;pointer-events:none;
              filter:drop-shadow(0 8px 24px rgba(0,0,0,0.45));
            `;
            document.body.appendChild(clone);

            // Destino del clon: esquina superior-izquierda del header de la sección
            const destTop  = 60 + 16 + 20;   // bajo el sticky header + margin de la sección
            const destLeft = 32;

            // Scroll
            const targetScrollY = section.getBoundingClientRect().top + window.scrollY - 60;
            const startScrollY  = window.scrollY;
            const scrollDiff    = targetScrollY - startScrollY;

            const duration = 900;
            let startTime: number | null = null;
            const ease = (t: number) =>
              t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            const step = (now: number) => {
              if (!startTime) startTime = now;
              const progress = Math.min((now - startTime) / duration, 1);
              const p = ease(progress);

              // Scroll página
              window.scrollTo(0, startScrollY + scrollDiff * p);

              // Clon: cae hacia el destino, rota un poco y se desvanece al llegar
              clone.style.top       = `${pRect.top  + (destTop  - pRect.top)  * p}px`;
              clone.style.left      = `${pRect.left + (destLeft - pRect.left) * p}px`;
              clone.style.opacity   = `${1 - p}`;
              clone.style.transform = `rotate(${p * 12}deg) scale(${1 - 0.25 * p})`;

              if (progress < 1) requestAnimationFrame(step);
              else clone.remove();
            };

            requestAnimationFrame(step);
          }}
        >
          ¡YA DISPONIBLES!
        </a>
      </div>
    </section>
  );
}
