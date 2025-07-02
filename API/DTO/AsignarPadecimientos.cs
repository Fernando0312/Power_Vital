using System.ComponentModel.DataAnnotations;

namespace PowerVital.DTO
{
    using System.ComponentModel.DataAnnotations;

    namespace PowerVital.DTO
    {
        public class AsignarPadecimientos
        {
            [Required(ErrorMessage = "El ID del cliente es obligatorio")]
            [Range(1, int.MaxValue, ErrorMessage = "El ID del cliente debe ser mayor a 0")]
            public int IdCliente { get; set; }

            [Required(ErrorMessage = "Debe proporcionar al menos un padecimiento con severidad")]
            public List<PadecimientoConSeveridad> Padecimientos { get; set; }
        }

        public class PadecimientoConSeveridad
        {
            [Required]
            public int IdPadecimiento { get; set; }

            [Required]
            [RegularExpression("Leve|Moderado|Grave", ErrorMessage = "La severidad debe ser Leve, Moderado o Grave")]
            public string Severidad { get; set; }
        }
    }
}
