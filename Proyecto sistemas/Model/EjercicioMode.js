export class EjercicioModel {
  constructor(
    idEjercicio,
    nombre,
    descripcion,
    areaMuscular,
    repeticiones,
    guiaEjercicio,
    dificultad
  ) {
    this.idEjercicio = idEjercicio;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.areaMuscular = areaMuscular;
    this.repeticiones = repeticiones;
    this.guiaEjercicio = guiaEjercicio; // dirección/URL esperada por la API
    this.dificultad = dificultad;
    // Si necesitas asociar rutinas, puedes agregarlo después
    // this.ejerciciosRutina = ejerciciosRutina;
  }
}
