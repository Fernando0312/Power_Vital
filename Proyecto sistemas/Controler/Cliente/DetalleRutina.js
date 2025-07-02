// ✅ Se ejecuta una sola vez al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const rutinaId = sessionStorage.getItem("rutinaSeleccionadaId");
  const rutinaNumero = sessionStorage.getItem("rutinaSeleccionadaNumero");
  const rutinasData = sessionStorage.getItem("rutinasCliente");
  const datosCliente = sessionStorage.getItem("datosCliente");

  if (!rutinaId || !rutinasData) {
    alert("Error: No se encontró información de la rutina.");
  window.location.href = '../../View/Cliente/RutinaCliente.html';
    return;
  }

  const rutinas = JSON.parse(rutinasData);
  const rutinaSeleccionada = rutinas.find(r => r.IdRutina == rutinaId);
  let cliente = datosCliente ? JSON.parse(datosCliente) : null;

  // Si no hay datos del cliente guardados, intentar obtenerlos nuevamente
  if (!cliente) {
    console.log('⚠️ No hay datos del cliente guardados, intentando obtener...');
    obtenerDatosClienteDirecto(sessionStorage.getItem("clienteId"))
      .then(datosObtenidos => {
        if (datosObtenidos) {
          sessionStorage.setItem('datosCliente', JSON.stringify(datosObtenidos));
          cliente = datosObtenidos;
          console.log('✅ Datos del cliente obtenidos directamente:', cliente);
          // Re-mostrar la página con los datos actualizados
          mostrarDetalleRutina(rutinaSeleccionada, rutinaNumero, cliente);
        }
      });
  }

  if (!rutinaSeleccionada) {
    alert("Error: Rutina no encontrada.");
   window.location.href = '../../View/Cliente/RutinaCliente.html';
    return;
  }

  console.log('🔍 Rutina seleccionada:', rutinaSeleccionada);
  console.log('🔍 Datos del cliente:', cliente);
  mostrarDetalleRutina(rutinaSeleccionada, rutinaNumero, cliente);
});

// 🔹 OBTENER DATOS DEL CLIENTE DIRECTAMENTE (función auxiliar)
async function obtenerDatosClienteDirecto(clienteId) {
 //const API_BASE = "http://mi-api-powergym-2025.somee.com/api";
  //const API_BASE = "http://localhost:7086/api";
const API_BASE = "https://proyecto-inegev2-1.onrender.com/api/Ejercicio";

  try {
    const endpoints = [
      `${API_BASE}/Cliente/obtenerClientePorId/${clienteId}`,
      `${API_BASE}/historialsalud/cliente/${clienteId}/estado-actual`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Obteniendo cliente desde: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data = await response.json();
          const cliente = data.Cliente || data;
          
          if (cliente.Nombre) {
            console.log('✅ Cliente obtenido:', cliente);
            return cliente;
          }
        }
      } catch (error) {
        console.log(`⚠️ Error en ${endpoint}:`, error.message);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo cliente:', error);
    return null;
  }
}

