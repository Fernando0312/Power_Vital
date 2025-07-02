const URL_ACTUALIZAR_CLAVE = "https://proyecto-inegev2-1.onrender.com/api/Login/AsignarClaveManual";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-asignar-clave");
  const mensaje = document.querySelector("#mensajeClave");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.querySelector("#correoUsuario").value.trim();
    const clave = document.querySelector("#clave").value.trim();
    const confirmarClave = document.querySelector("#nuevaClave").value.trim();

    // Validar campos vacíos
    if (!correo || !clave || !confirmarClave) {
      mostrarMensaje("❌ Todos los campos son obligatorios.", "danger");
      return;
    }

    // Validar coincidencia de contraseñas
    if (clave !== confirmarClave) {
      mostrarMensaje("❌ Las contraseñas no coinciden.", "danger");
      return;
    }

    try {
      const res = await fetch(URL_ACTUALIZAR_CLAVE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, nuevaClave: confirmarClave }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      mostrarMensaje(
        "✅ Contraseña actualizada correctamente. Se ha notificado al usuario por correo.",
        "success"
      );
      form.reset();
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "danger");
    }
  });

  // Mostrar/Ocultar contraseñas
 document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.querySelector(btn.getAttribute('toggle'));
    const esOculto = input.type === "password";

    input.type = esOculto ? "text" : "password";
    btn.classList.toggle("bi-eye");
    btn.classList.toggle("bi-eye-slash");
  });
});


  function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `text-${tipo}`;
  }
});
