const URL_API = "http://mi-api-powergym-2025.somee.com/api/Ejercicio"; // URL base de la API de ejercicios

document.addEventListener("DOMContentLoaded", function () {
  // --- AGREGAR EJERCICIO ---
  const formAgregar = document.getElementById("formAgregarEjercicio");
  if (formAgregar) {
    formAgregar.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Obtiene los valores
      const nombre = document.getElementById("add-nombre").value.trim();
      const descripcion = document
        .getElementById("add-descripcion")
        .value.trim();
      const areaMuscular = document.getElementById("add-areaMuscular").value;
      const repeticiones = parseInt(
        document.getElementById("add-repeticiones").value,
        10
      );
      const guiaEjercicio = document
        .getElementById("add-guiaEjercicio")
        .value.trim();
      const dificultad = document.getElementById("add-dificultad").value;

      // Obtener los checkboxes marcados
      const areaMuscularAfectada = Array.from(
        document.querySelectorAll(
          "#add-impedimentos input[type='checkbox']:checked"
        )
      )
        .map((cb) => cb.value)
        .join(", ");

      // Validaciones
      if (
        !nombre ||
        !descripcion ||
        !areaMuscular ||
        !guiaEjercicio ||
        !dificultad
      ) {
        mostrarMensaje(
          "Por favor complete todos los campos obligatorios.",
          "danger"
        );
        return;
      }
      if (isNaN(repeticiones) || repeticiones <= 0) {
        mostrarMensaje(
          "Las repeticiones deben ser un número positivo.",
          "danger"
        );
        return;
      }
      if (!/^https?:\/\/.+\..+/.test(guiaEjercicio)) {
        mostrarMensaje(
          "Ingrese una URL válida para la guía del ejercicio.",
          "danger"
        );
        return;
      }

      const ejercicioDTO = {
        nombre,
        descripcion,
        areaMuscular,
        areaMuscularAfectada,
        repeticiones,
        guiaEjercicio,
        dificultad,
      };

      try {
        const response = await fetch(`${URL_API}/crearEjercicio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ejercicioDTO),
        });

        if (response.ok) {
          mostrarMensaje("¡Ejercicio agregado exitosamente!", "success");
          formAgregar.reset();
          await cargarEjercicios();
        } else {
          let errorMsg = "Error al agregar el ejercicio.";
          try {
            const error = await response.json();
            if (error && error.mensaje) errorMsg += "<br>" + error.mensaje;
          } catch (jsonErr) {}
          mostrarMensaje(errorMsg, "danger");
        }
      } catch (err) {
        mostrarMensaje(
          "Error al conectar con la API: " + err.message,
          "danger"
        );
      }
    });
  }

  // --- TABLA DE EJERCICIOS ---
  if (document.getElementById("tablaEjercicios")) {
    cargarEjercicios();

    // Delegación de eventos para Editar y Borrar
    document
      .getElementById("tablaEjercicios")
      .addEventListener("click", async function (e) {
        if (e.target.classList.contains("btn-editar")) {
          const id = e.target.dataset.id;
          await mostrarModalEditar(id);
        }
        if (e.target.classList.contains("btn-borrar")) {
          const id = e.target.dataset.id;
          if (confirm("¿Seguro que deseas borrar este ejercicio?")) {
            await borrarEjercicio(id);
            await cargarEjercicios();
          }
        }
      });
  }

  // --- SUBMIT MODAL para EDITAR ejercicio ---
  const formModal = document.getElementById("formEditarEjercicio");
  if (formModal) {
    formModal.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Obtiene los valores
      const idEditar = document.getElementById("edit-idEjercicio").value;
      const nombre = document.getElementById("edit-nombre").value.trim();
      const descripcion = document
        .getElementById("edit-descripcion")
        .value.trim();
      const areaMuscular = document.getElementById("edit-areaMuscular").value;
      const repeticiones = parseInt(
        document.getElementById("edit-repeticiones").value,
        10
      );
      const guiaEjercicio = document
        .getElementById("edit-guiaEjercicio")
        .value.trim();
      const dificultad = document.getElementById("edit-dificultad").value;

      const areaMuscularAfectada = Array.from(
        document.querySelectorAll(
          "#edit-impedimentos input[type='checkbox']:checked"
        )
      )
        .map((cb) => cb.value)
        .join(", ");

      // Validaciones
      if (
        !nombre ||
        !descripcion ||
        !areaMuscular ||
        !guiaEjercicio ||
        !dificultad
      ) {
        mostrarMensaje(
          "Por favor complete todos los campos obligatorios.",
          "danger"
        );
        return;
      }
      if (isNaN(repeticiones) || repeticiones <= 0) {
        mostrarMensaje(
          "Las repeticiones deben ser un número positivo.",
          "danger"
        );
        return;
      }
      if (!/^https?:\/\/.+\..+/.test(guiaEjercicio)) {
        mostrarMensaje(
          "Ingrese una URL válida para la guía del ejercicio.",
          "danger"
        );
        return;
      }

      const ejercicioDTO = {
        nombre,
        descripcion,
        areaMuscular,
        areaMuscularAfectada,
        repeticiones,
        guiaEjercicio,
        dificultad,
      };

      try {
        const response = await fetch(`${URL_API}/editarEjercicio/${idEditar}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ejercicioDTO),
        });

        if (response.ok) {
          mostrarMensaje("¡Ejercicio editado exitosamente!", "success");
          const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modalEditarEjercicio")
          );
          modal.hide();
          await cargarEjercicios();
        } else {
          let errorMsg = "Error al editar el ejercicio.";
          try {
            const error = await response.json();
            if (error && error.mensaje) errorMsg += "<br>" + error.mensaje;
          } catch (jsonErr) {}
          mostrarMensaje(errorMsg, "danger");
        }
      } catch (err) {
        mostrarMensaje(
          "Error al conectar con la API: " + err.message,
          "danger"
        );
      }
    });
  }

  // --- Cargar la tabla de ejercicios ---
  async function cargarEjercicios() {
    const table = document.getElementById("tablaEjercicios");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "<tr><td colspan='8'>Cargando...</td></tr>";

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

      if (!Array.isArray(lista) || lista.length === 0) {
        tbody.innerHTML =
          "<tr><td colspan='8'>No hay ejercicios registrados.</td></tr>";
        return;
      }

      tbody.innerHTML = "";
      lista.forEach((ej) => {
        tbody.insertAdjacentHTML(
          "beforeend",
          `
  <tr>
    <td>${ej.Nombre}</td>
    <td>${ej.Descripcion}</td>
    <td>${ej.Repeticiones}</td>
    <td><a href="${ej.GuiaEjercicio}" target="_blank">Ver video</a></td>
    <td>${ej.AreaMuscular}</td>
    <td>${ej.AreaMuscularAfectada}</td>
    <td>${ej.Dificultad}</td>
    <td>
      <button class="btn btn-warning btn-sm btn-editar" data-id="${ej.IdEjercicio}">
        <i class="fas fa-pen-to-square"></i>
      </button>
      <button class="btn btn-danger btn-sm btn-borrar" data-id="${ej.IdEjercicio}">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  </tr>
  `
        );
      });
    } catch (err) {
      mostrarMensaje("Error al cargar ejercicios: " + err.message, "danger");
      tbody.innerHTML = "<tr><td colspan='8'>Error al cargar datos.</td></tr>";
    }
  }

  // --- Mostrar modal editar ---
  async function mostrarModalEditar(id) {
    try {
      const resp = await fetch(`${URL_API}/obtenerEjercicioPorId/${id}`);
      if (!resp.ok) throw new Error("No se pudo obtener el ejercicio");
      const ejercicio = await resp.json();

      document.getElementById("edit-idEjercicio").value =
        ejercicio.IdEjercicio ?? "";
      document.getElementById("edit-nombre").value = ejercicio.Nombre ?? "";
      document.getElementById("edit-descripcion").value =
        ejercicio.Descripcion ?? "";
      document.getElementById("edit-areaMuscular").value =
        ejercicio.AreaMuscular ?? "";
      document.getElementById("edit-repeticiones").value =
        ejercicio.Repeticiones ?? "";
      document.getElementById("edit-guiaEjercicio").value =
        ejercicio.GuiaEjercicio ?? "";
      document.getElementById("edit-dificultad").value =
        ejercicio.Dificultad ?? "";

      // Marcar los checkboxes de impedimentos
      const impedimentos = (ejercicio.AreaMuscularAfectada ?? "")
        .split(",")
        .map((i) => i.trim());
      document
        .querySelectorAll("#edit-impedimentos input[type='checkbox']")
        .forEach((cb) => {
          cb.checked = impedimentos.includes(cb.value);
        });

      const modal = new bootstrap.Modal(
        document.getElementById("modalEditarEjercicio")
      );
      modal.show();
    } catch (err) {
      mostrarMensaje(
        "Error al cargar ejercicio para editar: " + err.message,
        "danger"
      );
    }
  }

  // --- Eliminar ejercicio ---
  async function borrarEjercicio(id) {
    try {
      if (!id || isNaN(id)) {
        mostrarMensaje("ID de ejercicio inválido.", "danger");
        return;
      }
      const resp = await fetch(`${URL_API}/eliminarEjercicio/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        let mensaje = "No se pudo borrar el ejercicio";
        try {
          const data = await resp.json();
          if (data && data.mensaje) mensaje = data.mensaje;
        } catch (_) {}
        throw new Error(mensaje);
      }
      mostrarMensaje("Ejercicio eliminado correctamente.", "success");
    } catch (err) {
      mostrarMensaje("Error al borrar ejercicio: " + err.message, "danger");
    }
  }

  // --- Mostrar mensajes ---
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
});
