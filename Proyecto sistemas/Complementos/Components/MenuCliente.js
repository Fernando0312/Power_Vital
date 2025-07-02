export function MenuCliente() {
  return `
    <aside class="sidebar" id="sidebar">
      <div class="menu-header">
        <h1>MENU</h1>
        <div class="close-btn" id="closeSidebar"><i class="fas fa-times"></i></div>
      </div>
      <ul>
        <li><a href="../../View/Cliente/Index.html"><i class="fas fa-home"></i> Inicio</a></li>
        <li><a href="../../View/Cliente/RutinaCliente.html"><i class="fas fa-dumbbell"></i> Rutinas</a></li>
        <li><a href="#"><i class="fas fa-circle-question"></i> Help</a></li>
        <li><a href="#" id="logoutBtn"><i class="fas fa-right-from-bracket"></i> Cerrar Sesión</a></li>
      </ul>
    </aside>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const layout = document.getElementById("layout");
  layout.insertAdjacentHTML("afterbegin", MenuCliente());

  const openBtn = document.getElementById("openSidebar");
  const closeBtn = document.getElementById("closeSidebar");
  const icon = document.getElementById("iconHamburguesa");

  // Funcionalidad del sidebar
  if (openBtn && layout && icon) {
    openBtn.addEventListener("click", () => {
      layout.classList.add("sidebar-open");
      icon.style.display = "none";
    });
  }

  if (closeBtn && layout && icon) {
    closeBtn.addEventListener("click", () => {
      layout.classList.remove("sidebar-open");
      icon.style.display = "inline-block";
    });
  }

  // 🔧 FUNCIONALIDAD DE CERRAR SESIÓN
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Previene el comportamiento por defecto del enlace
      
      // Mostrar confirmación antes de cerrar sesión
      if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        cerrarSesion();
      }
    });
  }
});

// 🔧 FUNCIÓN PARA CERRAR SESIÓN
function cerrarSesion() {
  try {
    // OPCIÓN 1: Si usas localStorage para guardar datos de sesión
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    
    // OPCIÓN 2: Si usas sessionStorage
    sessionStorage.clear();
    
    // OPCIÓN 3: Si usas cookies, las eliminamos
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // OPCIÓN 4: Si tienes un backend, hacer petición para invalidar sesión
    // fetch('/api/logout', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    //   }
    // }).then(() => {
    //   // Limpiar datos locales después de la respuesta del servidor
    //   localStorage.clear();
    //   window.location.href = '/login.html';
    // });
    
    // Mostrar mensaje de confirmación
    alert("Sesión cerrada exitosamente");
    
    // Redirigir a la página de login
    window.location.href = "../../View/Login/Login.html"; // Ajusta la ruta según tu estructura
    
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    alert("Hubo un error al cerrar la sesión. Inténtalo de nuevo.");
  }
}