const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  ShadingType
} = require('docx');

// Paleta visual institucional
const COLOR_PRIMARY = 'EA580C';   // Naranja cooperativo
const COLOR_NAVY = '0F172A';      // Azul pizarra corporativo
const COLOR_MUTED = '64748B';     // Gris texto complementario
const COLOR_BORDER = 'CBD5E1';    // Gris de bordes
const COLOR_BG_HEADER = 'F1F5F9'; // Gris suave encabezados
const COLOR_BG_CALLOUT = 'FFF7ED';// Fondo cálido para notas explicativas
const COLOR_BORDER_CALLOUT = 'FDBA74'; // Borde acento cálido
const COLOR_BG_SUCCESS = 'ECFDF5';// Verde suave para metas

// Bordes estándar
const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER }
};

// Generadores de párrafos tipográficos
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 420, after: 180 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 30,
        color: COLOR_NAVY,
        font: 'Calibri'
      })
    ]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 140 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: COLOR_PRIMARY,
        font: 'Calibri'
      })
    ]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 21,
        color: COLOR_NAVY,
        font: 'Calibri'
      })
    ]
  });
}

function body(text, opts = {}) {
  const { bold = false, italic = false, after = 140, before = 0, color = '1E293B', alignment = AlignmentType.BOTH } = opts;
  return new Paragraph({
    alignment,
    spacing: { before, after, line: 280 },
    children: [
      new TextRun({
        text,
        size: 21,
        color,
        bold,
        italic,
        font: 'Calibri'
      })
    ]
  });
}

function bullet(boldPrefix, normalText) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 80, line: 260 },
    children: [
      new TextRun({
        text: boldPrefix,
        bold: true,
        size: 21,
        color: COLOR_NAVY,
        font: 'Calibri'
      }),
      new TextRun({
        text: normalText,
        size: 21,
        color: '334155',
        font: 'Calibri'
      })
    ]
  });
}

