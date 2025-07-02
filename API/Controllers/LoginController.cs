
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVital.Data;
using PowerVital.Models;
using PowerVital.DTO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using System;

namespace PowerVital.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public LoginController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                Console.WriteLine($"📤 LoginRequest recibido: {loginRequest.Email}");

                if (string.IsNullOrWhiteSpace(loginRequest.Email) || string.IsNullOrWhiteSpace(loginRequest.Clave))
                {
                    return BadRequest(new { message = "⚠️ Email y clave son obligatorios." });
                }

                var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == loginRequest.Email.ToLower());

                if (usuario == null)
                {
                    Console.WriteLine("❌ Usuario no encontrado.");
                    return Unauthorized(new { message = "❌ Usuario o clave incorrectos." });
                }

                // Verificar contraseña usando PasswordHasher
                var hasher = new PasswordHasher<Usuario>();
                var resultado = hasher.VerifyHashedPassword(null, usuario.Clave, loginRequest.Clave);

                if (resultado == PasswordVerificationResult.Failed)
                {
                    Console.WriteLine("❌ Clave incorrecta.");
                    return Unauthorized(new { message = "❌ Usuario o clave incorrectos." });
                }

                Console.WriteLine($"✅ Usuario autenticado. Rol: {usuario.Rol}");

                object datosRol = null;

                switch (usuario.Rol)
                {
                    case "Admin":
                        datosRol = await _context.Administradores.FirstOrDefaultAsync(a => a.IdUsuario == usuario.IdUsuario);
                        break;
                    case "Cliente":
                        datosRol = await _context.Clientes.FirstOrDefaultAsync(c => c.IdUsuario == usuario.IdUsuario);
                        break;
                    case "Entrenador":
                        datosRol = await _context.Entrenadores.FirstOrDefaultAsync(e => e.IdUsuario == usuario.IdUsuario);
                        break;
                    default:
                        return BadRequest(new { message = "❌ Rol no válido." });
                }

                if (datosRol == null)
                {
                    Console.WriteLine("❌ No se encontraron datos adicionales para el rol.");
                    return NotFound(new { message = "❌ Datos de rol no encontrados." });
                }

                return Ok(new
                {
                    message = "✅ Login exitoso.",
                    redirectUrl = usuario.Rol switch
                    {
                        "Admin" => "/Administrador/Index",
                        "Cliente" => "/Clientes/Inicio",
                        "Entrenador" => "/Entrenadores/index",
                        _ => "/Login"
                    },
                    usuario = new
                    {
                        usuario.IdUsuario,
                        usuario.Nombre,
                        usuario.Email,
                        Rol = usuario.Rol.ToLower(),
                        IdRol = usuario.Rol switch
                        {
                            "Admin" => ((Administrador)datosRol).IdUsuario,
                            "Cliente" => ((Cliente)datosRol).IdUsuario,
                            "Entrenador" => ((Entrenador)datosRol).IdUsuario,
                            _ => usuario.IdUsuario
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error interno: {ex.Message}");
                return StatusCode(500, new { message = "❌ Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("RecuperarClave")]
        public async Task<IActionResult> RecuperarClave([FromBody] string correo)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.Email == correo);
            if (cliente == null)
                return NotFound("No se encontró un usuario con ese correo");

            string nuevaClave = Utilidades.GenerarClaveSegura();

            var hasher = new PasswordHasher<Cliente>();
            cliente.Clave = hasher.HashPassword(cliente, nuevaClave);

            await _context.SaveChangesAsync();

            await _emailService.EnviarCorreoAsync(cliente.Email, "Recuperación de contraseña", $"Tu nueva contraseña temporal es: {nuevaClave}");

            return Ok("Contraseña enviada al correo");
        }

        [HttpPost("Logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "✅ Logout exitoso." });
        }



        [HttpPost("EnviarCodigoVerificacion")]
        public async Task<IActionResult> EnviarCodigoVerificacion([FromBody] string correo)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == correo);
            if (usuario == null)
                return NotFound("❌ No existe un usuario con ese correo.");

            // Generar código aleatorio
            var random = new Random();
            string codigo = random.Next(100000, 999999).ToString(); // Código de 6 dígitos

            // Guardar en memoria
            GestorCodigos.GuardarCodigo(correo, codigo);

            // Enviar correo
            string mensaje = $"Hola {usuario.Nombre},\n\nTu código de verificación es: {codigo}\nEste código expirará en 10 minutos.\n\nSi no solicitaste este código, ignora este mensaje.\n\nPowerVital";
            await _emailService.EnviarCorreoAsync(correo, "🔐 Código de verificación - PowerVital", mensaje);

            return Ok(new { message = "✅ Código enviado correctamente." });
        }


        [HttpPost("VerificarCodigo")]
        public IActionResult VerificarCodigo([FromBody] CodigoVerificacionDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.Codigo))
                return BadRequest("Correo y código son obligatorios.");

            bool esValido = GestorCodigos.VerificarCodigo(dto.Correo, dto.Codigo);

            if (!esValido)
                return BadRequest("❌ Código incorrecto o expirado.");

            // Borrar el código para que no se use de nuevo
            GestorCodigos.EliminarCodigo(dto.Correo);
            //reotorna un mensaje de exito 
            return Ok("✅ Código verificado correctamente.");
        }




        [HttpPut("AsignarClaveManual")]
        public async Task<IActionResult> AsignarClaveManual([FromBody] CambiarClaveDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.NuevaClave))
                return BadRequest("Correo y nueva contraseña son obligatorios.");

            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Correo);
            if (usuario == null)
                return NotFound("Usuario no encontrado con ese correo.");

            var hasher = new PasswordHasher<Usuario>();
            usuario.Clave = hasher.HashPassword(null, dto.NuevaClave);

            await _context.SaveChangesAsync();

            try
            {
                await _emailService.EnviarCorreoAsync(
                    usuario.Email,
                    "🔐 Cambio de contraseña en PowerVital",
                    $"Hola {usuario.Nombre},\n\nTu contraseña ha sido cambiada exitosamente. Si no fuiste tú, por favor ponte en contacto con nosotros inmediatamente al correo: powervitalgym@gmail.com.\n\nSaludos,\nEquipo PowerVital"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine("⚠️ Error al enviar correo de confirmación: " + ex.Message);
                // Opcional: puedes seguir sin lanzar error
            }

            return Ok(new { mensaje = "Contraseña actualizada exitosamente y correo enviado." });
        }




    }
}
