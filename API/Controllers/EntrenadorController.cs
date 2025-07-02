using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVital.Data;
using PowerVital.Models;
using PowerVital.DTOs;
using Microsoft.AspNetCore.Identity;

namespace PowerVital.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EntrenadorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        public EntrenadorController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }


        // ✅ GET: api/Entrenador
        [HttpGet("listaEntrenador")]
        public async Task<ActionResult<IEnumerable<EntrenadorDTO>>> ObtenerTodosLosEntrenadores()
        {
            var entrenadores = await _context.Entrenadores
                .Select(e => new EntrenadorDTO
                {
                    idIdUsuario = e.IdUsuario,
                    Nombre = e.Nombre,
                    Email = e.Email,
                    Clave = e.Clave,
                    Telefono = e.Telefono,
                    Rol =e.Rol,

                    FormacionAcademica = e.FormacionAcademica
                    // Excluyendo Clave y Rol
                })
                .ToListAsync();

            return Ok(entrenadores);
        }

        // ✅ GET: api/Entrenador/{id}
        [HttpGet("obtenerEntrenadorPorId/{id}")]
        public async Task<ActionResult<EntrenadorDTO>> ObtenerEntrenadorPorId(int id)
        {
            var entrenador = await _context.Entrenadores.FindAsync(id);

            if (entrenador == null)
                return NotFound();

            var dto = new EntrenadorDTO
            {
                idIdUsuario = entrenador.IdUsuario,
                Nombre = entrenador.Nombre,
                Email = entrenador.Email,
                Telefono = entrenador.Telefono,
                FormacionAcademica = entrenador.FormacionAcademica,
                Rol = entrenador.Rol
                // NO ENVÍES Clave en la edición (por seguridad)
            };


            return Ok(dto);
        }


        [HttpPost("agregarEntrenador")]
        public async Task<ActionResult> AgregarEntrenador([FromBody] EntrenadorDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string emailNormalizado = dto.Email.ToLower();

            var correoExistente = await _context.Entrenadores.AnyAsync(e => e.Email.ToLower() == emailNormalizado)
                || await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == emailNormalizado);

            if (correoExistente)
                return Conflict(new { message = "⚠️ El correo electrónico ya está registrado." });

            // 🔐 Generar clave segura
            string claveTemporal = Utilidades.GenerarClaveSegura();
            var hasher = new PasswordHasher<Entrenador>();
            string claveHasheada = hasher.HashPassword(null, claveTemporal);

            // Crear entrenador
            var nuevoEntrenador = new Entrenador
            {
                Nombre = dto.Nombre,
                Email = dto.Email,
                Clave = claveHasheada,
                Telefono = dto.Telefono,
                Rol = "Entrenador",
                FormacionAcademica = dto.FormacionAcademica
            };

            _context.Entrenadores.Add(nuevoEntrenador);
            await _context.SaveChangesAsync();

            // Enviar correo
            try
            {
                string asunto = "📩 Tu clave temporal - PowerVital";
                string mensaje = $"Hola {dto.Nombre},\n\nTu clave temporal para acceder es:\n👉 {claveTemporal}\n\nPor seguridad, cámbiala después de iniciar sesión.";
                await _emailService.EnviarCorreoAsync(dto.Email, asunto, mensaje);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al enviar correo: {ex.Message}");
            }

            return Ok(new
            {
                message = "✅ Entrenador creado y clave enviada al correo.",
                id = nuevoEntrenador.IdUsuario
            });
        }



        // ✅ PUT: api/Entrenador/{id}
        [HttpPut("editarEntrenador/{id}")]
        public async Task<IActionResult> EditarEntrenador(int id, [FromBody] EntrenadorDTO dto)
        {
            if (id != dto.idIdUsuario)
                return BadRequest("El ID no coincide.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entrenador = await _context.Entrenadores.FindAsync(id);
            if (entrenador == null)
                return NotFound();

            // Actualizar los campos permitidos
            entrenador.Nombre = dto.Nombre;
            entrenador.Email = dto.Email;
            entrenador.Telefono = dto.Telefono;
            if (!string.IsNullOrWhiteSpace(dto.Clave))
            {
                entrenador.Clave = dto.Clave;
            }

            entrenador.FormacionAcademica = dto.FormacionAcademica;
            // La clave no se actualiza desde aquí por seguridad

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ✅ DELETE: api/Entrenador/{id}

        //[HttpDelete("eliminarEntrenador/{id}")]
        //public async Task<IActionResult> EliminarEntrenador(int id)
        //{
        //    try
        //    {
        //        var entrenador = await _context.Entrenadores.FindAsync(id);
        //        if (entrenador == null)
        //            return NotFound(new { message = "❌ Entrenador no encontrado." });

        //        var tieneClientesAsignados = await _context.Clientes.AnyAsync(c => c.EntrenadorId == id);
        //        if (tieneClientesAsignados)
        //        {
        //            return Conflict(new { message = "❌ No se puede eliminar el entrenador porque tiene clientes asignados." });
        //        }

        //        _context.Entrenadores.Remove(entrenador);
        //        await _context.SaveChangesAsync();

        //        return Ok(new { message = "✅ Entrenador eliminado correctamente." });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new
        //        {
        //            message = "❌ Error interno al eliminar entrenador.",
        //            detalle = ex.Message
        //        });
        //    }
        //}


        [HttpDelete("eliminarEntrenador/{id}")]
        public async Task<IActionResult> EliminarEntrenador(int id)
        {
            try
            {
                var entrenador = await _context.Entrenadores.FindAsync(id);
                if (entrenador == null)
                    return NotFound(new { message = "❌ Entrenador no encontrado." });

                // Desasignar el entrenador de todos los clientes relacionados
                var clientesAsignados = await _context.Clientes
                    .Where(c => c.EntrenadorId == id)
                    .ToListAsync();

                foreach (var cliente in clientesAsignados)
                {
                    cliente.EntrenadorId = null; // 🔓 Desasignar entrenador
                }

                _context.Entrenadores.Remove(entrenador);
                await _context.SaveChangesAsync();

                return Ok(new { message = "✅ Entrenador eliminado y clientes desasignados." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ Error interno al eliminar entrenador.",
                    detalle = ex.Message
                });
            }
        }











        // 🔍 Verificar si el Entrenador existe
        private bool ExisteEntrenador(int id)
        {
            return _context.Entrenadores.Any(e => e.IdUsuario == id);
        }



        // GET: api/entrenador/{id}/clientes
        [HttpGet("{id}/clientes")]
        public async Task<IActionResult> ObtenerClientes(int id)
        {
            var clientes = await _context.Clientes
                .Where(c => c.EntrenadorId == id)
                .Select(c => new
                {
                    c.IdUsuario,              // ID del cliente
                    c.Nombre,          // Heredado de Usuario       
                    c.EstadoPago,
                    c.Altura,
                    c.Peso
                })
                .ToListAsync();

            return Ok(clientes);
        }


    }
}
