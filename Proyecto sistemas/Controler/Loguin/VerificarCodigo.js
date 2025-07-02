const API_VERIFICAR_CODIGO = "https://proyecto-inegev2-1.onrender.com/api/Login/VerificarCodigo";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-verificar-codigo");
  const mensaje = document.querySelector("#mensajeCodigo");

  const correo = localStorage.getItem("correoRecuperacion");

  if (!correo) {
    mensaje.textContent = "❌ No se detectó un correo. Vuelve a la pantalla anterior.";
    mensaje.className = "text-danger";
    form.style.display = "none";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = document.querySelector("#codigo").value.trim();

    try {
      const res = await fetch(API_VERIFICAR_CODIGO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });

      if (!res.ok) throw new Error(await res.text());

      // ✅ Código correcto: continuar
      window.location.href = "../../View/Login/AsignarNuevaClave.html";
    } catch (error) {
      mensaje.textContent = "❌ " + error.message;
      mensaje.className = "text-danger";
    }
  });
});
