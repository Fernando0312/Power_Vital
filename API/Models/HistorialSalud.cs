using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PowerVital.Models
{
    public class HistorialSalud
    {
        [Key]
        public int IdHistorialSalud { get; set; }

        [Required]
        public int ClienteId { get; set; }

        [ForeignKey("ClienteId")]
        public Cliente Cliente { get; set; }

        public DateTime Fecha { get; set; } = DateTime.Now;

        public decimal Peso { get; set; }

        public decimal IndiceMasaCorporal { get; set; }

        public ICollection<PadecimientoHistorial> Padecimientos { get; set; }

    }
}
