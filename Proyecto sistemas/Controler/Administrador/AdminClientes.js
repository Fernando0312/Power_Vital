import { ClienteModel } from "../../Model/ClienteModel.js";

// Definimos la base de la URL para las peticiones a la API
//const API_BASE = "http://mi-api-powergym-2025.somee.com/api";
//const API_BASE = "http://localhost:7086/api";

const API_BASE = "https://proyecto-inegev2-1.onrender.com/api";

// Variable global para lista de padecimientos
window.listaPadecimientos = [];

/**
 * Carga la lista de entrenadores desde la API y los agrega al combobox.
 * @param {Function|null} callback - Función opcional a ejecutar después de cargar los entrenadores.
 */
export function cargarEntrenadores(callback = null) {
  const $select = $("#entrenador");

  $.get(`${API_BASE}/Entrenador/listaEntrenador`, function (data) {
    $select
      .empty()
      .append(`<option value="">Seleccione un entrenador</option>`);
    const idsAgregados = new Set();

    data.forEach((ent) => {
      if (!idsAgregados.has(ent.idIdUsuario)) {
        $select.append(
          `<option value="${ent.idIdUsuario}">${ent.Nombre}</option>`
        );
        idsAgregados.add(ent.idIdUsuario);
      }
    });

    if (callback) callback();
  }).fail(function () {
    alert("Error al cargar entrenadores.");
  });
}

/**
 * Carga y muestra los padecimientos disponibles en forma de checkboxes + select de severidad.
 * @param {Array} padecimientosSeleccionados - IDs de padecimientos que deben aparecer seleccionados.
 * @param {Object} severidadesSeleccionadas - Diccionario idPadecimiento: severidad (opcional para edición)
 */
export function cargarPadecimientos(
  padecimientosSeleccionados = [],
  severidadesSeleccionadas = {}
) {
  $.get(`${API_BASE}/Padecimiento/listaPadecimientos`, function (data) {
    window.listaPadecimientos = data; // Guarda la lista globalmente para usar en historial

    const $container = $("#padecimientosList");
    $container.empty();

    data.forEach((p) => {
      const idPadecimiento = p.IdPadecimiento;
      const checked = padecimientosSeleccionados.includes(idPadecimiento);
      const severidad = severidadesSeleccionadas[idPadecimiento] || "";

      const checkboxHtml = `
        <div class="d-flex align-items-center mb-2 gap-2">
          <input 
            class="form-check-input padecimiento-item" 
            type="checkbox" 
            value="${idPadecimiento}" 
            id="pad-${idPadecimiento}" 
            ${checked ? "checked" : ""}>
          
          <label class="form-check-label me-2" for="pad-${idPadecimiento}">
            ${p.Nombre}
          </label>
          
          <select 
            class="form-select form-select-sm severidad-padecimiento" 
            data-padecimiento="${idPadecimiento}" 
            style="width: auto; ${checked ? "" : "display: none;"}">
            <option value="">Severidad</option>
            <option value="Leve" ${
              severidad === "Leve" ? "selected" : ""
            }>Leve</option>
            <option value="Moderado" ${
              severidad === "Moderado" ? "selected" : ""
            }>Moderado</option>
            <option value="Grave" ${
              severidad === "Grave" ? "selected" : ""
            }>Grave</option>
          </select>
        </div>
      `;

      $container.append(checkboxHtml);
    });

    // Event listener para mostrar/ocultar el select cuando se (des)marca el checkbox
    $container.find('input[type="checkbox"]').on("change", function () {
      const $select = $(this)
        .closest("div")
        .find("select.severidad-padecimiento");

      if (this.checked) {
        $select.show();
      } else {
        $select.hide().val(""); // Limpiar valor si se desmarca
      }
    });
  }).fail(function () {
    alert("Error al cargar padecimientos.");
  });
}

/**
 * Registra un historial de padecimiento para cada padecimiento seleccionado del cliente.
 * Llama al endpoint '/PadecimientoHistorial/crearHistorialPadecimiento' por cada padecimiento.
 * @param {number} idCliente - ID del cliente.
 * @param {decimal} peso - Peso del cliente al momento de registro.
 * @param {Array} listaPadecimientos - Lista de objetos {IdPadecimiento, Severidad}.
 */
