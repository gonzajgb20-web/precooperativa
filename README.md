# Clínica de Hardware y Optimización Escolar 💻🔧
> **Precooperativa Escolar — Escuela de Educación Técnica**  
> *Orientación en Programación e Informática*  
> **Autor / Responsable:** Gonzalo Gomez Bustamante

Sistema digital integral de gestión cooperativa escolar desarrollado en **Vue 3 + Vite**, con diseño responsivo, simulación interactiva de roles institucionales, base de datos relacional PostgreSQL en **Supabase** con políticas **RLS (Row Level Security)**, control de inventario de repuestos con alertas de stock, libro diario de tesorería y trazabilidad completa de órdenes de trabajo.

---

## 📑 Índice de Requerimientos y Diseño del Sistema

A continuación se detalla el cumplimiento exhaustivo de cada uno de los 16 puntos solicitados:

### 1. Revisión de Pantallas, Historias de Usuario y Alcance v1
Se relevaron las 7 pantallas del prototipo y las 3 historias de uso principales del informe técnico institucional:
- **Flujo de 5 etapas (Recorrido de una tarea):** `Cargar pedido` ➔ `Diagnóstico` ➔ `Reparar u optimizar` ➔ `Probar` ➔ `Entregar`.
- **Módulos indispensables implementados en v1:**
  1. *Panel de Inicio y Bienvenida*: Saludo institucional, métricas de taller, recorrido interactivo y órdenes recientes.
  2. *Carga de Pedidos al Taller*: Formulario dual con validaciones y panel explicativo de datos guardados.
  3. *Bandejas del Taller (Kanban)*: Tablero de 5 columnas, filtros por comisión (Hardware / Software y Redes), búsqueda en tiempo real y panel de detalle con trazabilidad.
  4. *Control de Inventario y Equipos Atendidos*: Control de insumos críticos (estaño, fichas jack, fuentes ATX, RAM, SSDs) con alertas visuales de stock bajo y panel oscuro de equipos recuperados.
  5. *Asamblea y Registros*: Actas rubricadas, Libro Diario contable con cálculo de saldos y padrón cooperativo.
  6. *Matriz de Datos y Permisos*: Matriz de roles, justificación de arquitectura y visor SQL.
  7. *Cierre del Ejercicio (31 de Octubre)*: Balance anual con indicadores cuantitativos para la asamblea ordinaria de noviembre.

### 2. Estructura y Organización del Proyecto Vue.js
```
precooperativa/
├── index.html                   # Entrada principal con tipografías Google Fonts (Outfit & Plus Jakarta Sans)
├── package.json                 # Dependencias (Vue 3, Vue Router 4, @supabase/supabase-js)
├── vite.config.js               # Configuración de compilación Vite
├── supabase_schema.sql          # Script SQL completo reproducible con tablas, RLS y seed data
├── .env.example                 # Variables de entorno públicas de ejemplo
├── public/                      # Recursos estáticos
└── src/
    ├── main.js                  # Inicialización y montaje con Vue Router
    ├── style.css                # Sistema de diseño, tokens CSS, componentes y modo responsivo
    ├── supabase.js              # Cliente Supabase seguro con fallback a persistencia local
    ├── composables/
    │   ├── useAuth.js           # Manejo reactivo de usuarios simulados y permisos por rol
    │   └── useToast.js          # Sistema global de notificaciones y alertas
    ├── services/
    │   └── dataService.js       # Capa de datos unificada (Supabase CRUD + LocalStorage reactive fallback)
    ├── data/
    │   └── mockData.js          # Lote de datos ficticios del informe técnico
    ├── components/
    │   ├── Navbar.vue           # Header con pestañas, selector de roles y monitor de Supabase
    │   ├── TaskJourney.vue      # Stepper visual interactivo de las 5 fases de trabajo
    │   ├── OrderDetailModal.vue # Modal/drawer de gestión de orden, auditoría y consumo de insumos
    │   ├── SupabaseModal.vue    # Modal de credenciales seguras y carga de datos simulados a la BD
    │   ├── YearEndModal.vue     # Modal de cierre del ejercicio contable y pedagógico al 31 de Octubre
    │   └── ToastContainer.vue   # Notificaciones flotantes no invasivas
    └── views/
        ├── HomeView.vue         # Pantalla 1: Bienvenida, métricas y órdenes recientes
        ├── NewOrderView.vue     # Pantalla 3: Formulario validado con tarjeta explicativa
        ├── WorkshopView.vue     # Pantalla 4: Tablero Kanban y panel lateral de detalle
        ├── InventoryView.vue    # Pantalla 5: Repuestos con alertas de stock y equipos atendidos
        ├── AssemblyView.vue     # Pantalla 7: Actas, Libro Diario, Padrón y Quién es quién
        └── PermissionsView.vue  # Pantalla 6: Matriz de permisos, Punto 10, Punto 11 y visor SQL
```

