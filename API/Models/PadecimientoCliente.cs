using System.ComponentModel.DataAnnotations;
namespace PowerVital.Models
{
    public class PadecimientoCliente
    {
        public int IdCliente { get; set; }
        public Cliente Cliente { get; set; }

        public int IdPadecimiento { get; set; }
        public Padecimiento Padecimiento { get; set; }
        public string Severidad { get; set; } // Ejemplo: Leve, Moderado, Grave

    }
}
