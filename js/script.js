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

  try {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd7JnQO1Le0zrFoTtwzm3DpuUJh-h4GxfX8F3a2RD7H69pMufbZPgILKVX6NuiT6RO7LbVKG76XAdh/pub?gid=0&single=true&output=tsv";
    const response = await fetch(url);
    const text = await response.text();

    const lines = text.split("\n").map(line => line.split("\t"));
    const data = lines.slice(1);
    const fila = data.find(row => row[0] === codigo);

    if (fila) {
      resultado.innerHTML = `
        <p><strong>Cliente:</strong> ${fila[3] || '-'}</p>
        <p><strong>Pedido:</strong> ${fila[1]}</p>
        <p><strong>Fecha de entrega:</strong> ${fila[2]}</p>
      `;
    } else {
      resultado.innerHTML = "<p><strong>Error:</strong> Código de cliente no encontrado.</p>";
    }

    resultado.classList.add("resultado-activo");
  } catch (err) {
    resultado.innerHTML = "<p><strong>Error:</strong> No se pudo acceder a la hoja.</p>";
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