### 3. Implementación de Pantallas Principales
Cada pantalla reproduce con precisión la distribución, jerarquía cromática (tonos cálidos corporativos `#ea580c`, fondos suaves `#fff7ed`, tarjetas oscuras `#1e293b` y acentos verde esmeralda) y recorridos diseñados en el documento institucional.

### 4. Navegación y Roles Simulados
Se implementó navegación mediante **Vue Router 4** (`/`, `/nuevo-pedido`, `/taller`, `/inventario`, `/asamblea`, `/permisos`).  
En la barra superior se incorporó un **Selector de Rol Simulado** que permite alternar inmediatamente entre:
- 👨‍🏫 **Prof. Juan Aragón** *(Docente / Solicitante)*
- 🔧 **Gonzalo Gomez Bustamante** *(Estudiante Asociado / Técnico de Hardware)*
- 💻 **Sofía Valenzuela** *(Estudiante Asociada / Técnica de Software y Redes)*
- 📊 **Lucas Martínez** *(Consejo de Administración / Tesorería)*
- ⚖️ **Prof. Mariana Rossi** *(Sindicatura / Comisión Asesora Docente - Modo sólo lectura de auditoría)*

La interfaz y los botones de acción se adaptan reactivamente según los permisos del usuario activo.

### 5. Formularios y Validación Rigurosa
El formulario de **Nuevo Pedido** valida:
- `Equipo o periférico`: Campo obligatorio (mínimo 3 caracteres).
- `Aula o laboratorio`: Campo obligatorio de ubicación escolar.
- `¿Qué le pasa?`: Descripción detallada de falla (mínimo 10 caracteres).
- `Comisión`: Selección obligatoria entre Hardware o Software y Redes.
- `Prioridad`: Selección obligatoria entre Baja, Media y Alta.  
Incluye mensajes de error contextuales y bloqueo de controles para roles no autorizados.

### 6. Identificación de Datos de Prueba (Mock Data)
Todas las órdenes de trabajo, insumos y actas provenientes del lote semilla están claramente identificadas mediante insignias visuales `[DATO DE PRUEBA]`, cumpliendo con la transparencia exigida.

### 7. Interfaz Adaptable (Desktop y Móvil)
- **Escritorio:** Grillas multi-columna (Kanban de 5 columnas, panel lateral fijado, matriz completa).
- **Móvil / Tablet:** Barra de navegación inferior touch-friendly, scroll horizontal en tablas y modales adaptativos con textos contrastados legibles.

### 8. Operaciones CRUD y Conservación del Historial
- **Altas (Create):** Creación de pedidos con código automático `OT-XXXX`, repuestos e insumos, asientos en Libro Diario y actas.
- **Consultas (Read):** Filtros en Kanban, detalle de inspección y rendición de saldos.
- **Modificaciones (Update):** Avance de estados (`Recibido` ➔ `Diagnóstico` ➔ `Reparación` ➔ `Probado` ➔ `Entregado`), asignación técnica y deducción de repuestos utilizados.
- **Eliminación / Cancelación:** En lugar de borrados destructivos que ocasionarían pérdida de auditoría, se implementó **cancelación lógica con motivo registrado**, conservando la trazabilidad completa en el historial inmutable.

### 9. Búsquedas, Filtros y Estados
- Buscador reactivo por código de orden, nombre de equipo, aula o descripción.
- Filtro por comisión: `Todas`, `Hardware`, `Software y Redes`.
- Conmutador `Solo mis pedidos` para docentes y técnicos.
- Indicadores visuales de estado y prioridad por color.

### 10. Persistencia: Local vs Compartida
- **Información que se conserva localmente (al cerrar la app):**  
  Preferencia de rol simulado, borrador de formulario no enviado, configuración de filtros y caché de navegación rápida en `localStorage`.
- **Información que se comparte entre usuarios / dispositivos (Nube en Supabase):**  
  Todas las órdenes de trabajo activas, diagnósticos técnicos, estado del pañol de repuestos (para evitar doble consumo simultáneo), asientos del Libro Diario y actas de asamblea rubricadas.

