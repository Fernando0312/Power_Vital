//const API_BASE = "http://mi-api-powergym-2025.somee.com/api";
//const API_BASE = "http://localhost:7086/api";

const API_BASE = "https://proyecto-inegev2-1.onrender.com/api";


document.addEventListener("DOMContentLoaded", () => {
  const clienteId = sessionStorage.getItem("clienteId");

  if (!clienteId) {
    alert("Cliente no identificado. Por favor, inicie sesión.");
    window.location.href = '../../View/Login/Login.html';
    return;
  }

  console.log(`🔍 Cliente ID obtenido: ${clienteId}`);

  if (document.getElementById('tablaRutinas')) {
    cargarRutinasCliente(clienteId);
  } else if (document.getElementById('nombreCompleto')) {
    cargarHistorialMedico(clienteId);
  } else if (document.getElementById('pdfCanvas')) {
    generarPDFHistorial();
  }
});

// RUTINAS
async function cargarRutinasCliente(clienteId) {
  mostrarCargando(true);
  try {
    const datosCliente = await obtenerDatosCliente(clienteId);
    
    // Guardar datos del cliente en sessionStorage
    if (datosCliente) {
      sessionStorage.setItem('datosCliente', JSON.stringify(datosCliente));
      console.log('✅ Datos del cliente guardados en sessionStorage');
    }
    
    const endpoint = `${API_BASE}/Rutina/obtenerRutinasPorCliente/${clienteId}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const rutinas = await response.json();
    if (!rutinas || rutinas.length === 0) {
      mostrarSinRutinas();
      return;
    }

    // Enriquecer rutinas con nombre del entrenador
    const rutinasConEntrenador = rutinas.map(rutina => ({
      ...rutina,
      NombreEntrenador: datosCliente?.NombreEntrenador || datosCliente?.NombreInstructor || 'Entrenador Asignado'
    }));

    // IMPORTANTE: Guardar las rutinas en sessionStorage
    sessionStorage.setItem('rutinasCliente', JSON.stringify(rutinasConEntrenador));
    console.log('✅ Rutinas guardadas en sessionStorage:', rutinasConEntrenador.length);

    mostrarRutinas(rutinasConEntrenador);
    actualizarContadorRutinas(rutinasConEntrenador);
  } catch (error) {
    console.error('Error al cargar rutinas:', error);
    mostrarError('No se pudieron cargar las rutinas.');
  } finally {
    mostrarCargando(false);
  }
}

async function obtenerDatosCliente(clienteId) {
  const endpoints = [
    `${API_BASE}/Cliente/obtenerClientePorId/${clienteId}`,
    `${API_BASE}/Cliente/${clienteId}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        const cliente = data.Cliente || data;
        
        // Si encontramos el nombre del entrenador, guardarlo
        if (cliente.NombreEntrenador || cliente.NombreInstructor) {
          console.log('✅ Entrenador encontrado:', cliente.NombreEntrenador || cliente.NombreInstructor);
        }
        
        return cliente;
      }
    } catch (error) {
      console.log(`Error en ${endpoint}:`, error.message);
    }
  }
  return null;
}