function registrarHistorialPadecimientosParaCliente(
  idCliente,
  peso,
  listaPadecimientos
) {
  if (!listaPadecimientos || listaPadecimientos.length === 0) return;

  listaPadecimientos.forEach((p) => {
    const nombrePadecimiento =
      window.listaPadecimientos.find(
        (x) => x.IdPadecimiento === p.IdPadecimiento
      )?.Nombre || "";

    $.ajax({
      url: `${API_BASE}/PadecimientoHistorial/crearHistorialPadecimiento`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        IdCliente: idCliente,
        IdPadecimiento: p.IdPadecimiento,
        NombrePadecimiento: nombrePadecimiento,
        Peso: peso,
        Severidad: p.Severidad,
      }),
      success: function () {
        // Opcional: mostrar "Historial registrado" o sumar a una lista de éxitos
      },
      error: function (xhr) {
        alert(
          "Error al registrar historial de padecimiento: " + xhr.responseText
        );
      },
    });
  });
}

export function validarEdadMinima() {
  const fechaNacimiento = document.getElementById("fechaNacimiento").value;
  if (!fechaNacimiento) return false;

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  const dia = hoy.getDate() - nacimiento.getDate();

  const tiene16Años =
    edad > 16 || (edad === 16 && (mes > 0 || (mes === 0 && dia >= 0)));

  return tiene16Años;
}

/**
 * Registra un nuevo cliente. Si tiene padecimientos los asigna y guarda historial de padecimientos.
 */
export function registrarCliente() {
  let cliente;
  try {
    cliente = obtenerClienteDesdeFormulario("Crear");
  } catch (err) {
    // Ya se alertó el error
    return;
  }

  // Validación de email en backend
  $.ajax({
    url: `${API_BASE}/Cliente/CrearCliente`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(cliente),

    beforeSend: () => {
      console.log("⏳ Enviando cliente:", cliente);
    },
    success: (res) => {
      console.log("✅ Respuesta recibida:", res);
      const clienteId = res.IdUsuario;

      if (!clienteId || clienteId === 0) {
        alert("❌ No se obtuvo un ID válido del cliente.");
        return;
      }

      const peso = cliente.Peso || 0;
      const imc =
        cliente.Altura && cliente.Altura > 0
          ? (peso / (cliente.Altura * cliente.Altura)).toFixed(2)
          : 0;
      const padecimientos = cliente.PadecimientosCompletos || [];

      // Registrar historial de salud
      registrarHistorialSaludCompleto(
        clienteId,
        peso,
        imc,
        new Date().toISOString(),
        () => {
          // Solo después del historial, asigna los padecimientos y registra historial de padecimientos
          if (padecimientos.length > 0) {
            asignarPadecimientos(clienteId, padecimientos);
            registrarHistorialPadecimientosParaCliente(
              clienteId,
              peso,
              padecimientos
            );
          } else {
            alert("✅ Cliente registrado sin padecimientos");
            location.href = "ListaClientes.html";
          }
        }
      );
    },
    error: (xhr) => {
      console.error("❌ Error en el servidor:", xhr);
      if (xhr.status === 409) {
        alert(
          "❌ " + (xhr.responseJSON?.mensaje || "El correo ya está registrado.")
        );
      } else {
        alert("❌ Error al registrar cliente: " + xhr.responseText);
      }
    },
  });
}

/**
 * Carga la información de un cliente desde localStorage y la muestra en el formulario de edición.
 */
