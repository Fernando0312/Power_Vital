
using PowerVital.Models;

namespace PowerVital.DTO
{
    /// <summary>
    /// DTO utilizado para la creación o edición de una rutina.
    /// </summary>
    public class CrearEditarRutina
    {
        /// <summary>
        /// Identificador único de la rutina. Es opcional, ya que puede no estar presente al crear una nueva rutina.
        /// </summary>
        public int? idRutina { get; set; }

        /// <summary>
        /// Fecha de inicio de la rutina.
        /// </summary>
        public DateTime FechaInicio { get; set; }

        /// <summary>
        /// Fecha de finalización de la rutina.
        /// </summary>
        public DateTime FechaFin { get; set; }

        /// <summary>
        /// Identificador del cliente al que pertenece la rutina.
        /// </summary>
        public int IdCliente { get; set; }

        /// <summary>
        /// Lista de ejercicios asociados a la rutina. 
        /// Se inicializa como una lista vacía para evitar problemas de referencia nula.
        /// </summary>
        public List<EjercicioRutina> Ejercicios { get; set; } = new List<EjercicioRutina>();
    }
}