function mostrarRutinas(rutinas) {
  const tbody = document.getElementById('tablaRutinas');
  
  tbody.innerHTML = rutinas.map((rutina, index) => {
    const totalEjercicios = rutina.Ejercicios ? rutina.Ejercicios.length : 0;
    const musculosUnicos = obtenerMusculosUnicos(rutina.Ejercicios || []);
    const duracion = calcularDuracionRutina(rutina.FechaInicio, rutina.FechaFin);
    
    // Usar el nombre del entrenador que viene enriquecido desde los datos del cliente
    const nombreEntrenador = rutina.NombreEntrenador || 'Entrenador Asignado';
    
    return `
      <tr class="rutina-row" style="cursor: pointer;" onclick="abrirDetalleRutina(${rutina.IdRutina}, ${index + 1})">
        <td class="text-center">
          <span class="fw-bold">${nombreEntrenador}</span>
        </td>
        <td>
          <div>
            <span class="fw-bold text-primary">Rutina Completa #${index + 1}</span>
            <br>
            <small class="text-muted">${totalEjercicios} ejercicios incluidos</small>
          </div>
        </td>
        <td class="text-center">
          <small class="text-muted">${musculosUnicos}</small>
        </td>
        <td class="text-center">
          <span class="badge bg-primary fs-6"># ${index + 1}</span>
        </td>
        <td class="small">
          <div style="max-width: 200px;">
            <strong>Período:</strong><br>
            <i class="fas fa-calendar"></i> ${formatearFechaRutina(rutina.FechaInicio)} - ${formatearFechaRutina(rutina.FechaFin)}
            <br><strong>Duración:</strong> ${duracion}
            <br><strong>Ejercicios:</strong> ${totalEjercicios}
          </div>
        </td>
        <td class="text-center">
          <span class="fw-bold text-success fs-5">${totalEjercicios}</span>
          <br><small class="text-muted">ejercicios</small>
        </td>
        <td class="text-center">
          <button class="btn btn-ver-detalle" onclick="event.stopPropagation(); abrirDetalleRutina(${rutina.IdRutina}, ${index + 1})">
            <i class="fas fa-eye"></i> Ver Detalle
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Agregar efecto hover
  const filas = document.querySelectorAll('.rutina-row');
  filas.forEach(fila => {
    fila.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#f8f9fa';
    });
    fila.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '';
    });
  });
}

function abrirDetalleRutina(idRutina, numeroRutina) {
  // Verificar que los datos estén guardados
  const rutinasGuardadas = sessionStorage.getItem('rutinasCliente');
  const datosCliente = sessionStorage.getItem('datosCliente');
  
  if (!rutinasGuardadas) {
    console.error('❌ No se encontraron rutinas guardadas en sessionStorage');
    alert('Error: No se encontraron datos de las rutinas. Por favor, recargue la página.');
    return;
  }
  
  // Guardar ID y número de rutina seleccionada
  sessionStorage.setItem('rutinaSeleccionadaId', idRutina);
  sessionStorage.setItem('rutinaSeleccionadaNumero', numeroRutina);
  
  console.log('✅ Navegando a detalle de rutina:', {
    idRutina,
    numeroRutina,
    hayRutinas: !!rutinasGuardadas,
    hayDatosCliente: !!datosCliente
  });
  
  // Navegar a la página de detalle
  window.location.href = '../../View/Cliente/DetalleRutina.html';
}

function obtenerMusculosUnicos(ejercicios) {
  if (!ejercicios || ejercicios.length === 0) return 'Sin ejercicios';
  
  const musculos = [...new Set(ejercicios.map(ej => ej.AreaMuscular))];
  if (musculos.length <= 2) {
    return musculos.join(', ');
  }
  return `${musculos.slice(0, 2).join(', ')} +${musculos.length - 2}`;
}

function calcularDuracionRutina(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diferencia = fin - inicio;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  
  if (dias <= 7) return `${dias} día${dias !== 1 ? 's' : ''}`;
  if (dias <= 30) return `${Math.ceil(dias / 7)} semana${Math.ceil(dias / 7) !== 1 ? 's' : ''}`;
  return `${Math.ceil(dias / 30)} mes${Math.ceil(dias / 30) !== 1 ? 'es' : ''}`;
}

function formatearFechaRutina(fechaISO) {
  if (!fechaISO) return '';
  
  try {
    const date = new Date(fechaISO);
    return date.toLocaleDateString("es-CR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return fechaISO;
  }
}

function mostrarSinRutinas() {
  const tbody = document.getElementById('tablaRutinas');
  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 2rem;">
        <i class="fas fa-info-circle fa-3x text-muted mb-3 d-block"></i>
        <h5>No tienes rutinas asignadas</h5>
        <p class="text-muted">Contacta a tu entrenador para que te asigne una rutina de ejercicios.</p>
      </td>
    </tr>
  `;
}

function mostrarCargando(mostrar) {
  const tbody = document.getElementById('tablaRutinas');
  if (mostrar && tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando rutinas...</p>
        </td>
      </tr>
    `;
  }
}

function mostrarError(mensaje) {
  const tbody = document.getElementById('tablaRutinas');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem;">
          <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3 d-block"></i>
          <h5 class="text-danger">${mensaje}</h5>
          <button class="btn btn-primary mt-3" onclick="location.reload()">
            <i class="fas fa-redo"></i> Reintentar
          </button>
        </td>
      </tr>
    `;
  }
}

function actualizarContadorRutinas(rutinas) {
  const contador = document.getElementById('totalRutinas');
  if (contador) {
    contador.textContent = `${rutinas.length} rutina${rutinas.length !== 1 ? 's' : ''} disponible${rutinas.length !== 1 ? 's' : ''}`;
  }
}

// Función para descargar todas las rutinas (opcional)
function descargarTodasLasRutinas() {
  const rutinas = sessionStorage.getItem('rutinasCliente');
  if (!rutinas) {
    alert('No hay rutinas disponibles para descargar.');
    return;
  }
  
  // Aquí puedes implementar la lógica para generar un PDF con todas las rutinas
  alert('Función en desarrollo. Por favor, descarga cada rutina individualmente.');
}

// HISTORIAL MÉDICO
async function cargarHistorialMedico(clienteId) {
  const padecimientos = document.getElementById('padecimientos');
  if (padecimientos) {
    padecimientos.textContent = 'Cargando información...';
  }

  try {
    const datosCliente = await obtenerDatosClienteHistorial(clienteId);
    if (datosCliente) {
      mostrarDatosClienteSimple(datosCliente);
    } else {
      throw new Error('No se pudo obtener información del cliente');
    }
  } catch (error) {
    console.error('Error al cargar historial médico:', error);
    mostrarErrorHistorial('No se pudo cargar el historial médico.');
  }
}

async function obtenerDatosClienteHistorial(clienteId) {
  const endpoints = [
    `${API_BASE}/Cliente/obtenerClientePorId/${clienteId}`,
    `${API_BASE}/PadecimientoHistorial/historialPadecimientoPorId/${clienteId}`
  ];

  let datosCliente = null;
  let padecimientosData = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (endpoint.includes('obtenerClientePorId')) {
          datosCliente = data;
        }
        
        if (endpoint.includes('historialPadecimientoPorId')) {
          padecimientosData = data;
        }
      }
    } catch (error) {
      console.log(`Error en ${endpoint}:`, error.message);
    }
  }

  if (datosCliente && padecimientosData) {
    datosCliente.PadecimientosDetalle = padecimientosData;
  }

  return datosCliente;
}

