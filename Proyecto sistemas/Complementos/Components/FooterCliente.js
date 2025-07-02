export function FooterCliente() {
  return `
  <footer class="pie container-fluid">
    <div class="row">
      <div class="col-6">
 <p>© <Strong>PowerVital</Strong> Todos los derechos Reservados</p>
      </div>
       <div class="col-6">
  <img src="../../Complementos/img/facebook.png" alt="Facebook" class="icono-social" />
      <img src="../../Complementos/img/instagram.png" alt="Instagram" class="icono-social" />
      </div>

    </div>
  </footer>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("mainWrapper");
  wrapper.insertAdjacentHTML("beforeend", FooterCliente());
});
