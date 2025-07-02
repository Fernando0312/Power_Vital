using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PowerVital.Models
{
    public  class Usuario
    {
        [Key]
        public int IdUsuario { get; set; }
        public string? Nombre { get; set; }
        public string Clave { get; set; }
        public string Email { get; set; }
        public string Rol { get; set; }

        public int Telefono { get; set; }

    }
}
