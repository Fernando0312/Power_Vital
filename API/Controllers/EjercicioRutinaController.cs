using Microsoft.AspNetCore.Mvc; // Controladores y respuestas HTTP
using Microsoft.EntityFrameworkCore; // Funcionalidades de EF Core (queries, SaveChanges, etc.)
using PowerVital.Data; // Acceso al contexto de base de datos
using PowerVital.DTOs; // Acceso al DTO creado para validaciones
using PowerVital.Models; // Modelos de base de datos

namespace PowerVital.Controllers
{
    // Indica que este controlador es una API y valida automáticamente modelos con DataAnnotations
    [ApiController]

    // Define la ruta base del controlador: api/EjercicioRutina
    [Route("api/[controller]")]
    public class EjercicioRutinaController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Inyecta el contexto de base de datos al controlador
        public EjercicioRutinaController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/EjercicioRutina
        // Obtiene todas las relaciones de ejercicio con rutina
        [HttpGet("listaEjercicioRutina")]
        public async Task<ActionResult<IEnumerable<EjercicioRutinaDTO>>> GetAll()
        {
            // Selecciona y transforma los datos al DTO
            var lista = await _context.EjercicioRutina
                .Select(er => new EjercicioRutinaDTO
                {
                    IdRutina = er.IdRutina,
                    IdEjercicio = er.IdEjercicio,
                    Comentario = er.Comentario,
                    NombreEjercicio = er.Ejercicio.Nombre,
                    DescripcionEjercicio = er.Ejercicio.Descripcion,
                    AreaMuscular = er.Ejercicio.AreaMuscular,
                    AreaMuscularAfectada = er.Ejercicio.AreaMuscularAfectada,
                    Repeticiones = er.Ejercicio.Repeticiones,
                    GuiaEjercicio = er.Ejercicio.GuiaEjercicio,
                    Dificultad = er.Ejercicio.Dificultad
                }).ToListAsync();

            return Ok(lista); // 200 OK con la lista
        }

        // GET: api/EjercicioRutina/1/2
        // Obtiene una relación específica entre una rutina y un ejercicio
        [HttpGet("buscarEjericioRutina/{idRutina:int}/{idEjercicio:int}")]
        public async Task<ActionResult<EjercicioRutinaDTO>> Get(int idRutina, int idEjercicio)
        {
            // Busca la entidad por su clave compuesta
            var er = await _context.EjercicioRutina
                .FirstOrDefaultAsync(e => e.IdRutina == idRutina && e.IdEjercicio == idEjercicio);

            if (er == null)
                return NotFound(new { mensaje = "La relación no fue encontrada." }); // 404 Not Found

            // Devuelve el DTO correspondiente
            return new EjercicioRutinaDTO
            {
                IdRutina = er.IdRutina,
                IdEjercicio = er.IdEjercicio,
                Comentario = er.Comentario,
                NombreEjercicio = er.Ejercicio.Nombre,
                DescripcionEjercicio = er.Ejercicio.Descripcion,
                AreaMuscular = er.Ejercicio.AreaMuscular,
                AreaMuscularAfectada = er.Ejercicio.AreaMuscularAfectada,
                Repeticiones = er.Ejercicio.Repeticiones,
                GuiaEjercicio = er.Ejercicio.GuiaEjercicio,
                Dificultad = er.Ejercicio.Dificultad
            };
        }

