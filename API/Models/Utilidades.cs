namespace PowerVital.Models
{
    public class Utilidades
    {

        public static string GenerarClaveSegura(int longitud = 12)
        {
            const string caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&";
            var random = new Random();
            return new string(Enumerable.Repeat(caracteres, longitud)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

    }
}
