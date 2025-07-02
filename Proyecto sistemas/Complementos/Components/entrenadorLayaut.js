export function renderAdminLayout() {
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
    <div id="idMenuHambAdmin">
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
  if (main) {
    main.insertAdjacentHTML("beforebegin", headerHTML + sidebarHTML);
  } else {
    document.body.insertAdjacentHTML("afterbegin", headerHTML + sidebarHTML);
  }

  document.body.insertAdjacentHTML("beforeend", footerHTML);

  window.addEventListener("load", () => {
    const openMenu = document.getElementById("openMenu");
    const closeMenu = document.getElementById("closeMenu");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector("main");

    openMenu?.addEventListener("click", () => {
      sidebar.classList.add("open");
      mainContent?.classList.add("shifted");
      document.body.classList.add("menu-open"); // Agregar esta línea
    });

    closeMenu?.addEventListener("click", () => {
      sidebar.classList.remove("open");
      mainContent?.classList.remove("shifted");
      document.body.classList.remove("menu-open"); // Y esta línea
    });
  });
}
renderAdminLayout();
