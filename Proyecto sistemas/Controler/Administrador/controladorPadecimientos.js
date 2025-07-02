const API_URL = "https://proyecto-inegev2-1.onrender.com/api/padecimiento";

document.addEventListener("DOMContentLoaded", () => {
  const accion = document.body.dataset.accion;
  const params = new URLSearchParams(window.location.search);
  const modo = params.get("modo");
  const id = params.get("id");

  if (accion === "editar") {
    cargarFormularioEditar(id);
    configurarFormularioEditar(id);
    return;
  }

  if (modo === "editar" && id) {
    // Ya no se usa aquí, edición es solo en EditarPadecimientos.html
    return;
  }

  switch (accion) {
    case "listar":
      listarPadecimientos();
      buscarPadecimientosAvanzado();
      break;
    case "agregar":
      configurarFormularioAgregar();
      break;
    default:
      console.warn("⚠️ Acción no reconocida:", accion);
  }
});

// ----- EDITAR PADECIMIENTO -----
function cargarFormularioEditar(id) {
  if (!id) {
    alert("No se proporcionó ID de padecimiento para editar.");
    window.location.href = "ListaPadecimientos.html";
    return;
  }
  fetch(`${API_URL}/obtenerPadecimientoPorId/${id}`)
    .then((res) => res.json())
    .then((p) => {
      document.getElementById("nombre").value = p.Nombre;
      document.getElementById("Descripcion").value = p.Descripcion;
      const areas = (p.AreaMuscularAfectada || "")
        .split(",")
        .map((a) => a.trim().toLowerCase());
      document
        .querySelectorAll("input[name='AreaMuscularAfectada']")
        .forEach((cb) => {
          cb.checked = areas.includes(cb.value.toLowerCase());
        });
    });
}

function configurarFormularioEditar(id) {
  const form = document.querySelector(".formulario");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const descripcion = form.Descripcion.value.trim();
    const areasSeleccionadas = Array.from(
      form.querySelectorAll("input[name='AreaMuscularAfectada']:checked")
    )
      .map((cb) => cb.value)
      .join(", ");
    if (!nombre || !descripcion || !areasSeleccionadas) {
      alert(
        "Por favor, completa todos los campos y selecciona al menos un área afectada."
      );
      return;
    }
    const dto = {
      idPadecimiento: parseInt(id),
      nombre: nombre,
      descripcion: descripcion,
      areaMuscularAfectada: areasSeleccionadas,
    };
    fetch(`${API_URL}/editarPadecimiento/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo actualizar el padecimiento.");
        alert("✅ Padecimiento actualizado correctamente.");
        window.location.href = "ListaPadecimientos.html";
      })
      .catch((err) => {
        alert("❌ Error al actualizar: " + err.message);
      });
  });
}

// ----- LISTAR Y ELIMINAR PADECIMIENTOS -----
function listarPadecimientos() {
  fetch(`${API_URL}/listaPadecimientos`)
    .then((res) => res.json())
    .then((lista) => {
      const tbody = document.querySelector("tbody.table-group-divider");
      tbody.innerHTML = "";

      lista.forEach((p) => {
        const fila = document.createElement("tr");
        fila.setAttribute("data-id", p.IdPadecimiento);
        fila.innerHTML = `
          <td>${p.IdPadecimiento}</td>
          <td>${p.Nombre}</td>
          <td style="max-width:500px;">${p.Descripcion}</td>
          <td>${p.AreaMuscularAfectada}</td>
          <td class="acciones-clientes">
            <button class="btn-tabla-editar" data-id="${p.IdPadecimiento}" title="Editar" type="button"
              onclick="window.location.href='../../View/Administrador/EditarPadecimientos.html?id=${p.IdPadecimiento}'">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn-tabla-eliminar" onclick="eliminarPadecimiento(${p.IdPadecimiento})" title="Eliminar" type="button">
              <i class="bi bi-trash-fill"></i>
            </button>
          </td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch((err) => console.error("❌ Error al listar:", err.message));
}

function eliminarPadecimiento(id) {
  if (!confirm("¿Seguro que deseas eliminar este padecimiento?")) return;

  fetch(`${API_URL}/eliminarPadecimiento/${id}`, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo eliminar.");
      mostrarToast("✅ Padecimiento eliminado correctamente.", "success");
      listarPadecimientos();
    })
    .catch((err) => {
      mostrarToast("❌ Error al eliminar: " + err.message, "danger");
    });
}

