// MenuEntren.js
export function renderTrainerLayout() {
  const headerHTML = `
    <header class="header">
      <div class="header-content">
        <img src="../../Complementos/img/logoof.png" alt="Logo" class="header-logo" />
        <div class="menu-toggle" id="openMenu">
          <i class="fas fa-bars"></i>
        </div>
      </div>
    </header>
  `;

  const sidebarHTML = `
    <div id="idMenuHambEntrenador">
      <nav id="sidebar" class="slide">
        <div class="menu-header">
          <h1>MENU</h1>
          <span class="close-btn" id="closeMenu">&times;</span>
        </div>
        <ul>
          <li><a href="../../View/Entrenador/Index.html"><i class="fas fa-home"></i> Inicio</a></li>
          <li><a href="../../View/Entrenador/VerCliente.html"><i class="fas fa-users"></i> Clientes</a></li>
          <li><a href="../../View/Administrador/ListaEjercicios.html"><i class="fas fa-dumbbell"></i> Ejercicios</a></li>
          <li><a href="../../View/Login/index.html"><i class="fas fa-sign-out-alt"></i> Salir</a></li>
        </ul>
      </nav>
    </div>
  `;

  const footerHTML = `
    <!-- Footer (siempre al fondo) -->
    <footer>
        <div class="container d-flex justify-content-center">
            <p>© 2025 PowerVital. Todos los derechos reservados.</p>
            <a href="#">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
            </a>
            <a href="#">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
            </a>
        </div>
    </footer>
  `;

  const overlayHTML = `<div id="menu-overlay"></div>`;

  const main = document.querySelector("main");

  // Inserta header + sidebar
  if (main) {
    main.insertAdjacentHTML(
      "beforebegin",
      headerHTML + sidebarHTML + overlayHTML
    );
  } else {
    console.warn("No se encontró <main>, insertando en <body>");
    document.body.insertAdjacentHTML(
      "afterbegin",
      headerHTML + sidebarHTML + overlayHTML
    );
  }

  // Inserta footer
  document.body.insertAdjacentHTML("beforeend", footerHTML);

  // Asigna eventos
  setTimeout(() => {
    const openMenu = document.getElementById("openMenu");
    const closeMenu = document.getElementById("closeMenu");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
    const overlay = document.getElementById("menu-overlay");

    openMenu?.addEventListener("click", () => {
      sidebar.classList.add("open");
      mainContent?.classList.add("shifted");
      overlay?.classList.add("visible");
    });

    closeMenu?.addEventListener("click", () => {
      sidebar.classList.remove("open");
      mainContent?.classList.remove("shifted");
      overlay?.classList.remove("visible");
    });

    overlay?.addEventListener("click", () => {
      sidebar.classList.remove("open");
      mainContent?.classList.remove("shifted");
      overlay?.classList.remove("visible");
    });
  }, 0);
}
// En ../../Complementos/Components/MenuEntren.js
export function renderMenuEntrenador() {
  // Código que inserta el menú de entrenador en el DOM, por ejemplo:
  document.getElementById("menu-lateral").innerHTML = `
    <!-- Aquí el HTML de tu menú de entrenador -->
  `;
}
// LLAMAMOS AUTOMÁTICAMENTE
renderTrainerLayout();
