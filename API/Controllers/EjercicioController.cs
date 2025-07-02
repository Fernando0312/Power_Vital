using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVital.Data;
using PowerVital.DTOs;
using PowerVital.Models;

namespace PowerVital.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EjercicioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EjercicioController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Ejercicio
        // Devuelve todos los ejercicios en forma de lista
        [HttpGet("listaEjercicios")]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var ejercicios = await _context.Ejercicios
                .Select(e => new
                {
                    e.IdEjercicio,
                    e.Nombre,
                    e.Descripcion,
                    e.AreaMuscular,
                    e.AreaMuscularAfectada,
                    e.Repeticiones,
                    e.Dificultad,
                    e.GuiaEjercicio
                })
                .ToListAsync();

            return Ok(ejercicios); // 200 OK
        }

        // GET: api/Ejercicio/5
        // Devuelve un ejercicio por su ID
        [HttpGet("obtenerEjercicioPorId/{id}")]
        public async Task<ActionResult<object>> GetById(int id)
        {
            var ejercicio = await _context.Ejercicios.FindAsync(id);

            if (ejercicio == null)
                return NotFound(new { mensaje = "Ejercicio no encontrado." }); // 404

            return Ok(new
            {
                ejercicio.IdEjercicio,
                ejercicio.Nombre,
                ejercicio.Descripcion,
                ejercicio.AreaMuscular,
                ejercicio.AreaMuscularAfectada,
                ejercicio.GuiaEjercicio,
                ejercicio.Dificultad,
                ejercicio.Repeticiones
            });
        }

        // POST: api/Ejercicio
        // Crea un nuevo ejercicio
        [HttpPost("crearEjercicio")]
        public async Task<ActionResult> Create([FromBody] EjercicioDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // 400 si falla validación

            var ejercicio = new Ejercicio
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                AreaMuscular = dto.AreaMuscular,
                AreaMuscularAfectada = dto.AreaMuscularAfectada,
                GuiaEjercicio = dto.GuiaEjercicio,
                Dificultad = dto.Dificultad,
                Repeticiones = dto.Repeticiones
            };

            _context.Ejercicios.Add(ejercicio);

            try
            {
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = ejercicio.IdEjercicio }, ejercicio); // 201
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { mensaje = "Error al guardar el ejercicio.", detalle = ex.Message }); // 500
            }
        }

        // PUT: api/Ejercicio/5
        // Actualiza un ejercicio existente
        [HttpPut("editarEjercicio/{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] EjercicioDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // 400

            var ejercicio = await _context.Ejercicios.FindAsync(id);

            if (ejercicio == null)
                return NotFound(new { mensaje = "Ejercicio no encontrado para actualizar." }); // 404

            ejercicio.Nombre = dto.Nombre;
            ejercicio.Descripcion = dto.Descripcion;
            ejercicio.AreaMuscular = dto.AreaMuscular;
            ejercicio.AreaMuscularAfectada = dto.AreaMuscularAfectada;
            ejercicio.Repeticiones = dto.Repeticiones;
            ejercicio.GuiaEjercicio = dto.GuiaEjercicio;
            ejercicio.Dificultad = dto.Dificultad;


            try
            {
                await _context.SaveChangesAsync();
                return NoContent(); // 204
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { mensaje = "Error al actualizar el ejercicio.", detalle = ex.Message });
            }
        }

        // DELETE: api/Ejercicio/5
        // Elimina un ejercicio existente
        [HttpDelete("eliminarEjericicio/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var ejercicio = await _context.Ejercicios.FindAsync(id);

            if (ejercicio == null)
                return NotFound(new { mensaje = "Ejercicio no encontrado para eliminar." }); // 404

            _context.Ejercicios.Remove(ejercicio);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent(); // 204
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { mensaje = "Error al eliminar el ejercicio.", detalle = ex.Message });
            }
        }
    }
}
