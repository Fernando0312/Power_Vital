// URL base de la API para ejercicios
//const URL_API = "http://mi-api-powergym-2025.somee.com/api/Ejercicio";
const URL_API = "https://proyecto-inegev2-1.onrender.com/api/Ejercicio";
// Variable global para almacenar la lista de ejercicios.
let listaEjerciciosGlobal = [];

document.addEventListener("DOMContentLoaded", function () {
  cargarEjerciciosAdmin();
  inicializarFiltroEjercicios();
  mostrarBotonAgregarSoloEntrenador();
  ocultarThAccionesSiAdmin();

  // Inicializa el filtro en la caja de texto para buscar ejercicios por nombre
  function inicializarFiltroEjercicios() {
    const filtroInput = document.getElementById("filtroEjercicio");
    if (filtroInput) {
      filtroInput.addEventListener("input", function () {
        renderizarTablaEjercicios(this.value);
      });
    }
  }

  // Renderiza la tabla de ejercicios, con filtro opcional por nombre
  function renderizarTablaEjercicios(filtro = "") {
    const table = document.getElementById("tablaEjercicios");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    let ejerciciosFiltrados = listaEjerciciosGlobal;
    let usuarioActual = null;
    try {
      usuarioActual = JSON.parse(
        sessionStorage.getItem("usuario") || localStorage.getItem("usuario")
      );
    } catch (e) {}

    let esEntrenador =
      usuarioActual &&
      usuarioActual.Rol &&
      usuarioActual.Rol.toLowerCase() === "entrenador";

    let esAdmin =
      usuarioActual &&
      usuarioActual.Rol &&
      usuarioActual.Rol.toLowerCase() === "admin";

    if (filtro) {
      ejerciciosFiltrados = listaEjerciciosGlobal.filter(
        (ej) =>
          ej.Nombre && ej.Nombre.toLowerCase().includes(filtro.toLowerCase())
      );
    }

    if (
      !Array.isArray(ejerciciosFiltrados) ||
      ejerciciosFiltrados.length === 0
    ) {
      tbody.innerHTML = `<tr><td colspan="${
        esEntrenador ? 8 : 7
      }">No hay ejercicios registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    ejerciciosFiltrados.forEach((ej) => {
      tbody.insertAdjacentHTML(
        "beforeend",
        `
      <tr>
        <td>${ej.Nombre}</td>
        <td>${ej.Descripcion}</td>
        <td>${ej.Repeticiones}</td>
        <td><a href="${ej.GuiaEjercicio}" target="_blank" class="btn-ver">Ver video<i class="fas fa-video"></i> </a></td>
        <td>${ej.AreaMuscular}</td>
        <td>${ej.AreaMuscularAfectada ?? ""}</td>
        <td>${ej.Dificultad}</td>
        ${
          esEntrenador
            ? `<td>
                  <button class="btn-tabla-editar" data-id="${ej.IdEjercicio}" title="Editar">
                    <span class="icono-btn"><i class="bi bi-pencil"></i></span>
                  </button>
                  <button class="btn-tabla-eliminar" data-id="${ej.IdEjercicio}" title="Eliminar">
                    <span class="icono-btn"><i class="bi bi-trash"></i></span>
                  </button>
               </td>`
            : ""
        }
      </tr>
      `
      );
    });

    // Listeners para los botones de editar y eliminar si el usuario es entrenador
    if (esEntrenador) {
      tbody.querySelectorAll(".btn-tabla-editar").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = this.getAttribute("data-id");
          window.location.href = `../../View/Entrenador/EditarEjercicio.html?id=${id}`;
        });
      });
      tbody.querySelectorAll(".btn-tabla-eliminar").forEach((btn) => {
        btn.addEventListener("click", async function () {
          const id = this.getAttribute("data-id");
          if (confirm("¿Seguro que quieres borrar este ejercicio?")) {
            await borrarEjercicio(id); // el confirm solo aquí
          }
        });
      });
    }
  }

  // Carga la lista de ejercicios desde la API y la muestra en la tabla
  async function cargarEjerciciosAdmin() {
    const table = document.getElementById("tablaEjercicios");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "<tr><td colspan='7'>Cargando...</td></tr>";

    try {
      const resp = await fetch(`${URL_API}/listaEjercicios`);
      if (!resp.ok) throw new Error("No se pudo obtener la lista");
      const ejercicios = await resp.json();

      let lista = [];
      if (Array.isArray(ejercicios)) {
        lista = ejercicios;
      } else if (Array.isArray(ejercicios.$values)) {
        lista = ejercicios.$values;
      } else if (Array.isArray(ejercicios.data)) {
        lista = ejercicios.data;
      } else if (Array.isArray(ejercicios.lista)) {
        lista = ejercicios.lista;
      } else {
        console.warn("Formato inesperado de la respuesta:", ejercicios);
      }

      listaEjerciciosGlobal = lista;
      renderizarTablaEjercicios();
    } catch (err) {
      mostrarMensaje("Error al cargar ejercicios: " + err.message, "danger");
      tbody.innerHTML = "<tr><td colspan='7'>Error al cargar datos.</td></tr>";
    }
  }

  // Muestra un mensaje de alerta en la página
  function mostrarMensaje(msg, tipo = "info") {
    let alertPlaceholder = document.getElementById("alertPlaceholder");
    if (!alertPlaceholder) {
      alertPlaceholder = document.createElement("div");
      alertPlaceholder.id = "alertPlaceholder";
      const main = document.querySelector("main");
      if (main) main.insertBefore(alertPlaceholder, main.firstChild);
      else document.body.prepend(alertPlaceholder);
    }
    alertPlaceholder.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show mt-3 mb-0" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
      </div>
    `;
  }

  // Muestra el botón de "Agregar" solo si el usuario es entrenador
  function mostrarBotonAgregarSoloEntrenador() {
    try {
      const usuarioActual = JSON.parse(
        sessionStorage.getItem("usuario") || localStorage.getItem("usuario")
      );
      const btnAgregar = document.getElementById("btnAgregarEjercicio");
      if (!btnAgregar) return;

      if (
        usuarioActual &&
        usuarioActual.Rol &&
        usuarioActual.Rol.toLowerCase() === "entrenador"
      ) {
        btnAgregar.style.display = "";
      } else {
        btnAgregar.remove();
      }
    } catch (e) {
      const btnAgregar = document.getElementById("btnAgregarEjercicio");
      if (btnAgregar) btnAgregar.remove();
    }
  }

  // Oculta la columna de "Acciones" si el usuario es administrador
  function ocultarThAccionesSiAdmin() {
    try {
      const usuarioActual = JSON.parse(
        sessionStorage.getItem("usuario") || localStorage.getItem("usuario")
      );
      if (
        usuarioActual &&
        usuarioActual.Rol &&
        usuarioActual.Rol.toLowerCase() === "admin"
      ) {
        const thAcciones = document.getElementById("thAcciones");
        if (thAcciones) thAcciones.style.display = "none";
      }
    } catch (e) {}
  }

  // ---- BORRAR EJERCICIO ----
  async function borrarEjercicio(id) {
    try {
      if (!id || isNaN(id)) {
        mostrarMensaje("ID de ejercicio inválido.", "danger");
        return;
      }
      // El confirm ya está en el botón, aquí no hace falta repetirlo

      // CORREGIDO: doble "i" en 'eliminarEjericicio'
      console.log(`${URL_API}/eliminarEjericicio/${id}`); // Depuración opcional
      const resp = await fetch(`${URL_API}/eliminarEjericicio/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        let mensaje = `No se pudo borrar el ejercicio (status: ${resp.status})`;
        try {
          const data = await resp.json();
          if (data && data.mensaje) mensaje = data.mensaje;
        } catch (_) {}
        throw new Error(mensaje);
      }
      mostrarMensaje("Ejercicio eliminado correctamente.", "success");
      cargarEjerciciosAdmin();
    } catch (err) {
      mostrarMensaje("Error al borrar ejercicio: " + err.message, "danger");
    }
  }

  // ---- EDITAR EJERCICIO ----
  // Puedes llamar a esta función desde un formulario de edición
  async function editarEjercicio(datos) {
    const id = datos.IdEjercicio;
    if (!id || isNaN(id)) {
      mostrarMensaje("ID de ejercicio inválido.", "danger");
      return;
    }

    try {
      // Llama al endpoint de edición con método PUT
      const resp = await fetch(`${URL_API}/editarEjercicio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (!resp.ok) {
        let mensaje = `Error al editar ejercicio (status: ${resp.status})`;
        try {
          const respuesta = await resp.json();
          if (respuesta && respuesta.mensaje) mensaje = respuesta.mensaje;
        } catch {}
        throw new Error(mensaje);
      }

      mostrarMensaje("Ejercicio editado correctamente.", "success");
      // Opcional: Redirige después de editar
      setTimeout(() => {
        window.location.href = "../../View/Administrador/ListaEjercicios.html";
      }, 1200);
    } catch (err) {
      mostrarMensaje("Error al editar ejercicio: " + err.message, "danger");
    }
  }

  // --- CARGA DATOS EN FORMULARIO DE EDICIÓN ---
  (async function () {
    function normalize(str) {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id && document.getElementById("formAgregarEjercicio")) {
      try {
        const response = await fetch(`${URL_API}/obtenerEjercicioPorId/${id}`);
        if (!response.ok) throw new Error("No se pudo cargar el ejercicio");
        const ejercicio = await response.json();

        document.getElementById("idEjercicio").value =
          ejercicio.IdEjercicio ?? "";
        document.getElementById("add-nombre").value = ejercicio.Nombre ?? "";
        document.getElementById("add-repeticiones").value =
          ejercicio.Repeticiones ?? "";
        document.getElementById("add-descripcion").value =
          ejercicio.Descripcion ?? "";
        document.getElementById("add-guiaEjercicio").value =
          ejercicio.GuiaEjercicio ?? "";
        document.getElementById("add-areaMuscular").value =
          ejercicio.AreaMuscular ?? "";
        document.getElementById("add-dificultad").value =
          ejercicio.Dificultad ?? "";

        // --- Selección de checkboxes a partir de AreaMuscularAfectada (NORMALIZADO) ---
        let areaAfectada = ejercicio.AreaMuscularAfectada;
        if (typeof areaAfectada === "string" && areaAfectada.trim() !== "") {
          let areas = areaAfectada.split(",").map((x) => normalize(x));
          document
            .querySelectorAll("input[name='impedimentos[]']")
            .forEach((input) => {
              input.checked = areas.some(
                (area) => normalize(input.value) === area
              );
            });
        }
      } catch (err) {
        let msg = "Error al cargar ejercicio: " + err.message;
        let alertPlaceholder = document.getElementById("alertPlaceholder");
        if (alertPlaceholder) {
          alertPlaceholder.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show mt-3 mb-0" role="alert">
              ${msg}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
            </div>
          `;
        } else {
          alert(msg);
        }
      }
    }
  })();

  // --- GUARDAR/EDITAR EJERCICIO (PUT) DESDE EL FORMULARIO ---
  const form = document.getElementById("formAgregarEjercicio");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const id = document.getElementById("idEjercicio").value;
      const nombre = document.getElementById("add-nombre").value;
      const repeticiones = document.getElementById("add-repeticiones").value;
      const descripcion = document.getElementById("add-descripcion").value;
      const guiaEjercicio = document.getElementById("add-guiaEjercicio").value;
      const areaMuscular = document.getElementById("add-areaMuscular").value;
      const dificultad = document.getElementById("add-dificultad").value;
      const impedimentos = Array.from(
        document.querySelectorAll("input[name='impedimentos[]']:checked")
      ).map((input) => input.value);

      // Construye el objeto con los datos que espera la API
      const datos = {
        IdEjercicio: id,
        Nombre: nombre,
        Repeticiones: repeticiones,
        Descripcion: descripcion,
        GuiaEjercicio: guiaEjercicio,
        AreaMuscular: areaMuscular,
        Dificultad: dificultad,
        AreaMuscularAfectada: impedimentos.join(", "), // <-- agrega esto si tu API lo usa
      };

      // Llama a la función para editar el ejercicio
      await editarEjercicio(datos);
    });
  }
});
