// Modelo de Cliente para el sistema
export class ClienteModel {
  /**
   * @param {number} idUsuario - ID del cliente (puede ser 0 al crear)
   * @param {string} nombre - Nombre del cliente
   * @param {string} clave - Clave o contraseña
   * @param {string} email - Email del cliente
   * @param {string} genero - Género del cliente
   * @param {number|string} telefono - Teléfono (se convierte a int)
   * @param {string} fechaNacimiento - Fecha de nacimiento (YYYY-MM-DD)
   * @param {number|string} altura - Altura (se convierte a float)
   * @param {number|string} peso - Peso (se convierte a float)
   * @param {boolean|string} estadoPago - Estado de pago (true/false o string)
   * @param {number} entrenadorId - ID del entrenador asignado
   * @param {Array} padecimientos - Array de ids de padecimientos
   */
  constructor(
    idUsuario,
    nombre,
    clave,
    email,
    genero,
    telefono,
    fechaNacimiento,
    altura,
    peso,
    estadoPago,
    entrenadorId,
    padecimientos
  ) {
    this.idUsuario = idUsuario;
    this.nombre = nombre;
    this.clave = clave;
    this.email = email;
    this.genero = genero;
    this.rol = "Cliente";
    this.telefono = parseInt(telefono);
    this.fechaNacimiento = fechaNacimiento;
    this.altura = parseFloat(altura);
    this.peso = parseFloat(peso);
    this.estadoPago = estadoPago; // Puede ser boolean o string según backend
    this.entrenadorId = entrenadorId;
    this.padecimientos = padecimientos;
  }
}
