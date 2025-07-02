using PowerVital.DTOs;

namespace PowerVital.DTO
{
    public class RutinaDTO
    {
        public int IdRutina { get; set; }

        public int IdCliente { get; set; }  // limpio: igual que en el modelo

        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }

        public List<EjercicioRutinaDTO> Ejercicios { get; set; }
    }
}

