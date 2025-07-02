using System.ComponentModel.DataAnnotations;

namespace PowerVital.DTO
{
    public class PadecimientoHistorialDTO
    {
        public int IdHistorial { get; set; }

        [Required]
        public int IdCliente { get; set; }

        // Cambia a nullable
        public int? IdPadecimiento { get; set; }

        [Required]
        [StringLength(100)]
        public string NombrePadecimiento { get; set; }

        public DateTime Fecha { get; set; } = DateTime.Now;

        public decimal? Peso { get; set; }

        [StringLength(20)]
        public string Severidad { get; set; }
    }
}