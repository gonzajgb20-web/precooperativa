const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.title = 'Clínica de Hardware y Optimización — Precooperativa Escolar';
  pptx.author = 'Gomez Gonzalo — 7° 3°';
  pptx.company = 'EEST — Organización y Métodos';

  // Palette: Dark executive theme (Apple / Vercel modern tech style)
  const C = {
    bg: '0B1120',         // Deep slate background
    cardBg: '162238',     // Card fill
    cardBorder: '25354F', // Card border
    cardBgHover: '1C2B47',
    orange: 'F97316',     // Primary accent
    orangeDark: 'C2410C',
    cyan: '38BDF8',       // Secondary accent
    green: '10B981',      // Success
    red: 'F43F5E',        // Alert
    yellow: 'FBBF24',     // Warning
    purple: 'A855F7',
    textWhite: 'FFFFFF',
    textMuted: '94A3B8',
    textDim: '64748B',
    borderLight: '334155'
  };

  const assetsDir = path.join(__dirname, 'presentation_assets');

  // Helper: Standard slide background & header
  function setupSlideHeader(slide, category, title, subtitle) {
    slide.background = { color: C.bg };

    // Decorative top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8, y: 0.35, w: 0.5, h: 0.05,
      fill: { color: C.orange },
      line: { color: C.orange, width: 0 }
    });

    // Category pill / breadcrumb
    slide.addText(category.toUpperCase(), {
      x: 1.4, y: 0.32, w: 7.5, h: 0.25,
      fontSize: 9, bold: true, color: C.orange,
      fontFace: 'Segoe UI'
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8, y: 0.55, w: 8.5, h: 0.45,
      fontSize: 20, bold: true, color: C.textWhite,
      fontFace: 'Segoe UI'
    });

    // Subtitle
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8, y: 0.98, w: 8.5, h: 0.28,
        fontSize: 11, color: C.textMuted,
        fontFace: 'Segoe UI'
      });
    }

    // Discreet bottom footer
    slide.addText('Precooperativa Escolar • Clínica de Hardware • Gomez Gonzalo (7° 3°)', {
      x: 0.8, y: 5.35, w: 8.4, h: 0.2,
      fontSize: 8, color: C.textDim,
      fontFace: 'Segoe UI'
    });
  }

  // ==========================================
  // SLIDE 1: PORTADA
  // ==========================================
  {
    const s = pptx.addSlide();
    s.background = { color: C.bg };

    // Background accent glow / shapes
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.6, w: 8.4, h: 4.4,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1.5 },
      rectRadius: 0.2
    });

    // Category Badge
    s.addShape(pptx.ShapeType.roundRect, {
      x: 1.2, y: 0.95, w: 3.2, h: 0.32,
      fill: { color: '20160F' },
      line: { color: C.orange, width: 1 },
      rectRadius: 0.16
    });
    s.addText('EEST • 7° AÑO 3° DIVISIÓN • 2026', {
      x: 1.2, y: 0.95, w: 3.2, h: 0.32,
      fontSize: 9, bold: true, color: C.orange,
      align: 'center', valign: 'middle', fontFace: 'Segoe UI'
    });

    // Main Titles
    s.addText('Clínica de Hardware y Optimización', {
      x: 1.2, y: 1.45, w: 7.6, h: 0.7,
      fontSize: 28, bold: true, color: C.textWhite,
      fontFace: 'Segoe UI'
    });

    s.addText('Plataforma Integral de Gestión para la Precooperativa Escolar Técnica', {
      x: 1.2, y: 2.15, w: 7.6, h: 0.4,
      fontSize: 14, color: C.cyan,
      fontFace: 'Segoe UI'
    });

    s.addText('Trazabilidad en tiempo real de reparaciones, control inteligente de inventario,\nadministración contable por partida doble y gobierno cooperativo escolar.', {
      x: 1.2, y: 2.65, w: 7.6, h: 0.6,
      fontSize: 11, color: C.textMuted,
      fontFace: 'Segoe UI'
    });

    // Presenter & Subject Card
    s.addShape(pptx.ShapeType.roundRect, {
      x: 1.2, y: 3.5, w: 7.6, h: 1.15,
      fill: { color: '0E1626' },
      line: { color: C.borderLight, width: 1 },
      rectRadius: 0.12
    });

    s.addText([
      { text: 'Estudiante: ', options: { bold: true, color: C.orange } },
      { text: 'Gomez Gonzalo (7° 3° Informática)   •   ', options: { color: C.textWhite } },
      { text: 'Profesor: ', options: { bold: true, color: C.cyan } },
      { text: 'Aragon Lautaro\n', options: { color: C.textWhite } },
      { text: 'Asignatura: ', options: { bold: true, color: C.green } },
      { text: 'Organización y Métodos   •   ', options: { color: C.textWhite } },
      { text: 'Especialidad: ', options: { bold: true, color: C.yellow } },
      { text: 'Programación e Informática Técnica', options: { color: C.textWhite } }
    ], {
      x: 1.4, y: 3.65, w: 7.2, h: 0.85,
      fontSize: 11, fontFace: 'Segoe UI', valign: 'middle'
    });
  }

  // ==========================================
  // SLIDE 2: EL PROPÓSITO
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Fundamentación', 'Propósito del Proyecto', 'Transformar una necesidad crítica de la escuela pública en formación técnica y ahorro real.');

    // 3 Cards: Problema, Solución, Impacto
    const cards = [
      {
        title: 'El Problema Escolar',
        color: C.red,
        points: [
          'Deterioro constante de netbooks y PCs en aulas y laboratorios.',
          'Presupuestos oficiales insuficientes o demoras de meses.',
          'Equipos arrumbados por fallas simples (pasta térmica, fuentes, cables).'
        ]
      },
      {
        title: 'La Solución Cooperativa',
        color: C.cyan,
        points: [
          'Taller técnico operado por estudiantes de 7mo año de Informática.',
          'Principios cooperativos: ayuda mutua, equidad y servicio solidario.',
          'Prácticas profesionalizantes con herramientas digitales modernas.'
        ]
      },
      {
        title: 'El Impacto Medible',
        color: C.green,
        points: [
          'Reparaciones completadas en promedio en menos de 48 horas.',
          '$214.500 ARS ahorrados en mano de obra en el período piloto.',
          'Trazabilidad total: cada tornillo y repuesto queda registrado.'
        ]
      }
    ];

    cards.forEach((c, i) => {
      const x = 0.8 + i * 2.85;
      s.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.45, w: 2.7, h: 2.7,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      // Top colored bar
      s.addShape(pptx.ShapeType.rect, {
        x, y: 1.45, w: 2.7, h: 0.08,
        fill: { color: c.color },
        line: { color: c.color, width: 0 }
      });

      s.addText(c.title, {
        x: x + 0.2, y: 1.65, w: 2.3, h: 0.35,
        fontSize: 13, bold: true, color: C.textWhite, fontFace: 'Segoe UI'
      });

      s.addText(c.points.map(p => `• ${p}`).join('\n\n'), {
        x: x + 0.2, y: 2.05, w: 2.3, h: 1.9,
        fontSize: 10, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });

    // Bottom Impact Banner
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.3, w: 8.4, h: 0.85,
      fill: { color: '101A2B' },
      line: { color: C.borderLight, width: 1 },
      rectRadius: 0.1
    });

    s.addText([
      { text: '$0  ', options: { fontSize: 16, bold: true, color: C.orange } },
      { text: 'Costo para la institución escolar     |     ', options: { fontSize: 10, color: C.textMuted } },
      { text: '100%  ', options: { fontSize: 16, bold: true, color: C.green } },
      { text: 'Equipos recuperados en la escuela     |     ', options: { fontSize: 10, color: C.textMuted } },
      { text: '48 hs  ', options: { fontSize: 16, bold: true, color: C.cyan } },
      { text: 'Tiempo medio de respuesta', options: { fontSize: 10, color: C.textMuted } }
    ], {
      x: 1.0, y: 4.45, w: 8.0, h: 0.55,
      align: 'center', fontFace: 'Segoe UI'
    });
  }

  // ==========================================
  // SLIDE 3: STACK TECNOLÓGICO
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Ingeniería de Software', 'Arquitectura y Stack Tecnológico', 'Diseñado para ofrecer máxima fluidez, reactividad instantánea y seguridad empresarial.');

    const tech = [
      {
        badge: 'FRONTEND REACTIVO',
        name: 'Vue.js 3 + Vite',
        color: C.green,
        desc: 'Composition API (<script setup>) para alta modularidad. Vite garantiza compilación en <500ms y hot-reloading instantáneo.'
      },
      {
        badge: 'DISEÑO & UX',
        name: 'Emil Kowalski System',
        color: C.orange,
        desc: 'Microinteracciones táctiles, animaciones con curvas físicas (ease-out), selectores accesibles y sin textos redundantes.'
      },
      {
        badge: 'BASE DE DATOS',
        name: 'Supabase (PostgreSQL)',
        color: C.cyan,
        desc: 'Base relacional robusta en la nube. Soporte de suscripciones en tiempo real para que todos los puestos vean los cambios al instante.'
      },
      {
        badge: 'SEGURIDAD & ROLES',
        name: 'Row Level Security (RLS)',
        color: C.purple,
        desc: 'Políticas estrictas en base de datos. Cada usuario solo puede ver o modificar los datos autorizados según su rol institucional.'
      }
    ];

    tech.forEach((t, i) => {
      const x = 0.8 + (i % 2) * 4.3;
      const y = 1.45 + Math.floor(i / 2) * 1.85;

      s.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 4.1, h: 1.65,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      // Badge
      s.addText(t.badge, {
        x: x + 0.25, y: y + 0.15, w: 3.5, h: 0.2,
        fontSize: 8.5, bold: true, color: t.color, fontFace: 'Segoe UI'
      });

      // Name
      s.addText(t.name, {
        x: x + 0.25, y: y + 0.35, w: 3.5, h: 0.35,
        fontSize: 14, bold: true, color: C.textWhite, fontFace: 'Segoe UI'
      });

      // Desc
      s.addText(t.desc, {
        x: x + 0.25, y: y + 0.72, w: 3.6, h: 0.8,
        fontSize: 9.5, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLIDE 4: FLUJO OPERATIVO (CIRCUITO END-TO-END)
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Organización y Métodos', 'Ciclo Operativo del Servicio', 'Trazabilidad rigurosa de 5 fases estandarizadas para cada computadora atendida.');

    const steps = [
      { num: '01', title: 'Solicitud', role: 'Docente', desc: 'Carga equipo, aula y síntoma de falla en formulario web.' },
      { num: '02', title: 'Diagnóstico', role: 'Técnico', desc: 'Inspección física en banco de pruebas y plan de acción.' },
      { num: '03', title: 'Reparación', role: 'Taller', desc: 'Mano de obra técnica y deducción de repuestos en stock.' },
      { num: '04', title: 'Pruebas QA', role: 'Calidad', desc: 'Test de estrés de temperatura, booteo y estabilidad.' },
      { num: '05', title: 'Entrega', role: 'Docente/Admin', desc: 'Firma de acta, entrega del equipo y cierre de la orden.' }
    ];

    steps.forEach((st, i) => {
      const x = 0.8 + i * 1.7;
      s.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.5, w: 1.58, h: 3.4,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1
      });

      // Number badge
      s.addShape(pptx.ShapeType.ellipse, {
        x: x + 0.45, y: 1.7, w: 0.65, h: 0.65,
        fill: { color: '20160F' },
        line: { color: C.orange, width: 1.5 }
      });
      s.addText(st.num, {
        x: x + 0.45, y: 1.7, w: 0.65, h: 0.65,
        fontSize: 12, bold: true, color: C.orange,
        align: 'center', valign: 'middle', fontFace: 'Segoe UI'
      });

      // Title
      s.addText(st.title, {
        x: x + 0.1, y: 2.5, w: 1.38, h: 0.35,
        fontSize: 12, bold: true, color: C.textWhite,
        align: 'center', fontFace: 'Segoe UI'
      });

      // Role pill
      s.addText(st.role.toUpperCase(), {
        x: x + 0.1, y: 2.85, w: 1.38, h: 0.25,
        fontSize: 8, bold: true, color: C.cyan,
        align: 'center', fontFace: 'Segoe UI'
      });

      // Description
      s.addText(st.desc, {
        x: x + 0.12, y: 3.15, w: 1.34, h: 1.5,
        fontSize: 9, color: C.textMuted,
        align: 'center', fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLIDE 5: VISTA 1 — TABLERO DE TALLER (KANBAN)
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Módulos del Sistema', 'Tablero de Taller (Kanban Visual)', 'Monitoreo ágil y centralizado de la carga de trabajo en tiempo real.');

    // Screenshot container
    const imgPath = path.join(assetsDir, 'media_1794858003935_2b23e850.png');
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.45, w: 4.8, h: 3.6,
      fill: { color: '0A0E1A' },
      line: { color: C.cardBorder, width: 1.5 },
      rectRadius: 0.1
    });

    if (fs.existsSync(imgPath)) {
      s.addImage({
        path: imgPath,
        x: 0.85, y: 1.5, w: 4.7, h: 3.5,
        sizing: { type: 'contain' }
      });
    }

    // Right details
    const features = [
      {
        title: '5 Carriles Operativos',
        color: C.orange,
        desc: 'Recibido, Diagnóstico, En Reparación, Probado y Entregado. Visibilidad total sin pantallas intermedias.'
      },
      {
        title: 'Búsqueda Reactiva',
        color: C.cyan,
        desc: 'Filtros instantáneos por aula, docente solicitante, código OT o falla reportada. Cero recargas de página.'
      },
      {
        title: 'Tarjetas Táctiles',
        color: C.green,
        desc: 'Resumen visual con prioridad (Urgente / Media / Baja), técnico asignado y botón de acceso a la orden.'
      }
    ];

    features.forEach((f, i) => {
      const y = 1.45 + i * 1.22;
      s.addShape(pptx.ShapeType.roundRect, {
        x: 5.8, y, w: 3.4, h: 1.1,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1
      });

      s.addText(f.title, {
        x: 6.0, y: y + 0.12, w: 3.0, h: 0.3,
        fontSize: 12, bold: true, color: f.color, fontFace: 'Segoe UI'
      });

      s.addText(f.desc, {
        x: 6.0, y: y + 0.42, w: 3.0, h: 0.6,
        fontSize: 9.5, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLIDE 6: VISTA 2 — PROCESO DE PEDIDO INTERACTIVO
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Módulos del Sistema', 'Proceso de Pedido y Pipeline Táctil', 'Vista dedicada /taller/pedido/:id con interacción táctil, drag & drop y bitácora técnica.');

    const cards = [
      {
        badge: 'INTERACCIÓN DINÁMICA',
        title: 'Pipeline Drag & Drop',
        color: C.orange,
        desc: 'El técnico puede arrastrar el pedido a la siguiente fase o hacer clic en los botones de avance rápido. La interfaz valida que cada etapa cumpla los requisitos antes de pasar.'
      },
      {
        badge: 'RESPONSABILIDAD CLARA',
        title: 'Asignación con 1 Clic',
        color: C.cyan,
        desc: 'Selector con autocompletado (<AppCombobox>) para designar al técnico responsable o botón "Tomar Pedido" para autoasignarse al instante.'
      },
      {
        badge: 'AUDITORÍA TÉCNICA',
        title: 'Bitácora y Repuestos',
        color: C.green,
        desc: 'Registro de observaciones técnicas inmutables y deducción automática de repuestos del inventario (pasta térmica, estaño, fuentes) con cálculo de costo.'
      }
    ];

    cards.forEach((c, i) => {
      const x = 0.8 + i * 2.85;
      s.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.5, w: 2.7, h: 3.4,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      // Top colored bar
      s.addShape(pptx.ShapeType.rect, {
        x, y: 1.5, w: 2.7, h: 0.08,
        fill: { color: c.color },
        line: { color: c.color, width: 0 }
      });

      s.addText(c.badge, {
        x: x + 0.2, y: 1.7, w: 2.3, h: 0.2,
        fontSize: 8, bold: true, color: c.color, fontFace: 'Segoe UI'
      });

      s.addText(c.title, {
        x: x + 0.2, y: 1.95, w: 2.3, h: 0.5,
        fontSize: 13, bold: true, color: C.textWhite, fontFace: 'Segoe UI'
      });

      s.addText(c.desc, {
        x: x + 0.2, y: 2.5, w: 2.3, h: 2.2,
        fontSize: 9.5, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLIDE 7: VISTA 3 — INVENTARIO DE REPUESTOS
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Módulos del Sistema', 'Inventario Inteligente de Repuestos', 'Control estricto de existencias, umbrales de stock mínimo y localización física.');

    const imgPath = path.join(assetsDir, 'media_1794855798242_a388dff5.png');
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.45, w: 4.8, h: 3.6,
      fill: { color: '0A0E1A' },
      line: { color: C.cardBorder, width: 1.5 },
      rectRadius: 0.1
    });

    if (fs.existsSync(imgPath)) {
      s.addImage({
        path: imgPath,
        x: 0.85, y: 1.5, w: 4.7, h: 3.5,
        sizing: { type: 'contain' }
      });
    }

    const items = [
      {
        title: 'Alertas de Stock Bajo',
        color: C.red,
        desc: 'El sistema resalta en rojo los insumos con stock menor o igual al mínimo requerido para evitar frenar reparaciones.'
      },
      {
        title: 'Ubicación en el Taller',
        color: C.yellow,
        desc: 'Cada repuesto indica su lugar físico exacto (ej. Gavetero C1, Estante B3, Mesa de Soldadura) para agilizar el trabajo.'
      },
      {
        title: 'Valorización Económica',
        color: C.green,
        desc: 'Precio estimado de reposición para calcular el costo de cada reparación y alimentar el libro contable de la cooperativa.'
      }
    ];

    items.forEach((it, i) => {
      const y = 1.45 + i * 1.22;
      s.addShape(pptx.ShapeType.roundRect, {
        x: 5.8, y, w: 3.4, h: 1.1,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1
      });

      s.addText(it.title, {
        x: 6.0, y: y + 0.12, w: 3.0, h: 0.3,
        fontSize: 12, bold: true, color: it.color, fontFace: 'Segoe UI'
      });

      s.addText(it.desc, {
        x: 6.0, y: y + 0.42, w: 3.0, h: 0.6,
        fontSize: 9.5, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLIDE 8: VISTA 4 — ASAMBLEA Y LIBRO DIARIO
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Gobierno y Finanzas', 'Asamblea y Libro Diario Contable', 'Transparencia económica, administración por partida doble y legalidad precooperativa.');

    const imgPath = path.join(assetsDir, 'media_1794853278055_5d9f106a.png');
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.45, w: 4.8, h: 3.6,
      fill: { color: '0A0E1A' },
      line: { color: C.cardBorder, width: 1.5 },
      rectRadius: 0.1
    });

    if (fs.existsSync(imgPath)) {
      s.addImage({
        path: imgPath,
        x: 0.85, y: 1.5, w: 4.7, h: 3.5,
        sizing: { type: 'contain' }
      });
    }

    const items = [
      {
        title: 'Partida Doble (Debe y Haber)',
        color: C.cyan,
        desc: 'Cada compra de repuestos o donación recibida se asienta con comprobante, fecha, cuenta contable y balance equilibrado.'
      },
      {
        title: 'Fondos de Reserva Estatutarios',
        color: C.green,
        desc: 'Cálculo automático de la Reserva Legal (5%), Fondo de Asistencia Social (5%) y Excedentes según la Ley de Cooperativas.'
      },
      {
        title: 'Libro Digital de Actas',
        color: C.purple,
        desc: 'Registro inmutable de decisiones tomadas en Asamblea General Ordinaria, firmas de socios y memoria anual de gestión.'
      }
    ];

    items.forEach((it, i) => {
      const y = 1.45 + i * 1.22;
      s.addShape(pptx.ShapeType.roundRect, {
        x: 5.8, y, w: 3.4, h: 1.1,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1
      });

      s.addText(it.title, {
        x: 6.0, y: y + 0.12, w: 3.0, h: 0.3,
        fontSize: 12, bold: true, color: it.color, fontFace: 'Segoe UI'
      });

      s.addText(it.desc, {
        x: 6.0, y: y + 0.42, w: 3.0, h: 0.6,
        fontSize: 9.5, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLIDE 9: VISTA 5 — SEGURIDAD Y ROLES (RBAC)
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Control de Acceso', 'Seguridad y Matriz de Roles (RBAC)', 'Nivel de acceso segmentado por función institucional para blindar la base de datos.');

    const roles = [
      {
        name: 'Administrador General',
        color: C.red,
        scope: 'Acceso Total',
        desc: 'Gestión de usuarios, auditoría global, asignación de permisos y configuración del sistema.'
      },
      {
        name: 'Técnico de Taller',
        color: C.orange,
        scope: 'Taller & Pedidos',
        desc: 'Diagnóstico técnico, cambio de fases en pipeline, notas de reparación y consumo de repuestos.'
      },
      {
        name: 'Consejo / Sindicatura',
        color: C.cyan,
        scope: 'Gestión & Control',
        desc: 'Emisión de informes, aprobación de compras, fiscalización de cuentas y libro de actas.'
      },
      {
        name: 'Docente Solicitante',
        color: C.green,
        scope: 'Solicitud & Consulta',
        desc: 'Carga de nuevos pedidos de reparación de su aula y consulta del estado de sus equipos.'
      }
    ];

    roles.forEach((r, i) => {
      const x = 0.8 + (i % 2) * 4.3;
      const y = 1.45 + Math.floor(i / 2) * 1.85;

      s.addShape(pptx.ShapeType.roundRect, {
        x, y, w: 4.1, h: 1.65,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      s.addText(r.scope.toUpperCase(), {
        x: x + 0.25, y: y + 0.15, w: 3.5, h: 0.2,
        fontSize: 8.5, bold: true, color: r.color, fontFace: 'Segoe UI'
      });

      s.addText(r.name, {
        x: x + 0.25, y: y + 0.35, w: 3.5, h: 0.35,
        fontSize: 13, bold: true, color: C.textWhite, fontFace: 'Segoe UI'
      });

      s.addText(r.desc, {
        x: x + 0.25, y: y + 0.72, w: 3.6, h: 0.8,
        fontSize: 9.5, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLIDE 10: RESULTADOS Y KPIS (GRÁFICOS NATIVOS)
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Evaluación de Rendimiento', 'Resultados y Métricas de la Prueba Piloto', 'Datos reales registrados durante la simulación operativa de 12 órdenes.');

    // Native Donut Chart: Tasa de Éxito
    s.addChart(pptx.ChartType.doughnut, [
      {
        name: 'Resolución',
        labels: ['Reparados (92%)', 'En espera repuesto (8%)'],
        values: [11, 1]
      }
    ], {
      x: 0.8, y: 1.45, w: 2.7, h: 2.6,
      chartColors: [C.green, C.orange],
      legendPos: 'b',
      legendColor: C.textMuted,
      legendFontSize: 8,
      title: 'Tasa de Éxito en Reparaciones',
      titleColor: C.textWhite,
      titleFontSize: 11,
      showValue: true,
      dataLabelColor: C.textWhite
    });

    // Native Bar Chart: Tipos de falla
    s.addChart(pptx.ChartType.bar, [
      {
        name: 'Casos Atendidos',
        labels: ['Fuentes ATX', 'Discos / OS', 'RAM / Térmico', 'Redes / Otros'],
        values: [5, 4, 3, 2]
      }
    ], {
      x: 3.6, y: 1.45, w: 3.0, h: 2.6,
      chartColors: [C.cyan],
      title: 'Fallas por Categoría',
      titleColor: C.textWhite,
      titleFontSize: 11,
      catAxisLabelColor: C.textMuted,
      catAxisLabelFontSize: 8,
      valAxisLabelColor: C.textMuted,
      valAxisLabelFontSize: 8,
      showValue: true,
      dataLabelColor: C.textWhite
    });

    // Right side KPI Cards
    const kpis = [
      { value: '$214.500', label: 'Ahorro a la Escuela', color: C.orange, desc: 'Mano de obra privada evitada' },
      { value: '32 hs', label: 'Tiempo Promedio', color: C.green, desc: 'Meta institucional: < 48 hs' },
      { value: '0 %', label: 'Extravíos de Insumos', color: C.cyan, desc: 'Trazabilidad y gaveteros 100%' }
    ];

    kpis.forEach((k, i) => {
      const y = 1.45 + i * 0.88;
      s.addShape(pptx.ShapeType.roundRect, {
        x: 6.75, y, w: 2.45, h: 0.78,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.08
      });

      s.addText(k.value, {
        x: 6.85, y: y + 0.08, w: 2.25, h: 0.35,
        fontSize: 15, bold: true, color: k.color, fontFace: 'Segoe UI'
      });

      s.addText(`${k.label} • ${k.desc}`, {
        x: 6.85, y: y + 0.42, w: 2.25, h: 0.3,
        fontSize: 8, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });

    // Bottom summary banner
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.25, w: 8.4, h: 0.9,
      fill: { color: '101A2B' },
      line: { color: C.borderLight, width: 1 },
      rectRadius: 0.1
    });

    s.addText([
      { text: 'Conclusión Operativa: ', options: { bold: true, color: C.orange } },
      { text: 'El 100% de las metas fijadas en Organización y Métodos fueron cumplidas o superadas, demostrando la viabilidad económica y pedagógica del modelo precooperativo escolar.', options: { color: C.textWhite } }
    ], {
      x: 1.0, y: 4.35, w: 8.0, h: 0.7,
      fontSize: 10, fontFace: 'Segoe UI'
    });
  }

  // ==========================================
  // SLIDE 11: PROTOCOLO DE IMPREVISTOS
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Reglamento Precooperativo (Art. 14)', 'Gestión y Resolución de Imprevistos', 'Protocolo estandarizado ante fallas técnicas ocultas o imprevistos de taller.');

    // Top scenario card
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.45, w: 8.4, h: 0.85,
      fill: { color: '1F161A' },
      line: { color: C.red, width: 1 },
      rectRadius: 0.1
    });

    s.addText([
      { text: 'CASO REAL SIMULADO (OT-0004): ', options: { bold: true, color: C.red } },
      { text: 'Durante el diagnóstico de una Netbook Juana Manso reportada por lentitud, se descubre el pin de carga DC suelto y la pista de cobre quebrada. El equipo no cargaba batería.', options: { color: C.textWhite } }
    ], {
      x: 1.0, y: 1.55, w: 8.0, h: 0.65,
      fontSize: 10.5, fontFace: 'Segoe UI'
    });

    // 4 Steps
    const steps = [
      { num: 'PASO 1', title: 'Detección', color: C.orange, desc: 'El técnico suspende el trabajo y toma registro fotográfico de la pista cortada.' },
      { num: 'PASO 2', title: 'Pausa en Sistema', color: C.yellow, desc: 'La OT pasa a estado "Pausado" en el pipeline con nota técnica detallada.' },
      { num: 'PASO 3', title: 'Comunicación', color: C.cyan, desc: 'Aviso formal al docente con presupuesto estimado de repuesto ($4.500).' },
      { num: 'PASO 4', title: 'Resolución', color: C.green, desc: 'Aprobación del Consejo, soldadura con puente de cobre y test de estrés OK.' }
    ];

    steps.forEach((st, i) => {
      const x = 0.8 + i * 2.15;
      s.addShape(pptx.ShapeType.roundRect, {
        x, y: 2.5, w: 1.95, h: 2.4,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1
      });

      s.addText(st.num, {
        x: x + 0.15, y: 2.65, w: 1.65, h: 0.2,
        fontSize: 8, bold: true, color: st.color, fontFace: 'Segoe UI'
      });

      s.addText(st.title, {
        x: x + 0.15, y: 2.9, w: 1.65, h: 0.35,
        fontSize: 12, bold: true, color: C.textWhite, fontFace: 'Segoe UI'
      });

      s.addText(st.desc, {
        x: x + 0.15, y: 3.3, w: 1.65, h: 1.4,
        fontSize: 9.5, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });
  }

  // ==========================================
  // SLIDE 12: CONCLUSIONES INSTITUCIONALES
  // ==========================================
  {
    const s = pptx.addSlide();
    setupSlideHeader(s, 'Cierre Institucional', 'Conclusiones y Próximos Pasos', 'Síntesis pedagógica, técnica y humana del proyecto precooperativo escolar.');

    const pillars = [
      {
        badge: 'VALOR EDUCATIVO',
        title: 'Práctica Profesionalizante',
        color: C.cyan,
        desc: 'Los alumnos no solo arreglan computadoras: aprenden organización industrial, registro contable, atención al usuario y trabajo en equipo.'
      },
      {
        badge: 'SUSTENTABILIDAD',
        title: 'Ahorro Escolar Continuo',
        color: C.green,
        desc: 'La escuela recupera hardware sin desembolsar partidas presupuestarias imposibles, extendiendo la vida útil de las máquinas.'
      },
      {
        badge: 'DEMOCRACIA & ÉTICA',
        title: 'Cultura Cooperativa',
        color: C.orange,
        desc: 'Toma de decisiones transparente en Asamblea, rendición de cuentas pública y sentido de pertenencia en la escuela técnica.'
      }
    ];

    pillars.forEach((p, i) => {
      const x = 0.8 + i * 2.85;
      s.addShape(pptx.ShapeType.roundRect, {
        x, y: 1.5, w: 2.7, h: 2.6,
        fill: { color: C.cardBg },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.12
      });

      s.addShape(pptx.ShapeType.rect, {
        x, y: 1.5, w: 2.7, h: 0.08,
        fill: { color: p.color },
        line: { color: p.color, width: 0 }
      });

      s.addText(p.badge, {
        x: x + 0.2, y: 1.7, w: 2.3, h: 0.2,
        fontSize: 8, bold: true, color: p.color, fontFace: 'Segoe UI'
      });

      s.addText(p.title, {
        x: x + 0.2, y: 1.95, w: 2.3, h: 0.4,
        fontSize: 13, bold: true, color: C.textWhite, fontFace: 'Segoe UI'
      });

      s.addText(p.desc, {
        x: x + 0.2, y: 2.45, w: 2.3, h: 1.5,
        fontSize: 9.5, color: C.textMuted, fontFace: 'Segoe UI'
      });
    });

    // Institutional Closing Card
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.3, w: 8.4, h: 0.85,
      fill: { color: '0E1626' },
      line: { color: C.orange, width: 1.2 },
      rectRadius: 0.1
    });

    s.addText([
      { text: 'Muchas Gracias  •  ', options: { fontSize: 13, bold: true, color: C.orange } },
      { text: 'Gomez Gonzalo (7° 3°)  |  Prof. Aragon Lautaro  |  Organización y Métodos  |  Ciclo 2026', options: { fontSize: 10, color: C.textWhite } }
    ], {
      x: 1.0, y: 4.45, w: 8.0, h: 0.55,
      align: 'center', fontFace: 'Segoe UI'
    });
  }

  // Save the presentation
  const outputPath = path.join(__dirname, 'Presentacion_Clinica_Hardware_Gomez_Gonzalo.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentación PowerPoint generada con éxito en: ${outputPath}`);
}

createPresentation().catch(err => {
  console.error('Error generando presentación PPTX:', err);
  process.exit(1);
});
