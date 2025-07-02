//ControaladorEntrenador.js
//const API_BASE = "http://mi-api-powergym-2025.somee.com/api";
const API_BASE = "https://proyecto-inegev2-1.onrender.com/api";
document.addEventListener("DOMContentLoaded", () => {
  const idEntrenador = sessionStorage.getItem("idEntrenador");
  const nombreEntrenador = sessionStorage.getItem("nombreEntrenador");

  // Mostrar nombre del entrenador si está disponible
  if (nombreEntrenador) {
    document.title = `Vista Entrenador - ${nombreEntrenador}`;
  }

  if (idEntrenador) {
    cargarClientes(idEntrenador);
  } else {
    alert("⚠️ No se encontró el ID del entrenador en la sesión.");
    window.location.href = "../../View/Login/Login.html";
  }
});

function cargarClientes(idEntrenador) {
  const tbody = document.getElementById("tablaClientes");
  if (!tbody) {
    console.error(
      "❌ No se encontró el elemento con id 'tablaClientes' en el DOM."
    );
    return;
  }
  tbody.innerHTML =
    "<tr><td colspan='4' class='text-center'>Cargando clientes...</td></tr>";

  fetch(`${API_BASE}/Cliente/listaClientes`)
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then((todosLosClientes) => {
      const clientesDelEntrenador = todosLosClientes.filter(
        (cliente) => cliente.EntrenadorId == idEntrenador
      );

      tbody.innerHTML = "";

      if (clientesDelEntrenador.length === 0) {
        tbody.innerHTML =
          "<tr><td colspan='4' class='text-center text-muted'>No tienes clientes asignados.</td></tr>";
        return;
      }

      clientesDelEntrenador.forEach((cliente) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td class="text-center align-middle">
            <div>
              <strong>${cliente.Nombre}</strong><br>
              <small class="text-muted">${cliente.Email}</small>
            </div>
          </td>
          <td class="text-center align-middle" style="width: 150px;">
            <button class="btn btn-primary btn-sm" onclick="verRutina(${cliente.IdUsuario})" title="Ver rutina actual">
              <i class="fas fa-dumbbell me-1"></i>Ver Rutina
            </button>
          </td>
          <td class="text-center align-middle" style="width: 150px;">
            <button class="btn btn-success btn-sm" onclick="nuevaRutina(${cliente.IdUsuario})" title="Crear nueva rutina">
              <i class="fas fa-plus me-1"></i>Nueva Rutina
            </button>
          </td>
          <td class="text-center align-middle" style="width: 150px;">
            <button class="btn btn-info btn-sm" onclick="verPerfil(${cliente.IdUsuario})" title="Ver perfil de salud">
              <i class="fas fa-heart-pulse me-1"></i>Perfil
            </button>
          </td>
        `;
        tbody.appendChild(fila);
      });

      console.log(
        `✅ Cargados ${clientesDelEntrenador.length} clientes para el entrenador ${idEntrenador}`
      );
    })
    .catch((err) => {
      console.error("❌ Error al cargar clientes:", err);
      tbody.innerHTML =
        "<tr><td colspan='4' class='text-center text-danger'>Error al cargar clientes. Intenta recargar la página.</td></tr>";
      if (typeof mostrarMensaje === "function") {
        mostrarMensaje("Error al cargar la lista de clientes.", "danger");
      }
    });
}

// ✅ Función corregida para ver rutina con el endpoint correcto
window.verRutina = function (idCliente) {
  const modalContent = document.getElementById("contenidoRutinaDinamico");
  modalContent.innerHTML =
    "<div class='text-center'><i class='fas fa-spinner fa-spin'></i> Cargando rutina...</div>";

  const modal = new bootstrap.Modal(document.getElementById("modalRutina"));
  modal.show();

  // ✅ ENDPOINT CORRECTO: obtenerRutinasPorCliente
  fetch(`${API_BASE}/Rutina/obtenerRutinasPorCliente/${idCliente}`)
    .then((res) => {
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("No se encontró rutina activa para este cliente.");
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then((rutinas) => {
      if (!rutinas || rutinas.length === 0) {
        modalContent.innerHTML = `
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Este cliente no tiene rutinas asignadas.
          </div>
        `;
        return;
      }

      // Tomar la rutina más reciente (ordenar por fecha de inicio)
      const rutinasOrdenadas = rutinas.sort(
        (a, b) => new Date(b.FechaInicio) - new Date(a.FechaInicio)
      );
      const rutina = rutinasOrdenadas[0];

      let html = `
        <div class="mb-3">
          <h6><i class="fas fa-calendar me-2"></i>Información de la Rutina</h6>
          <div class="row">
            <div class="col-md-6">
              <strong>ID Rutina:</strong> #${rutina.IdRutina}
            </div>
            <div class="col-md-6">
              <strong>Total de Rutinas:</strong> ${rutinas.length}
            </div>
            <div class="col-md-6">
              <strong>Fecha de Inicio:</strong> ${formatearFecha(
                rutina.FechaInicio
              )}
            </div>
            <div class="col-md-6">
              <strong>Fecha de Fin:</strong> ${formatearFecha(rutina.FechaFin)}
            </div>
          </div>
        </div>
        <hr>
        <h6><i class="fas fa-dumbbell me-2"></i>Ejercicios de la Rutina</h6>
      `;

      // ✅ Cargar ejercicios de la rutina usando el endpoint correcto
      fetch(`${API_BASE}/EjercicioRutina/listaEjercicioRutina`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error ${res.status} al cargar ejercicios`);
          }
          return res.json();
        })
        .then((todosLosEjercicios) => {
          console.log("Todos los ejercicios de rutina:", todosLosEjercicios);

          // Filtrar ejercicios por ID de rutina
          const ejerciciosDeLaRutina = todosLosEjercicios.filter(
            (ej) => ej.IdRutina == rutina.IdRutina
          );

          console.log(
            `Ejercicios filtrados para rutina ${rutina.IdRutina}:`,
            ejerciciosDeLaRutina
          );

          if (!ejerciciosDeLaRutina || ejerciciosDeLaRutina.length === 0) {
            html += `
              <div class="alert alert-warning">
                <i class="fas fa-info-circle me-2"></i>
                Esta rutina no tiene ejercicios asignados.
              </div>
            `;
          } else {
            html += "<div class='table-responsive'>";
            html += `
              <table class="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Ejercicio</th>
                    <th>Descripción</th>
                    <th>Área Muscular</th>
                    <th>Repeticiones</th>
                    <th>Dificultad</th>
                    <th>Comentario</th>
                  </tr>
                </thead>
                <tbody>
            `;

            ejerciciosDeLaRutina.forEach((ej) => {
              html += `
                <tr>
                  <td><strong>${
                    ej.NombreEjercicio || ej.Nombre || "Sin nombre"
                  }</strong></td>
                  <td><small>${
                    ej.DescripcionEjercicio || ej.Descripcion || "-"
                  }</small></td>
                  <td><span class="badge bg-secondary">${
                    ej.AreaMuscular || ej.AreaMuscularAfectada || "-"
                  }</span></td>
                  <td class="text-center"><strong>${
                    ej.Repeticiones || "-"
                  }</strong></td>
                  <td><span class="badge bg-info">${
                    ej.Dificultad || "-"
                  }</span></td>
                  <td><small>${ej.Comentario || "-"}</small></td>
                </tr>
              `;
            });

            html += "</tbody></table></div>";

            // Mostrar total de ejercicios
            html += `<div class="mt-2"><small class="text-muted">Total de ejercicios: ${ejerciciosDeLaRutina.length}</small></div>`;
          }

          modalContent.innerHTML = html;
        })
        .catch((err) => {
          console.error("Error al cargar ejercicios:", err);
          html += `
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-circle me-2"></i>
              No se pudieron cargar los ejercicios de esta rutina.
              <br><small>Error: ${err.message}</small>
            </div>
          `;
          modalContent.innerHTML = html;
        });
    })
    .catch((err) => {
      console.error("❌ Error al cargar rutina:", err);
      modalContent.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          ${err.message}
        </div>
      `;
    });
};

// ✅ Nueva función para crear rutina
window.nuevaRutina = function (idCliente) {
  // Guardar el ID del cliente en sessionStorage para usarlo en la página de rutinas
  sessionStorage.setItem("clienteParaRutina", idCliente);

  // Redirigir a la página de generar rutina
  window.location.href = "../../View/Entrenador/GenerarRutina.html";
};

// ✅ Nueva función para ver perfil del cliente
window.verPerfil = function (idCliente) {
  fetch(`${API_BASE}/Cliente/obtenerClientePorId/${idCliente}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then((cliente) => {
      // Cargar también los padecimientos
      fetch(
        `${API_BASE}/AsignarPadecimientos/obtenerPadecimientos/${idCliente}`
      )
        .then((res) => {
          if (!res.ok)
            throw new Error(`Error ${res.status} al cargar padecimientos`);
          return res.json();
        })
        .then((padecimientos) => {
          mostrarPerfilCliente(cliente, padecimientos);
        })
        .catch((err) => {
          console.error("Error al cargar padecimientos:", err);
          mostrarPerfilCliente(cliente, []);
        });
    })
    .catch((err) => {
      console.error("❌ Error al cargar perfil:", err);
      mostrarMensaje("Error al cargar el perfil del cliente.", "danger");
    });
};

function mostrarPerfilCliente(cliente, padecimientos) {
  const modalContent = document.getElementById("contenidoRutinaDinamico");

  let padecimientosHtml = "";
  if (padecimientos.length > 0) {
    padecimientosHtml = padecimientos
      .map(
        (p) =>
          `<span class="badge bg-warning text-dark me-1">${
            p.Nombre || "Padecimiento ID: " + p.IdPadecimiento
          } (${p.Severidad})</span>`
      )
      .join("");
  } else {
    padecimientosHtml =
      "<span class='text-muted'>Sin padecimientos registrados</span>";
  }

  // Calcular edad
  const edad = calcularEdad(cliente.FechaNacimiento);

  modalContent.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h6><i class="fas fa-user me-2"></i>Información Personal</h6>
        <table class="table table-sm">
          <tr><td><strong>Nombre:</strong></td><td>${cliente.Nombre}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${cliente.Email}</td></tr>
          <tr><td><strong>Teléfono:</strong></td><td>${
            cliente.Telefono
          }</td></tr>
          <tr><td><strong>Fecha de Nacimiento:</strong></td><td>${formatearFecha(
            cliente.FechaNacimiento
          )}</td></tr>
          <tr><td><strong>Edad:</strong></td><td>${edad} años</td></tr>
          <tr><td><strong>Género:</strong></td><td>${cliente.Genero}</td></tr>
        </table>
      </div>
      <div class="col-md-6">
        <h6><i class="fas fa-chart-line me-2"></i>Datos Físicos</h6>
        <table class="table table-sm">
          <tr><td><strong>Altura:</strong></td><td>${
            cliente.Altura
          } cm</td></tr>
          <tr><td><strong>Peso:</strong></td><td>${cliente.Peso} kg</td></tr>
          <tr><td><strong>IMC:</strong></td><td>${calcularIMC(
            cliente.Peso,
            cliente.Altura
          )}</td></tr>
          <tr><td><strong>Estado de Pago:</strong></td><td>
            <span class="badge ${
              cliente.EstadoPago ? "bg-success" : "bg-danger"
            }">
              ${cliente.EstadoPago ? "Al día" : "Pendiente"}
            </span>
          </td></tr>
          <tr><td><strong>Entrenador:</strong></td><td>${
            cliente.NombreEntrenador || "Sin asignar"
          }</td></tr>
        </table>
      </div>
    </div>
    <hr>
    <h6><i class="fas fa-heart-pulse me-2"></i>Padecimientos y Limitaciones</h6>
    <div class="mb-3">
      ${padecimientosHtml}
    </div>
  `;

  // Cambiar el título del modal
  document.getElementById(
    "modalRutinaLabel"
  ).textContent = `Perfil de ${cliente.Nombre}`;

  const modal = new bootstrap.Modal(document.getElementById("modalRutina"));
  modal.show();

  // Restaurar el título cuando se cierre el modal
  document.getElementById("modalRutina").addEventListener(
    "hidden.bs.modal",
    function () {
      document.getElementById("modalRutinaLabel").textContent =
        "Rutina del Cliente";
    },
    { once: true }
  );
}

// ✅ Función para calcular edad
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "No especificada";

  try {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  } catch (error) {
    return "No calculable";
  }
}

// ✅ Función para calcular IMC
function calcularIMC(peso, altura) {
  if (!peso || !altura || altura === 0) return "No calculable";

  try {
    const alturaMetros = altura / 100; // convertir cm a metros
    const imc = peso / (alturaMetros * alturaMetros);

    let categoria = "";
    if (imc < 18.5) categoria = "Bajo peso";
    else if (imc < 25) categoria = "Normal";
    else if (imc < 30) categoria = "Sobrepeso";
    else categoria = "Obesidad";

    return `${imc.toFixed(1)} (${categoria})`;
  } catch (error) {
    return "No calculable";
  }
}

// ✅ Función para formatear fechas
function formatearFecha(fechaString) {
  if (!fechaString) return "No especificada";

  try {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return fechaString; // Devolver la fecha original si hay error
  }
}

// ✅ Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo = "info") {
  // Crear o encontrar el contenedor de alertas
  let alertContainer = document.getElementById("alertContainer");
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.id = "alertContainer";
    alertContainer.className = "position-fixed top-0 end-0 p-3";
    alertContainer.style.zIndex = "9999";
    document.body.appendChild(alertContainer);
  }

  // Crear la alerta
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  alertContainer.appendChild(alertDiv);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// ✅ Función de búsqueda corregida
function buscarCliente() {
  const searchInput =
    document.querySelector("#buscarCliente") ||
    document.querySelector('input[placeholder*="Buscar cliente"]');

  if (!searchInput) {
    console.warn("Campo de búsqueda no encontrado");
    return;
  }

  const searchTerm = searchInput.value.toLowerCase().trim();

  const filas = document.querySelectorAll("#tablaClientes tr");

  filas.forEach((fila) => {
    const nombre =
      fila.querySelector("td:first-child")?.textContent.toLowerCase() || "";

    if (nombre.includes(searchTerm) || searchTerm === "") {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
}

// ✅ Eventos de búsqueda corregidos
document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.querySelector(".btn-custom");
  const searchInput =
    document.querySelector("#buscarCliente") ||
    document.querySelector('input[placeholder*="Buscar cliente"]');

  if (searchButton) {
    searchButton.addEventListener("click", buscarCliente);
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        buscarCliente();
      }
    });

    // Búsqueda en tiempo real
    searchInput.addEventListener("input", buscarCliente);
  }
});