// 🔹 MOSTRAR DETALLE DE LA RUTINA
function mostrarDetalleRutina(rutina, numeroRutina, cliente) {
  const container = document.getElementById('contenedorDetalle');
  
  if (!container) {
    console.error('❌ No se encontró el contenedor');
    return;
  }

  const totalEjercicios = rutina.Ejercicios ? rutina.Ejercicios.length : 0;
  const duracionEstimada = totalEjercicios * 2.5; // 2.5 minutos por ejercicio
  
  // Buscar el nombre del entrenador en múltiples fuentes posibles
  const nombreEntrenador = rutina.NombreEntrenador || 
                           rutina.NombreInstructor || 
                           cliente?.NombreEntrenador || 
                           cliente?.NombreInstructor || 
                           'Entrenador Asignado';
                           
  const nombreCliente = cliente?.Nombre || 'Cliente';
  
  console.log('🔍 Datos para mostrar:');
  console.log('- Entrenador encontrado:', nombreEntrenador);
  console.log('- Cliente encontrado:', nombreCliente);
  console.log('- Rutina tiene entrenador:', rutina.NombreEntrenador);
  console.log('- Cliente tiene entrenador:', cliente?.NombreEntrenador);

  container.innerHTML = `
    <!-- Encabezado de la rutina -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card card-rutina border-primary">
          <div class="card-header encabezado-detalle-rutina text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <i class="fas fa-dumbbell"></i> Rutina #${numeroRutina}
                </h4>
                <small>Cliente: ${nombreCliente} | Entrenador: ${nombreEntrenador}</small>
              </div>
              <div class="text-end">
                <div class="badge bg-light text-dark fs-6">${totalEjercicios} ejercicios</div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-md-3">
                <i class="fas fa-calendar-start text-success fs-3"></i>
                <h6 class="mt-2">Inicio</h6>
                <p class="text-muted">${formatearFecha(rutina.FechaInicio)}</p>
              </div>
              <div class="col-md-3">
                <i class="fas fa-calendar-end text-danger fs-3"></i>
                <h6 class="mt-2">Fin</h6>
                <p class="text-muted">${formatearFecha(rutina.FechaFin)}</p>
              </div>
              <div class="col-md-3">
                <i class="fas fa-clock text-info fs-3"></i>
                <h6 class="mt-2">Duración</h6>
                <p class="text-muted">${Math.round(duracionEstimada)} min</p>
              </div>
              <div class="col-md-3">
                <i class="fas fa-muscle text-warning fs-3"></i>
                <h6 class="mt-2">Músculos</h6>
                <p class="text-muted">${obtenerMusculosUnicos(rutina.Ejercicios)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y título -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">
        <i class="fas fa-list-ol text-primary"></i> 
        Ejercicios de la Rutina
      </h5>
      <div>
        <button class="btn btn-danger me-2" onclick="descargarRutinaPDF()">
          <i class="fas fa-file-pdf"></i> Descargar PDF
        </button>
        <button class="btn btn-info" onclick="imprimirRutina()">
          <i class="fas fa-print"></i> Imprimir
        </button>
      </div>
    </div>

    <!-- Tabla de ejercicios -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th class="text-center" style="width: 60px;">#</th>
            <th><i class="fas fa-running"></i> Ejercicio</th>
            <th class="text-center"><i class="fas fa-bullseye"></i> Área</th>
            <th class="text-center"><i class="fas fa-repeat"></i> Reps</th>
            <th class="text-center"><i class="fas fa-signal"></i> Dificultad</th>
            <th class="text-center"><i class="fas fa-play-circle"></i> Video</th>
          </tr>
        </thead>
        <tbody>
          ${rutina.Ejercicios ? rutina.Ejercicios.map((ejercicio, index) => `
            <tr>
              <td class="text-center fw-bold text-primary fs-5">${index + 1}</td>
              <td>
                <div>
                  <strong class="text-dark">${ejercicio.NombreEjercicio}</strong>
                  <br>
                  <small class="text-muted">${ejercicio.DescripcionEjercicio}</small>
                  ${ejercicio.AreaMuscularAfectada ? 
                    `<br><small class="text-info"><i class="fas fa-crosshairs"></i> ${ejercicio.AreaMuscularAfectada}</small>` : 
                    ''
                  }
                  ${ejercicio.Comentario ? 
                    `<br><small class="text-warning"><i class="fas fa-comment"></i> ${ejercicio.Comentario}</small>` : 
                    ''
                  }
                </div>
              </td>
              <td class="text-center">
                <span class="badge bg-primary fs-6">${ejercicio.AreaMuscular}</span>
              </td>
              <td class="text-center">
                <span class="fw-bold text-success fs-4">${ejercicio.Repeticiones}</span>
              </td>
              <td class="text-center">
                <span class="badge ${getDificultadColor(ejercicio.Dificultad)} fs-6">${ejercicio.Dificultad}</span>
              </td>
              <td class="text-center">
                ${ejercicio.GuiaEjercicio ? 
                  `<button class="btn btn-sm btn-outline-danger" onclick="verVideo('${ejercicio.GuiaEjercicio}', '${ejercicio.NombreEjercicio}')">
                    <i class="fab fa-youtube"></i> Ver
                  </button>` : 
                  `<span class="text-muted"><i class="fas fa-video-slash"></i></span>`
                }
              </td>
            </tr>
          `).join('') : '<tr><td colspan="6" class="text-center">No hay ejercicios</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Resumen -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card bg-light">
          <div class="card-body">
            <h6><i class="fas fa-chart-bar text-primary"></i> Resumen de la Rutina</h6>
            <div class="row text-center">
              <div class="col-md-2">
                <strong>${totalEjercicios}</strong>
                <br><small class="text-muted">Total ejercicios</small>
              </div>
              <div class="col-md-2">
                <strong>${Math.round(duracionEstimada)} min</strong>
                <br><small class="text-muted">Duración estimada</small>
              </div>
              <div class="col-md-2">
                <strong>${contarDificultades(rutina.Ejercicios, 'Baja')}</strong>
                <br><small class="text-muted">Fáciles</small>
              </div>
              <div class="col-md-2">
                <strong>${contarDificultades(rutina.Ejercicios, 'Media')}</strong>
                <br><small class="text-muted">Medios</small>
              </div>
              <div class="col-md-2">
                <strong>${contarDificultades(rutina.Ejercicios, 'Alta')}</strong>
                <br><small class="text-muted">Difíciles</small>
              </div>
              <div class="col-md-2">
                <strong>${obtenerMusculosUnicosCount(rutina.Ejercicios)}</strong>
                <br><small class="text-muted">Grupos musculares</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de navegación -->
    <div class="d-flex justify-content-between mt-4">
      <button class="btn btn-secondary" onclick="window.location.href='../../View/Cliente/RutinaCliente.html'">
        <i class="fas fa-arrow-left"></i> Volver a Rutinas
      </button>
      <button class="btn btn-success" onclick="descargarRutinaPDF()">
        <i class="fas fa-download"></i> Descargar PDF Nuevamente
      </button>
    </div>
  `;
}

