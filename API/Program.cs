using PowerVital.Data;
using Microsoft.EntityFrameworkCore;
using PowerVital.Models;
using PowerVital.Models; // <-- Necesario para EmailService


var builder = WebApplication.CreateBuilder(args);

// 👉 Leer la clave OpenAI
string openAiKey = builder.Configuration["OpenAI:ApiKey"];
Console.WriteLine("🔑 Clave OpenAI cargada: " + (string.IsNullOrEmpty(openAiKey) ? "NO" : "SÍ"));

// 👉 Configuración CORS (permitir localhost y dominio en producción)
var allowedOrigins = new[] {
    "http://127.0.0.1:5501", // tu front en local
    "http://127.0.0.1:5500", // tu front en local
    "http://mi-api-powergym-2025.somee.com", // la propia API (por si usas front ahí mismo)
    "http://tu-front.somee.com", // <-- cuando subas el front
     "https://powervital.onrender.com",
     "https://www.powervital.onrender.com" // por si se accede con www también
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// 👉 Servicios
builder.Services.AddScoped<EmailService>();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

var app = builder.Build();

// 👉 Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSwagger();
app.UseSwaggerUI();

// IMPORTANTE: CORS debe ir antes de Authorization
app.UseCors("AllowSpecificOrigins");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
