namespace PowerVital.DTO
{
    public class GuardarClienteDto
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string? Clave { get; set; }
        public string Email { get; set; }
        public int Telefono { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Genero { get; set; }
        public decimal Altura { get; set; }
        public decimal Peso { get; set; }
        public bool EstadoPago { get; set; }
        public int? EntrenadorId { get; set; }

        public List<PadecimientoClienteDto> PadecimientosCompletos { get; set; } = new();
    }

    public class PadecimientoClienteDto
    {
        public int IdPadecimiento { get; set; }
        public string Severidad { get; set; } = string.Empty;
    }

}
