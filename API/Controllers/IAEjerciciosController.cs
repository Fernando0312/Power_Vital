using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVital.Data;
using PowerVital.DTO;
using PowerVital.DTOs;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace PowerVital.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IAEjerciciosController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;

        public IAEjerciciosController(IConfiguration config, AppDbContext context)
        {
            _config = config;
            _httpClient = new HttpClient();
            _context = context;
        }

        private string NormalizarZona(string zona)
        {
            if (string.IsNullOrWhiteSpace(zona))
                return "";

            zona = zona.ToLower().Trim();

            if (zona == "columna vertebral")
                return "columna";
            if (zona == "core")
                return "abdomen";
            if (zona == "bíceps")
                return "biceps";
            if (zona == "tríceps")
                return "triceps";

            return zona;
        }

        private List<string> ObtenerZonasAfectadas(List<PadecimientoIADTO> padecimientos)
        {
            return padecimientos
                .SelectMany(p => (p.AreaMuscular ?? "")
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(z => NormalizarZona(z)))
                .Distinct()
                .ToList();
        }

        private List<string> ObtenerTodasZonas(List<EjercicioDTO> ejerciciosDisponibles)
        {
            return ejerciciosDisponibles
                .SelectMany(e => (e.AreaMuscularAfectada ?? e.AreaMuscular ?? "")
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(z => NormalizarZona(z)))
                .Distinct()
                .ToList();
        }

        [HttpPost("recomendar")]
        public async Task<IActionResult> Recomendar([FromBody] RecomendacionIARequest request)
        {
            try
            {
                Console.WriteLine($"🚀 Iniciando recomendación IA para cliente: {request.NombreCliente}");

                _httpClient.Timeout = TimeSpan.FromSeconds(60);

                // Buscar cliente y sus padecimientos
                var cliente = await _context.Clientes
                    .Include(c => c.PadecimientosClientes)
                        .ThenInclude(pc => pc.Padecimiento)
                    .FirstOrDefaultAsync(c => c.IdUsuario == request.IdCliente);

                if (cliente == null)
                    return NotFound("Cliente no encontrado");

                // Listar padecimientos del cliente
                var padecimientos = cliente.PadecimientosClientes
                    .Select(pc => new PadecimientoIADTO
                    {
                        Nombre = pc.Padecimiento.Nombre,
                        AreaMuscular = pc.Padecimiento.AreaMuscularAfectada,
                        Severidad = pc.Severidad
                    })
                    .ToList();

                // Listar ejercicios disponibles
                var ejerciciosDisponibles = await _context.Ejercicios
                    .Select(e => new EjercicioDTO
                    {
                        IdEjercicio = e.IdEjercicio,
                        Nombre = e.Nombre,
                        Descripcion = e.Descripcion,
                        AreaMuscular = e.AreaMuscular,
                        AreaMuscularAfectada = e.AreaMuscularAfectada,
                        Dificultad = e.Dificultad,
                        Repeticiones = e.Repeticiones,
                        GuiaEjercicio = e.GuiaEjercicio
                    })
                    .ToListAsync();

                // Debug datos de entrada
                Console.WriteLine($"Cliente: {cliente.Nombre} (ID: {cliente.IdUsuario})");
                Console.WriteLine($"Padecimientos: {string.Join(", ", padecimientos.Select(p => $"{p.Nombre} [{p.AreaMuscular}] ({p.Severidad})"))}");
                Console.WriteLine($"Ejercicios disponibles: {ejerciciosDisponibles.Count}");

                // Filtrar ejercicios seguros según la lógica de las áreas y dificultad
                var ejerciciosSeguros = ejerciciosDisponibles
                    .Where(ej =>
                    {
                        var zonasEjercicio = (ej.AreaMuscularAfectada ?? ej.AreaMuscular ?? "")
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(z => NormalizarZona(z));

                        bool afectaZonaGrave = zonasEjercicio.Any(zonaEj =>
                            padecimientos.Any(p =>
                                string.Equals(p.Severidad, "grave", StringComparison.OrdinalIgnoreCase) &&
                                (p.AreaMuscular ?? "")
                                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                    .Select(z => NormalizarZona(z))
                                    .Contains(zonaEj)
                            )
                        );

                        bool afectaZonaModeradoLeve = zonasEjercicio.Any(zonaEj =>
                            padecimientos.Any(p =>
                                (p.Severidad.Equals("moderado", StringComparison.OrdinalIgnoreCase) ||
                                 p.Severidad.Equals("leve", StringComparison.OrdinalIgnoreCase)) &&
                                (p.AreaMuscular ?? "")
                                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                    .Select(z => NormalizarZona(z))
                                    .Contains(zonaEj)
                            )
                        );

                        if (padecimientos.Count == 0)
                            return true;
                        else if (afectaZonaGrave)
                            return ej.Dificultad?.Equals("baja", StringComparison.OrdinalIgnoreCase) == true;
                        else if (afectaZonaModeradoLeve)
                            return ej.Dificultad != null &&
                                (ej.Dificultad.Equals("baja", StringComparison.OrdinalIgnoreCase) ||
                                 ej.Dificultad.Equals("media", StringComparison.OrdinalIgnoreCase));
                        else
                            return true;
                    })
                    .ToList();

                // Más debug
                Console.WriteLine($"✅ Ejercicios seguros encontrados: {ejerciciosSeguros.Count}");

                // Zonas afectadas y no afectadas
                List<string> ObtenerZonasAfectadas(List<PadecimientoIADTO> pades) =>
                    pades
                        .SelectMany(p => (p.AreaMuscular ?? "")
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(z => NormalizarZona(z)))
                        .Distinct()
                        .ToList();

                List<string> ObtenerTodasZonas(List<EjercicioDTO> ejercicios) =>
                    ejercicios
                        .SelectMany(e => (e.AreaMuscularAfectada ?? e.AreaMuscular ?? "")
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(z => NormalizarZona(z)))
                        .Distinct()
                        .ToList();

                var zonasAfectadas = ObtenerZonasAfectadas(padecimientos);
                var zonasNoAfectadas = ObtenerTodasZonas(ejerciciosDisponibles)
                    .Where(z => !zonasAfectadas.Contains(z))
                    .ToList();

                // ===================
                // Lógica del PROMPT AI
                // ===================
                var prompt = $@"Eres un experto en salud y entrenamiento físico.
Debes recomendar ejercicios seguros para el cliente {request.NombreCliente} según sus padecimientos y severidad.";

                if (padecimientos.Count == 0)
                {
                    prompt += "\n\nEl cliente NO TIENE padecimientos.";
                }
                else
                {
                    prompt += "\n\nPadecimientos del cliente:";
                    foreach (var p in padecimientos)
                        prompt += $"\n- {p.Nombre} (Área: {p.AreaMuscular}, Severidad: {p.Severidad})";

                    prompt += "\n\nÁreas musculares NO afectadas, donde sí puede recomendar ejercicios:";
                    foreach (var z in zonasNoAfectadas)
                        prompt += $"\n- {z}";
                }

                prompt += "\n\nEjercicios disponibles (agrupados por área, NO inventes nuevos):";
                prompt += $"\n\nCantidad de ejercicios seguros detectados: {ejerciciosSeguros.Count}";

                var ejerciciosPorArea = ejerciciosSeguros
                    .GroupBy(e => NormalizarZona(e.AreaMuscular))
                    .OrderBy(g => g.Key);

                foreach (var grupo in ejerciciosPorArea)
                {
                    var nombres = grupo.Select(e => e.Nombre).Distinct().ToList();
                    prompt += $"\n{grupo.Key.ToUpper()}: {string.Join(", ", nombres)}";
                }

                prompt += @"

INSTRUCCIONES:
1. Devuelve los ejercicios AGRUPADOS POR ÁREA MUSCULAR.
2. Incluye áreas sin ejercicios como: 'Sin ejercicios recomendables'.
3. Si el cliente no tiene padecimientos, recomienda mínimo 2 por área.
4. Si tiene padecimientos, sugiere ejercicios seguros por área.
5. No inventes ejercicios nuevos.
6. Si no puede hacer ninguno, responde: 'Ningún ejercicio es apto para este cliente'.
";

                Console.WriteLine("📤 Enviando prompt a OpenAI...");
                // ===================

                var requestBody = new
                {
                    model = "gpt-3.5-turbo-1106",
                    messages = new[] { new { role = "user", content = prompt } },
                    max_tokens = 2000
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config["OpenAI:ApiKey"]}");

                var sw = Stopwatch.StartNew();
                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
                sw.Stop();
                Console.WriteLine($"⏱️ Tiempo de respuesta: {sw.Elapsed.TotalSeconds} s");

                var resultJson = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine("❌ Error OpenAI:");
                    Console.WriteLine(resultJson);
                    return StatusCode((int)response.StatusCode, "Error OpenAI: " + resultJson);
                }

                using var doc = JsonDocument.Parse(resultJson);
                var raw = doc.RootElement.GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                Console.WriteLine("📩 Respuesta de OpenAI:");
                Console.WriteLine(raw);

                // 📌 NUEVO PARSER ROBUSTO PARA RESPUESTAS DE OPENAI
                var sugerencias = new List<string>();
                foreach (var line in raw.Split('\n', StringSplitOptions.RemoveEmptyEntries))
                {
                    var cleanLine = line.TrimStart('-', '.', ' ', '"').Trim();
                    if (string.IsNullOrWhiteSpace(cleanLine)) continue;
                    if (cleanLine.Contains("Ningún ejercicio es apto para este cliente", StringComparison.OrdinalIgnoreCase) ||
                        cleanLine.Contains("Sin ejercicios recomendables", StringComparison.OrdinalIgnoreCase))
                        continue;

                    // Ejemplo: "PECHO: Press banca plano, Flexiones"
                    var colonIdx = cleanLine.IndexOf(':');
                    if (colonIdx > 0 && colonIdx < cleanLine.Length - 1)
                    {
                        // Hay área: ejercicios
                        var ejerciciosStr = cleanLine.Substring(colonIdx + 1).Trim();
                        var ejerciciosArr = ejerciciosStr.Split(',', StringSplitOptions.RemoveEmptyEntries);
                        foreach (var ej in ejerciciosArr)
                        {
                            var nombre = ej.Trim();
                            if (!string.IsNullOrWhiteSpace(nombre))
                                sugerencias.Add(nombre);
                        }
                    }
                    else
                    {
                        // Línea suelta, intenta agregar como está
                        int parenIndex = cleanLine.LastIndexOf(" (");
                        var nombre = (parenIndex > 0) ? cleanLine.Substring(0, parenIndex).Trim() : cleanLine;
                        if (!string.IsNullOrWhiteSpace(nombre))
                            sugerencias.Add(nombre);
                    }
                }
                sugerencias = sugerencias
                    .Where(nombre => ejerciciosSeguros.Any(e => e.Nombre.Equals(nombre, StringComparison.OrdinalIgnoreCase)))
                    .Distinct()
                    .Take(50)
                    .ToList();

                // Si no hay sugerencias, ahí sí mostrar el mensaje global
                if (sugerencias.Count == 0)
                {
                    return Ok(new { ejerciciosRecomendados = new List<string> { "Ningún ejercicio es apto para este cliente" } });
                }

                var resultado = ejerciciosSeguros
                    .Where(e => sugerencias.Contains(e.Nombre))
                    .Select(e => new EjercicioIARespuesta
                    {
                        IdEjercicio = e.IdEjercicio,
                        Nombre = e.Nombre,
                        Descripcion = e.Descripcion,
                        AreaMuscular = e.AreaMuscular,
                        Dificultad = e.Dificultad,
                        Repeticiones = e.Repeticiones,
                        AreaAfectada = e.AreaMuscularAfectada ?? e.AreaMuscular,
                        GuiaEjercicio = e.GuiaEjercicio
                    })
                    .ToList();

                return Ok(new { ejerciciosRecomendados = resultado });
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Excepción inesperada:");
                Console.WriteLine(ex.ToString());
                return StatusCode(500, "Error interno del servidor: " + ex.Message);
            }
        }
    }
}