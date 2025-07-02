function MenuHambEjer() {
  return `
      <aside class="slide" id="sidebar">
        <div class="menu-header">
          <h1>MENU</h1>
          <div class="close-btn" id="closeMenu"><i class="fas fa-times"></i></div>
        </div>
        <ul>
          <li><a href="#"><i class="fas fa-home"></i> Inicio</a></li>
          <li><a href="#"><i class="fas fa-dollar-sign"></i> Pagos</a></li>
          <li class="has-submenu">
            <a href="#" id="toggleSubmenu"><i class="fas fa-users"></i> Usuarios <i class="fas fa-chevron-down caret"></i></a>
            <ul class="submenu" id="submenuUsuarios">
               <li><a href="../../View/Administrador/Index.html"> Administradores</a></li>
               <li><a href="../../View/Entrenador/Index.html""> Entrenadores</a></li>
              <li><a href="../Cliente/Index.html"> Clientes</a></li>
            </ul>
          </li>
          <li><a href="editarEjercicio.html"><i class="fas fa-dumbbell"></i>Ejercicios</a></li>
          <li><a href="indexEjercicio.html"><i class="fas fa-dumbbell"></i>Crear Ejercicios</a></li>
          <li><a href="../Entrenador/Index.html"><i class="fas fa-heartbeat"></i>Entrenador</a></li>
          <li><a href="#"><i class="fas fa-sign-out-alt"></i> Salir</a></li>
        </ul>
      </aside>
    `;
}

//Pase la funcion del script que lo acia funcionar para aquí, el window es para que no se cargue primero que el html
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("idMenuHambEjercicio").innerHTML = MenuHambEjer();

  const openBtn = document.getElementById("openMenu");
  const closeBtn = document.getElementById("closeMenu");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const submenuToggle = document.getElementById("toggleSubmenu");
  const submenu = document.getElementById("submenuUsuarios");

  openBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    openBtn.style.display = "none";
    mainContent.classList.add("shifted");
  });

  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    openBtn.style.display = "block";
    mainContent.classList.remove("shifted");
  });

  submenuToggle.addEventListener("click", (e) => {
    e.preventDefault();
    submenu.classList.toggle("visible");
  });

  submenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      submenu
        .querySelectorAll("a")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
});
