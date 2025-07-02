// ===============================
// 🔗 APIs
// ===============================
//const API_BASE = "http://mi-api-powergym-2025.somee.com/api";
const API_BASE = "https://proyecto-inegev2-1.onrender.com/api";

const API_CLIENTE = `${API_BASE}/Cliente`;
const API_PADECIMIENTO_CLIENTE = `${API_BASE}/AsignarPadecimientos`;
const API_PADECIMIENTO_GENERAL = `${API_BASE}/Padecimiento`;
const API_EJERCICIOS = `${API_BASE}/Ejercicio`;
const API_RUTINA = `${API_BASE}/Rutina`;
const API_IA_EJERCICIOS = `${API_BASE}/IAEjercicios`;
const API_EJERCICIO_RUTINA = `${API_BASE}/EjercicioRutina`;

// ===============================
// 🔗 APIs
// ===============================
//const API_BASE = "https://localhost:7086";
//const API_CLIENTE = `${API_BASE}/api/Cliente`;
//const API_PADECIMIENTO_CLIENTE = `${API_BASE}/api/AsignarPadecimientos`;
//const API_PADECIMIENTO_GENERAL = `${API_BASE}/api/Padecimiento`;
//const API_IA_EJERCICIOS = `${API_BASE}/api/IAEjercicios`;
//const API_RUTINA = `${API_BASE}/api/Rutina`;
//const API_EJERCICIO_RUTINA = `${API_BASE}/api/EjercicioRutina`;

// ===============================
// 🔄 Variables globales
// ===============================
let clienteSeleccionado = null;
let rutinaSugerida = [];
let rutinaYaGenerada = false;
window.listaPadecimientos = [];

// ===============================
// 🔄 Cargar lista global de padecimientos
// ===============================
$.get(`${API_PADECIMIENTO_GENERAL}/listaPadecimientos`, (data) => {
  window.listaPadecimientos = data;
});

// ===============================
// 🎯 FOCUS → cargar todos los clientes
// ===============================
const idEntrenador = sessionStorage.getItem("idEntrenador");

$("#clienteBuscador").on("focus", function () {
  $.get(`${API_CLIENTE}/listaClientes`, (clientes) => {
    const $lista = $("#listaResultados").empty();
    // Filtra solo los del entrenador actual
    const clientesFiltrados = clientes.filter(
      (c) => c.EntrenadorId == idEntrenador
    );
    clientesFiltrados.forEach((c) => {
      $lista.append(
        `<li data-id="${c.IdUsuario}">${c.Nombre} – ${c.Email}</li>`
      );
    });
    $lista.find("li").on("click", function () {
      seleccionarCliente($(this));
    });
  });
});

// 🔍 INPUT → filtrar clientes
$("#clienteBuscador").on("input", function () {
  const texto = $(this).val().toLowerCase();
  if (texto.length < 2) {
    $("#listaResultados").empty();
    return;
  }
  $.get(`${API_CLIENTE}/listaClientes`, (clientes) => {
    const filtrados = clientes.filter(
      (c) =>
        c.Nombre.toLowerCase().includes(texto) ||
        c.Email.toLowerCase().includes(texto)
    );
    const $lista = $("#listaResultados").empty();
    filtrados.forEach((c) => {
      $lista.append(
        `<li data-id="${c.IdUsuario}">${c.Nombre} – ${c.Email}</li>`
      );
    });
    $lista.find("li").on("click", function () {
      seleccionarCliente($(this));
    });
  });
});

// 🚀 BLUR → al salir del campo, ocultar lista
$("#clienteBuscador").on("blur", function () {
  setTimeout(() => {
    $("#listaResultados").empty();
  }, 200);
});

// ===============================
// ✅ Seleccionar cliente
// ===============================
function seleccionarCliente($li) {
  const id = $li.data("id");
  const nombre = $li.text();
  resetUI();
  clienteSeleccionado = parseInt(id);
  $("#nombreCliente").text(nombre);
  $("#infoCliente").show();
  $("#botonGenerarRutinaContainer").show();
  cargarInfoCliente(id);
  $("#listaResultados").empty();
  $("#clienteBuscador").val("");
  console.log("✅ Cliente seleccionado:", nombre, "ID:", clienteSeleccionado);
}

// ===============================
// 📋 CARGAR INFO CLIENTE
// ===============================
function cargarInfoCliente(clienteId) {
  $.get(`${API_CLIENTE}/obtenerClientePorId/${clienteId}`, (cliente) => {
    $("#clienteNombre").text(cliente.Nombre);
    $("#clientePeso").text(cliente.Peso + " kg");
    $("#clienteAltura").text(cliente.Altura + " cm");
    $("#clienteEntrenador").text(cliente.NombreEntrenador || "-");
    $.get(
      `${API_PADECIMIENTO_CLIENTE}/obtenerPadecimientos/${clienteId}`,
      (padecimientos) => {
        const lista = padecimientos
          .map((p) => {
            const nombre =
              (
                window.listaPadecimientos.find(
                  (x) => Number(x.IdPadecimiento) === Number(p.IdPadecimiento)
                ) || {}
              ).Nombre || `ID ${p.IdPadecimiento}`;
            return `${nombre} (${p.Severidad})`;
          })
          .join(", ");
        $("#clientePadecimientos").text(lista || "-");
      }
    );
  });
}

