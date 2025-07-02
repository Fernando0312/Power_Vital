using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PowerVital.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ejercicios",
                columns: table => new
                {
                    IdEjercicio = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AreaMuscular = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AreaMuscularAfectada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Repeticiones = table.Column<int>(type: "int", nullable: false),
                    GuiaEjercicio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Dificultad = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ejercicios", x => x.IdEjercicio);
                });

            migrationBuilder.CreateTable(
                name: "Padecimientos",
                columns: table => new
                {
                    IdPadecimiento = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AreaMuscularAfectada = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Padecimientos", x => x.IdPadecimiento);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Clave = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false),
                    Telefono = table.Column<int>(type: "int", nullable: false),
                    titulacion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaNacimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Genero = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Altura = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Peso = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EstadoPago = table.Column<bool>(type: "bit", nullable: true),
                    EntrenadorId = table.Column<int>(type: "int", nullable: true),
                    FormacionAcademica = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.IdUsuario);
                    table.ForeignKey(
                        name: "FK_Usuarios_Usuarios_EntrenadorId",
                        column: x => x.EntrenadorId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario");
                });

            migrationBuilder.CreateTable(
                name: "HistorialesSalud",
                columns: table => new
                {
                    IdHistorialSalud = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClienteId = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Peso = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IndiceMasaCorporal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistorialesSalud", x => x.IdHistorialSalud);
                    table.ForeignKey(
                        name: "FK_HistorialesSalud_Usuarios_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PadecimientoCliente",
                columns: table => new
                {
                    IdCliente = table.Column<int>(type: "int", nullable: false),
                    IdPadecimiento = table.Column<int>(type: "int", nullable: false),
                    Severidad = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PadecimientoCliente", x => new { x.IdCliente, x.IdPadecimiento });
                    table.ForeignKey(
                        name: "FK_PadecimientoCliente_Padecimientos_IdPadecimiento",
                        column: x => x.IdPadecimiento,
                        principalTable: "Padecimientos",
                        principalColumn: "IdPadecimiento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PadecimientoCliente_Usuarios_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rutinas",
                columns: table => new
                {
                    IdRutina = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IdCliente = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rutinas", x => x.IdRutina);
                    table.ForeignKey(
                        name: "FK_Rutinas_Usuarios_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PadecimientosHistorial",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HistorialSaludId = table.Column<int>(type: "int", nullable: false),
                    PadecimientoId = table.Column<int>(type: "int", nullable: true),
                    Severidad = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PadecimientosHistorial", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PadecimientosHistorial_HistorialesSalud_HistorialSaludId",
                        column: x => x.HistorialSaludId,
                        principalTable: "HistorialesSalud",
                        principalColumn: "IdHistorialSalud",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PadecimientosHistorial_Padecimientos_PadecimientoId",
                        column: x => x.PadecimientoId,
                        principalTable: "Padecimientos",
                        principalColumn: "IdPadecimiento",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EjercicioRutina",
                columns: table => new
                {
                    IdRutina = table.Column<int>(type: "int", nullable: false),
                    IdEjercicio = table.Column<int>(type: "int", nullable: false),
                    Comentario = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    NombreEjercicio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DescripcionEjercicio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AreaMuscular = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AreaMuscularAfectada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Repeticiones = table.Column<int>(type: "int", nullable: false),
                    GuiaEjercicio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Dificultad = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EjercicioRutina", x => new { x.IdRutina, x.IdEjercicio });
                    table.ForeignKey(
                        name: "FK_EjercicioRutina_Ejercicios_IdEjercicio",
                        column: x => x.IdEjercicio,
                        principalTable: "Ejercicios",
                        principalColumn: "IdEjercicio",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EjercicioRutina_Rutinas_IdRutina",
                        column: x => x.IdRutina,
                        principalTable: "Rutinas",
                        principalColumn: "IdRutina",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EjercicioRutina_IdEjercicio",
                table: "EjercicioRutina",
                column: "IdEjercicio");

            migrationBuilder.CreateIndex(
                name: "IX_HistorialesSalud_ClienteId",
                table: "HistorialesSalud",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_PadecimientoCliente_IdPadecimiento",
                table: "PadecimientoCliente",
                column: "IdPadecimiento");

            migrationBuilder.CreateIndex(
                name: "IX_PadecimientosHistorial_HistorialSaludId",
                table: "PadecimientosHistorial",
                column: "HistorialSaludId");

            migrationBuilder.CreateIndex(
                name: "IX_PadecimientosHistorial_PadecimientoId",
                table: "PadecimientosHistorial",
                column: "PadecimientoId");

            migrationBuilder.CreateIndex(
                name: "IX_Rutinas_IdCliente",
                table: "Rutinas",
                column: "IdCliente");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_EntrenadorId",
                table: "Usuarios",
                column: "EntrenadorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EjercicioRutina");

            migrationBuilder.DropTable(
                name: "PadecimientoCliente");

            migrationBuilder.DropTable(
                name: "PadecimientosHistorial");

            migrationBuilder.DropTable(
                name: "Ejercicios");

            migrationBuilder.DropTable(
                name: "Rutinas");

            migrationBuilder.DropTable(
                name: "HistorialesSalud");

            migrationBuilder.DropTable(
                name: "Padecimientos");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
