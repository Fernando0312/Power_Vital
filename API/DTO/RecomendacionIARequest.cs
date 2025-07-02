using System.ComponentModel.DataAnnotations;

namespace PowerVital.DTO { 
    public class RecomendacionIARequest
    {
        public int IdCliente { get; set; }
        public string NombreCliente { get; set; }

        public List<PadecimientoIADTO>? Padecimientos { get; set; }
        public List<EjercicioIADTO>? EjerciciosDisponibles { get; set; }
    }

    public class PadecimientoIADTO
    {
        public string Nombre { get; set; }
        public string AreaMuscular { get; set; }
        public string Severidad { get; set; }
    }

    public class EjercicioIADTO
    {
        public string Nombre { get; set; }
        public string AreaMuscular { get; set; }
    }
}