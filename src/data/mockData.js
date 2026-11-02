// ==============================================================================
// DATOS FICTICIOS / DE PRUEBA (MOCK DATA)
// Basados en el informe técnico de la Precooperativa Escolar
// "Clínica de Hardware y Optimización Escolar"
// ==============================================================================

export const MOCK_USERS = [
  {
    id: 'user-aragon',
    nombre_completo: 'Prof. Juan Aragón',
    email: 'aragon@escuela.edu.ar',
    rol: 'docente',
    rol_nombre: 'Docente / Responsable de Aula (Solicitante)',
    comision: 'Docente de Laboratorio',
    icon: 'user-check',
    descripcion_permisos: 'Puede solicitar reparaciones, ver el estado de sus pedidos y confirmar la recepción del equipo reparado.'
  },
  {
    id: 'user-gonzalo',
    nombre_completo: 'Gonzalo Gomez Bustamante',
    email: 'gonzalo@precoop.escuela.edu.ar',
    rol: 'tecnico',
    rol_nombre: 'Estudiante Asociado / Técnico de Hardware',
    comision: 'Hardware',
    curso: '6to Año Informática',
    icon: 'wrench',
    descripcion_permisos: 'Gestiona el tablero Kanban, repara periféricos, suelda componentes, prueba equipos y descuenta insumos.'
  },
  {
    id: 'user-sofia',
    nombre_completo: 'Sofía Valenzuela',
    email: 'sofia@precoop.escuela.edu.ar',
    rol: 'tecnico',
    rol_nombre: 'Estudiante Asociada / Técnica de Software y Redes',
    comision: 'Software y Redes',
    curso: '5to Año Informática',
    icon: 'laptop',
    descripcion_permisos: 'Aplica debloating en Windows, configura adaptadores Wi-Fi y routers escolares, y reporta horas técnicas.'
  },
  {
    id: 'user-lucas',
    nombre_completo: 'Lucas Martínez',
    email: 'lucas@precoop.escuela.edu.ar',
    rol: 'consejo',
    rol_nombre: 'Consejo de Administración (Tesorería)',
    comision: 'Consejo de Administración',
    curso: '7mo Año Informática',
    icon: 'dollar',
    descripcion_permisos: 'Administra el inventario de repuestos, asienta facturas en el Libro Diario y convoca reuniones.'
  },
  {
    id: 'user-mariana',
    nombre_completo: 'Prof. Mariana Rossi',
    email: 'mariana.rossi@escuela.edu.ar',
    rol: 'sindicatura',
    rol_nombre: 'Sindicatura / Comisión Asesora Docente',
    comision: 'Sindicatura y Fiscalización',
    icon: 'shield',
    descripcion_permisos: 'Acceso de auditoría y lectura a todos los módulos sin intervenir en la carga operativa.'
  }
]

