namespace PowerVital.Controllers
{
    internal class EjercicioIARespuesta
    {


        public int IdEjercicio { get; set; } // ✅ AÑADIR ESTA LÍNEA
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string AreaMuscular { get; set; }
        public string Dificultad { get; set; }
        public int Repeticiones { get; set; }
        public string AreaAfectada { get; set; }
        public string GuiaEjercicio { get; internal set; }
    }
}