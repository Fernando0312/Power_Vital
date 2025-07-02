using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PowerVital.Models
{
    public class Rutina
    {
        [Key]
        public int IdRutina { get; set; }

        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }

        [ForeignKey("Cliente")]
        public int IdCliente { get; set; }    // FK limpia

        public Cliente Cliente { get; set; }  // Navegación limpia

        public ICollection<EjercicioRutina> EjerciciosRutina { get; set; } = new List<EjercicioRutina>();
    }
}
