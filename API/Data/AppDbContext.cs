using Microsoft.EntityFrameworkCore;
using PowerVital.Models;

namespace PowerVital.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Administrador> Administradores { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Entrenador> Entrenadores { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Ejercicio> Ejercicios { get; set; }
        public DbSet<Padecimiento> Padecimientos { get; set; }
        public DbSet<Rutina> Rutinas { get; set; }
        public DbSet<EjercicioRutina> EjercicioRutina { get; set; }
        public DbSet<PadecimientoCliente> PadecimientoCliente { get; set; }
        public DbSet<HistorialSalud> HistorialesSalud { get; set; }
        public DbSet<PadecimientoHistorial> PadecimientosHistorial { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Herencia TPH para Usuario
            modelBuilder.Entity<Usuario>()
                .HasDiscriminator<string>("Rol")
                .HasValue<Administrador>("Admin")
                .HasValue<Entrenador>("Entrenador")
                .HasValue<Cliente>("Cliente");

            // RELACIÓN Cliente - Entrenador
            modelBuilder.Entity<Cliente>()
                .HasOne(c => c.Entrenador)
                .WithMany(e => e.Clientes)
                .HasForeignKey(c => c.EntrenadorId)
                .OnDelete(DeleteBehavior.NoAction);

            // RELACIÓN Rutina -> Cliente (CORRECTO)
            modelBuilder.Entity<Rutina>()
                .HasOne(r => r.Cliente)
                .WithMany(c => c.Rutinas)
                .HasForeignKey(r => r.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);

            // RELACIÓN EjercicioRutina
            modelBuilder.Entity<EjercicioRutina>()
                .HasKey(er => new { er.IdRutina, er.IdEjercicio });

            modelBuilder.Entity<EjercicioRutina>()
                .HasOne(er => er.Rutina)
                .WithMany(r => r.EjerciciosRutina)
                .HasForeignKey(er => er.IdRutina);

            modelBuilder.Entity<EjercicioRutina>()
                .HasOne(er => er.Ejercicio)
                .WithMany() // Sin navegación inversa en Ejercicio
                .HasForeignKey(er => er.IdEjercicio);

            // RELACIÓN PadecimientoCliente
            modelBuilder.Entity<PadecimientoCliente>()
                .HasKey(pc => new { pc.IdCliente, pc.IdPadecimiento });

            modelBuilder.Entity<PadecimientoCliente>()
                .HasOne(pc => pc.Cliente)
                .WithMany(c => c.PadecimientosClientes)
                .HasForeignKey(pc => pc.IdCliente)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PadecimientoCliente>()
                .HasOne(pc => pc.Padecimiento)
                .WithMany(p => p.PadecimientosClientes)
                .HasForeignKey(pc => pc.IdPadecimiento)
                .OnDelete(DeleteBehavior.Cascade);

            // RELACIÓN HistorialSalud -> Cliente
            modelBuilder.Entity<HistorialSalud>()
                .HasOne(h => h.Cliente)
                .WithMany(c => c.HistorialesSalud)
                .HasForeignKey(h => h.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);

            // RELACIÓN PadecimientoHistorial -> HistorialSalud
            modelBuilder.Entity<PadecimientoHistorial>()
                .HasOne(ph => ph.HistorialSalud)
                .WithMany(h => h.Padecimientos)
                .HasForeignKey(ph => ph.HistorialSaludId)
                .OnDelete(DeleteBehavior.Cascade);

            // RELACIÓN PadecimientoHistorial -> Padecimiento
            modelBuilder.Entity<PadecimientoHistorial>()
                .HasOne(ph => ph.Padecimiento)
                .WithMany(p => p.PadecimientosHistorial)
                .HasForeignKey(ph => ph.PadecimientoId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