function buscarPadecimientosAvanzado() {
  const input = document.getElementById("inputBuscar");
  if (!input) return;

  input.addEventListener("input", function () {
    const texto = input.value.trim().toLowerCase();

    if (texto === "") {
      listarPadecimientos();
      return;
    }

    fetch(`${API_URL}/listaPadecimientos`)
      .then((res) => res.json())
      .then((lista) => {
        const resultados = lista.filter((p) => {
          return (
            p.IdPadecimiento.toString().includes(texto) ||
            p.Nombre.toLowerCase().includes(texto) ||
            p.Descripcion.toLowerCase().includes(texto) ||
            p.AreaMuscularAfectada.toLowerCase().includes(texto)
          );
        });

        const tbody = document.querySelector("tbody.table-group-divider");
        tbody.innerHTML = "";

        if (resultados.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" class="text-danger">No se encontraron resultados.</td>
            </tr>
          `;
          return;
        }

        resultados.forEach((p) => {
          const fila = document.createElement("tr");
          fila.setAttribute("data-id", p.IdPadecimiento);
          fila.innerHTML = `
            <td>${p.IdPadecimiento}</td>
            <td>${p.Nombre}</td>
            <td>${p.Descripcion}</td>
            <td>${p.AreaMuscularAfectada}</td>
            <td class="acciones-clientes">
              <button class="btn-tabla-editar" data-id="${p.IdPadecimiento}" title="Editar" type="button"
                onclick="window.location.href='../../View/Administrador/EditarPadecimientos.html?id=${p.IdPadecimiento}'">
                <i class="fas fa-pen-to-square icono-btn"></i>
              </button>
              <button class="btn-tabla-eliminar" onclick="eliminarPadecimiento(${p.IdPadecimiento})" title="Eliminar" type="button">
                <i class="fas fa-trash icono-btn"></i>
              </button>
            </td>
          `;
          tbody.appendChild(fila);
        });
      })
      .catch((err) => {
        console.error("Error en búsqueda:", err);
      });
  });
}

// ----- AGREGAR PADECIMIENTO -----
function configurarFormularioAgregar() {
  const form = document.querySelector(".formulario");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const descripcion = form.Descripcion.value.trim();
    const areasSeleccionadas = Array.from(
      form.querySelectorAll("input[name='AreaMuscularAfectada']:checked")
    )
      .map((cb) => cb.value)
      .join(", ");

    if (!nombre || !descripcion || !areasSeleccionadas) {
      alert(
        "Por favor, completa todos los campos y selecciona al menos un área afectada."
      );
      return;
    }

    const dto = {
      nombre: nombre,
      descripcion: descripcion,
      areaMuscularAfectada: areasSeleccionadas,
    };

    fetch(
      "https://proyecto-inegev2-1.onrender.com/api/padecimiento/crearPadecimiento",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo agregar el padecimiento.");
        alert("✅ Padecimiento agregado correctamente.");
        form.reset();
      })
      .catch((err) => {
        alert("❌ Error al agregar: " + err.message);
      });
  });
}

function mostrarToast(mensaje, tipo = "info") {
  const toastElemento = document.getElementById("liveToast");
  const toastMensaje = document.getElementById("toastMensaje");

  if (!toastElemento || !toastMensaje) return;

  toastElemento.className = `toast align-items-center text-bg-${tipo} border-0`;
  toastMensaje.textContent = mensaje;

  const toast = new bootstrap.Toast(toastElemento);
  toast.show();
}
