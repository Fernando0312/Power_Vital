const API_ENVIAR_CODIGO =
  "https://proyecto-inegev2-1.onrender.com/api/Login/EnviarCodigoVerificacion";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-recuperacion");
  const mensajeDiv = document.querySelector("#mensajeRespuesta");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.querySelector("#correoRecuperacion").value.trim();

    if (!correo) {
      mensajeDiv.textContent = "❌ Debes ingresar un correo.";
      mensajeDiv.classList.add("text-danger");
      return;
    }

    try {
      const res = await fetch(API_ENVIAR_CODIGO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(correo),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      localStorage.setItem("correoRecuperacion", correo); // Guardar correo para usar después
      window.location.href = "../../View/Login/VerificarCodigo.html"; // Redirigir
    } catch (error) {
      mensajeDiv.textContent = "❌ " + error.message;
      mensajeDiv.className = "text-danger";
    }
  });
});
