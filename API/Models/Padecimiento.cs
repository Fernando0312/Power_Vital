using PowerVital.Models;
using System.ComponentModel.DataAnnotations;

public class Padecimiento
{
    [Key]
    public int IdPadecimiento { get; set; }
    public string Nombre { get; set; }
    public string Descripcion { get; set; }
    public string AreaMuscularAfectada { get; set; }

    public ICollection<PadecimientoCliente> PadecimientosClientes { get; set; }
    public ICollection<PadecimientoHistorial> PadecimientosHistorial { get; set; }
}
