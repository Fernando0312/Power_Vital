using System.ComponentModel.DataAnnotations;

namespace PowerVital.DTO
{
    public class HistorialSaludDTO
    {

        public int IdHistorialSalud { get; set; }

        [Required]
        public int ClienteId { get; set; }

        public DateTime Fecha { get; set; } = DateTime.Now;

        [Range(0, 500, ErrorMessage = "El peso debe estar entre 0 y 500 kg.")]
        public decimal Peso { get; set; }

        public decimal IndiceMasaCorporal { get; set; } = 0;


    }
}