function mostrarDatosClienteSimple(data) {
  // Datos básicos
  const campos = {
    'nombreCompleto': data.Nombre || 'No disponible',
    'fechaNacimiento': formatearFecha(data.FechaNacimiento) || 'No disponible',
    'genero': data.Genero || 'No especificado',
    'telefono': data.Telefono || 'No disponible',
    'correo': data.Email || 'No disponible',
    'altura': data.Altura ? `${data.Altura} m` : 'No registrada',
    'peso': data.Peso ? `${data.Peso} kg` : 'No registrado',
    'imc': calcularIMC(data.Peso, data.Altura) || 'No calculable'
  };

  Object.keys(campos).forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = campos[id];
    }
  });

  // Padecimientos únicos agrupados por fecha
  let padecimientos = 'Sin registros medicos disponibles';
  
  if (data.PadecimientosDetalle && data.PadecimientosDetalle.length > 0) {
    // Agrupar por fecha, evitando duplicados por fecha
    const registrosPorFecha = {};
    
    data.PadecimientosDetalle.forEach(p => {
      if (p.Fecha && p.NombrePadecimiento) {
        const fecha = formatearFecha(p.Fecha);
        
        if (!registrosPorFecha[fecha]) {
          registrosPorFecha[fecha] = {
            fecha: fecha,
            fechaOriginal: new Date(p.Fecha),
            padecimientos: new Map() // Usar Map para evitar duplicados
          };
        }
        
        // Solo agregar si no existe ya este padecimiento en esta fecha
        registrosPorFecha[fecha].padecimientos.set(p.NombrePadecimiento, {
          nombre: p.NombrePadecimiento,
          severidad: p.Severidad
        });
      }
    });
    
    // Convertir a array y ordenar por fecha (más reciente primero)
    const registrosArray = Object.values(registrosPorFecha);
    registrosArray.sort((a, b) => b.fechaOriginal - a.fechaOriginal);
    
    if (registrosArray.length > 0) {
      const textoRegistros = registrosArray.map(registro => {
        const padecimientosArray = Array.from(registro.padecimientos.values());
        const padecimientosTexto = padecimientosArray
          .map(p => p.nombre + ' (' + p.severidad + ')')
          .join(', ');
        
        return 'FECHA: ' + registro.fecha + '\n' + padecimientosTexto;
      }).join('\n\n');
      
      padecimientos = textoRegistros;
    }
  }

  const padecimientosElement = document.getElementById('padecimientos');
  if (padecimientosElement) {
    // Usar textContent en lugar de innerHTML para evitar problemas con caracteres especiales
    padecimientosElement.style.whiteSpace = 'pre-line';
    padecimientosElement.textContent = padecimientos;
  }
}

function mostrarErrorHistorial(mensaje) {
  const padecimientosElement = document.getElementById('padecimientos');
  if (padecimientosElement) {
    padecimientosElement.textContent = mensaje;
  }
}