        // POST: api/EjercicioRutina
        // Crea una nueva relación entre rutina y ejercicio
        [HttpPost("agregarEjercicioRutina")]
        public async Task<ActionResult> Create([FromBody] EjercicioRutinaDTO dto)
        {
            // Verifica si el modelo recibido cumple con las validaciones
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // 400 Bad Request con errores de validación

            // Verifica si ya existe la misma relación para evitar duplicados
            var existe = await _context.EjercicioRutina
                .AnyAsync(e => e.IdRutina == dto.IdRutina && e.IdEjercicio == dto.IdEjercicio);

            if (existe)
                return Conflict(new { mensaje = "Ya existe esa combinación de rutina y ejercicio." }); // 409 Conflict

            try
            {
                // Crea una nueva entidad con los datos recibidos
                var nuevaRelacion = new EjercicioRutina
                {
                    IdRutina = dto.IdRutina,
                    IdEjercicio = dto.IdEjercicio,
                    Comentario = dto.Comentario,

                    NombreEjercicio = dto.NombreEjercicio,
                    DescripcionEjercicio =dto.DescripcionEjercicio,
                    AreaMuscular =dto.AreaMuscular,
                    AreaMuscularAfectada = dto.AreaMuscularAfectada,
                    Repeticiones = dto.Repeticiones,
                    GuiaEjercicio = dto.GuiaEjercicio,
                    Dificultad =dto.Dificultad

                };

                // Agrega la entidad al contexto y guarda en la base de datos
                _context.EjercicioRutina.Add(nuevaRelacion);
                await _context.SaveChangesAsync();

                // Devuelve 201 Created con la ruta del nuevo recurso
                return CreatedAtAction(nameof(Get), new { idRutina = dto.IdRutina, idEjercicio = dto.IdEjercicio }, dto);
            }
            catch (DbUpdateException ex)
            {
                // Si hay un error de base de datos, devuelve 500 con detalle
                return StatusCode(500, new { mensaje = "Error al guardar en la base de datos.", detalle = ex.Message });
            }
        }

        // PUT: api/EjercicioRutina/1/2
        // Actualiza el comentario de una relación existente
        [HttpPut("editarEjercicioRutina/{idRutina:int}/{idEjercicio:int}")]
        public async Task<ActionResult> Update(int idRutina, int idEjercicio, [FromBody] EjercicioRutinaDTO dto)
        {
            // Verifica si el modelo recibido es válido
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // 400 Bad Request

            // Busca la entidad original por clave compuesta
            var entidad = await _context.EjercicioRutina
                .FirstOrDefaultAsync(e => e.IdRutina == idRutina && e.IdEjercicio == idEjercicio);

            if (entidad == null)
                return NotFound(new { mensaje = "La relación a actualizar no fue encontrada." }); // 404 Not Found

            // Solo se actualiza el comentario

            entidad.Comentario = dto.Comentario;
            entidad.NombreEjercicio = dto.NombreEjercicio;
            entidad.DescripcionEjercicio = dto.DescripcionEjercicio;
            entidad.AreaMuscular = dto.AreaMuscular;
            entidad.AreaMuscularAfectada = dto.AreaMuscularAfectada;
            entidad.Repeticiones = dto.Repeticiones;
            entidad.GuiaEjercicio = dto.GuiaEjercicio;
            entidad.Dificultad = dto.Dificultad;
            






            try
            {
                await _context.SaveChangesAsync(); // Guarda los cambios
                return NoContent(); // 204 No Content: todo salió bien
            }
            catch (DbUpdateException ex)
            {
                // Error al actualizar
                return StatusCode(500, new { mensaje = "Error al actualizar en la base de datos.", detalle = ex.Message });
            }
        }

        // DELETE: api/EjercicioRutina/1/2
        // Elimina una relación específica entre rutina y ejercicio
        [HttpDelete("eliminarEjercicioRutina/{idRutina:int}/{idEjercicio:int}")]
        public async Task<ActionResult> Delete(int idRutina, int idEjercicio)
        {
            // Busca la entidad a eliminar
            var entidad = await _context.EjercicioRutina
                .FirstOrDefaultAsync(e => e.IdRutina == idRutina && e.IdEjercicio == idEjercicio);

            if (entidad == null)
                return NotFound(new { mensaje = "La relación a eliminar no fue encontrada." }); // 404 Not Found

            try
            {
                _context.EjercicioRutina.Remove(entidad); // Elimina la entidad
                await _context.SaveChangesAsync(); // Guarda cambios
                return NoContent(); // 204 No Content
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { mensaje = "Error al eliminar de la base de datos.", detalle = ex.Message });
            }
        }
    }
}