export function cargarClienteEditar() {
  // Recupera el cliente guardado en localStorage
  const cliente = JSON.parse(localStorage.getItem("clienteEditar"));
  if (!cliente) return;

  console.log("✅ Cliente a editar:", cliente);

  // 🚀 Cargar entrenadores (con callback para seleccionar el correcto)
  cargarEntrenadores(() => {
    // Por compatibilidad con posibles nombres distintos en el DTO
    const idEntrenador =
      cliente.EntrenadorId ||
      cliente.Entrenador?.IdUsuario ||
      cliente.Entrenador?.idIdUsuario ||
      0;
    $("#entrenador").val(idEntrenador);
  });

  // 🚀 Rellenar campos básicos
  $("#nombre").val(cliente.Nombre);
  $("#clave").val(cliente.Clave);
  $("#correo").val(cliente.Email);
  $("#telefono").val(cliente.Telefono);
  $("#fechaNacimiento").val(cliente.FechaNacimiento.split("T")[0]);
  $("#genero").val(cliente.Genero);
  $("#altura").val(cliente.Altura);
  $("#peso").val(cliente.Peso);

  // 🚀 Padecimientos
  if (cliente.PadecimientosClientes?.length > 0) {
    $("#padecimiento").prop("checked", true);
    $("#contenedorPadecimientos").show();

    const ids = cliente.PadecimientosClientes.map((p) => {
      return (
        p.PadecimientoId || p.IdPadecimiento || p.Padecimiento?.IdPadecimiento
      );
    });

    const severidades = {};
    cliente.PadecimientosClientes.forEach((p) => {
      const id =
        p.PadecimientoId || p.IdPadecimiento || p.Padecimiento?.IdPadecimiento;
      severidades[id] = p.Severidad || "";
    });

    console.log("✅ Padecimientos seleccionados:", ids);
    console.log("✅ Severidades:", severidades);

    // 🚀 Cargar padecimientos con seleccionados
    cargarPadecimientos(ids, severidades);
  } else {
    // No tiene padecimientos
    $("#padecimiento").prop("checked", false);
    $("#contenedorPadecimientos").hide();
  }

  // 🚀 Evento de submit del formulario
  $("#formularioEditar")
    .off("submit")
    .submit(function (e) {
      e.preventDefault();

      const esMayor = validarEdadMinima();

      if (!esMayor) {
        $("#alertaEdadEditar")
          .removeClass("d-none")
          .text("❌ El cliente debe tener al menos 16 años para continuar.");

        // Scroll animado hacia el mensaje de error
        $("html, body").animate(
          {
            scrollTop: $("#alertaEdadEditar").offset().top - 100,
          },
          600
        );

        setTimeout(() => {
          $("#alertaEdadEditar").addClass("d-none");
        }, 5000);

        return;
      } else {
        $("#alertaEdadEditar").addClass("d-none");
      }

      actualizarCliente(cliente.IdUsuario);
    });
}

/**
 * Actualiza la información de un cliente existente y sus padecimientos.
 * También guarda historial de padecimientos por cada padecimiento asignado.
 * @param {number} id - ID del cliente a actualizar.
 */
export function actualizarCliente(id) {
  const cliente = obtenerClienteDesdeFormulario("Editar");
  cliente.IdUsuario = id;

  console.log("🚀 Cliente a actualizar:", cliente);

  $.ajax({
    url: `${API_BASE}/Cliente/editarCliente`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(cliente),
    success: () => {
      console.log(
        "✅ Cliente actualizado, ahora eliminando padecimientos antiguos..."
      );

      // 🚀 Primero elimina los padecimientos anteriores
      $.ajax({
        url: `${API_BASE}/AsignarPadecimientos/eliminarPadecimiento/${id}`,
        type: "DELETE",
        complete: () => {
          console.log(
            "✅ Padecimientos antiguos eliminados, asignando nuevos..."
          );

          if (
            cliente.PadecimientosCompletos &&
            cliente.PadecimientosCompletos.length > 0
          ) {
            // 🚀 Asignar los nuevos padecimientos
            asignarPadecimientos(id, cliente.PadecimientosCompletos);

            // 🚀 Registrar historial de padecimientos
            registrarHistorialPadecimientosParaCliente(
              id,
              cliente.Peso,
              cliente.PadecimientosCompletos
            );
          } else {
            console.log(
              "⚠️ Cliente actualizado SIN padecimientos, registrando historial vacío..."
            );

            // Registrar historial "sin padecimientos"
            $.ajax({
              url: `${API_BASE}/PadecimientoHistorial/crearHistorialPadecimiento`,
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify({
                IdCliente: id,
                IdPadecimiento: null,
                NombrePadecimiento: "Sin padecimientos",
                Peso: cliente.Peso || 0,
                Severidad: "",
              }),
              complete: function () {
                alert("✅ Cliente actualizado sin padecimientos");
                location.href = "ListaClientes.html";
              },
              error: function (xhr) {
                alert(
                  "❌ Error al registrar historial de padecimiento: " +
                    xhr.responseText
                );
              },
            });
          }
        },
        error: (xhr) => {
          alert(
            "❌ Error al eliminar padecimientos previos: " + xhr.responseText
          );
        },
      });
    },
    error: (xhr) => {
      if (xhr.status === 409) {
        alert(
          "❌ " + (xhr.responseJSON?.mensaje || "El correo ya está registrado.")
        );
      } else {
        alert("❌ Error al actualizar cliente: " + xhr.responseText);
      }
    },
  });
}

