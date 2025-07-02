using System.ComponentModel.DataAnnotations;

namespace PowerVital.DTOs
{
    public class EjercicioDTO
    {
        public int IdEjercicio { get; set; } // ✅

        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre no puede tener más de 100 caracteres.")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "La descripción es obligatoria.")]
        [StringLength(500, ErrorMessage = "La descripción no puede superar los 500 caracteres.")]
        public string Descripcion { get; set; }

        [Required(ErrorMessage = "El área muscular es obligatoria.")]
        [StringLength(100, ErrorMessage = "El área muscular no puede tener más de 100 caracteres.")]
        public string AreaMuscular { get; set; }
        public string AreaMuscularAfectada { get; set; }

        [Range(1, 100, ErrorMessage = "Las repeticiones deben estar entre 1 y 100.")]
        public int Repeticiones { get; set; }

        public String GuiaEjercicio { get; set; }

        public String Dificultad { get; set; }
    }
}