// GENERAR PDF
async function generarPDFHistorial() {
  const loadingElement = document.getElementById('loadingPDF');
  const canvasElement = document.getElementById('pdfCanvas');
  const btnDescargar = document.getElementById('btnDescargarPDF');
  const btnCorreo = document.getElementById('btnEnviarCorreo');
  
  if (loadingElement) loadingElement.style.display = 'block';
  if (canvasElement) canvasElement.style.display = 'none';
  if (btnDescargar) btnDescargar.disabled = true;
  if (btnCorreo) btnCorreo.disabled = true;
  
  try {
    const clienteId = sessionStorage.getItem("clienteId");
    if (!clienteId) {
      throw new Error("No se encontró información del cliente");
    }

    console.log('📄 Obteniendo datos del cliente...');
    const datosCliente = await obtenerDatosClienteHistorial(clienteId);
    if (!datosCliente) {
      throw new Error("No se pudieron obtener los datos del cliente");
    }

    // Actualizar nombre en la UI
    const nombreClienteElement = document.getElementById('nombreCliente');
    if (nombreClienteElement) {
      nombreClienteElement.textContent = datosCliente.Nombre || 'Cliente';
    }

    console.log('📄 Generando PDF...');
    const pdfBlob = await crearPDFHistorial(datosCliente);
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (canvasElement) canvasElement.style.display = 'block';
    
    console.log('📄 Mostrando PDF en canvas...');
    await mostrarPDFEnCanvas(pdfBlob);
    
    // Configurar y habilitar botones
    configurarBotonDescarga(pdfBlob, datosCliente.Nombre || 'Cliente');
    
    console.log('✅ PDF generado exitosamente');

  } catch (error) {
    console.error('Error al generar PDF:', error);
    if (loadingElement) loadingElement.style.display = 'none';
    alert('Error al generar el PDF: ' + error.message);
  }
}

async function crearPDFHistorial(datos) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 20;
    let y = 30;

    // Título principal
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL MÉDICO DEL PACIENTE', 105, y, { align: 'center' });
    y += 25;

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(margin, y, 190, y);
    y += 15;

    // Sección datos personales
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('DATOS PERSONALES', margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    // Preparar datos asegurando que sean strings
    const datosPersonales = [
      ['Nombre:', String(datos.Nombre || 'No disponible')],
      ['Fecha de nacimiento:', String(formatearFecha(datos.FechaNacimiento) || 'No disponible')],
      ['Género:', String(datos.Genero || 'No especificado')],
      ['Teléfono:', String(datos.Telefono || 'No disponible')],
      ['Correo:', String(datos.Email || 'No disponible')],
      ['Altura:', String(datos.Altura ? `${datos.Altura} m` : 'No registrada')],
      ['Peso:', String(datos.Peso ? `${datos.Peso} kg` : 'No registrado')],
      ['IMC:', String(calcularIMC(datos.Peso, datos.Altura) || 'No calculable')]
    ];

    datosPersonales.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, margin, y);
      doc.setFont(undefined, 'normal');
      doc.text(value, margin + 60, y);
      y += 8;
    });

    y += 15;

    // Sección padecimientos únicos agrupados por fecha
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL MEDICO POR FECHAS', margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    let textoPadecimientos = 'Sin registros medicos disponibles en el historial.';
    
    if (datos.PadecimientosDetalle && Array.isArray(datos.PadecimientosDetalle) && datos.PadecimientosDetalle.length > 0) {
      // Agrupar por fecha, evitando duplicados
      const registrosPorFecha = {};
      
      datos.PadecimientosDetalle.forEach(p => {
        if (p.Fecha && p.NombrePadecimiento) {
          const fecha = formatearFecha(p.Fecha);
          
          if (!registrosPorFecha[fecha]) {
            registrosPorFecha[fecha] = {
              fecha: fecha,
              fechaOriginal: new Date(p.Fecha),
              padecimientos: new Map() // Usar Map para evitar duplicados
            };
          }
          
          // Solo agregar si no existe ya este padecimiento en esta fecha
          registrosPorFecha[fecha].padecimientos.set(p.NombrePadecimiento, {
            nombre: p.NombrePadecimiento,
            severidad: p.Severidad
          });
        }
      });
      
      // Convertir a array y ordenar por fecha (más reciente primero)
      const registrosArray = Object.values(registrosPorFecha);
      registrosArray.sort((a, b) => b.fechaOriginal - a.fechaOriginal);
      
      if (registrosArray.length > 0) {
        const lineasRegistros = [];
        
        registrosArray.forEach(registro => {
          const padecimientosArray = Array.from(registro.padecimientos.values());
          
          lineasRegistros.push('FECHA: ' + registro.fecha);
          lineasRegistros.push('______________________________');
          
          padecimientosArray.forEach(p => {
            lineasRegistros.push('• ' + p.nombre + ' - Severidad: ' + p.severidad);
          });
          
          lineasRegistros.push(''); // Línea en blanco entre fechas
        });
        
        textoPadecimientos = lineasRegistros.join('\n');
      }
    }

    // Dividir texto en líneas para el PDF
    const lineas = doc.splitTextToSize(textoPadecimientos, 170);
    doc.text(lineas, margin, y);
    y += (lineas.length * 6) + 20;

    // Verificar si necesitamos una nueva página
    if (y > 250) {
      doc.addPage();
      y = 30;
    }

    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    const fechaActual = new Date().toLocaleString('es-CR');
    doc.text(`Reporte generado el: ${fechaActual}`, margin, y);
    doc.text('PowerVital - Sistema de Gestión de Gimnasio', margin, y + 6);

    // Nota informativa
    y += 15;
    doc.setFontSize(8);
    doc.text('Nota: Este historial muestra el estado completo de padecimientos en cada fecha de consulta.', margin, y);
    doc.text('Cada entrada representa todos los padecimientos activos en esa fecha especifica.', margin, y + 4);
    doc.text('Consulte con su medico para interpretacion profesional del historial.', margin, y + 8);

    // Retornar como blob
    return doc.output('blob');

  } catch (error) {
    console.error('Error al crear PDF:', error);
    throw new Error('Error al generar el documento PDF');
  }
}