/**
 * Registra el historial de salud de un cliente.
 * IMPORTANTE: Usa el endpoint correcto '/HistorialSalud/crearHistorialSalud'
 * @param {number} idCliente
 * @param {number} peso
 * @param {number} imc
 * @param {string} fecha - Fecha en formato ISO
 * @param {function} callback - Se llama al finalizar exitosamente la petición
 */
function registrarHistorialSaludCompleto(
  idCliente,
  peso,
  imc,
  fecha = new Date().toISOString(),
  callback
) {
  $.ajax({
    url: `${API_BASE}/HistorialSalud/crearHistorialSalud`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      ClienteId: idCliente,
      Fecha: fecha,
      Peso: peso,
      IndiceMasaCorporal: imc || 0, // coincide con el modelo backend
    }),
    success: (res) => {
      if (callback) callback(res.IdHistorialSalud || res.idHistorialSalud);
    },
    error: (xhr, status, error) => {
      console.error(
        "Error al registrar historial de salud:",
        xhr.responseText || error
      );
      alert(
        "❌ No se pudo guardar el historial de salud. Detalle: " +
          (xhr.responseText || error)
      );
    },
  });
}

/**
 * Asigna los padecimientos seleccionados a un cliente usando el endpoint correcto.
 * @param {number} idCliente
 * @param {Array} padecimientosCompletos - Array de objetos {IdPadecimiento, Severidad}
 */
function asignarPadecimientos(idCliente, padecimientosCompletos) {
  if (!padecimientosCompletos || padecimientosCompletos.length === 0) return;

  const dto = {
    IdCliente: idCliente,
    Padecimientos: padecimientosCompletos.map((p) => ({
      IdPadecimiento: p.IdPadecimiento,
      Severidad: p.Severidad,
    })),
  };

  $.ajax({
    url: `${API_BASE}/AsignarPadecimientos/asignarPadecimientos`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(dto),
    success: function () {
      alert("✅ Cliente y padecimientos asignados correctamente");
      location.href = "ListaClientes.html";
    },
    error: function (xhr) {
      alert("❌ Error al asignar padecimientos: " + xhr.responseText);
    },
  });
}

/**
 * Extrae los valores del formulario y los estructura como un objeto cliente.
 * @param {string} tipo - "Crear" o "Editar"
 * @returns {Object} Cliente estructurado para enviar al backend
 */
