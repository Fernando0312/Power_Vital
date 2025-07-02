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
    this.guiaEjercicio = guiaEjercicio;
    this.dificultad = dificultad;
  }
}