async function mostrarPDFEnCanvas(pdfBlob) {
  try {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    
    // Convertir blob a array buffer para PDF.js
    const arrayBuffer = await pdfBlob.arrayBuffer();
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: 1.5 });
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    console.log('✅ PDF mostrado en canvas exitosamente');

  } catch (error) {
    console.error('Error al mostrar PDF:', error);
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 400;
    
    context.fillStyle = '#f8f9fa';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#495057';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText('Vista previa del PDF generado', 400, 180);
    context.fillText('El PDF se ha generado correctamente', 400, 210);
    context.fillText('Haga clic en "Descargar PDF" para obtener el archivo', 400, 240);
  }
}

function configurarBotonDescarga(pdfBlob, nombreCliente) {
  const btnDescargar = document.getElementById('btnDescargarPDF');
  const btnCorreo = document.getElementById('btnEnviarCorreo');
  
  // Habilitar botones
  if (btnDescargar) {
    btnDescargar.disabled = false;
    btnDescargar.onclick = function() {
      try {
        // Crear URL para el blob
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Historial_Medico_${nombreCliente.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Agregar al DOM, hacer clic y remover
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Limpiar URL después de un breve delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ PDF descargado exitosamente');
      } catch (error) {
        console.error('❌ Error al descargar PDF:', error);
        alert('Error al descargar el PDF. Por favor, intente nuevamente.');
      }
    };
  }

  if (btnCorreo) {
    btnCorreo.disabled = false;
    btnCorreo.onclick = function() {
      // Crear enlace mailto con información
      const asunto = encodeURIComponent(`Historial Médico - ${nombreCliente}`);
      const cuerpo = encodeURIComponent(`Adjunto encontrará el historial médico de ${nombreCliente}.\n\nGenerado el: ${new Date().toLocaleString('es-CR')}\n\nPowerVital - Sistema de Gestión de Gimnasio`);
      const mailtoLink = `mailto:?subject=${asunto}&body=${cuerpo}`;
      
      // Abrir cliente de correo
      window.location.href = mailtoLink;
      
      // Mostrar instrucciones al usuario
      setTimeout(() => {
        alert('Se ha abierto su cliente de correo. Por favor, adjunte manualmente el archivo PDF descargado.');
      }, 500);
    };
  }
}

// UTILIDADES
function calcularIMC(peso, altura) {
  if (!peso || !altura || peso <= 0 || altura <= 0) return null;
  const alturaMetros = altura > 10 ? altura / 100 : altura;
  const imc = peso / (alturaMetros * alturaMetros);
  return `${imc.toFixed(1)} (${clasificarIMC(imc)})`;
}

function clasificarIMC(imc) {
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidad';
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return null;
  try {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return fechaISO;
  }
}

// Hacer la función disponible globalmente
window.descargarTodasLasRutinas = descargarTodasLasRutinas;