function obtenerClienteDesdeFormulario(tipo) {
  const padecimientosCompletos = [];

  function getCampo(id, isNumber = false, isFloat = false) {
    const val = $(`#${id}`).val();
    if (isNumber) {
      const num = isFloat ? parseFloat(val) : parseInt(val, 10);
      return isNaN(num) ? null : num;
    }
    return val ? val.trim() : "";
  }

  const entrenadorId = getCampo("entrenador", true);

  // Padecimientos y severidad
  $("#padecimientosList input:checked").each(function () {
    const idPadecimiento = parseInt(this.value, 10);
    const severidad = $(this)
      .closest("div")
      .find("select.severidad-padecimiento")
      .val();
    if (!isNaN(idPadecimiento) && severidad) {
      padecimientosCompletos.push({
        IdPadecimiento: idPadecimiento,
        Severidad: severidad,
      });
    }
  });

  // Fecha de nacimiento y validación
  let fechaNacStr = getCampo("fechaNacimiento").trim();
  if (!fechaNacStr) {
    alert("Debes ingresar la fecha de nacimiento.");
    throw new Error("Fecha de nacimiento vacía");
  }

  let fechaNacISO = fechaNacStr;
  const fechaNac = new Date(fechaNacISO);
  const hoy = new Date();
  if (isNaN(fechaNac.getTime()) || fechaNac > hoy) {
    alert("❌ La fecha de nacimiento no puede ser en el futuro o inválida.");
    throw new Error("Fecha de nacimiento inválida");
  }

  // Validar campos obligatorios
  const nombre = getCampo("nombre");

  let clave = null;
  if (tipo === "Crear") {
    clave = "mi-clave-secreta";
  }
  const email = getCampo("correo");
  const genero = getCampo("genero");

  // || (tipo === "Crear" && !clave

  if (!nombre || !email || !genero || (tipo === "Crear" && !clave)) {
    alert(
      "Por favor, rellena todos los campos obligatorios (nombre, correo, género)."
    );
    throw new Error("Campos requeridos vacíos");
  }

  const cliente = {
    IdUsuario: tipo === "Crear" ? 0 : getCampo("idUsuario", true) || 0,
    Nombre: nombre,
    Email: email,
    Telefono: getCampo("telefono"),
    FechaNacimiento: fechaNacISO,
    Genero: genero,
    Altura: getCampo("altura", true, true) || 0,
    Peso: getCampo("peso", true, true) || 0,
    EstadoPago: true,
    EntrenadorId: entrenadorId || 0,
    Padecimientos: padecimientosCompletos.map((p) => p.IdPadecimiento),
    PadecimientosCompletos: padecimientosCompletos,
    ...(tipo === "Crear" && { Clave: clave }), // 👈 Solo incluir Clave si se está creando
  };

  return cliente;
}

/**
 * Lista todos los clientes en la tabla HTML.
 */
export function listarClientes() {
  $.get(`${API_BASE}/Cliente/listaClientes`, function (data) {
    const tbody = $("#cliente-tbody");
    tbody.empty();

    data.forEach((c) => {
      const padecimientos =
        c.Padecimientos && c.Padecimientos.length > 0
          ? c.Padecimientos.join(", ")
          : "-";

      // Etiqueta de estado: Activo (verde) o Inactivo (rojo)
      const estadoPagoLabel = c.EstadoPago ? "Activo" : "Inactivo";
      const badgeClass = c.EstadoPago ? "bg-success" : "bg-danger";

      const fila = `
        <tr>
            <td>${c.Nombre}</td>
            <td>${c.Email}</td>
            <td>${c.Telefono}</td>
            <td>${c.Altura}</td>
            <td>${c.Peso}</td>
            <td>${c.NombreEntrenador}</td>
            <td>
              <span class="badge ${badgeClass}">${estadoPagoLabel}</span>
            </td>
            <td>${padecimientos}</td>
            <td>
              <div class="acciones-clientes">
                <button class='btn-tabla-editar' onclick='editarCliente(${c.IdUsuario})'>
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class='btn-tabla-eliminar' onclick='eliminarCliente(${c.IdUsuario})'>
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </td>
        </tr>`;
      tbody.append(fila);
    });
  });
}
/**
 * Función global para editar un cliente.
 * Almacena el cliente en localStorage y redirige a la página de edición.
 */
window.editarCliente = function (idUsuario) {
  $.get(
    `${API_BASE}/Cliente/obtenerClientePorId/${idUsuario}`,
    function (clienteCompleto) {
      localStorage.setItem("clienteEditar", JSON.stringify(clienteCompleto));
      window.location.href = "EditarCliente.html";
    }
  ).fail(function () {
    alert("❌ Error al obtener los datos completos del cliente.");
  });
};

/**
 * Función global para eliminar un cliente.
 * Pide confirmación antes de eliminar y actualiza la lista.
 */
window.eliminarCliente = function (id) {
  if (!confirm("¿Deseas eliminar este cliente?")) return;
  $.ajax({
    url: `${API_BASE}/Cliente/eliminarCliente/${id}`,
    method: "DELETE",
    success: () => {
      alert("Cliente eliminado correctamente");
      listarClientes();
    },
    error: () => alert("Error al eliminar cliente"),
  });
};

/**
 * Lista todos los clientes en la tabla HTML, mostrando solo Nombre, Email, Teléfono, Estado de Pago y botón para cambiar estado de pago.
 * Esta función es independiente de listarClientes y puedes llamarla, por ejemplo, desde Pagos.html.
 */
