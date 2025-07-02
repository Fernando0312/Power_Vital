using System.ComponentModel.DataAnnotations;

namespace PowerVital.Models
{
    public class Ejercicio
    {
        [Key]
        public int IdEjercicio { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string AreaMuscular { get; set; }
        public string AreaMuscularAfectada { get; set; }
        public int Repeticiones { get; set; } 
        public string GuiaEjercicio { get; set; }  

        public string Dificultad { get; set; }

    }
}
