<template>
  <div class="permissions-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Matriz de Datos Guardados y Permisos por Rol</h1>
        <p class="view-subtitle">Especificación de seguridad, políticas de acceso y arquitectura de datos (Pantalla 6)</p>
      </div>

      <div class="current-role-banner">
        <span>Tu rol activo en este momento:</span>
        <strong class="role-pill">{{ currentUser.rol_nombre }}</strong>
      </div>
    </div>

    <!-- 1. Matriz Interactiva de Permisos (Pantalla 6 del PDF) -->
    <div class="card matrix-card">
      <div class="matrix-title-row">
        <div>
          <h2 class="sub-title">Matriz de Permisos por Rol Institucional</h2>
          <p class="sub-desc">Determina qué operaciones CRUD puede realizar cada tipo de usuario sobre los datos del sistema</p>
        </div>
        <span class="badge badge-mock">REGLAMENTO PRECOOPERATIVO</span>
      </div>

      <div class="table-responsive">
        <table class="matrix-table">
          <thead>
            <tr>
              <th class="th-entity">Módulo / Datos del Sistema</th>
              <th :class="{ 'th-active': isDocente }">👨‍🏫 Docente / Solicitante</th>
              <th :class="{ 'th-active': isTecnico }">🔧 Estudiante de Comisión</th>
              <th :class="{ 'th-active': isConsejo }">📊 Consejo de Administración</th>
              <th :class="{ 'th-active': isSindicatura }">⚖️ Sindicatura / Asesora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in matrixData" :key="row.module">
              <td class="td-entity">
                <strong>{{ row.module }}</strong>
                <small>{{ row.desc }}</small>
              </td>
              <td>
                <span class="perm-pill" :class="getPermClass(row.docente)">
                  {{ row.docente }}
                </span>
              </td>
              <td>
                <span class="perm-pill" :class="getPermClass(row.tecnico)">
                  {{ row.tecnico }}
                </span>
              </td>
              <td>
                <span class="perm-pill" :class="getPermClass(row.consejo)">
                  {{ row.consejo }}
                </span>
              </td>
              <td>
                <span class="perm-pill" :class="getPermClass(row.sindicatura)">
                  {{ row.sindicatura }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Arquitectura de Datos: Persistencia Local vs Compartida (Puntos 10 y 11) -->
    <div class="arch-grid">
      <!-- Punto 10: Persistencia de Información -->
      <div class="card arch-card">
        <div class="arch-card-header">
          <span class="arch-icon">💾</span>
          <div>
            <h3 class="arch-title">Punto 10: Persistencia de Información</h3>
            <span class="arch-sub">¿Qué se conserva localmente y qué se comparte entre dispositivos?</span>
          </div>
        </div>

        <div class="arch-content">
          <div class="data-split-box">
            <div class="split-col">
              <h4 class="split-heading text-primary">📱 Local (Al cerrar la App)</h4>
              <ul class="split-list">
                <li><strong>Sesión activa y rol simulado:</strong> Perfil del usuario activo en el navegador.</li>
                <li><strong>Preferencias visuales:</strong> Filtros seleccionados, pestañas activas y búsqueda.</li>
                <li><strong>Borradores de pedidos:</strong> Datos de formulario no enviados aún (previene pérdida accidental).</li>
                <li><strong>Caché de consultas:</strong> Copia local temporal para navegación fluida sin conexión continua.</li>
              </ul>
            </div>

            <div class="split-col">
              <h4 class="split-heading text-emerald">🌐 Compartida (Multi-Dispositivo en Nube)</h4>
              <ul class="split-list">
                <li><strong>Órdenes de Trabajo y Estados:</strong> Visibles en tiempo real para todos los talleres y aulas.</li>
                <li><strong>Stock del Pañol de Repuestos:</strong> Evita que dos comisiones consuman la misma pieza simultáneamente.</li>
                <li><strong>Libro Diario de Tesorería:</strong> Registro inmutable de compras e ingresos para auditoría.</li>
                <li><strong>Actas Oficiales y Resoluciones:</strong> Consulta pública para toda la asamblea estudiantil.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Punto 11: Justificación del Backend y Base de Datos -->
      <div class="card arch-card">
        <div class="arch-card-header">
          <span class="arch-icon">🛡️</span>
          <div>
            <h3 class="arch-title">Punto 11: Justificación del Backend</h3>
            <span class="arch-sub">¿Por qué es indispensable contar con base de datos y backend?</span>
          </div>
        </div>

        <div class="arch-content">
          <div class="justification-block">
            <strong>¿Se necesita backend? SÍ, ES INDISPENSABLE.</strong>
            <p>
              Una precooperativa escolar es por naturaleza un sistema <strong>colaborativo y concurrente</strong>. Los docentes solicitan desde sus aulas, los estudiantes diagnostican y reparan en los talleres de informática, la tesorería asienta compras y la sindicatura audita.
            </p>
          </div>

          <div class="limitations-box">
            <h5>⚠️ Limitaciones críticas de una solución sin backend (Solo LocalStorage):</h5>
            <ol class="limitations-list">
              <li>
                <strong>Aislamiento de datos:</strong> Si el docente carga un pedido en su celular o PC del aula, el estudiante en el laboratorio NO puede verlo, anulando el flujo del taller.
              </li>
              <li>
                <strong>Falsos niveles de seguridad:</strong> En frontend puro, cualquier usuario con herramientas de desarrollador (F12) puede manipular permisos o modificar el Libro Diario.
              </li>
              <li>
                <strong>Pérdida por borrado de caché:</strong> Al formatear una PC escolar o limpiar cookies, se destruiría todo el padrón y el historial del ejercicio cooperativo.
              </li>
              <li>
                <strong>Condiciones de carrera:</strong> Discrepancias graves en el inventario de repuestos si dos técnicos trabajan en paralelo.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Especificación de Tablas y Script SQL (Puntos 12 y 13) -->
    <div class="card sql-card">
      <div class="sql-header">
        <div>
          <h3 class="sub-title">Puntos 12 y 13: Tablas, Relaciones y Script SQL</h3>
          <p class="sub-desc">Diseño relacional PostgreSQL/Supabase con claves foráneas, restricciones y políticas RLS</p>
        </div>
        <a href="#schema-view" @click="showSql = !showSql" class="btn btn-secondary btn-sm">
          {{ showSql ? 'Ocultar Código SQL' : '👁️ Ver Script SQL Completo' }}
        </a>
      </div>

      <!-- Diagrama Relacional de Entidades -->
      <div class="schema-entities-grid">
        <div class="entity-card">
          <div class="entity-name">profiles</div>
          <span class="entity-desc">Usuarios y Roles</span>
          <div class="entity-fields">
            <span class="pk">🔑 id (UUID)</span>
            <span>nombre_completo</span>
            <span>email</span>
            <span>rol (CHECK)</span>
            <span>comision</span>
          </div>
        </div>

        <div class="entity-card">
          <div class="entity-name">ordenes_trabajo</div>
          <span class="entity-desc">Pedidos y Reparaciones</span>
          <div class="entity-fields">
            <span class="pk">🔑 id (UUID)</span>
            <span class="fk">🔗 solicitante_id</span>
            <span class="fk">🔗 tecnico_asignado_id</span>
            <span>codigo_ot (UNIQUE)</span>
            <span>estado (ENUM)</span>
            <span>descripcion_falla</span>
          </div>
        </div>

        <div class="entity-card">
          <div class="entity-name">historial_estados</div>
          <span class="entity-desc">Auditoría / Trazabilidad</span>
          <div class="entity-fields">
            <span class="pk">🔑 id (UUID)</span>
            <span class="fk">🔗 orden_id</span>
            <span>estado_anterior</span>
            <span>estado_nuevo</span>
            <span>revisor_nombre</span>
            <span>created_at</span>
          </div>
        </div>

        <div class="entity-card">
          <div class="entity-name">inventario_repuestos</div>
          <span class="entity-desc">Pañol e Insumos</span>
          <div class="entity-fields">
            <span class="pk">🔑 id (UUID)</span>
            <span>nombre</span>
            <span>stock_actual</span>
            <span>stock_minimo</span>
            <span>precio_unitario</span>
          </div>
        </div>

        <div class="entity-card">
          <div class="entity-name">libro_diario</div>
          <span class="entity-desc">Transparencia Contable</span>
          <div class="entity-fields">
            <span class="pk">🔑 id (UUID)</span>
            <span>numero_asiento (SERIAL)</span>
            <span>tipo_movimiento</span>
            <span>monto</span>
            <span>comprobante_numero</span>
          </div>
        </div>

        <div class="entity-card">
          <div class="entity-name">actas</div>
          <span class="entity-desc">Libro Oficial Rubricado</span>
          <div class="entity-fields">
            <span class="pk">🔑 id (UUID)</span>
            <span>numero_acta</span>
            <span>tipo_acta</span>
            <span>resumen_acuerdos</span>
            <span>firmantes</span>
          </div>
        </div>
      </div>

      <!-- Visor de Script SQL -->
      <div v-if="showSql" id="schema-view" class="sql-viewer-box">
        <div class="sql-bar">
          <span>Archivo en el repositorio: <code>supabase_schema.sql</code></span>
          <button @click="copySqlCode" class="btn btn-secondary btn-sm">📋 Copiar SQL</button>
        </div>
        <pre class="sql-code-block"><code>{{ sqlPreview }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

const { currentUser, isDocente, isTecnico, isConsejo, isSindicatura } = useAuth()
const { success } = useToast()
const showSql = ref(false)

const matrixData = [
  {
    module: 'Registro de asociados',
    desc: 'Padrón de estudiantes, comisiones y cursos',
    docente: 'Consulta',
    tecnico: 'Consulta',
    consejo: 'Consulta y modif.',
    sindicatura: 'Consulta'
  },
  {
    module: 'Pedidos y órdenes de trabajo',
    desc: 'Carga de fallas, Kanban, diagnósticos y entregas',
    docente: 'Sólo lo propio',
    tecnico: 'Consulta y modif.',
    consejo: 'Consulta y modif.',
    sindicatura: 'Consulta'
  },
  {
    module: 'Inventario de equipos y repuestos',
    desc: 'Stock de fuentes, memorias RAM, estaño y adaptadores',
    docente: 'Consulta',
    tecnico: 'Consulta y modif.',
    consejo: 'Consulta y modif.',
    sindicatura: 'Consulta'
  },
  {
    module: 'Libro diario de ingresos y egresos',
    desc: 'Asientos contables, facturas de compras y saldo en caja',
    docente: 'Sin acceso',
    tecnico: 'Consulta',
    consejo: 'Consulta y modif.',
    sindicatura: 'Consulta'
  },
  {
    module: 'Actas del Consejo de Administración',
    desc: 'Resoluciones sobre taller, compras y comisiones',
    docente: 'Consulta',
    tecnico: 'Consulta',
    consejo: 'Consulta y modif.',
    sindicatura: 'Consulta'
  },
  {
    module: 'Actas y votaciones de Asamblea',
    desc: 'Estatuto fundacional, memoria anual y balance de ejercicio',
    docente: 'Consulta',
    tecnico: 'Consulta y modif.',
    consejo: 'Consulta y modif.',
    sindicatura: 'Consulta'
  }
]

const getPermClass = (perm) => {
  switch (perm) {
    case 'Sólo lo propio': return 'perm-propio'
    case 'Consulta y modif.': return 'perm-full'
    case 'Consulta': return 'perm-read'
    case 'Sin acceso': return 'perm-none'
    default: return ''
  }
}

const sqlPreview = `-- Archivo: supabase_schema.sql (Guardado en la raíz del proyecto)
-- Tablas con RLS (Row Level Security) y Políticas de Acceso

CREATE TABLE public.ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_ot VARCHAR(20) UNIQUE NOT NULL,
    equipo VARCHAR(150) NOT NULL,
    aula_laboratorio VARCHAR(100) NOT NULL,
    descripcion_falla TEXT NOT NULL,
    comision_responsable VARCHAR(50) NOT NULL CHECK (comision_responsable IN ('Hardware', 'Software y Redes')),
    prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('Baja', 'Media', 'Alta')),
    estado VARCHAR(30) NOT NULL DEFAULT 'Recibido' CHECK (
        estado IN ('Recibido', 'Diagnóstico', 'Reparar u optimizar', 'Probado', 'Entregado', 'Cancelado')
    ),
    solicitante_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    solicitante_nombre VARCHAR(150) NOT NULL,
    tecnico_asignado_nombre VARCHAR(150),
    diagnostico TEXT,
    trabajo_realizado TEXT,
    pruebas_control_calidad TEXT,
    es_dato_prueba BOOLEAN DEFAULT false,
    fecha_solicitud TIMESTAMPTZ DEFAULT now()
);

-- Políticas RLS:
ALTER TABLE public.ordenes_trabajo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura de órdenes" ON public.ordenes_trabajo FOR SELECT USING (true);
CREATE POLICY "Inserción habilitada" ON public.ordenes_trabajo FOR INSERT WITH CHECK (true);
CREATE POLICY "Modificación por técnicos o consejo" ON public.ordenes_trabajo FOR UPDATE 
  USING (public.current_user_role() IN ('tecnico', 'consejo'));`

const copySqlCode = () => {
  navigator.clipboard.writeText(sqlPreview)
  success('Script SQL copiado al portapapeles.')
}
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-title {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.view-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.current-role-banner {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.role-pill {
  color: var(--color-primary);
  font-weight: 700;
}

/* Matriz de Permisos */
.matrix-card {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.matrix-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sub-title {
  font-size: 1.35rem;
  color: var(--text-main);
}

.sub-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.table-responsive {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.matrix-table th {
  padding: 0.85rem;
  background: #f8fafc;
  border-bottom: 2px solid var(--border-subtle);
  text-align: center;
  font-weight: 700;
  color: var(--text-muted);
}

.matrix-table th.th-entity {
  text-align: left;
}

.matrix-table th.th-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.matrix-table td {
  padding: 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  text-align: center;
}

.td-entity {
  text-align: left !important;
}

.td-entity strong {
  display: block;
  font-size: 0.875rem;
  color: var(--text-main);
}

.td-entity small {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.perm-pill {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
}

.perm-propio {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.perm-full {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.perm-read {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.perm-none {
  background: #f8fafc;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  font-style: italic;
}

/* Arquitectura Grid */
.arch-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 900px) {
  .arch-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.arch-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.arch-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.arch-icon {
  font-size: 1.8rem;
}

.arch-title {
  font-size: 1.15rem;
}

.arch-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.data-split-box {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 500px) {
  .data-split-box {
    grid-template-columns: 1fr 1fr;
  }
}

.split-col {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.split-heading {
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
}

.split-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.78rem;
  line-height: 1.35;
}

.justification-block {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-md);
  padding: 0.9rem;
  font-size: 0.82rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.limitations-box {
  background: #fff8f8;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  padding: 0.9rem;
}

.limitations-box h5 {
  font-size: 0.82rem;
  color: var(--color-danger);
  margin-bottom: 0.5rem;
}

.limitations-list {
  padding-left: 1.25rem;
  font-size: 0.78rem;
  line-height: 1.4;
  color: #7f1d1d;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* SQL Card */
.sql-card {
  padding: 1.5rem;
}

.sql-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.schema-entities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .schema-entities-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .schema-entities-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.entity-card {
  background: #f8fafc;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-size: 0.78rem;
}

.entity-name {
  font-weight: 800;
  font-family: monospace;
  color: var(--color-primary);
  font-size: 0.85rem;
}

.entity-desc {
  font-size: 0.68rem;
  color: var(--text-dim);
  display: block;
  margin-bottom: 0.45rem;
}

.entity-fields {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.pk { color: #d97706; font-weight: 700; }
.fk { color: #0284c7; }

.sql-viewer-box {
  margin-top: 1.5rem;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.sql-bar {
  background: #1e293b;
  color: #94a3b8;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.sql-bar code {
  color: #f97316;
}

.sql-code-block {
  background: #0f172a;
  color: #e2e8f0;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.8rem;
  line-height: 1.45;
  overflow-x: auto;
  max-height: 350px;
}
</style>
