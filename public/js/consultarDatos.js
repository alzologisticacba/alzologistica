async function consultar() {
  const codigo = document.getElementById("codigo").value.trim();
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";
  resultado.classList.remove("resultado-activo");

  if (!codigo) {
    resultado.innerHTML = "<p>Ingrese un código válido.</p>";
    resultado.classList.add("resultado-activo");
    return;
  }

  resultado.innerHTML = '<div class="spinner"></div>';
  resultado.classList.add("resultado-activo");

  try {
    const url = `https://script.google.com/macros/s/AKfycbwRM0oh-SZFaBnFNxhvIHETRTIVPmpUahaDHbvR82Dp6N-AR3Jj-bqhuZjIGppPeeKdSg/exec?codigo=${encodeURIComponent(codigo)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      resultado.innerHTML = `<p><strong>Error:</strong> ${data.error}</p>`;
    } else {
      resultado.innerHTML = `
        <p><strong>Cliente:</strong> ${data.cliente}</p>
        <p><strong>Día de Venta:</strong> ${data.diaVenta}</p>
        <p><strong>Día de Reparto:</strong> ${data.diaReparto}</p>
        <p class="linea-contacto">
          <strong>Vendedor:</strong> ${data.nombreVendedor}
          <a href="https://wa.me/54${data.telefonoVendedor}" target="_blank" class="wsp-link">
            <i class="fab fa-whatsapp"></i> ${data.telefonoVendedor}
          </a>
        </p>
        <p class="linea-contacto">
          <strong>Repartidor:</strong> ${data.nombreRepartidor} &nbsp; 
          <a href="https://wa.me/54${data.telefonoRepartidor}" target="_blank" class="wsp-link">
            <i class="fab fa-whatsapp"></i> ${data.telefonoRepartidor}
          </a>
        </p>
      `;
    }

    resultado.classList.add("resultado-activo");
  } catch (err) {
    resultado.innerHTML = "<p><strong>Error:</strong> No se pudo acceder al servidor.</p>";
    resultado.classList.add("resultado-activo");
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const boton = document.getElementById("btn-consultar");
  if (boton) {
    boton.addEventListener("click", consultar);
  }
});


 function toggleWhatsappMenu() {
    const menu = document.getElementById("whatsapp-menu");
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  }


  function mostrarPopup() {
  document.getElementById("popup").style.display = "flex";
}

function cerrarPopup() {
  document.getElementById("popup").style.display = "none";
}

// Mostrar el pop-up automáticamente al cargar
window.addEventListener("DOMContentLoaded", mostrarPopup);

document.addEventListener("click", function (e) {
  const popup = document.getElementById("popup");
  const contenido = document.querySelector(".popup-content");

  if (
    popup.style.display === "flex" &&
    !contenido.contains(e.target) &&
    !e.target.classList.contains("popup-close")
  ) {
    cerrarPopup();
  }
});