function callout(titleText, explanationText) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_PRIMARY },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_BG_CALLOUT, type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 200, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: `💡 ${titleText}`,
                    bold: true,
                    size: 20,
                    color: COLOR_PRIMARY,
                    font: 'Calibri'
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 0, line: 260 },
                children: [
                  new TextRun({
                    text: explanationText,
                    italic: true,
                    size: 20,
                    color: '431407',
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

async function generateCompleteDocx() {
  const doc = new Document({
    creator: 'Gomez Gonzalo',
    title: 'Informe de Seguimiento y Planificación — Precooperativa Escolar',
    description: 'Informe técnico pedagógico para Organización y Métodos (7° 3°).',
    sections: [
      // ==========================================
      // SECCIÓN 1: PORTADA FORMAL
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 60 },
            children: [
              new TextRun({
                text: 'ESCUELA DE EDUCACIÓN SECUNDARIA TÉCNICA',
                bold: true,
                size: 22,
                color: COLOR_MUTED,
                font: 'Calibri'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 600 },
            children: [
              new TextRun({
                text: 'ORIENTACIÓN EN PROGRAMACIÓN E INFORMÁTICA',
                bold: true,
                size: 20,
                color: COLOR_MUTED,
                font: 'Calibri'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 120 },
            children: [
              new TextRun({
                text: 'INFORME DE SEGUIMIENTO Y PLANIFICACIÓN OPERATIVA',
                bold: true,
                size: 36,
                color: COLOR_NAVY,
                font: 'Calibri'
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 600 },
            children: [
              new TextRun({
                text: 'Clínica de Hardware y Optimización — Precooperativa Escolar',
                size: 24,
                color: COLOR_PRIMARY,
                bold: true,
                font: 'Calibri'
              })
            ]
          }),

          // Cuadro formal de datos
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
                    children: [body('Estudiante:', { bold: true, after: 0 })]
                  }),
                  new TableCell({
                    width: { size: 65, type: WidthType.PERCENTAGE },
                    children: [body('Gomez Gonzalo', { bold: true, after: 0 })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
                    children: [body('Profesor a cargo:', { bold: true, after: 0 })]
                  }),
                  new TableCell({
                    children: [body('Aragon Lautaro', { bold: true, after: 0 })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
                    children: [body('Curso y División:', { bold: true, after: 0 })]
                  }),
                  new TableCell({
                    children: [body('7° Año 3° División', { after: 0 })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
                    children: [body('Materia / Asignatura:', { bold: true, after: 0 })]
                  }),
                  new TableCell({
                    children: [body('Organización y Métodos', { bold: true, after: 0 })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR },
                    children: [body('Fecha de Presentación:', { bold: true, after: 0 })]
                  }),
                  new TableCell({
                    children: [body('Noviembre de 2026', { after: 0 })]
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 0 },
            children: [
              new TextRun({
                text: 'República Argentina • Ciclo Lectivo 2026',
                size: 18,
                italic: true,
                color: COLOR_MUTED,
                font: 'Calibri'
              })
            ]
          }),

          new Paragraph({ children: [new PageBreak()] })
        ]
      },

      // ==========================================
      // SECCIÓN 2: CUERPO DIDÁCTICO Y EXHAUSTIVO
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'Clínica de Hardware — Precooperativa Escolar | Organización y Métodos (7° 3°)',
                    size: 16,
                    color: COLOR_MUTED,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 120 },
                children: [
                  new TextRun({
                    text: 'Gomez Gonzalo — Prof. Aragon Lautaro | Página ',
                    size: 17,
                    color: COLOR_MUTED,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 17,
                    bold: true,
                    color: COLOR_NAVY,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: ' de ',
                    size: 17,
                    color: COLOR_MUTED,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 17,
                    color: COLOR_MUTED,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        children: [
          // ----------------------------------------------------
          // ÍNDICE GENERAL DEL DOCUMENTO
          // ----------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 200 },
            children: [
              new TextRun({
                text: 'ÍNDICE GENERAL',
                bold: true,
                size: 28,
                color: COLOR_NAVY,
                font: 'Calibri'
              })
            ]
          }),

          body('1. INFORME DE SEGUIMIENTO EN VUE.JS (PUNTO 6)', { bold: true }),
          body('   1.1 ¿Qué es este informe y cuál es su propósito?'),
          body('   1.2 Destinatarios, Frecuencia y Período de Evaluación'),
          body('   1.3 Arquitectura de la Vista en Vue.js y Selector Dinámico de Período'),
          body('   1.4 Fuentes de Datos y Sincronización en Tiempo Real (Supabase / PostgreSQL)'),
          body('   1.5 Indicadores Clave de Rendimiento (KPIs): Metas vs. Resultados Obtenidos'),
          body('   1.6 Tablas de Datos Operativos y Gráfico Comparativo de Rendimiento'),
          body('   1.7 Preparación para Impresión y Exportación Directa a PDF (@media print)'),
          body('   1.8 Matriz de Perfiles y Control de Acceso (¿Quién puede consultarlo?)'),

          body('2. EXPLICACIÓN E INTERPRETACIÓN DE RESULTADOS (PUNTO 7)', { bold: true, before: 100 }),
          body('   2.1 ¿Por qué se cumplieron y superaron las metas fijadas?'),
          body('   2.2 Dificultades Detectadas y Patrones Recurrentes de Falla en la Escuela'),
          body('   2.3 Conclusiones que Requieren Mayor Información y Seguimiento'),
          body('   2.4 Dos Acciones de Mejora Continua Totalmente Fundamentadas'),
          body('   2.5 Relación Funcional: Tablero de Taller vs. Informe de Período vs. Informe Final'),

          body('3. PLANIFICACIÓN Y SIMULACIÓN DE LA EXPERIENCIA (PUNTO 8)', { bold: true, before: 100 }),
          body('   3.1 Delimitación de la Prueba Piloto: Recursos, Costos y Valores Ficticios'),
          body('   3.2 Cronograma Operativo: Actividades, Horarios, Roles y Resultados Esperados'),
          body('   3.3 Recorrido Completo de una Solicitud Paso a Paso (Caso OT-0001)'),
          body('   3.4 Simulación y Resolución de un Imprevisto Crítico aplicando el Reglamento'),
          body('   3.5 Conclusiones Generales del Proyecto Precooperativo'),

          new Paragraph({ children: [new PageBreak()] }),

          // ====================================================
          // CAPÍTULO 1: INFORME DE SEGUIMIENTO EN VUE.JS (PUNTO 6)
          // ====================================================
          heading1('1. Informe de Seguimiento en Vue.js (Punto 6)'),

          heading2('1.1 ¿Qué es este informe y cuál es su propósito?'),
          body(
            'En una escuela técnica con orientación en Informática, la creación de una precooperativa escolar no se reduce a reparar computadoras en una mesa de trabajo: requiere administrar un servicio con orden, control y método profesional. Si un taller escolar trabaja sin medir lo que hace, no puede saber si le faltan repuestos, si los arreglos demoran demasiado o cuánta plata le está ahorrando a la escuela pública.'
          ),
          body(
            'El Informe de Seguimiento es la herramienta analítica del sistema que reúne todos los datos registrados en el día a día (cuántas máquinas entraron, qué se rompió, qué repuestos se gastaron del estante y quién hizo el trabajo) y los transforma en estadísticas claras, gráficos y conclusiones sencillas de interpretar.'
          ),
          callout(
            'Propósito en palabras sencillas:',
            'El propósito es saber con exactitud matemática cómo está funcionando el taller escolar: qué porcentaje de máquinas se repararon con éxito, cuántas horas se demoró en promedio y qué beneficio económico directo recibió la institución escolar gracias al trabajo de los alumnos.'
          ),

          heading2('1.2 Destinatarios, Frecuencia y Período de Evaluación'),
          body(
            'Para que un informe sea útil en la materia Organización y Métodos, debe tener bien definido a quién le habla, cada cuánto tiempo se emite y qué ventana de tiempo analiza:'
          ),
          bullet('Destinatarios Formales: ', 'El Consejo de Administración de la precooperativa (los estudiantes encargados de coordinar el taller y gestionar compras), la Sindicatura y Docentes Asesores (los encargados de controlar que no se cometan irregularidades) y la Dirección de la Escuela (para informar a las autoridades distritales el impacto de la especialidad).'),
          bullet('Frecuencia de Emisión: ', 'Mensual. Todos los fines de mes se emite un informe consolidado para ser presentado y debatido en la reunión ordinaria del Consejo. No obstante, el sistema permite emitir informes de períodos especiales (ej. quincenales o bimestrales) si la Asamblea General lo requiere.'),
          bullet('Período de Evaluación: ', 'Por defecto, el sistema abre mostrando el último mes calendario cerrado (por ejemplo, del 1° al 31 de octubre o del 1° al 30 de noviembre). Sin embargo, cuenta con un selector de fechas libre para que el usuario pueda evaluar el trimestre, el semestre o el año lectivo completo.'),

          heading2('1.3 Arquitectura de la Vista en Vue.js y Selector Dinámico de Período'),
          body(
            'La vista fue construida en Vue 3 (`src/views/ReportView.vue` y componentes auxiliares) utilizando la sintaxis de Composition API (`<script setup>`). Esta arquitectura garantiza que la página sea ultrarrápida, no tenga que recargarse en blanco cada vez que se toca un botón y funcione con total fluidez.'
          ),
          body(
            'En la parte superior de la pantalla, el usuario encuentra el "Selector de Período". Este control cuenta con dos selectores de fecha (`Desde:` y `Hasta:`) acompañados de botones rápidos de un solo clic: "Últimos 30 días", "Mes actual" y "Ciclo Lectivo Completo".'
          ),
          callout(
            '¿Cómo funciona la reactividad por dentro?',
            'Cuando el usuario cambia una fecha, las propiedades computadas (`computed properties`) de Vue recalculan instantáneamente todas las fórmulas matemáticas y filtran las órdenes en milisegundos, sin necesidad de que el usuario tenga que apretar un botón de "buscar" ni recargar la pestaña del navegador.'
          ),

          heading2('1.4 Fuentes de Datos y Sincronización en Tiempo Real'),
          body(
            'Una regla básica de la organización administrativa es que ningún informe puede inventar números: todos los datos deben provenir de registros auditables e inmutables. En este proyecto, las fuentes de datos son las tablas oficiales alojadas en la base de datos Supabase (PostgreSQL en la nube):'
          ),
          bullet('Tabla ordenes_trabajo: ', 'Aporta la lista de todas las computadoras recibidas, aula de origen, docente solicitante, prioridad y estado actual.'),
          bullet('Tabla historial_estados: ', 'Aporta la bitácora inmutable: la fecha exacta, la hora y el nombre del técnico que movió cada máquina de una etapa a otra.'),
          bullet('Tabla inventario_repuestos y consumos_repuestos: ', 'Registra qué repuestos se descontaron físicamente del estante del pañol (ej. fuentes ATX, pasta térmica, cables UTP) y su valor unitario estimado.'),
          bullet('Tabla libro_diario: ', 'Registra las entradas y salidas de dinero de la precooperativa para cotejar los gastos reales con los repuestos adquiridos.'),
          body(
            'Si en algún momento el taller se queda sin conexión a internet, el sistema activa automáticamente un motor de respaldo local (`LocalStorage`), garantizando que ningún dato se pierda y sincronizándolo apenas se restablece la red escolar.'
          ),

          heading2('1.5 Indicadores Clave de Rendimiento (KPIs): Metas vs. Resultados'),
          body(
            'Un KPI (Key Performance Indicator) es un indicador numérico clave que sirve para medir si se alcanzó o no un objetivo planteado. Para este período de taller, se definieron cuatro metas concretas:'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Indicador Clave (KPI)', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Meta Fijada', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Resultado Real', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Cumplimiento', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('1. Equipos Reparados y Entregados', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('10 equipos / mes', { after: 0 })] }),
                  new TableCell({ children: [body('12 equipos', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('120% (Superada)', { bold: true, after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('2. Tiempo de Ciclo (Turnaround)', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('Máximo 48 horas', { after: 0 })] }),
                  new TableCell({ children: [body('38 horas promedio', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('100% (Cumplida)', { bold: true, after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('3. Tasa de Éxito en Diagnósticos', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('Mínimo 85%', { after: 0 })] }),
                  new TableCell({ children: [body('91.6% (11 de 12)', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('107% (Superada)', { after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('4. Ahorro Económico para la Escuela', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('Mínimo $150.000', { after: 0 })] }),
                  new TableCell({ children: [body('$214.500 ARS', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('143% (Superada)', { bold: true, after: 0 })] })
                ]
              })
            ]
          }),

          callout(
            '¿Cómo se calcula el ahorro de $214.500 ARS?',
            'Se compara el costo del servicio en el mercado privado contra el gasto real de la precooperativa. Reparar una PC en un servicio técnico particular cuesta un promedio de $22.000 de mano de obra más repuesto. Para 12 máquinas, el costo privado habría sido de $264.000. La cooperativa solo gastó $49.500 en repuestos comprados en lote. La diferencia ($264.000 - $49.500 = $214.500) es el dinero que la escuela pública se ahorró.'
          ),

          heading2('1.6 Tablas de Datos Operativos y Gráfico Comparativo'),
          body(
            'Para que el informe no sea un bloque de texto árido, la vista en Vue.js desglosa los resultados en dos componentes visuales:'
          ),
          bullet('Tabla de Desglose por Comisión: ', 'Permite ver qué área tuvo más demanda. Durante el período evaluado, la Comisión de Hardware atendió 7 solicitudes (fuentes quemadas, limpieza de memorias RAM y cambios de pasta térmica), mientras que la Comisión de Software y Redes atendió 5 solicitudes (desinstalación de malware, debloating para acelerar arranque de Huayra Linux/Windows y armado de fichas de red RJ45).'),
          bullet('Gráfico Comparativo de Barras: ', 'Un gráfico visual que muestra en una barra las computadoras que ingresaron rotas en la semana y en otra barra las que salieron entregadas funcionando. Si la barra de entregadas iguala o supera a la de ingresadas, el profesor sabe a simple vista que el taller está al día y no tiene cuellos de botella acumulados.'),

          heading2('1.7 Preparación para Impresión y Exportación Directa a PDF (@media print)'),
          body(
            'En una institución educativa pública, los directores, secretarios e inspectores frecuentemente exigen constancias en papel o en archivos PDF firmados digitalmente. Por eso, no alcanza con que la pantalla se vea linda en el monitor: debe estar preparada para imprimirse sin errores.'
          ),
          body(
            'La vista en Vue.js incorpora reglas especiales de diseño (`@media print` en CSS):'
          ),
          bullet('Limpieza automática de la pantalla: ', 'Al presionar el botón "Imprimir o Guardar en PDF" (o apretar Ctrl+P), el sistema oculta automáticamente la barra de navegación superior, los botones naranjas interactivos, el menú desplegable y los pie de página del navegador.'),
          bullet('Maquetación A4 estandarizada: ', 'Los fondos se convierten a blanco puro con texto negro de máximo contraste para ahorrar tóner escolar. Las tablas tienen reglas de corte (`page-break-inside: avoid;`) para que ninguna fila quede partida por la mitad entre una hoja y otra.'),
          bullet('Encabezado y pie de página de hoja: ', 'Cada hoja impresa incluye arriba el membrete oficial de la Precooperativa Escolar y abajo el espacio para la firma del Estudiante Responsable y del Profesor Asesor.'),

          heading2('1.8 Matriz de Perfiles y Control de Acceso (¿Quién puede consultarlo?)'),
          body(
            'La transparencia cooperativa no significa desorden de permisos. En el sistema desarrollado, la posibilidad de ver o modificar el informe sigue el principio de seguridad de roles de Supabase (Row Level Security):'
          ),
          bullet('Consejo de Administración y Administrador General: ', 'Acceso total para generar informes de cualquier fecha, comparar costos de repuestos y ver el detalle de cada alumno que trabajó.'),
          bullet('Sindicatura y Comisión Asesora Docente: ', 'Acceso de lectura y auditoría. Pueden revisar todos los números pero no pueden alterar los registros del pasado (garantía de control de legalidad).'),
          bullet('Docentes Solicitantes de Aulas: ', 'Pueden consultar el estado y el historial de sus propios pedidos de aula, pero no tienen acceso a los balances económicos ni a las actas cerradas.'),
          bullet('Público General / Invitados: ', 'Solo pueden visualizar un resumen estadístico general sin datos personales de alumnos ni números contables sensibles.'),

          new Paragraph({ children: [new PageBreak()] }),

          // ====================================================
          // CAPÍTULO 2: EXPLICACIÓN E INTERPRETACIÓN DE RESULTADOS
          // ====================================================
          heading1('2. Explicación e Interpretación de Resultados (Punto 7)'),

          heading2('2.1 ¿Por qué se cumplieron y superaron las metas fijadas?'),
          body(
            'Cuando se analiza el rendimiento de una organización, el éxito nunca debe atribuirse al azar. Se superó la meta de equipos reparados en un 20% (12 equipos entregados frente a 10 esperados) debido a una decisión de diseño de procesos fundamental: la eliminación del viejo tablero estático y la implementación del flujo de 5 etapas secuenciales.'
          ),
          body(
            'Antes, una máquina rota quedaba apoyada en un banco y nadie sabía con certeza en qué estado estaba. Con el nuevo sistema, cada máquina avanza obligatoriamente por cinco casilleros:'
          ),
          bullet('1. Recepción: ', 'Se constata la falla reportada por el docente.'),
          bullet('2. Diagnóstico: ', 'El técnico prueba componentes con instrumental y define la causa exacta.'),
          bullet('3. Reparación: ', 'Se colocan piezas nuevas o se optimiza el sistema operativo.'),
          bullet('4. Control de Calidad: ', 'Se somete la máquina a pruebas de estrés para asegurar que no vuelva a fallar.'),
          bullet('5. Entrega Conforme: ', 'El docente verifica en el aula y confirma la recepción.'),
          body(
            'Al exigir que cada etapa tenga un técnico responsable con nombre y apellido (ej. Gomez Gonzalo), se generó compromiso individual y se eliminó el "efecto espectador", donde todos creían que otro compañero iba a reparar el equipo.'
          ),

          heading2('2.2 Dificultades Detectadas y Patrones Recurrentes de Falla'),
          body(
            'El informe de seguimiento permitió identificar dos patrones de falla muy claros en las computadoras de la escuela:'
          ),
          bullet('Primer Patrón — Estrés Térmico por Suciedad y Pasta Seca (45% de los casos): ', 'Casi la mitad de las computadoras que ingresaron por "lentitud insoportable" o porque "se apagaban de golpe a los 10 minutos" no tenían ningún virus ni circuito quemado: tenían los ventiladores tapados de pelusa y polvillo de tiza, y la pasta térmica del microprocesador estaba dura como yeso. El procesador, al superar los 85°C, activaba su protección térmica automática (thermal throttling) bajando su velocidad al mínimo para no fundirse.'),
          bullet('Segundo Patrón — Fuentes ATX dañadas tras Tormentas Eléctricas (30% de los casos): ', 'En los días de lluvia y tormenta eléctrica, la red eléctrica del colegio sufre fluctuaciones de tensión. Al no haber suficientes estabilizadores en el Laboratorio 1, las fuentes de alimentación genéricas de 450W sufrieron rotura de fusibles y capacitores inflados en la etapa secundaria. Esto provocó que en una sola semana se consumieran casi todas las fuentes de repuesto del pañol.'),

          heading2('2.3 Conclusiones que Requieren Mayor Información y Seguimiento'),
          body(
            'Un buen técnico de Organización y Métodos debe ser honesto y reconocer cuándo los datos actuales no son suficientes para emitir un veredicto definitivo. En este período se detectaron dos cuestiones que requieren mayor información a futuro:'
          ),
          bullet('Durabilidad de las optimizaciones de software (Debloating): ', 'Se lograron acelerar 5 netbooks quitando programas pesados de inicio y optimizando servicios. Pero todavía no sabemos si esa mejora de velocidad se mantiene después de 3 meses, cuando decenas de alumnos distintos instalen nuevos programas para sus materias. Hace falta implementar una encuesta de satisfacción a 90 días con los docentes de aula.'),
          bullet('Cómputo de insumos menores de taller: ', 'Actualmente el sistema descuenta piezas grandes (memorias, fuentes, discos, cables), pero no descuenta el estaño para soldar, la grasa de disipación fraccionada ni el alcohol isopropílico utilizado para limpiar contactos. Si bien son gastos menores, al cabo de todo el año lectivo pueden representar una suma importante que hoy no se está midiendo con exactitud.'),

          heading2('2.4 Dos Acciones de Mejora Continua Totalmente Fundamentadas'),
          body(
            'Para solucionar de raíz los problemas detectados, se proponen dos acciones organizacionales concretas y fundamentadas:'
          ),

          heading3('Acción de Mejora N° 1: Plan de Mantenimiento Preventivo Semestral por Aulas'),
          bullet('¿En qué consiste? ', 'No esperar a que una máquina se rompa para que el docente tenga que pedir auxilio. La Comisión de Hardware planificará visitas preventivas cada 6 meses a los laboratorios para sopletear polvo, limpiar disipadores y renovar la pasta térmica antes del inicio de cada cuatrimestre.'),
          bullet('Fundamentación técnica: ', 'Una jeringa de pasta térmica cuesta $5.000 ARS y rinde para 15 computadoras. Salvar un procesador quemado o evitar que una clase se quede sin máquinas ahorra cientos de miles de pesos. La prevención es 10 veces más barata que la reparación reactiva.'),

          heading3('Acción de Mejora N° 2: Política de Stock Mínimo Dinámico con Compras en Lote'),
          bullet('¿En qué consiste? ', 'En lugar de tener siempre un stock fijo de 2 fuentes en el pañol, aumentar el stock mínimo a 5 unidades antes de los meses de primavera (época de tormentas fuertes). Además, autorizar al Tesorero del Consejo a comprar las fuentes en cajas cerradas de 10 unidades a distribuidores mayoristas.'),
          bullet('Fundamentación económica: ', 'Comprar repuestos de a uno en casas minoristas locales genera un sobrecosto del 25% y demoras de hasta dos semanas de flete. Comprar en lote con los fondos de la precooperativa reduce el costo unitario y asegura que ninguna máquina espere más de 24 horas para tener repuesto.'),

          heading2('2.5 Relación Funcional: Tablero vs. Informe de Período vs. Informe Final'),
          body(
            'Para que no haya confusiones complejas sobre qué documento usar en cada momento, el sistema articula tres niveles de información bien diferenciados:'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Herramienta', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: '¿Para qué sirve?', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: '¿Quién la utiliza?', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Frecuencia de Uso', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('Tablero de Taller (/taller)', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('Consulta rápida del día a día. Muestra qué equipos están en la mesa de trabajo ahora mismo y permite arrastrar su estado.', { after: 0 })] }),
                  new TableCell({ children: [body('Técnicos de taller y docentes solicitantes.', { after: 0 })] }),
                  new TableCell({ children: [body('Diaria / Permanente en tiempo real.', { after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('Informe de Seguimiento (Este informe)', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('Análisis de un período cerrado (mes o bimestre). Evalúa KPIs, costos de repuestos, dificultades y propone mejoras.', { after: 0 })] }),
                  new TableCell({ children: [body('Consejo de Administración, Síndico y Profesores.', { after: 0 })] }),
                  new TableCell({ children: [body('Mensual o a fin de cada mes evaluado.', { after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('Informe Final de Proyecto', { bold: true, after: 0 })] }),
                  new TableCell({ children: [body('Documento maestro anual. Reúne todas las actividades, balances contables definitivos, memoria anual e impacto social escolar.', { after: 0 })] }),
                  new TableCell({ children: [body('Asamblea General Ordinaria y Dirección Escolar.', { after: 0 })] }),
                  new TableCell({ children: [body('Anual (al concluir el ciclo lectivo escolar).', { after: 0 })] })
                ]
              })
            ]
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ====================================================
          // CAPÍTULO 3: PLANIFICACIÓN Y SIMULACIÓN DE LA EXPERIENCIA
          // ====================================================
          heading1('3. Planificación y Simulación de la Experiencia (Punto 8)'),

          heading2('3.1 Delimitación de la Prueba Piloto: Recursos, Costos y Valores Ficticios'),
          body(
            'Antes de lanzar el taller de reparaciones a toda la escuela (donde hay más de 30 aulas y dependencias), era indispensable planificar y simular una experiencia piloto controlada. La prueba se delimitó sobre una muestra representativa de 5 equipos informáticos de la escuela (3 PCs de escritorio y 2 netbooks escolares).'
          ),
          body(
            'Para que la planificación sea realista según las reglas de Organización y Métodos, se inventariaron los recursos disponibles y los faltantes:'
          ),
          bullet('Recursos Físicos Disponibles en Taller: ', 'Mesa de trabajo de madera con alfombra antiestática conectada a tierra, estación de soldar de 40W, pistola de calor, multímetro digital calibrado, kit de destornilladores de precisión Torx y Phillips, pulseras antiestáticas, alcohol isopropílico y pasta térmica de alta conductividad.'),
          bullet('Recursos Digitales y de Red: ', 'Servidor local con la aplicación web en Vue.js y sincronización automática con la base de datos Supabase, accesible desde cualquier máquina conectada a la red Wi-Fi escolar.'),
          bullet('Recursos Pendientes / Brecha: ', 'Falta de pantallas LCD de repuesto para netbooks de 11.6 pulgadas y escasez de memorias RAM DDR3 de 4GB para ampliación de equipos antiguos.'),
          bullet('Valores Ficticios / Estimados de Costo: ', 'Para poder calcular el ahorro contable sin desvíos, se fijaron valores de referencia de mercado: $12.000 ARS por hora de mano de obra técnica privada, $24.000 ARS por fuente ATX de 450W y $18.500 ARS por unidad de disco sólido SSD Kingston de 240GB.'),

          heading2('3.2 Cronograma Operativo: Actividades, Horarios, Roles y Resultados'),
          body(
            'La experiencia se planificó en una semana de trabajo estructurada en 5 jornadas, asignando roles claros para evitar superposición de tareas:'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Día y Horario', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Actividad Específica', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Rol Responsable', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  }),
                  new TableCell({
                    shading: { fill: COLOR_NAVY, type: ShadingType.CLEAR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Resultado Esperado', bold: true, color: 'FFFFFF', font: 'Calibri' })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('Lunes 08:00 - 10:00', { after: 0 })] }),
                  new TableCell({ children: [body('Carga de solicitudes y recepción física en mesa de entrada de taller.', { after: 0 })] }),
                  new TableCell({ children: [body('Prof. Aragon Lautaro (Docente Solicitante)', { after: 0 })] }),
                  new TableCell({ children: [body('Equipos ingresados con código formal OT-0001 a OT-0005 en estado "Recibido".', { after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('Lunes 10:15 - 13:00', { after: 0 })] }),
                  new TableCell({ children: [body('Apertura de gabinetes, medición de voltajes con multímetro y diagnóstico.', { after: 0 })] }),
                  new TableCell({ children: [body('Gomez Gonzalo (Técnico de Hardware)', { after: 0 })] }),
                  new TableCell({ children: [body('Diagnóstico técnico cargado en sistema y orden movida a "Diagnóstico".', { after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('Martes 08:00 - 12:00', { after: 0 })] }),
                  new TableCell({ children: [body('Sustitución de componentes, limpieza profunda, soldadura y debloating.', { after: 0 })] }),
                  new TableCell({ children: [body('Gomez Gonzalo y Sofía Valenzuela (Técnicos)', { after: 0 })] }),
                  new TableCell({ children: [body('Repuestos descontados del pañol y orden movida a "Reparar u optimizar".', { after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('Miércoles 09:00 - 11:30', { after: 0 })] }),
                  new TableCell({ children: [body('Control de calidad: pruebas de estabilidad, test de memoria y estrés térmico.', { after: 0 })] }),
                  new TableCell({ children: [body('Lucas Martínez (Encargado de Calidad / Consejo)', { after: 0 })] }),
                  new TableCell({ children: [body('Aprobación de pruebas técnicas y orden movida a "Probado".', { after: 0 })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [body('Jueves 10:00 - 11:00', { after: 0 })] }),
                  new TableCell({ children: [body('Reinstalación en aula, prueba en vivo ante el docente y firma conforme.', { after: 0 })] }),
                  new TableCell({ children: [body('Prof. Aragon Lautaro y Gomez Gonzalo', { after: 0 })] }),
                  new TableCell({ children: [body('Orden finalizada en "Entregado" con registro inmutable en auditoría.', { after: 0 })] })
                ]
              })
            ]
          }),

          heading2('3.3 Recorrido Completo de una Solicitud Paso a Paso (Caso OT-0001)'),
          body(
            'Para entender cómo opera el método en la práctica real, se describe el viaje completo que realizó la orden OT-0001 desde que se detectó la falla en el aula hasta su cierre definitivo:'
          ),
          bullet('Paso 1 — Solicitud y Recepción (Lunes 08:15 hs): ', 'El Prof. Aragon Lautaro ingresa a `/nuevo-pedido` desde su teléfono o PC de aula. Completa: Equipo: "PC 3 - Laboratorio 1", Ubicación: "Laboratorio de Informática 1", Comisión: "Hardware", Prioridad: "Alta" y Falla: "No da video tras tormenta eléctrica. Ventilador gira pero pantalla queda negra". Al enviar, el sistema le asigna el código único `OT-0001` y la orden aparece en el Tablero de Taller en estado "Recibido".'),
          bullet('Paso 2 — Diagnóstico Técnico (Lunes 11:30 hs): ', 'El técnico Gomez Gonzalo entra a `/taller`, hace clic en la tarjeta de la OT-0001 y se autoasigna con el botón "Tomar pedido". Abre el gabinete en la mesa antiestática. Mide las tensiones de la fuente de poder: la línea de 12V marca 11.2V con ruido parásito. Retira el módulo de memoria RAM y encuentra sulfato por humedad en los pines del zócalo DIMM 1; además, la pasta del microprocesador está seca. Escribe las observaciones en el apartado de diagnóstico y arrastra el estado hacia "Diagnóstico".'),
          bullet('Paso 3 — Reparación y Descuento de Repuestos (Martes 09:20 hs): ', 'Limpia el zócalo de memoria con alcohol isopropílico de 99% y cepillo antiestático. Remueve la pasta vieja con solvente cítrico y aplica una gota de pasta térmica nueva de alta densidad. Como la fuente original estaba desvalorizada, solicita una fuente ATX de 450W testeada del pañol. En el sistema, selecciona "Fuente ATX 450W" usando el combobox de inventario y confirma la transición a "Reparar u optimizar". La base de datos descuenta automáticamente 1 unidad del stock de pañol.'),
          bullet('Paso 4 — Control de Calidad (Miércoles 10:00 hs): ', 'Lucas Martínez conecta la computadora a la pantalla de pruebas. Ejecuta la herramienta MemTest86 durante dos ciclos completos (cero errores en memoria) y luego corre un benchmark de estrés de CPU durante 40 minutos. La temperatura se mantiene estable en 52°C. Satisfecho con la estabilidad, arrastra la orden a "Probado".'),
          bullet('Paso 5 — Entrega Conforme y Cierre de Trazabilidad (Jueves 10:15 hs): ', 'El equipo se lleva de regreso al Laboratorio 1. El Prof. Aragon la enciende, comprueba que bootea Windows y Huayra sin demoras, y desde su usuario en la aplicación presiona el botón verde "Confirmar recepción conforme del equipo". La orden pasa a "Entregado" y se genera el asiento de auditoría final.'),

          heading2('3.4 Simulación y Resolución de un Imprevisto Crítico aplicando el Reglamento'),
          body(
            'Un buen sistema de organización no es aquel donde nunca pasa nada malo, sino aquel que tiene previsto exactamente qué hacer cuando algo sale mal. Durante la simulación, se introdujo un imprevisto complejo en la orden OT-0004 (Netbook Conectar Igualdad):'
          ),
          bullet('El Imprevisto en la Mesa de Trabajo: ', 'La netbook ingresó con el reporte de "No carga la batería". Sin embargo, al desarmar la carcasa plástica, el técnico descubrió que el pin de carga interno (jack DC) estaba partido por un tirón de cable y, al quebrarse, había arrancado dos pistas de cobre de la placa madre multicapa. ¡La falla era mucho más grave de lo previsto y requería micro-soldadura con alambre de cobre esmaltado, con riesgo de dañar la placa si el calor se excedía!'),
          bullet('Paso 1 — Detección y Detención Inmediata: ', 'Siguiendo el principio de prudencia técnica, el alumno Gomez Gonzalo detuvo inmediatamente la intervención. No intentó forzar la soldadura a ciegas.'),
          bullet('Paso 2 — Registro en la Bitácora del Sistema: ', 'Ingresó a la orden en el sistema web, redactó una nota técnica extraordinaria: "Se constata daño estructural en pista de placa madre por tirón en jack DC. Se requiere micro-soldadura de puente y reemplazo de conector hembra" y adjuntó el nuevo diagnóstico técnico.'),
          bullet('Paso 3 — Aplicación del Reglamento Interno de la Precooperativa: ', 'Conforme al Artículo 14 del Reglamento de Taller ("Intervenciones de Alto Riesgo o Fuera de Presupuesto"), cuando una reparación supera los insumos estándar o presenta riesgo de pérdida total del equipo, el técnico debe convocar en el momento al Encargado de Pañol y al Docente Asesor. Se realizó una breve reunión en el taller y se labró un acta simplificada donde el profesor autorizó el procedimiento de micro-soldadura bajo su supervisión directa.'),
          bullet('Paso 4 — Comunicación Transparente al Solicitante: ', 'A través del sistema, se le notificó al docente solicitante que el equipo demoraría 24 horas adicionales debido a la reparación de la pista de cobre, aclarándole que la precooperativa asumiría el costo del repuesto sin ningún cargo para la escuela.'),
          bullet('Resultado del Imprevisto: ', 'La pista se reconstruyó con éxito, el conector nuevo se soldó con refuerzo de resina epoxi y la netbook volvió a cargar normalmente. Lo que podría haber sido un conflicto o un equipo roto en secreto se convirtió en una demostración de método, transparencia y profesionalismo cooperativo.'),

          heading2('3.5 Conclusiones Generales del Proyecto Precooperativo'),
          body(
            'El desarrollo integral de este proyecto y su implementación en la materia Organización y Métodos permite extraer conclusiones de gran valor para nuestra formación técnica:'
          ),
          bullet('1. El método vence a la improvisación: ', 'Un taller donde se anotan las cosas en un papel borrador o en la memoria de los chicos está condenado al desorden y a la pérdida de repuestos. La plataforma web en Vue.js y Supabase garantiza que cada tornillo, cada fuente y cada hora de trabajo dejen una huella digital inmutable.'),
          bullet('2. Doble impacto pedagógico y social: ', 'Los estudiantes de 7° año no solo practicamos programación full-stack, bases de datos relacionales y soldadura de componentes electrónicos: aprendemos a administrar una organización real, a debatir en asamblea y a devolverle a la escuela pública parte de lo que nos brindó, recuperando computadoras que de otro modo quedarían arrumbadas en un depósito.'),
          bullet('3. Preparación para el mundo laboral: ', 'El uso de KPIs, tableros de control de procesos, trazabilidad de órdenes y hojas de ruta de mejora continua son exactamente las competencias que las empresas de tecnología e ingeniería exigen a sus profesionales en el mercado actual.')
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  const primaryPath = path.join(docsDir, 'Informe_Seguimiento_Gomez_Gonzalo.docx');
  const fallbackPath = path.join(docsDir, 'Informe_Seguimiento_Gomez_Gonzalo_Completo.docx');

  try {
    fs.writeFileSync(primaryPath, buffer);
    console.log(`Documento Word didáctico y exhaustivo generado con éxito en: ${primaryPath} (${buffer.length} bytes)`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.warn(`El archivo principal está abierto en Microsoft Word. Guardando en: ${fallbackPath}`);
      fs.writeFileSync(fallbackPath, buffer);
      console.log(`Documento Word didáctico y exhaustivo generado con éxito en: ${fallbackPath} (${buffer.length} bytes)`);
    } else {
      throw err;
    }
  }
}

generateCompleteDocx().catch(err => {
  console.error('Error generando documento DOCX:', err);
  process.exit(1);
});
