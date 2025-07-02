export function renderAdminLayout() {
  const headerHTML = `
    <header class="header ">
      <div class="header-content ">
        <img src="../../Complementos/img/logoof.png" alt="Logo" class="header-logo" />
        <div class="menu-toggle" id="openMenu">
          <i class="fas fa-bars"></i>
        </div>
      </div>
    </header>
  `;

  const sidebarHTML = `
     
    <div id="idMenuHambAdmin">
      <nav id="sidebar" class="slide">
        <div class="menu-header">
          <h1>MENU</h1>
          <span class="close-btn" id="closeMenu">&times;</span>
        </div>
        <ul>
          <li><a href="Index.html"><i class="fas fa-home"></i> Inicio</a></li>
          <li><a href="../../View/Administrador/Pagos.html""><i class="fas fa-dollar-sign"></i> Pagos</a></li>
          <li>
            <a href="#" id="clientesMenuBtn">
              <i class="fas fa-users"></i> Usuarios <span class="caret"><i class="fas fa-caret-down"></i></span>
            </a>
            <ul class="submenu" id="clientesSubmenu">
              <li><a href="Empleados.html">Administradores</a></li>
              <li><a href="ListaEntrenadores.html">Entrenadores</a></li>
              <li><a href="ListaClientes.html">Clientes</a></li>
            </ul>
          </li>
          <li><a href="../../View/Administrador/ListaEjercicios.html"><i class="fas fa-dumbbell"></i> Ejercicios</a></li>
          <li><a href="../../View/Login/index.html"><i class="fas fa-sign-out-alt"></i> Salir</a></li>
        </ul>
      </nav>
    </div>
  `;

  const footerHTML = `
    <footer>
        <div class="container d-flex justify-content-center">
            <p>© 2025 <Strong>PowerVital</Strong>. Todos los derechos reservados.</p>
            <a href="#">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" />
            </a>
            <a href="#">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
            </a>
        </div>
    </footer>
  `;

  const main = document.querySelector("main");

  // Inserta el header y sidebar
  if (main) {
    main.insertAdjacentHTML("beforebegin", headerHTML + sidebarHTML);
  } else {
    console.warn("No se encontró <main>, insertando en <body>");
    document.body.insertAdjacentHTML("afterbegin", headerHTML + sidebarHTML);
  }

  // Inserta el footer
  document.body.insertAdjacentHTML("beforeend", footerHTML);

  // Espera a que el DOM esté actualizado para asignar eventos
  setTimeout(() => {
    const openMenu = document.getElementById("openMenu");
    const closeMenu = document.getElementById("closeMenu");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
    const clientesMenuBtn = document.getElementById("clientesMenuBtn");
    const clientesSubmenu = document.getElementById("clientesSubmenu");

    if (openMenu && sidebar) {
      openMenu.addEventListener("click", () => {
        sidebar.classList.add("open");
        mainContent?.classList.add("shifted");
      });
    }

    if (closeMenu && sidebar) {
      closeMenu.addEventListener("click", () => {
        sidebar.classList.remove("open");
        mainContent?.classList.remove("shifted");
      });
    }

    if (clientesMenuBtn && clientesSubmenu) {
      clientesMenuBtn.addEventListener("click", (e) => {
        e.preventDefault();
        clientesSubmenu.classList.toggle("visible");
      });
    }
  }, 0); // Se ejecuta al final del stack
}