// ===============================
// 🚀 BOTÓN GENERAR RUTINA
// ===============================
$("#btnGenerarRutina").on("click", function () {
  if (!clienteSeleccionado) {
    alert("Primero selecciona un cliente.");
    return;
  }
  if (rutinaYaGenerada) {
    if (
      !confirm(
        "⚠️ Ya has generado una rutina para este cliente. ¿Quieres generar una nueva rutina?"
      )
    ) {
      return;
    }
    rutinaSugerida = [];
    rutinaYaGenerada = false;
    $("#rutinaGenerada").hide();
  }
  $("#btnGenerarRutina").prop("disabled", true).text("Generando...");
  generarRutina(clienteSeleccionado);
});

// ===============================
// 📃 GENERAR RUTINA (IA)
// ===============================
function generarRutina(clienteId) {
  console.log("Generando rutina con IA para clienteId:", clienteId);
  const nombreCliente = $("#clienteNombre").text();
  $("#spinnerIA").show();
  $.ajax({
    url: `${API_IA_EJERCICIOS}/recomendar`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      IdCliente: clienteId,
      NombreCliente: nombreCliente,
    }),
    timeout: 30000,
    success(response) {
      let ejercicios = [];
      let respuesta = response.ejerciciosRecomendados;

      // Si es array de objetos (ideal)
      if (
        Array.isArray(respuesta) &&
        typeof respuesta[0] === "object" &&
        respuesta[0] !== null
      ) {
        ejercicios = respuesta.filter(
          (ej) => ej && typeof ej === "object" && (ej.IdEjercicio || ej.Nombre)
        );
      }
      // Si es array de strings
      else if (Array.isArray(respuesta) && typeof respuesta[0] === "string") {
        respuesta.forEach((linea) => {
          procesarLineaEjercicio(linea, ejercicios);
        });
      }
      // Si es string multilinea (lo más común en tu caso)
      else if (typeof respuesta === "string") {
        respuesta.split("\n").forEach((linea) => {
          procesarLineaEjercicio(linea, ejercicios);
        });
      }

      // Solo mostrar el mensaje si NO hay ejercicios reales
      if (!ejercicios.length) {
        alert("⚠️ Ningún ejercicio es apto para este cliente.");
        rutinaSugerida = [];
        rutinaYaGenerada = false;
        $("#spinnerIA").hide();
        return;
      }

      rutinaSugerida = ejercicios;
      rutinaYaGenerada = true;
      $("#rutinaGenerada").show();
      mostrarTablaRutina();
      $("html, body").animate(
        {
          scrollTop: $("#rutinaGenerada").offset().top - 50,
        },
        500
      );
    },
    error(xhr, status) {
      console.error("❌ Error recomendando ejercicios:", status, xhr);
      alert(
        "❌ Ocurrió un error al recomendar ejercicios. Intenta de nuevo más tarde."
      );
    },
    complete() {
      $("#spinnerIA").hide();
      $("#btnGenerarRutina")
        .prop("disabled", false)
        .html('<i class="fas fa-dumbbell"></i> Generar Rutina');
    },
  });
}

// Nueva función auxiliar para procesar cada línea
function procesarLineaEjercicio(linea, ejercicios) {
  if (typeof linea !== "string") return;

  // Elimina guiones y espacios adelante
  linea = linea.trim();
  if (linea.startsWith("-")) linea = linea.slice(1).trim();
  if (!linea) return;

  // Ignora líneas de "Sin ejercicios"
  if (
    linea.toLowerCase().startsWith("sin ejercicios") ||
    linea.toLowerCase().includes("sin ejercicios") ||
    linea.toLowerCase().includes("ningún ejercicio")
  )
    return;

  // ¿Es una línea tipo "ÁREA: ejercicio1, ejercicio2..."?
  const partes = linea.split(":");
  if (partes.length < 2) return;

  const area = partes[0].trim();
  const listaEj = partes[1].trim();
  listaEj.split(",").forEach((nombreEj) => {
    const nombreLimpio = nombreEj.trim();
    if (nombreLimpio) {
      ejercicios.push({
        Nombre: nombreLimpio,
        AreaMuscular: area,
        Descripcion: "",
        Dificultad: "",
        GuiaEjercicio: "",
        AreaAfectada: "",
        IdEjercicio: Date.now() + Math.random(),
      });
    }
  });
}

