# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Restaurar dependencias
RUN dotnet restore

# Compilar y publicar en modo Release
RUN dotnet publish -c Release -o out

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copiar desde la etapa de build
COPY --from=build /app/out .

# Puerto de escucha
EXPOSE 80

# Ejecutar el proyecto
ENTRYPOINT ["dotnet", "PowerVital.dll"]