### 11. Justificación de Backend y Base de Datos
- **¿Se necesita backend? SÍ, ES INDISPENSABLE.**
  El taller cooperativo opera con múltiples docentes solicitando desde diversas aulas y dos comisiones técnicas reparando en simultáneo en los laboratorios.
- **Limitaciones de una solución sin backend (solo LocalStorage):**
  1. *Aislamiento:* Un pedido cargado en el celular de un docente no llegaría jamás a las computadoras del taller.
  2. *Inexistencia de seguridad:* En el cliente no existen restricciones reales; cualquiera podría alterar saldos contables o fingir ser tesorero.
  3. *Pérdida de datos:* Si se borran los datos del navegador en una PC de la escuela, se perdería el ejercicio contable completo.
  4. *Inconsistencia de stock:* No habría forma de sincronizar el estaño o las memorias RAM consumidas entre distintas máquinas.

### 12. Diseño de Tablas, Claves y Relaciones
Definido en el script relacional PostgreSQL:
- `profiles` (`id UUID PK`, `nombre_completo`, `email`, `rol`, `comision`, `activo`)
- `ordenes_trabajo` (`id UUID PK`, `codigo_ot UNIQUE`, `equipo`, `aula_laboratorio`, `descripcion_falla`, `comision_responsable`, `prioridad`, `estado`, `solicitante_id FK`, `tecnico_asignado_id FK`)
- `historial_estados` (`id UUID PK`, `orden_id FK ON DELETE CASCADE`, `estado_anterior`, `estado_nuevo`, `revisor_nombre`, `created_at`)
- `inventario_repuestos` (`id UUID PK`, `nombre UNIQUE`, `categoria`, `stock_actual`, `stock_minimo`, `precio_unitario_estimado`)
- `consumos_repuestos` (`id UUID PK`, `orden_id FK`, `repuesto_id FK`, `cantidad`, `registrado_por`)
- `libro_diario` (`id UUID PK`, `numero_asiento SERIAL`, `fecha`, `tipo_movimiento`, `monto`, `comprobante_numero`)
- `actas` (`id UUID PK`, `tipo_acta`, `numero_acta`, `titulo`, `resumen_acuerdos`, `firmantes`)

### 13. Script SQL Reproducible
El archivo [`supabase_schema.sql`](./supabase_schema.sql) se encuentra en la raíz del repositorio, conteniendo todas las sentencias DDL, claves foráneas, restricciones `CHECK`, políticas RLS y los datos semilla para su reproducción directa en Supabase.

### 14. Conexión Vue.js con Supabase y Carga de Datos Simulados
- La biblioteca `@supabase/supabase-js` está conectada mediante `src/supabase.js`.
- Incluye un **Modal de Supabase** con el botón `⚡ Cargar registros simulados a Supabase`, permitiendo poblar la base de datos remota con un solo clic.
- Si no se configuran credenciales remotas, el sistema opera automáticamente en **Modo Demo Local** reactivo sin arrojar errores.

### 15. Políticas de Acceso RLS (Row Level Security) y Permisos en Interfaz
Las políticas RLS definidas en SQL restringen la inserción y actualización según el rol (`tecnico`, `consejo`, `docente`), garantizando que la seguridad se aplique a nivel de motor de datos y no solo visualmente.

### 16. Mensajes de Carga, Confirmación y Seguridad de Credenciales
- Componente `ToastContainer` con mensajes de éxito, advertencia y error.
- Diálogos de confirmación previa para acciones críticas (cancelación de órdenes, consumo de stock).
- **Seguridad estricta:** Ninguna clave secreta (`service_role`) está expuesta en el código ni en la documentación. Se utiliza exclusivamente la clave pública anónima mediante variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

---

## 🚀 Puesta en Marcha Local

### 1. Requisitos
- **Node.js**: v18 o superior
- **npm**: v9 o superior

### 2. Instalación
```bash
# Clonar o ingresar al directorio del proyecto
cd precooperativa

# Instalar dependencias
npm install
```

### 3. Ejecución del Entorno de Desarrollo
```bash
npm run dev
```
La aplicación quedará disponible en `http://localhost:5173/` (o puerto subsiguiente).

### 4. Compilación para Producción
```bash
npm run build
```

---

## 🏛️ Cierre del Ejercicio (31 de Octubre)
En la vista **Asamblea**, se encuentra disponible el botón **Cierre del ejercicio (31 de Octubre)**, que genera el reporte oficial de impacto pedagógico (PCs optimizadas, periféricos reparados y horas de aula recuperadas) y el balance económico de superávit para su elevación a la Asamblea Anual Ordinaria en el mes de noviembre.
