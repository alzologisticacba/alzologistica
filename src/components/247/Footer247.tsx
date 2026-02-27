// src/components/247/Footer247.tsx

interface FooterLink {
  img: string;
  titulo: string;
  descripcion: string;
  href: string;
  label: string;
}

const LINKS: FooterLink[] = [
  {
    img: "/img/247/difusionfooter.png",
    titulo: "Canal de Difusión",
    descripcion: "Seguí nuestras novedades, ofertas y lanzamientos en tiempo real.",
    href: "https://whatsapp.com/channel/0029VbC00Vd3QxS30oAEN60G",
    label: "Unirse al canal",
  },
  {
    img: "/img/247/comercialfooter.png",
    titulo: "Área Comercial",
    descripcion: "Contactá a nuestro equipo de ventas para asesoramiento personalizado.",
    href: `https://wa.me/5493513276516?text=${encodeURIComponent("Hola vengo de Alzo 24/7! Quiero obtener asesoramiento para mi punto de venta!")}`,
    label: "Contactar vendedor",
  },
  {
    img: "/img/247/mayoristafooter.png",
    titulo: "Mayoristas",
    descripcion: "Accedé a precios especiales y condiciones exclusivas para revendedores.",
    href: `https://wa.me/5493516316968?text=${encodeURIComponent("Hola vengo de Alzo 24/7! Quiero obtener asesoramiento para mayoristas!")}`,
    label: "Canal mayorista",
  },
  {
    img: "/img/247/adminfooter.png",
    titulo: "Administración",
    descripcion: "Consultas sobre facturación, pagos y gestión de cuenta.",
    href: "https://wa.me/5493512029862",
    label: "Ir a administración",
  },
];

export default function Footer247() {
  return (
    <footer className="footer247" suppressHydrationWarning>
      <div className="footer247__inner">
        <div className="footer247__grid">
          {LINKS.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer247__card"
            >
              {i > 0 && <div className="footer247__divider" aria-hidden="true" />}
              <div className="footer247__card-inner">
                <div className="footer247__icon">
                  <img
                    src={item.img}
                    alt={item.titulo}
                    className="footer247__icon-img"
                  />
                </div>
                <h3 className="footer247__titulo">{item.titulo}</h3>
                <p className="footer247__desc">{item.descripcion}</p>
                <span className="footer247__link">{item.label}</span>
              </div>
            </a>
          ))}
        </div>

        <div className="footer247__bottom">
          <p className="footer247__copy" suppressHydrationWarning>
            © 2026 Alzo Logística
          </p>
        </div>
      </div>
    </footer>
  );
}