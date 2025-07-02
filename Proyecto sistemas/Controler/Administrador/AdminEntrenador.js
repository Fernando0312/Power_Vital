//const URL_API = "http://mi-api-powergym-2025.somee.com/api/Entrenador/";
const URL_API = "https://proyecto-inegev2-1.onrender.com/api/Entrenador/";
//const URL_API = "http://localhost:7086/api/Entrenador/";
// Función principal que se ejecuta al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  // Cargar lista si existe tabla
  obtenerTodosLosEntrenadores().then((response) => {
    if (Array.isArray(response)) {
      renderizarEntrenadores(response); // 👈 Aquí directamente sin $values
    } else {
      console.warn("Respuesta inesperada:", response);
    }
  });

  // Crear entrenador
  const formularioCrear = document.getElementById("formularioCrear");
  if (formularioCrear) {
    formularioCrear.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await agregarEntrenador();
        alert("✅ Entrenador agregado correctamente");
        formularioCrear.reset();
        obtenerTodosLosEntrenadores().then(renderizarEntrenadores);
        window.location.href =
          "../../View/Administrador/ListaEntrenadores.html";
      } catch (error) {
        alert("❌ Error al registrar entrenador:\n" + error.message);
      }
    });
  }

  // Editar entrenador
  const formularioEditar = document.getElementById("formularioEditar");
  if (formularioEditar) {
    formularioEditar.addEventListener("submit", async function (e) {
      e.preventDefault();
      const id = document.getElementById("idEditar").value;
      try {
        await editarEntrenador(id);
        alert("✅ Entrenador editado correctamente");
        bootstrap.Modal.getInstance(
          document.getElementById("modalEditarEntrenador")
        ).hide();
        obtenerTodosLosEntrenadores().then(renderizarEntrenadores);
      } catch (error) {
        alert("❌ Error al editar:\n" + error.message);
      }
    });

    const inputFiltro = document.getElementById("filtroEntrenador");
    if (inputFiltro) {
      inputFiltro.addEventListener("input", filtrarEntrenadores);
    }
  }

  // Eliminar entrenador
  const formularioEliminar = document.getElementById("formularioEliminar");
  if (formularioEliminar) {
    formularioEliminar.addEventListener("submit", async function (e) {
      e.preventDefault();
      const id = document.getElementById("idEliminar").value;
      try {
        await eliminarEntrenador(id);
        alert("🗑️ Entrenador eliminado");
        bootstrap.Modal.getInstance(
          document.getElementById("modalEliminarEntrenador")
        ).hide();
        obtenerTodosLosEntrenadores().then(renderizarEntrenadores);
      } catch (error) {
        alert("❌ Error al eliminar:\n" + error.message);
      }
    });
  }
});

//  Renderiza la tabla de entrenadores
export function renderizarEntrenadores(lista) {
  const tbody = document.getElementById("entrenador-tbody");
  tbody.innerHTML = "";

  lista.forEach((entrenador) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${entrenador.Nombre}</td>
      <td>${entrenador.Email}</td>
      <td>${entrenador.Telefono}</td>
    
      <td>${entrenador.FormacionAcademica || ""}</td>
      <td>${entrenador.Rol || ""}</td>
      <td class="acciones-clientes">
        <button class="btn-tabla-editar" title="Editar" onclick="mostrarModalEditar(
          ${entrenador.idIdUsuario},
          '${entrenador.Nombre}',
          '${entrenador.Email}',
          '${entrenador.Telefono}',
          '${entrenador.FormacionAcademica || ""}'
        )">
          <i class="bi bi-pencil-fill"></i>
        </button>
        <button class="btn-tabla-eliminar" title="Eliminar" onclick="mostrarModalEliminar(${
          entrenador.idIdUsuario
        })">
          <i class="bi bi-trash-fill"></i>
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//  Mostrar modal de edición con datos precargados
window.mostrarModalEditar = function (
  Id,
  Nombre,
  Correo,
  Telefono,
  Formacion
) {
  document.getElementById("idEditar").value = Id;
  document.getElementById("nombreEditar").value = Nombre;
  document.getElementById("correoEditar").value = Correo;
  document.getElementById("telefonoEditar").value = Telefono;
  document.getElementById("formacionEditar").value = Formacion;

  new bootstrap.Modal(document.getElementById("modalEditarEntrenador")).show();
};

//  Mostrar modal de confirmación para eliminar
window.mostrarModalEliminar = function (id) {
  document.getElementById("idEliminar").value = id;
  new bootstrap.Modal(
    document.getElementById("modalEliminarEntrenador")
  ).show();
};

//  Formato para obtener datos desde formulario de creación
// function getEntrenadorDesdeFormulario() {
//   return {
//     Nombre: document.getElementById("nombre").value,
//     Email: document.getElementById("correo").value,
//     Clave: document.getElementById("clave").value,
//     Telefono: parseInt(document.getElementById("telefono").value),
//     FormacionAcademica: document.getElementById("formacion").value,
//     Rol: "Entrenador",
//   };
// }

function getEntrenadorDesdeFormulario() {
  return {
    Nombre: document.getElementById("nombre").value,
    Email: document.getElementById("correo").value,
    // Clave: "", // ❌ Ya no se incluye
    Telefono: parseInt(document.getElementById("telefono").value),
    FormacionAcademica: document.getElementById("formacion").value,
    Rol: "Entrenador"
  };
}


// Crear nuevo entrenador
export async function agregarEntrenador() {
  const nuevo = getEntrenadorDesdeFormulario();

  const response = await fetch(`${URL_API}agregarEntrenador`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo),
  });

  if (!response.ok) throw new Error("Error al crear el entrenador");

  return response.json();
}

// Obtener todos los entrenadores
export async function obtenerTodosLosEntrenadores() {
  const response = await fetch(`${URL_API}listaEntrenador`);
  if (!response.ok) throw new Error("Error al obtener entrenadores");
  return response.json();
}

// Obtener entrenador por ID (opcional)
export async function obtenerEntrenadorPorId(id) {
  const response = await fetch(`${URL_API}obtenerEntrenadorPorId/${id}`);
  if (!response.ok) throw new Error("Entrenador no encontrado");
  return response.json();
}

// Editar entrenador (usa los campos del modal)
export async function editarEntrenador(id) {
  const entrenadorEditado = {
    IdIdUsuario: id,
    Nombre: document.getElementById("nombreEditar").value,
    Email: document.getElementById("correoEditar").value,
    Telefono: parseInt(document.getElementById("telefonoEditar").value),
    FormacionAcademica: document.getElementById("formacionEditar").value,
    Rol: "Entrenador",
  };

  const response = await fetch(`${URL_API}editarEntrenador/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entrenadorEditado),
  });

  if (!response.ok) throw new Error("Error al editar el entrenador");

  return response;
}

// Eliminar entrenador
export async function eliminarEntrenador(id) {
  const response = await fetch(`${URL_API}eliminarEntrenador/${id}`, {
    method: "DELETE",
  });


if (!response.ok) {
  const errorBody = await response.json();
  throw new Error(errorBody.message || "Error al eliminar el entrenador");
}



}

//Para buscar
function filtrarEntrenadores() {
  const filtro = document
    .getElementById("filtroEntrenador")
    .value.toLowerCase();
  const filas = document.querySelectorAll("#entrenador-tbody tr");

  filas.forEach((fila) => {
    const textoFila = fila.textContent.toLowerCase();
    fila.style.display = textoFila.includes(filtro) ? "" : "none";
  });
}