// 🔹 DESCARGAR RUTINA EN PDF
function descargarRutinaPDF() {
  const { jsPDF } = window.jspdf;
  const rutinaNumero = sessionStorage.getItem("rutinaSeleccionadaNumero");
  const clienteId = sessionStorage.getItem("clienteId");
  const datosCliente = sessionStorage.getItem("datosCliente");
  const cliente = datosCliente ? JSON.parse(datosCliente) : null;
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Título principal
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('PowerVital - Rutina de Ejercicios', 20, 20);
    
    // Información de la rutina y cliente
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Rutina #${rutinaNumero}`, 20, 35);
    pdf.text(`Cliente: ${cliente?.Nombre || 'N/A'} (ID: ${clienteId})`, 20, 45);
    
    // Buscar el nombre del entrenador de manera consistente
    const nombreEntrenadorPDF = cliente?.NombreEntrenador || 
                               cliente?.NombreInstructor || 
                               'Entrenador Asignado';
    
    pdf.text(`Entrenador: ${nombreEntrenadorPDF}`, 20, 55);
    pdf.text(`Fecha de descarga: ${new Date().toLocaleDateString('es-CR')}`, 20, 65);
    
    // Obtener datos de la rutina
    const rutinasData = JSON.parse(sessionStorage.getItem("rutinasCliente"));
    const rutinaId = sessionStorage.getItem("rutinaSeleccionadaId");
    const rutina = rutinasData.find(r => r.IdRutina == rutinaId);
    
    if (!rutina || !rutina.Ejercicios) {
      alert('Error: No se encontraron ejercicios para generar el PDF.');
      return;
    }

    // Información adicional de la rutina
    pdf.setFontSize(12);
    pdf.text(`Período: ${formatearFecha(rutina.FechaInicio)} - ${formatearFecha(rutina.FechaFin)}`, 20, 80);
    pdf.text(`Total de ejercicios: ${rutina.Ejercicios.length}`, 20, 90);
    pdf.text(`Duración estimada: ${Math.round(rutina.Ejercicios.length * 2.5)} minutos`, 20, 100);
    
    // Línea separadora
    pdf.line(20, 105, 190, 105);
    
    // Título de la tabla de ejercicios
    let yPosition = 115;
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Lista de Ejercicios:', 20, yPosition);
    yPosition += 10;
    
    // Encabezados de la tabla
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('#', 20, yPosition);
    pdf.text('Ejercicio', 30, yPosition);
    pdf.text('Área Muscular', 90, yPosition);
    pdf.text('Repeticiones', 130, yPosition);
    pdf.text('Dificultad', 160, yPosition);
    
    // Línea bajo encabezados
    yPosition += 3;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 7;
    
    // Contenido de los ejercicios
    pdf.setFont(undefined, 'normal');
    rutina.Ejercicios.forEach((ejercicio, index) => {
      // Verificar si necesitamos una nueva página
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
        
        // Repetir encabezados en nueva página
        pdf.setFont(undefined, 'bold');
        pdf.text('#', 20, yPosition);
        pdf.text('Ejercicio', 30, yPosition);
        pdf.text('Área Muscular', 90, yPosition);
        pdf.text('Repeticiones', 130, yPosition);
        pdf.text('Dificultad', 160, yPosition);
        yPosition += 3;
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 7;
        pdf.setFont(undefined, 'normal');
      }
      
      // Datos del ejercicio
      pdf.text(`${index + 1}`, 20, yPosition);
      
      // Nombre del ejercicio (truncar si es muy largo)
      const nombreEjercicio = ejercicio.NombreEjercicio.length > 25 ? 
        ejercicio.NombreEjercicio.substring(0, 25) + '...' : 
        ejercicio.NombreEjercicio;
      pdf.text(nombreEjercicio, 30, yPosition);
      
      pdf.text(ejercicio.AreaMuscular || 'N/A', 90, yPosition);
      pdf.text(ejercicio.Repeticiones?.toString() || 'N/A', 130, yPosition);
      pdf.text(ejercicio.Dificultad || 'N/A', 160, yPosition);
      
      yPosition += 7;
      
      // Descripción del ejercicio (en línea separada)
      if (ejercicio.DescripcionEjercicio) {
        pdf.setFontSize(8);
        const descripcion = ejercicio.DescripcionEjercicio.length > 80 ? 
          ejercicio.DescripcionEjercicio.substring(0, 80) + '...' : 
          ejercicio.DescripcionEjercicio;
        pdf.text(`   Descripción: ${descripcion}`, 30, yPosition);
        yPosition += 5;
        pdf.setFontSize(10);
      }
      
      // Comentario del ejercicio (si existe)
      if (ejercicio.Comentario) {
        pdf.setFontSize(8);
        pdf.text(`   Comentario: ${ejercicio.Comentario}`, 30, yPosition);
        yPosition += 5;
        pdf.setFontSize(10);
      }
      
      yPosition += 3; // Espacio entre ejercicios
    });
    
    // Resumen al final
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 20;
    }
    
    yPosition += 10;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Resumen de la Rutina:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`• Total de ejercicios: ${rutina.Ejercicios.length}`, 25, yPosition);
    yPosition += 7;
    pdf.text(`• Ejercicios fáciles: ${contarDificultades(rutina.Ejercicios, 'Baja')}`, 25, yPosition);
    yPosition += 7;
    pdf.text(`• Ejercicios medios: ${contarDificultades(rutina.Ejercicios, 'Media')}`, 25, yPosition);
    yPosition += 7;
    pdf.text(`• Ejercicios difíciles: ${contarDificultades(rutina.Ejercicios, 'Alta')}`, 25, yPosition);
    yPosition += 7;
    pdf.text(`• Grupos musculares: ${obtenerMusculosUnicosCount(rutina.Ejercicios)}`, 25, yPosition);
    yPosition += 7;
    pdf.text(`• Entrenador: ${nombreEntrenadorPDF}`, 25, yPosition);
    
    // Pie de página
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`PowerVital - Página ${i} de ${totalPages}`, 20, 285);
      pdf.text(`Generado el ${new Date().toLocaleString('es-CR')}`, 130, 285);
    }
    
    // Descargar el PDF
    const nombreArchivo = `Rutina_${rutinaNumero}_${cliente?.Nombre || 'Cliente'}_${clienteId}.pdf`;
    pdf.save(nombreArchivo);
    
    // Mostrar mensaje de éxito
    mostrarToast('PDF descargado exitosamente', 'success');
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    mostrarToast('Error al generar el PDF. Verifique que tenga habilitada la descarga de archivos.', 'error');
  }
}

