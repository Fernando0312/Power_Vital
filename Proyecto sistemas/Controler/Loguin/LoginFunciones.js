// LoginFunciones.js
import { LoginModel } from "../../Model/LoginModel.js";

//const URL_API = "http://mi-api-powergym-2025.somee.com/api/Login/Login";
const URL_API = "https://proyecto-inegev2-1.onrender.com/api/Login/Login";
//const URL_API = "http://localhost:7086/api/Login/Login";


document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    iniciarSesion();
  });
});

function iniciarSesion() {
  const email = document.querySelector("#inputCorreo").value.trim();
  const clave = document.querySelector("#inputClave").value.trim();

  const loginModel = new LoginModel(email, clave);

  fetch(URL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginModel),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("❌ Credenciales inválidas");
      }
      return response.json();
    })
    .then((data) => {
      const usuario = data.usuario;
      console.log("🔎 Respuesta del backend:", data);

      // Guardar información base
      sessionStorage.setItem("usuario", JSON.stringify(usuario));
      sessionStorage.setItem("rol", usuario.Rol.trim().toLowerCase());

      // Guardar datos específicos según el rol
      const rol = usuario.Rol.trim().toLowerCase();

      switch (rol) {
        case "admin":
          window.location.href = "../../View/Administrador/Index.html";
          break;

        case "cliente":
          sessionStorage.setItem("clienteId", usuario.IdUsuario); // ✅ Agregado
          window.location.href = "../../View/Cliente/Index.html";
          break;

        case "entrenador":
          sessionStorage.setItem("idEntrenador", usuario.IdUsuario);
          sessionStorage.setItem("nombreEntrenador", usuario.Nombre);
          window.location.href = "../../View/Entrenador/Index.html";
          break;

        default:
          alert("⚠️ Rol no reconocido. Contacte al administrador.");
          break;
      }

      console.log("🟢 Usuario guardado en sesión:", usuario);
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
      alert("❌ Credenciales inválidas o error en el servidor.");
    });
}
