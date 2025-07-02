using System.ComponentModel.DataAnnotations;

namespace PowerVital.Models
{
    public class Cliente : Usuario
    {
        public DateTime FechaNacimiento { get; set; }
        public string Genero { get; set; }
        public decimal Altura { get; set; }
        public decimal Peso { get; set; }
        public bool EstadoPago { get; set; }

        public int? EntrenadorId { get; set; }
        public Entrenador Entrenador { get; set; }
        public ICollection<Rutina> Rutinas { get; set; }//Aqui tendra las rutinas del cliente, sera una lista de rutinas
        public ICollection<PadecimientoCliente> PadecimientosClientes { get; set; }// la loista de padecimientos que tendra
        public ICollection<HistorialSalud> HistorialesSalud { get; set; }

        //Estos se veran reflejados en la
    }
}
