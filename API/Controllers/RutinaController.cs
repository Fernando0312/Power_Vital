using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVital.Data;
using PowerVital.DTO;
using PowerVital.DTOs;
using PowerVital.Models;

namespace PowerVital.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RutinaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RutinaController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Rutina/listaRutina
        [HttpGet("listaRutina")]
        public async Task<ActionResult<IEnumerable<RutinaDTO>>> GetRutinas()
        {
            var rutinas = await _context.Rutinas
                .Include(r => r.EjerciciosRutina)
                .Select(r => new RutinaDTO
                {
                    IdRutina = r.IdRutina,
                    FechaInicio = r.FechaInicio,
                    FechaFin = r.FechaFin,
                    IdCliente = r.IdCliente,
                    Ejercicios = r.EjerciciosRutina.Select(ej => new EjercicioRutinaDTO
                    {
                        IdRutina = ej.IdRutina,
                        IdEjercicio = ej.IdEjercicio,
                        Comentario = ej.Comentario,
                        NombreEjercicio = ej.NombreEjercicio,
                        DescripcionEjercicio = ej.DescripcionEjercicio,
                        AreaMuscular = ej.AreaMuscular,
                        AreaMuscularAfectada = ej.AreaMuscularAfectada,
                        Repeticiones = ej.Repeticiones,
                        GuiaEjercicio = ej.GuiaEjercicio,
                        Dificultad = ej.Dificultad
                    }).ToList()
                })
                .ToListAsync();

            return rutinas;
        }

        // GET: api/Rutina/obtenerRutinasPorCliente/{clienteId}
        [HttpGet("obtenerRutinasPorCliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<RutinaDTO>>> GetRutinasPorCliente(int clienteId)
        {
            var rutinas = await _context.Rutinas
                .Include(r => r.EjerciciosRutina)
                .Where(r => r.IdCliente == clienteId)
                .Select(r => new RutinaDTO
                {
                    IdRutina = r.IdRutina,
                    FechaInicio = r.FechaInicio,
                    FechaFin = r.FechaFin,
                    IdCliente = r.IdCliente,
                    Ejercicios = r.EjerciciosRutina.Select(ej => new EjercicioRutinaDTO
                    {
                        IdRutina = ej.IdRutina,
                        IdEjercicio = ej.IdEjercicio,
                        Comentario = ej.Comentario,
                        NombreEjercicio = ej.NombreEjercicio,
                        DescripcionEjercicio = ej.DescripcionEjercicio,
                        AreaMuscular = ej.AreaMuscular,
                        AreaMuscularAfectada = ej.AreaMuscularAfectada,
                        Repeticiones = ej.Repeticiones,
                        GuiaEjercicio = ej.GuiaEjercicio,
                        Dificultad = ej.Dificultad
                    }).ToList()
                })
                .ToListAsync();

            return rutinas;
        }

        // POST: api/Rutina/crearRutina
        [HttpPost("crearRutina")]
        public async Task<ActionResult> PostRutina(CrearEditarRutina dto)
        {
            try
            {
                var rutina = new Rutina
                {
                    FechaInicio = dto.FechaInicio,
                    FechaFin = dto.FechaFin,
                    IdCliente = dto.IdCliente
                };

                _context.Rutinas.Add(rutina);
                await _context.SaveChangesAsync();

                // Mapeamos correctamente cada EjercicioRutina
                var ejerciciosRutina = dto.Ejercicios.Select(ej => new EjercicioRutina
                {
                    IdRutina = rutina.IdRutina,
                    IdEjercicio = ej.IdEjercicio,
                    Comentario = ej.Comentario,
                    NombreEjercicio = ej.NombreEjercicio,
                    DescripcionEjercicio = ej.DescripcionEjercicio,
                    AreaMuscular = ej.AreaMuscular,
                    AreaMuscularAfectada = ej.AreaMuscularAfectada,
                    Repeticiones = ej.Repeticiones,
                    GuiaEjercicio = ej.GuiaEjercicio,
                    Dificultad = ej.Dificultad
                }).ToList();

                _context.EjercicioRutina.AddRange(ejerciciosRutina);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Rutina creada correctamente",
                    rutina.IdRutina,
                    rutina.FechaInicio,
                    rutina.FechaFin,
                    IdCliente = rutina.IdCliente,
                    ejerciciosAgregados = ejerciciosRutina.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear la rutina", error = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        // PUT: api/Rutina/editarRutina/{id}
        [HttpPut("editarRutina/{id}")]
        public async Task<IActionResult> PutRutina(int id, RutinaDTO dto)
        {
            var rutina = await _context.Rutinas.FindAsync(id);
            if (rutina == null)
            {
                return NotFound(new { message = "Rutina no encontrada" });
            }

            rutina.FechaInicio = dto.FechaInicio;
            rutina.FechaFin = dto.FechaFin;
            rutina.IdCliente = dto.IdCliente;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Rutina actualizada correctamente",
                rutina.IdRutina,
                rutina.FechaInicio,
                rutina.FechaFin,
                IdCliente = rutina.IdCliente
            });
        }

        // POST: api/Rutina/agregarEjercicioRutina
        [HttpPost("agregarEjercicioRutina")]
        public async Task<IActionResult> AgregarEjercicioRutina(EjercicioRutinaDTO dto)
        {
            var ejercicioRutina = new EjercicioRutina
            {
                IdRutina = dto.IdRutina,
                IdEjercicio = dto.IdEjercicio,
                Comentario = dto.Comentario,
                NombreEjercicio = dto.NombreEjercicio,
                DescripcionEjercicio = dto.DescripcionEjercicio,
                AreaMuscular = dto.AreaMuscular,
                AreaMuscularAfectada = dto.AreaMuscularAfectada,
                Repeticiones = dto.Repeticiones,
                GuiaEjercicio = dto.GuiaEjercicio,
                Dificultad = dto.Dificultad
            };

            _context.EjercicioRutina.Add(ejercicioRutina);
            await _context.SaveChangesAsync();

            return Ok(ejercicioRutina);
        }

        // DELETE: api/Rutina/eliminarRutina/{id}
        [HttpDelete("eliminarRutina/{id}")]
        public async Task<IActionResult> DeleteRutina(int id)
        {
            var rutina = await _context.Rutinas.FindAsync(id);
            if (rutina == null)
            {
                return NotFound();
            }

            _context.Rutinas.Remove(rutina);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("obtenerRutinasPorEntrenador/{idEntrenador}")]
        public async Task<ActionResult<IEnumerable<RutinaDTO>>> GetRutinasPorEntrenador(int idEntrenador)
        {
            var rutinas = await _context.Rutinas
                .Include(r => r.EjerciciosRutina)
                .Include(r => r.Cliente)
                .Where(r => r.Cliente.EntrenadorId == idEntrenador)
                .Select(r => new RutinaDTO
                {
                    IdRutina = r.IdRutina,
                    FechaInicio = r.FechaInicio,
                    FechaFin = r.FechaFin,
                    IdCliente = r.IdCliente,
                    Ejercicios = r.EjerciciosRutina.Select(ej => new EjercicioRutinaDTO
                    {
                        IdRutina = ej.IdRutina,
                        IdEjercicio = ej.IdEjercicio,
                        Comentario = ej.Comentario,
                        NombreEjercicio = ej.NombreEjercicio,
                        DescripcionEjercicio = ej.DescripcionEjercicio,
                        AreaMuscular = ej.AreaMuscular,
                        AreaMuscularAfectada = ej.AreaMuscularAfectada,
                        Repeticiones = ej.Repeticiones,
                        GuiaEjercicio = ej.GuiaEjercicio,
                        Dificultad = ej.Dificultad
                    }).ToList()
                }).ToListAsync();

            return rutinas;
        }



    }
}
