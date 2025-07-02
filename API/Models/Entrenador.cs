using System.ComponentModel.DataAnnotations;
namespace PowerVital.Models
{
    public class Entrenador : Usuario
    {
        public string? FormacionAcademica { get; set; }
        public ICollection<Cliente> Clientes { get; set; }

    }
}