export function listarClientesPagos() {
  $.get(`${API_BASE}/Cliente/listaClientes`, function (data) {
    const tbody = $("#clientes-tbody");
    tbody.empty();

    data.forEach((c) => {
      // Etiqueta de estado: Activo (verde) o Inactivo (rojo)
      const estadoPagoLabel = c.EstadoPago ? "Activo" : "Inactivo";
      const badgeClass = c.EstadoPago ? "bg-success" : "bg-danger";
      const nuevoEstado = !c.EstadoPago;
      const nuevoEstadoLabel = nuevoEstado ? "Activo" : "Inactivo";
      const nuevoBadgeClass = nuevoEstado ? "bg-success" : "bg-danger";

      const fila = `
        <tr>
          <td>${c.Nombre}</td>
          <td>${c.Email}</td>
          <td>${c.Telefono}</td>
          <td>
            <span class="badge ${badgeClass}">${estadoPagoLabel}</span>
          </td>
          <td>
            <button class="btn btn-sm ${
              nuevoEstado ? "btn-success" : "btn-danger"
            } btn-cambiar-pago"
              data-id="${c.IdUsuario}" data-estado="${nuevoEstado}">
              Cambiar a <span class="badge ${nuevoBadgeClass}">${nuevoEstadoLabel}</span>
            </button>
          </td>
        </tr>
      `;
      tbody.append(fila);
    });
  });
}

/**
 * Cambia el estado de pago de un cliente por su ID, asegurando que se manden sus padecimientos actuales.
 * @param {number} idCliente - ID del cliente a modificar
 * @param {boolean} nuevoEstadoPago - true para Activo, false para Inactivo
 */
export function actualizarEstadoPagoClientePorId(idCliente, nuevoEstadoPago) {
  $.get(
    `${API_BASE}/Cliente/obtenerClientePorId/${idCliente}`,
    function (cliente) {
      // Cambiamos el estado de pago
      cliente.EstadoPago = nuevoEstadoPago;

      // Reconstrucción robusta de padecimientos si no existen en el objeto
      if (
        !Array.isArray(cliente.PadecimientosCompletos) ||
        cliente.PadecimientosCompletos.length === 0
      ) {
        if (
          Array.isArray(cliente.PadecimientosClientes) &&
          cliente.PadecimientosClientes.length > 0
        ) {
          cliente.PadecimientosCompletos = cliente.PadecimientosClientes.map(
            (p) => ({
              IdPadecimiento:
                p.PadecimientoId ||
                p.IdPadecimiento ||
                (p.Padecimiento && p.Padecimiento.IdPadecimiento),
              Severidad: p.Severidad || "",
            })
          );
        } else {
          cliente.PadecimientosCompletos = [];
        }
      }

      if (
        !Array.isArray(cliente.Padecimientos) ||
        cliente.Padecimientos.length === 0
      ) {
        cliente.Padecimientos = cliente.PadecimientosCompletos.map(
          (p) => p.IdPadecimiento
        );
      }

      $.ajax({
        url: `${API_BASE}/Cliente/editarCliente`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(cliente),
        success: function () {
          alert("Estado de pago actualizado correctamente");
          if (typeof listarClientesPagos === "function") {
            listarClientesPagos();
          }
        },
        error: function (xhr) {
          alert("Error al actualizar el estado de pago: " + xhr.responseText);
        },
      });
    }
  ).fail(function () {
    alert("No se encontró el cliente con ese ID.");
  });
}

// Delegación de evento para botón de cambio de estado de pago (solo para la tabla de pagos)
$(document).on("click", ".btn-cambiar-pago", function () {
  const idCliente = $(this).data("id");
  const nuevoEstadoPago = $(this).data("estado");
  actualizarEstadoPagoClientePorId(idCliente, nuevoEstadoPago);
});

//Para buscar
document.addEventListener("DOMContentLoaded", () => {
  const inputFiltro = document.getElementById("filtroCliente");
  if (inputFiltro) {
    inputFiltro.addEventListener("input", () => {
      const texto = inputFiltro.value.toLowerCase();
      const filas = document.querySelectorAll("#clientes-tbody tr");

      filas.forEach((fila) => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(texto) ? "" : "none";
      });
    });
  }
});