export const MOCK_ORDERS = [
  {
    id: 'ot-0021',
    codigo_ot: 'OT-0021',
    equipo: 'PC 4 - Laboratorio de Hardware',
    aula_laboratorio: 'Lab Hardware',
    descripcion_falla: 'No enciende tras corte de energía. Fuente de poder emite zumbido intermitente y olor a recalentamiento.',
    comision_responsable: 'Hardware',
    prioridad: 'Media',
    estado: 'Reparar u optimizar',
    solicitante_id: 'user-aragon',
    solicitante_nombre: 'Prof. Juan Aragón',
    tecnico_asignado_id: 'user-gonzalo',
    tecnico_asignado_nombre: 'Gonzalo Gomez Bustamante',
    diagnostico: 'Capacitores hinchados en la etapa de filtrado primario de la fuente de alimentación. Requiere reemplazo de fuente ATX de 450W.',
    trabajo_realizado: 'Se desmontó la fuente dañada y se instaló fuente de repuesto de 450W del pañol. Limpieza de ventilador y pasta térmica.',
    pruebas_control_calidad: 'Encendido continuo en banco de prueba por 45 minutos sin caídas de tensión.',
    insumos_usados: [
      { id: 'rep-fuente', nombre: 'Fuente ATX 450 W', cantidad: 1 }
    ],
    es_dato_prueba: true,
    fecha_solicitud: '2026-10-28T10:15:00Z',
    historial: [
      { fecha: '2026-10-28 10:15', estado: 'Recibido', responsable: 'Prof. Juan Aragón', nota: 'Solicitud ingresada por lentitud y falla eléctrica' },
      { fecha: '2026-10-29 09:30', estado: 'Diagnóstico', responsable: 'Gonzalo Gomez Bustamante', nota: 'Diagnóstico confirmado: fuente averiada' },
      { fecha: '2026-10-30 11:00', estado: 'Reparar u optimizar', responsable: 'Gonzalo Gomez Bustamante', nota: 'En proceso de sustitución de fuente' }
    ]
  },
  {
    id: 'ot-0018',
    codigo_ot: 'OT-0018',
    equipo: 'PC de escritorio - Aula 2',
    aula_laboratorio: 'Aula 2',
    descripcion_falla: 'Lentitud extrema en el inicio de Windows y trabas continuas en Visual Studio Code. Alumnos no pueden compilar a tiempo.',
    comision_responsable: 'Software y Redes',
    prioridad: 'Alta',
    estado: 'Diagnóstico',
    solicitante_id: 'user-aragon',
    solicitante_nombre: 'Prof. Juan Aragón',
    tecnico_asignado_id: 'user-sofia',
    tecnico_asignado_nombre: 'Sofía Valenzuela',
    diagnostico: 'Windows 10 saturado de servicios innecesarios, telemetría y software residente de inicio. Memoria al 92% en reposo.',
    trabajo_realizado: 'Pendiente de script de debloating y desactivación de programas de inicio.',
    pruebas_control_calidad: null,
    insumos_usados: [],
    es_dato_prueba: true,
    fecha_solicitud: '2026-10-29T14:30:00Z',
    historial: [
      { fecha: '2026-10-29 14:30', estado: 'Recibido', responsable: 'Prof. Juan Aragón', nota: 'Pedido registrado para aula 2' },
      { fecha: '2026-10-30 08:45', estado: 'Diagnóstico', responsable: 'Sofía Valenzuela', nota: 'Análisis de procesos de arranque completado' }
    ]
  },
  {
    id: 'ot-0020',
    codigo_ot: 'OT-0020',
    equipo: 'Auriculares x 6 - Aula 5',
    aula_laboratorio: 'Aula 5',
    descripcion_falla: 'Falso contacto en cable y fichas jack arrancadas en puestos de multimedia y audiolibros.',
    comision_responsable: 'Hardware',
    prioridad: 'Baja',
    estado: 'Probado',
    solicitante_id: 'user-aragon',
    solicitante_nombre: 'Prof. Juan Aragón',
    tecnico_asignado_id: 'user-gonzalo',
    tecnico_asignado_nombre: 'Gonzalo Gomez Bustamante',
    diagnostico: 'Fichas rotas por tirón físico. Cable esmaltado interior requiere pelado térmico y soldadura nueva.',
    trabajo_realizado: 'Se cortaron 5 cm de cable dañado y se soldaron 6 fichas jack 3.5mm estéreo con estaño 60/40 y termocontraíble.',
    pruebas_control_calidad: 'Prueba de audio estéreo y continuidad en ambos canales (L/R) con tester digital.',
    insumos_usados: [
      { id: 'rep-estano', nombre: 'Estaño para soldar 60/40 (rollo)', cantidad: 1 },
      { id: 'rep-jack', nombre: 'Fichas Jack 3.5 mm estéreo', cantidad: 6 }
    ],
    es_dato_prueba: true,
    fecha_solicitud: '2026-10-27T09:00:00Z',
    historial: [
      { fecha: '2026-10-27 09:00', estado: 'Recibido', responsable: 'Prof. Juan Aragón', nota: 'Recepción de lote de 6 auriculares' },
      { fecha: '2026-10-27 15:20', estado: 'Diagnóstico', responsable: 'Gonzalo Gomez Bustamante', nota: 'Aprobada intervención por Comisión Hardware' },
      { fecha: '2026-10-28 16:00', estado: 'Reparar u optimizar', responsable: 'Gonzalo Gomez Bustamante', nota: 'Soldadura de nuevas fichas y fijación con termocontraíble' },
      { fecha: '2026-10-30 17:30', estado: 'Probado', responsable: 'Gonzalo Gomez Bustamante', nota: 'Aprobó control de calidad estéreo. Listo para retirar.' }
    ]
  },
  {
    id: 'ot-0015',
    codigo_ot: 'OT-0015',
    equipo: 'Router Wi-Fi TP-Link - Aula 1',
    aula_laboratorio: 'Aula 1',
    descripcion_falla: 'Pérdida de conectividad periódica y saturación del rango DHCP al conectarse simultáneamente 25 netbooks.',
    comision_responsable: 'Software y Redes',
    prioridad: 'Media',
    estado: 'Entregado',
    solicitante_id: 'user-aragon',
    solicitante_nombre: 'Prof. Juan Aragón',
    tecnico_asignado_id: 'user-sofia',
    tecnico_asignado_nombre: 'Sofía Valenzuela',
    diagnostico: 'Firmware desactualizado y lease time DHCP configurado en 7 días, colapsando la tabla de direcciones.',
    trabajo_realizado: 'Actualización a firmware estable, aislamiento de clientes AP y reducción de tiempo de concesión DHCP a 2 horas.',
    pruebas_control_calidad: 'Prueba de carga con 24 netbooks con streaming local concurrente sin pérdida de paquetes.',
    insumos_usados: [],
    es_dato_prueba: true,
    fecha_solicitud: '2026-10-20T11:20:00Z',
    historial: [
      { fecha: '2026-10-20 11:20', estado: 'Recibido', responsable: 'Prof. Juan Aragón', nota: 'Reportado por docente de matemáticas' },
      { fecha: '2026-10-21 10:00', estado: 'Diagnóstico', responsable: 'Sofía Valenzuela', nota: 'Verificación de saturación de leases' },
      { fecha: '2026-10-22 14:00', estado: 'Reparar u optimizar', responsable: 'Sofía Valenzuela', nota: 'Reconfiguración de SSID y canal 6 sin solapamiento' },
      { fecha: '2026-10-23 09:00', estado: 'Probado', responsable: 'Sofía Valenzuela', nota: 'Prueba de carga exitosa' },
      { fecha: '2026-10-24 12:00', estado: 'Entregado', responsable: 'Prof. Juan Aragón', nota: 'Docente confirmó recepción en Aula 1' }
    ]
  },
  {
    id: 'ot-0012',
    codigo_ot: 'OT-0012',
    equipo: 'Monitor Samsung 19" - Biblioteca',
    aula_laboratorio: 'Biblioteca',
    descripcion_falla: 'Pantalla parpadea al encender y se apaga a los 3 segundos (inverter con falla o capacitores de backlight agotados).',
    comision_responsable: 'Hardware',
    prioridad: 'Baja',
    estado: 'Entregado',
    solicitante_id: 'user-aragon',
    solicitante_nombre: 'Bibliotecario Marcos',
    tecnico_asignado_id: 'user-gonzalo',
    tecnico_asignado_nombre: 'Gonzalo Gomez Bustamante',
    diagnostico: 'Dos condensadores electrolíticos de 1000uF 25V secos en la placa de alimentación.',
    trabajo_realizado: 'Desoldado de componentes hinchados y montaje de capacitores nuevos de bajo ESR.',
    pruebas_control_calidad: 'Test de imagen continua por 3 horas con brillo al 80%. Imagen nítida sin oscilaciones.',
    insumos_usados: [
      { id: 'rep-estano', nombre: 'Estaño para soldar 60/40', cantidad: 1 }
    ],
    es_dato_prueba: true,
    fecha_solicitud: '2026-10-15T08:30:00Z',
    historial: [
      { fecha: '2026-10-15 08:30', estado: 'Recibido', responsable: 'Bibliotecario Marcos', nota: 'Monitor retirado de biblioteca' },
      { fecha: '2026-10-16 11:00', estado: 'Diagnóstico', responsable: 'Gonzalo Gomez Bustamante', nota: 'Condensadores averiados localizados con capacímetro' },
      { fecha: '2026-10-18 15:30', estado: 'Reparar u optimizar', responsable: 'Gonzalo Gomez Bustamante', nota: 'Reemplazo y soldadura completada' },
      { fecha: '2026-10-19 10:00', estado: 'Probado', responsable: 'Gonzalo Gomez Bustamante', nota: 'Prueba térmica superada' },
      { fecha: '2026-10-19 16:00', estado: 'Entregado', responsable: 'Bibliotecario Marcos', nota: 'Reinstalado en el puesto de catálogo de biblioteca' }
    ]
  }
]

