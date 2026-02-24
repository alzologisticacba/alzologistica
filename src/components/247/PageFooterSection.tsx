// src/components/247/PageFooterSection.tsx
// ⚠️ Este componente debe ir FUERA del shell-247, directamente dentro de .app-247
import CategoriesSection from "./CategoriesSection";
import Footer247 from "./Footer247";

export default function PageFooterSection() {
  return (
    <div className="page-footer-section">
      {/* Botón volver al inicio — centrado dentro del shell */}
      <div className="page-footer-section__back-wrap">
        <a href="/247" className="page-footer-section__back-btn">
          ← Volver al inicio
        </a>
      </div>

      {/* Categorías — full width con inner centrado */}
      <div className="page-footer-section__cats">
        <div className="shell-247">
          <CategoriesSection />
        </div>
      </div>

      {/* Footer — full width */}
      <Footer247 />
    </div>
  );
}