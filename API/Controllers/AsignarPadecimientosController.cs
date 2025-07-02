using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVital.Data;
using PowerVital.DTO;
using PowerVital.DTO.PowerVital.DTO;
using PowerVital.Models;

namespace PowerVital.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AsignarPadecimientosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AsignarPadecimientosController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/asignarPadecimientos/asignarPadecimientos
        [HttpPost("asignarPadecimientos")]
        public async Task<IActionResult> AsignarPadecimientos([FromBody] AsignarPadecimientos dto)
        {
            var cliente = await _context.Clientes.FindAsync(dto.IdCliente);
            if (cliente == null)
                return NotFound(new { mensaje = "Cliente no encontrado" });

            foreach (var item in dto.Padecimientos)
            {
                var yaExiste = await _context.PadecimientoCliente.AnyAsync(pc =>
                    pc.IdCliente == dto.IdCliente && pc.IdPadecimiento == item.IdPadecimiento);

                if (!yaExiste)
                {
                    _context.PadecimientoCliente.Add(new PadecimientoCliente
                    {
                        IdCliente = dto.IdCliente,
                        IdPadecimiento = item.IdPadecimiento,
                        Severidad = item.Severidad
                    });
                }
                else
                {
                    // Si ya existe, actualizamos la severidad
                    var existente = await _context.PadecimientoCliente.FirstAsync(pc =>
                        pc.IdCliente == dto.IdCliente && pc.IdPadecimiento == item.IdPadecimiento);

                    existente.Severidad = item.Severidad;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Padecimientos asignados correctamente" });
        }

        // GET: api/asignarPadecimientos/obtenerPadecimientos/5
        [HttpGet("obtenerPadecimientos/{idCliente}")]
        public async Task<ActionResult<List<PadecimientoConSeveridad>>> ObtenerPadecimientosDeCliente(int idCliente)
        {
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.IdUsuario == idCliente);
            if (!clienteExiste)
                return NotFound(new { mensaje = "Cliente no encontrado" });

            var lista = await _context.PadecimientoCliente
                .Where(pc => pc.IdCliente == idCliente)
                .Select(pc => new PadecimientoConSeveridad
                {
                    IdPadecimiento = pc.IdPadecimiento,
                    Severidad = pc.Severidad
                })
                .ToListAsync();

            return Ok(lista);
        }

        // DELETE: api/asignarPadecimientos/eliminarPadecimiento/5/2
        [HttpDelete("eliminarPadecimiento/{idCliente}/{idPadecimiento}")]
        public async Task<IActionResult> EliminarPadecimiento(int idCliente, int idPadecimiento)
        {
            var padecimiento = await _context.PadecimientoCliente
                .FirstOrDefaultAsync(pc => pc.IdCliente == idCliente && pc.IdPadecimiento == idPadecimiento);

            if (padecimiento == null)
                return NotFound(new { mensaje = "Padecimiento no encontrado para el cliente" });

            _context.PadecimientoCliente.Remove(padecimiento);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Padecimiento eliminado correctamente" });
        }

        // CORREGIDO: DELETE: api/asignarPadecimientos/eliminarPadecimiento/5
        [HttpDelete("eliminarPadecimiento/{idCliente}")]
        public async Task<IActionResult> EliminarTodosLosPadecimientos(int idCliente)
        {
            var padecimientos = await _context.PadecimientoCliente
                .Where(pc => pc.IdCliente == idCliente)
                .ToListAsync();

            if (padecimientos.Any())
            {
                _context.PadecimientoCliente.RemoveRange(padecimientos);
                await _context.SaveChangesAsync();
                return Ok(new { mensaje = "Todos los padecimientos del cliente fueron eliminados correctamente" });
            }
            else
            {
                // Siempre responde 200 OK aunque no haya nada que eliminar
                return Ok(new { mensaje = "El cliente no tenía padecimientos que eliminar" });
            }
        }
    }
}