// ===============================
// 📃 MOSTRAR TABLA
// ===============================
function mostrarTablaRutina() {
  const $tbody = $("#tablaRutina tbody").empty();
  if (!rutinaSugerida.length) {
    $tbody.append(`
      <tr>
        <td colspan="9" class="text-center text-muted">
          No hay ejercicios en la rutina actual.
        </td>
      </tr>
    `);
    return;
  }
  rutinaSugerida.forEach((ej, index) => {
    const guia = ej.GuiaEjercicio
      ? `<a href="${escapeHtml(ej.GuiaEjercicio)}" target="_blank" class="btn-guia"><i class="fas fa-video"></i> Ver Guía</a>`
      : "Sin guía";
    $tbody.append(`
      <tr>
        <td>${escapeHtml(ej.Nombre)}</td>
        <td>${escapeHtml(ej.Descripcion)}</td>
        <td>${escapeHtml(ej.AreaMuscular)}</td>
        <td>${escapeHtml(ej.Dificultad)}</td>
        <td>${escapeHtml(ej.AreaAfectada)}</td>
        <td><input type="number" class="form-control reps-input" value="${
          ej.Repeticiones || 12
        }" min="1" data-index="${index}"></td>
        <td class=" text-center"> ${guia}</td>
        <td><input type="text" class="form-control comentario-input" placeholder="Comentario opcional" data-index="${index}"></td>
        <td class="text-center"><button class="btn btn-danger btn-sm" onclick="eliminarEjercicio(${index})"><i class="fas fa-trash-alt"></i> Eliminar</button></td>
      </tr>
    `);
  });
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function eliminarEjercicio(index) {
  rutinaSugerida.splice(index, 1);
  mostrarTablaRutina();
}
window.eliminarEjercicio = eliminarEjercicio;

// ===============================
// 💾 GUARDAR RUTINA CON REFRESH
// ===============================
$("#guardarRutina").on("click", function () {
  if (!clienteSeleccionado || !rutinaSugerida.length) {
    alert(
      "Selecciona un cliente y asegúrate de que la rutina tenga ejercicios."
    );
    return;
  }
  $("#guardarRutina").prop("disabled", true).text("Guardando...");
  const dtoRutina = {
    FechaInicio: new Date().toISOString(),
    FechaFin: new Date(
      new Date().setMonth(new Date().getMonth() + 1)
    ).toISOString(),
    IdCliente: parseInt(clienteSeleccionado),
    Ejercicios: [],
  };
  console.log("Creando rutina:", dtoRutina);
  $.ajax({
    url: `${API_RUTINA}/crearRutina`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(dtoRutina),
    success: function (rutinaCreada) {
      const idRutina = rutinaCreada.IdRutina || rutinaCreada.idRutina;
      console.log("✅ Rutina creada con ID:", idRutina);
      let ejerciciosGuardados = 0;
      let totalEjercicios = rutinaSugerida.length;
      rutinaSugerida.forEach((ej, idx) => {
        const reps = parseInt($(`[data-index="${idx}"].reps-input`).val()) || 0;
        const comentario =
          $(`[data-index="${idx}"].comentario-input`).val() || "";
        const dtoEj = {
          IdRutina: idRutina,
          IdEjercicio: ej.IdEjercicio,
          Comentario: comentario,
          NombreEjercicio: ej.Nombre,
          DescripcionEjercicio: ej.Descripcion,
          AreaMuscular: ej.AreaMuscular,
          AreaMuscularAfectada: ej.AreaAfectada,
          Repeticiones: reps,
          GuiaEjercicio: ej.GuiaEjercicio,
          Dificultad: ej.Dificultad,
        };
        if (!ej.IdEjercicio) {
          console.warn("❌ El ejercicio no tiene IdEjercicio:", ej);
          totalEjercicios--;
          return;
        }
        $.ajax({
          url: `${API_EJERCICIO_RUTINA}/agregarEjercicioRutina`,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(dtoEj),
          success: () => {
            ejerciciosGuardados++;
            if (ejerciciosGuardados === totalEjercicios) {
              alert("✅ Rutina y ejercicios guardados correctamente.");
              location.reload();
            }
          },
          error: () => {
            totalEjercicios--;
            if (ejerciciosGuardados === totalEjercicios) {
              alert(`⚠️ Rutina creada, pero algunos ejercicios fallaron.`);
              location.reload();
            }
          },
        });
      });
    },
    error: function (xhr) {
      console.error("❌ Error creando rutina:", xhr.status, xhr.responseText);
      alert(`❌ Error al crear la rutina (status ${xhr.status}).`);
      $("#guardarRutina").prop("disabled", false).text("💾 Guardar Rutina");
    },
  });
});

// ===============================
// 🔄 FUNCIÓN resetUI → limpia rutina pero mantiene cliente
// ===============================
function resetUI() {
  rutinaSugerida = [];
  rutinaYaGenerada = false;
  $("#tablaRutina tbody").empty();
  $("#rutinaGenerada").hide();
  $("#btnGenerarRutina")
    .prop("disabled", false)
    .html('<i class="fas fa-dumbbell"></i> Generar Rutina');
  $("#guardarRutina")
    .prop("disabled", false)
    .html('<i class="fas fa-save"></i> Guardar Rutina');
}
