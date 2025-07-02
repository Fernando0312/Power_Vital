using System.ComponentModel.DataAnnotations;

namespace PowerVital.Models
{
    public class EjercicioRutina
    {
        [Required(ErrorMessage = "El campo IdRutina es obligatorio.")]
        public int IdRutina { get; set; }

        // No hace falta poner Navigation extra, con el Id y Fluent API controlamos la relación
        public Rutina Rutina { get; set; }

        [Required(ErrorMessage = "El campo IdEjercicio es obligatorio.")]
        public int IdEjercicio { get; set; }

        public Ejercicio Ejercicio { get; set; }

        [StringLength(300, ErrorMessage = "El comentario no puede superar los 300 caracteres.")]
        public string Comentario { get; set; }

        // 🚀 CAMPOS "CONGELADOS"
        [Required]
        public string NombreEjercicio { get; set; }

        [Required]
        public string DescripcionEjercicio { get; set; }

        [Required]
        public string AreaMuscular { get; set; }

        [Required]
        public string AreaMuscularAfectada { get; set; }

        [Required]
        public int Repeticiones { get; set; }

        [Required]
        public string GuiaEjercicio { get; set; }

        [Required]
        public string Dificultad { get; set; }
    }
}
