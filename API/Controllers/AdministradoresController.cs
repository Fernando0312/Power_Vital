using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVital.Data;
using PowerVital.Models;
using PowerVital.DTO;
using Microsoft.AspNetCore.Identity;

namespace PowerVital.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdministradoresController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        public AdministradoresController(AppDbContext context, EmailService emailService)
        {
            _context = context; 
            _emailService = emailService;
        }



            // GET: api/Administradores
            [HttpGet("listaAdministradores")]
        public async Task<ActionResult<IEnumerable<AdministradorDto>>> GetAdministradores()
        {
            var administradores = await _context.Administradores
                .Select(a => new AdministradorDto
                {
                    idIdUsuario = a.IdUsuario,
                    Nombre = a.Nombre,
                    Email = a.Email,
                    Clave = a.Clave,
                    Rol = a.Rol,
                    Telefono = a.Telefono,
                    FormacionAcademica = a.titulacion // Agregado para recuperar titulacion
                })
                .ToListAsync();

            return Ok(administradores);

           

        }

        // GET: api/Administradores/5
        [HttpGet("obtenerAdministradorPorId/{id}")]
        public async Task<ActionResult<AdministradorDto>> GetAdministrador(int id)
        {
            var administrador = await _context.Administradores.FindAsync(id);

            if (administrador == null)
            {
                return NotFound(new { message = "❌ Administrador no encontrado." });
            }

            var dto = new AdministradorDto
            {
                idIdUsuario = administrador.IdUsuario,
                Nombre = administrador.Nombre,
                Email = administrador.Email,
                Clave = administrador.Clave,
                Rol = administrador.Rol,
                Telefono = administrador.Telefono,
                FormacionAcademica = administrador.titulacion // Agregado para incluir titulacion
            };

            return Ok(dto);
        }


       


        [HttpPost("crearAdministrador")]
        public async Task<ActionResult> CrearAdministrador([FromBody] AdministradorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string emailNormalizado = dto.Email.ToLower();

            var correoExistente = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == emailNormalizado)
                || await _context.Administradores.AnyAsync(a => a.Email.ToLower() == emailNormalizado);

            if (correoExistente)
                return Conflict(new { message = "⚠️ El correo electrónico ya está registrado." });

            // ✅ Generar clave segura
            string claveGenerada = Utilidades.GenerarClaveSegura();


            // ✅ Hashear la clave con PasswordHasher<Usuario>
            var hasher = new PasswordHasher<Usuario>();
            string claveHasheada = hasher.HashPassword(null, claveGenerada);



            // Crear instancia del administrador
            var admin = new Administrador
            {
                Nombre = dto.Nombre,
                Email = dto.Email,
                Clave = claveHasheada,
                Rol = "Admin",
                Telefono = dto.Telefono,
                titulacion = dto.FormacionAcademica
            };

            _context.Administradores.Add(admin);
            await _context.SaveChangesAsync();

            // ✅ Enviar la clave al correo
            try
            {
                string asunto = "🔐 Tu clave temporal - PowerVital";
                string mensaje = $"Hola {admin.Nombre},\n\nTu clave temporal para ingresar es:\n\n👉 {claveGenerada}\n\nPor seguridad, cámbiala después de iniciar sesión.\n\nSaludos,\nEquipo PowerVital";
                await _emailService.EnviarCorreoAsync(admin.Email, asunto, mensaje); // ✅ Ya está inyectado

            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar correo: {ex.Message}");
                // Nota: no detenemos el flujo si falla el correo
            }

            return Ok(new
            {
                message = "✅ Administrador creado y clave enviada por correo.",
                id = admin.IdUsuario
            });
        }







        // PUT: api/Administradores/5
        [HttpPut("actualizarAdministrador/{id}")]
        public async Task<ActionResult> ActualizarAdministrador(int id, [FromBody] AdministradorDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var administradorExistente = await _context.Administradores.FindAsync(id);
            if (administradorExistente == null)
            {
                return NotFound(new { message = "❌ Administrador no encontrado." });
            }

            administradorExistente.Nombre = dto.Nombre;
            administradorExistente.Email = dto.Email;
            if (!string.IsNullOrWhiteSpace(dto.Clave))
            {
                administradorExistente.Clave = dto.Clave;
            }
            administradorExistente.Rol = dto.Rol;
            administradorExistente.Telefono = dto.Telefono;
            administradorExistente.titulacion = dto.FormacionAcademica; // Actualización del campo titulacion

            await _context.SaveChangesAsync();
            return Ok(new { message = "✅ Administrador actualizado correctamente." });
        }

        // DELETE: api/Administradores/5
        [HttpDelete("eliminarAdministrador/{id}")]
        public async Task<ActionResult> EliminarAdministrador(int id)
        {
            var administrador = await _context.Administradores.FindAsync(id);
            if (administrador == null)
            {
                return NotFound(new { message = "❌ Administrador no encontrado." });
            }

            _context.Administradores.Remove(administrador);
            await _context.SaveChangesAsync();

            return Ok(new { message = "🗑️ Administrador eliminado correctamente." });
        }
    }
}