// 🔹 IMPRIMIR RUTINA
function imprimirRutina() {
  // Ocultar botones antes de imprimir
  const botones = document.querySelectorAll('.btn');
  botones.forEach(btn => btn.style.display = 'none');
  
  // Imprimir
  window.print();
  
  // Mostrar botones nuevamente después de imprimir
  setTimeout(() => {
    botones.forEach(btn => btn.style.display = '');
  }, 1000);
}

// 🔹 MOSTRAR TOAST DE NOTIFICACIÓN
function mostrarToast(mensaje, tipo = 'success') {
  const iconos = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-triangle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  };
  
  const colores = {
    success: 'alert-success',
    error: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  };
  
  const toast = document.createElement('div');
  toast.className = `alert ${colores[tipo]} position-fixed top-0 end-0 m-3 alert-dismissible fade show`;
  toast.style.zIndex = '9999';
  toast.style.minWidth = '300px';
  toast.innerHTML = `
    <i class="${iconos[tipo]}"></i> ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 5000);
}

// 🔹 FUNCIONES AUXILIARES
function formatearFecha(fechaISO) {
  const date = new Date(fechaISO);
  return date.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function obtenerMusculosUnicos(ejercicios) {
  if (!ejercicios || ejercicios.length === 0) return 'Sin ejercicios';
  const musculos = [...new Set(ejercicios.map(ej => ej.AreaMuscular))];
  return musculos.length <= 3 ? musculos.join(', ') : `${musculos.length} grupos`;
}

function obtenerMusculosUnicosCount(ejercicios) {
  if (!ejercicios || ejercicios.length === 0) return 0;
  return [...new Set(ejercicios.map(ej => ej.AreaMuscular))].length;
}

function contarDificultades(ejercicios, dificultad) {
  if (!ejercicios) return 0;
  return ejercicios.filter(ej => ej.Dificultad === dificultad).length;
}

function getDificultadColor(dificultad) {
  switch(dificultad?.toLowerCase()) {
    case 'baja': return 'bg-success';
    case 'media': return 'bg-warning';
    case 'alta': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

// 🔹 VER VIDEO EN MODAL
function verVideo(videoUrl, nombreEjercicio) {
  const modalHtml = `
    <div class="modal fade" id="videoModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fab fa-youtube text-danger"></i> 
              ${nombreEjercicio}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0">
            <div class="ratio ratio-16x9">
              <iframe src="${convertirUrlYoutube(videoUrl)}" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen>
              </iframe>
            </div>
          </div>
          <div class="modal-footer">
            <a href="${videoUrl}" target="_blank" class="btn btn-outline-primary">
              <i class="fas fa-external-link-alt"></i> Abrir en YouTube
            </a>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remover modal anterior si existe
  const modalAnterior = document.getElementById('videoModal');
  if (modalAnterior) {
    modalAnterior.remove();
  }

  // Agregar nuevo modal
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('videoModal'));
  modal.show();
}

// 🔹 CONVERTIR URL DE YOUTUBE PARA EMBED
function convertirUrlYoutube(url) {
  if (!url) return '';
  
  // Si ya es una URL de embed, devolverla tal como está
  if (url.includes('embed')) return url;
  
  // Convertir URL normal de YouTube a embed
  let videoId = '';
  
  if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}