using System.ComponentModel.DataAnnotations;

namespace PowerVital.DTOs
{

    public class EjercicioRutinaDTO
    {   
        public int IdRutina { get; set; }
        public int IdEjercicio { get; set; }
        public string Comentario { get; set; }

        public string NombreEjercicio { get; set; }
        public string DescripcionEjercicio { get; set; }
        public string AreaMuscular { get; set; }
        public string AreaMuscularAfectada { get; set; }
        public int Repeticiones { get; set; }
        public string GuiaEjercicio { get; set; }
        public string Dificultad { get; set; }


    }
}