export const MOCK_INVENTORY = [
  {
    id: 'rep-ram',
    nombre: 'Memoria RAM DDR3 4 GB',
    categoria: 'Hardware',
    stock_actual: 5,
    stock_minimo: 2,
    unidad_medida: 'módulos',
    ubicacion: 'Gavetero A1',
    precio_estimado: 6500,
    alerta_stock: false
  },
  {
    id: 'rep-ssd',
    nombre: 'SSD 240 GB Kingston',
    categoria: 'Hardware',
    stock_actual: 3,
    stock_minimo: 2,
    unidad_medida: 'unidades',
    ubicacion: 'Gavetero A2',
    precio_estimado: 18500,
    alerta_stock: false
  },
  {
    id: 'rep-fuente',
    nombre: 'Fuente ATX 450 W',
    categoria: 'Hardware',
    stock_actual: 1,
    stock_minimo: 2,
    unidad_medida: 'unidades',
    ubicacion: 'Estante B3',
    precio_estimado: 24000,
    alerta_stock: true
  },
  {
    id: 'rep-estano',
    nombre: 'Estaño para soldar 60/40 (rollo)',
    categoria: 'Insumos',
    stock_actual: 1,
    stock_minimo: 2,
    unidad_medida: 'rollos',
    ubicacion: 'Mesa de Soldadura',
    precio_estimado: 7500,
    alerta_stock: true
  },
  {
    id: 'rep-wifi',
    nombre: 'Adaptador Wi-Fi USB 300Mbps',
    categoria: 'Redes',
    stock_actual: 4,
    stock_minimo: 2,
    unidad_medida: 'unidades',
    ubicacion: 'Gavetero C1',
    precio_estimado: 8200,
    alerta_stock: false
  },
  {
    id: 'rep-jack',
    nombre: 'Fichas Jack 3.5 mm estéreo',
    categoria: 'Insumos',
    stock_actual: 14,
    stock_minimo: 5,
    unidad_medida: 'unidades',
    ubicacion: 'Gavetero D4',
    precio_estimado: 450,
    alerta_stock: false
  }
]

