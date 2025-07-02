namespace PowerVital.DTO
{
    public static class GestorCodigos
    {
        private static Dictionary<string, CodigoVerificacionTemporal> codigos = new();

        public static void GuardarCodigo(string correo, string codigo)
        {
            codigos[correo] = new CodigoVerificacionTemporal
            {
                Codigo = codigo,
                Expira = DateTime.UtcNow.AddMinutes(10)
            };
        }

        public static bool VerificarCodigo(string correo, string codigo)
        {
            if (!codigos.ContainsKey(correo)) return false;

            var registro = codigos[correo];
            if (registro.Expira < DateTime.UtcNow) return false;

            return registro.Codigo == codigo;
        }

        public static void EliminarCodigo(string correo)
        {
            if (codigos.ContainsKey(correo))
                codigos.Remove(correo);
        }
    }
}
