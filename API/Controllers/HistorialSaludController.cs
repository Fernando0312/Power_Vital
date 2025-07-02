using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PowerVital.Data;
using PowerVital.DTO;
using PowerVital.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PowerVital.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistorialSaludController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HistorialSaludController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/HistorialSalud/cliente/5
        [HttpGet("obtenerHisotorialPorClienteId/{idCliente}")]
        public async Task<ActionResult<IEnumerable<HistorialSaludDTO>>> GetByClienteId(int idCliente)
        {
            var historiales = await _context.HistorialesSalud
                .Where(h => h.ClienteId == idCliente)
                .ToListAsync();

            var dto = historiales.Select(h => new HistorialSaludDTO
            {
                IdHistorialSalud = h.IdHistorialSalud,
                ClienteId = h.ClienteId,
                Fecha = h.Fecha,
                Peso = h.Peso,
                IndiceMasaCorporal = h.IndiceMasaCorporal
            });

            return Ok(dto);
        }

        // POST: api/HistorialSalud
        [HttpPost("crearHistorialSalud")]
        public async Task<ActionResult<HistorialSaludDTO>> Create([FromBody] HistorialSaludDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var historial = new HistorialSalud
            {
                ClienteId = dto.ClienteId,
                Fecha = dto.Fecha,
                Peso = dto.Peso,
                IndiceMasaCorporal = dto.IndiceMasaCorporal
            };

            _context.HistorialesSalud.Add(historial);
            await _context.SaveChangesAsync();

            dto.IdHistorialSalud = historial.IdHistorialSalud;

            return CreatedAtAction(nameof(GetByClienteId), new { idCliente = dto.ClienteId }, dto);
        }



        [HttpGet("pdf/{clienteId}")]
        public async Task<IActionResult> GenerarPDFHistorial(int clienteId)
        {
            QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

            var cliente = await _context.Clientes.FindAsync(clienteId);
            if (cliente == null) return NotFound();

            var historialCompleto = await _context.HistorialesSalud
                .Where(h => h.ClienteId == clienteId)
                .OrderBy(h => h.Fecha)
                .Include(h => h.Padecimientos)
                    .ThenInclude(ph => ph.Padecimiento)
                .ToListAsync();

            var padecimientosActuales = await _context.PadecimientoCliente
                .Where(pc => pc.IdCliente == clienteId)
                .Include(pc => pc.Padecimiento)
                .ToListAsync();

            var historialAgrupado = historialCompleto
                .GroupBy(h => h.Fecha.Date)
                .OrderBy(g => g.Key)
                .ToList();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(20);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header().Column(header =>
                    {
                        header.Item().Row(row =>
                        {
                            row.RelativeColumn().Text("PowerVital").Bold().FontSize(20);
                        });

                        header.Item().Text($"Historial de salud de {cliente.Nombre}")
                                     .FontSize(16).Bold().AlignCenter();
                    });

                    page.Content().Column(content =>
                    {
                        foreach (var grupo in historialAgrupado)
                        {
                            var fecha = grupo.Key;
                            var historial = grupo.Last(); // Tomamos el último historial del día

                            // Si es el último historial del cliente, usamos los padecimientos actuales
                            var esUltimo = historial == historialCompleto.Last();
                            var padecimientos = esUltimo
                                ? padecimientosActuales
                                : grupo.SelectMany(h => h.Padecimientos.Select(ph => new PadecimientoCliente
                                {
                                    IdPadecimiento = ph.PadecimientoId ?? 0,
                                    Padecimiento = ph.Padecimiento,
                                    Severidad = ph.Severidad
                                })).ToList();

                            content.Item().Text($"📅 Fecha: {fecha:dd/MM/yyyy}").Bold().FontSize(13);

                            content.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(80); // Fecha
                                    columns.RelativeColumn();   // Padecimiento
                                    columns.ConstantColumn(80); // Severidad
                                    columns.ConstantColumn(50); // Peso
                                    columns.ConstantColumn(50); // IMC
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("Fecha");
                                    header.Cell().Element(CellStyle).Text("Padecimiento");
                                    header.Cell().Element(CellStyle).Text("Severidad");
                                    header.Cell().Element(CellStyle).Text("Peso");
                                    header.Cell().Element(CellStyle).Text("IMC");

                                    static IContainer CellStyle(IContainer container) =>
                                        container.DefaultTextStyle(x => x.Bold()).Padding(4).Background(Colors.Grey.Lighten2);
                                });

                                if (padecimientos == null || !padecimientos.Any())
                                {
                                    table.Cell().Text(fecha.ToShortDateString());
                                    table.Cell().Text("Sin padecimientos registrados");
                                    table.Cell().Text("-");
                                    table.Cell().Text(historial.Peso.ToString("0.##"));
                                    table.Cell().Text(historial.IndiceMasaCorporal.ToString("0.##"));
                                }
                                else
                                {
                                    foreach (var p in padecimientos)
                                    {
                                        table.Cell().Text(fecha.ToShortDateString());
                                        table.Cell().Text(p.Padecimiento?.Nombre ?? "N/D");
                                        table.Cell().Text(p.Severidad ?? "-");
                                        table.Cell().Text(historial.Peso.ToString("0.##"));
                                        table.Cell().Text(historial.IndiceMasaCorporal.ToString("0.##"));
                                    }
                                }
                            });

                            content.Item().PaddingBottom(15);
                        }
                    });

                    page.Footer().AlignCenter().Text($"Generado por PowerVital | {DateTime.Now:dd/MM/yyyy}");
                });
            });

            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", "historial_paciente.pdf");
        }






        [HttpGet("cliente/{id}/estado-actual")]
        public async Task<IActionResult> ObtenerEstadoActual(int id)
        {
            var historial = await _context.HistorialesSalud
                .Where(h => h.ClienteId == id)
                .OrderByDescending(h => h.Fecha)
                .Select(h => new {
                    h.Peso,
                    h.IndiceMasaCorporal,
                    h.Fecha,
                    Cliente = new
                    {
                        h.Cliente.Nombre,
                        h.Cliente.FechaNacimiento,
                        h.Cliente.Genero,
                        h.Cliente.Telefono,
                        h.Cliente.Email,
                        h.Cliente.Altura
                    },
                    // 🔁 Aquí corregimos: usamos los padecimientos actuales
                    Padecimientos = h.Cliente.PadecimientosClientes
                        .Select(pc => new {
                            Nombre = pc.Padecimiento.Nombre,
                            pc.Severidad
                        }).ToList()
                })
                .FirstOrDefaultAsync();

            if (historial == null)
                return NotFound();

            return Ok(historial);
        }




    }
}