export const MOCK_LEDGER = [
  {
    id: 'asiento-01',
    numero_asiento: 1,
    fecha: '2026-10-05',
    tipo: 'Ingreso',
    concepto: 'Asignación de fondo inicial para herramientas y repuestos de taller',
    categoria: 'Aporte cooperativo',
    monto: 85000,
    comprobante: 'ACTA-01-FND',
    registrado_por: 'Lucas Martínez (Tesorero)'
  },
  {
    id: 'asiento-02',
    numero_asiento: 2,
    fecha: '2026-10-14',
    tipo: 'Egreso',
    concepto: 'Compra de 2 rollos de estaño 60/40 y lote de 20 fichas jack 3.5mm para laboratorio',
    categoria: 'Compra de repuestos',
    monto: 14250,
    comprobante: 'FAC-B-0001-000342',
    registrado_por: 'Lucas Martínez (Tesorero)'
  },
  {
    id: 'asiento-03',
    numero_asiento: 3,
    fecha: '2026-10-22',
    tipo: 'Egreso',
    concepto: 'Adquisición de kit de adaptadores Wi-Fi USB para optimización de aulas',
    categoria: 'Herramientas',
    monto: 24600,
    comprobante: 'FAC-B-0002-000891',
    registrado_por: 'Lucas Martínez (Tesorero)'
  }
]

export const MOCK_MINUTES = [
  {
    id: 'acta-12',
    numero: 12,
    tipo: 'Asamblea Ordinaria',
    titulo: 'Acta Nº 12 — Asamblea Anual Ordinaria de Constitución',
    fecha: '2026-03-20',
    resumen: 'Se aprueba el estatuto fundacional de la Clínica de Hardware y Optimización Escolar. Se ratifican los principios de gestión democrática (1 asociado = 1 voto) y no reparto de excedentes en dinero.',
    firmantes: 'Gonzalo Gomez Bustamante (Presidente), Lucas Martínez (Tesorero), Prof. Mariana Rossi (Asesora)'
  },
  {
    id: 'acta-07',
    numero: 7,
    tipo: 'Consejo de Administración',
    titulo: 'Acta Nº 7 — Consejo de Administración: Organización de comisiones de taller',
    fecha: '2026-04-12',
    resumen: 'Asignación de responsables a cada orden, actualización de stock mínimo para fuentes y estaño, y autorización del fondo rotatorio de compras.',
    firmantes: 'Consejo de Administración y Secretaría'
  }
]

export const MOCK_ASSOCIATES = [
  { id: '1', nombre: 'Gonzalo Gomez Bustamante', rol: 'Presidente / Técnico Hardware', curso: '6to Año', estado: 'Activo' },
  { id: '2', nombre: 'Lucas Martínez', rol: 'Tesorero / Consejo', curso: '7mo Año', estado: 'Activo' },
  { id: '3', nombre: 'Sofía Valenzuela', rol: 'Vocal / Técnica Software y Redes', curso: '5to Año', estado: 'Activo' },
  { id: '4', nombre: 'Mateo Fernández', rol: 'Secretario / Consejo', curso: '6to Año', estado: 'Activo' },
  { id: '5', nombre: 'Valentina Díaz', rol: 'Técnica Hardware', curso: '5to Año', estado: 'Activo' },
  { id: '6', nombre: 'Tomás Romero', rol: 'Técnico Software y Redes', curso: '6to Año', estado: 'Activo' },
  { id: '7', nombre: 'Camila Benítez', rol: 'Síndica Titular', curso: '7mo Año', estado: 'Activo' },
  { id: '8', nombre: 'Joaquín Navarro', rol: 'Técnico Hardware', curso: '5to Año', estado: 'Activo' },
  { id: '9', nombre: 'Lucía Morales', rol: 'Técnica Software y Redes', curso: '6to Año', estado: 'Activo' }
]
