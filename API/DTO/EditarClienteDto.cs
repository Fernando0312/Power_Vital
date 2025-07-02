using PowerVital.Models;

namespace PowerVital.DTO
{
    public class EditarClienteDto
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string Clave { get; set; }
        public string Email { get; set; }
        public int Telefono { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Genero { get; set; }
        public decimal Altura { get; set; }
        public decimal Peso { get; set; }
        public bool EstadoPago { get; set; }
        public int? EntrenadorId { get; set; }

        public string? NombreEntrenador { get; set; }

        // Este es el que se muestra en la tabla → Nombre (Severidad)
        public List<string>? Padecimientos { get; set; }
    }
}

