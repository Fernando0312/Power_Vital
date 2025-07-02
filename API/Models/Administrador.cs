using System.ComponentModel.DataAnnotations;

namespace PowerVital.Models
{
    public class Administrador:Usuario
    {

        [Required(ErrorMessage = "El campo titulacion es obligatorio.")] // Valida que el campo no esté vacío.
        [StringLength(100, ErrorMessage = "La titulacion no puede exceder los 100 caracteres.")] // Define la longitud máxima.
        [DataType(DataType.Text)] // Especifica que es un texto.
        public string? titulacion { get; set; }

    }
}
