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
          <li><a href="Index.html"><i class="fas fa-home"></i> Inicio</a></li>
          <li><a href="#"><i class="fas fa-dollar-sign"></i> Pagos</a></li>
          <li><a href="#"><i class="fas fa-users"></i> Clientes</a></li>
          <li><a href="#"><i class="fas fa-dumbbell"></i> Ejercicios</a></li>
          <li><a href="#"><i class="fas fa-sign-out-alt"></i> Salir</a></li>
        </ul>
      </nav>
    </div>
  `;

  const footerHTML = `
    <footer class="footer">
    <div class="row">
      <div class="col-6">
 <p>PowerVital Todos los derechos Reservados</p>
      </div>
       <div class="col-6">
  <img src="../../Complementos/img/facebook.png" alt="Facebook" class="footer-logo" />
      <img src="../../Complementos/img/instagram.png" alt="Instagram" class="footer-logo" />
      </div>

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
    });

    closeMenu?.addEventListener("click", () => {
      sidebar.classList.remove("open");
      mainContent?.classList.remove("shifted");
    });
  });
}
