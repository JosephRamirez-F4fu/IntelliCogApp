import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-usage-guide',
  imports: [NgOptimizedImage, CommonModule],
  templateUrl: './usage-guide.html',
  styleUrl: './usage-guide.css',
})
export class UsageGuide {
  opened = [false, false, false, false, false];

  secciones = [
    {
      img: '/images/user.svg',
      alt: 'Pacientes',
      titulo: 'Gestión de Pacientes',
      pasos: [
        `<b>Crear paciente:</b> Haz clic en <b>Crear Paciente</b> y completa el formulario con los datos requeridos (nombre, apellido, DNI, sexo, edad, años de educación, etc.). Haz clic en <b>Guardar</b> para registrar al paciente.`,
        `<b>Buscar paciente:</b> Usa los campos de filtro por nombre/apellido o DNI. Los resultados se actualizan automáticamente. Puedes limpiar los filtros con el botón <b>Limpiar</b>.`,
        `<b>Editar o eliminar:</b> En la tabla de pacientes, usa los botones <b>Editar</b> para modificar los datos o <b>Eliminar</b> para borrar el paciente.`,
        `<b>Ir a historial:</b> Haz clic en <b>Ir a historial</b> para ver todas las evaluaciones de ese paciente y acceder a su historial clínico.`,
        `<b>Paginación:</b> Si hay muchos pacientes, usa los botones <b>Anterior</b> y <b>Siguiente</b> para navegar entre páginas.`,
      ],
    },
    {
      img: '/images/atom.svg',
      alt: 'Evaluaciones',
      titulo: 'Evaluaciones',
      pasos: [
        `<b>Buscar paciente:</b> Escribe el nombre o DNI en el buscador. Selecciona el paciente de la lista desplegable para cargar su información y su historial de evaluaciones.`,
        `<b>Ver historial:</b> Se mostrará una tabla con todas las evaluaciones del paciente seleccionado, incluyendo fecha, tipo, resultado y clasificación manual.`,
        `<b>Crear evaluación:</b> Haz clic en <b>Crear Evaluación</b>. Completa los datos requeridos según el tipo de evaluación (Resonancia Magnética o Datos Clínicos) y guarda.`,
        `<b>Detalle de evaluación:</b> Haz clic en <b>Detalle</b> para ver la información completa de la evaluación, incluyendo imagen MRI, datos clínicos, resultados del modelo, clasificación manual y notas clínicas.`,
        `<b>Editar o eliminar evaluación:</b> Desde la tabla puedes eliminar una evaluación. En el detalle puedes editar la clasificación manual y las notas clínicas.`,
        `<b>Cambiar de paciente:</b> Haz clic en <b>Cambiar Paciente</b> para limpiar la selección y buscar otro paciente.`,
      ],
    },
    {
      img: '/images/chart.svg',
      alt: 'Clasificación',
      titulo: 'Análisis de Resultados',
      pasos: [
        `<b>Filtros avanzados:</b> Puedes buscar por paciente (nombre o DNI), filtrar por sexo, tipo de evaluación (MRI o Datos Clínicos) y rango de edad.`,
        `<b>Visualización de gráficos:</b>
        <ul>
          <li><b>Barras:</b> Muestra la cantidad de evaluaciones por tipo de resultado.</li>
          <li><b>Torta:</b> Visualiza la proporción de cada tipo de resultado.</li>
          <li><b>Línea:</b> Observa la evolución de las evaluaciones en el tiempo.</li>
        </ul>`,
        `<b>Interactividad:</b> Los gráficos se actualizan automáticamente al cambiar los filtros.`,
      ],
    },
    {
      img: '/images/pdf.svg',
      alt: 'Reportes',
      titulo: 'Reportes',
      pasos: [
        `<b>Buscar paciente:</b> Usa el buscador por nombre o DNI y selecciona el paciente para cargar sus evaluaciones.`,
        `<b>Descargar historial:</b> Haz clic en <b>Descargar historial PDF</b> para obtener todas las evaluaciones del paciente en un solo archivo PDF.`,
        `<b>Descargar evaluación individual:</b> Haz clic en <b>Descargar PDF</b> en la fila de la evaluación que desees.`,
        `<b>Enviar por correo:</b> Ingresa el correo electrónico en el campo correspondiente y haz clic en <b>Enviar historial por correo</b> o <b>Enviar por correo</b> en la fila de la evaluación.`,
        `<b>Visualización:</b> Puedes ver los datos principales de cada evaluación antes de descargar o enviar.`,
      ],
    },
    {
      img: '/images/display.svg',
      alt: 'Soporte Técnico',
      titulo: 'Soporte Técnico',
      pasos: [
        `<b>Formulario de consulta:</b> Completa el campo <b>Nombre de Consulta</b> y describe tu problema o duda en el campo <b>Descripción</b>.`,
        `<b>Enviar consulta:</b> Haz clic en <b>Enviar</b>. Recibirás una notificación si el envío fue exitoso.`,
        `<b>Respuesta:</b> Un miembro del equipo de soporte se pondrá en contacto contigo a la brevedad al correo registrado.`,
      ],
    },
    {
      img: '/images/data-base.svg',
      alt: 'Datos de entrenamiento',
      titulo: 'Precedencia de los datos de entrenamiento',
      pasos: [
        `<b>Datos clínicos:</b> <br>
        <b>Investigadores principales:</b> Bednorz, A.<br>
    283 pacientes hospitalizados en el Hospital Geriátrico Juan Pablo II de Katowice entre 2015 y 2019, como parte de una evaluación geriátrica integral.<br>
    `,
        `<b>Resonancia Magnética:</b> <br>
    OASIS-1: Cross-Sectional<br>
    <b>Investigadores principales:</b> D. Marcus, R. Buckner, J. Csernansky, J. Morris<br>
    <b>Subvenciones:</b> P50 AG05681, P01 AG03991, P01 AG026276, R01 AG021910, P20 MH071616, U24 RR021382<br>
    `,
      ],
    },
  ];

  toggle(idx: number) {
    this.opened[idx] = !this.opened[idx];
  }
}
