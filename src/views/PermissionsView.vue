<template>
  <div class="permissions-view">
    <!-- Encabezado de la Vista -->
    <div class="view-header">
      <div>
        <h1 class="view-title">Roles y Permisos</h1>
        <p class="view-subtitle">Niveles de acceso y capacidades operativas según el rol institucional en la precooperativa.</p>
      </div>

      <!-- Indicador de sesión activa -->
      <div class="active-user-status-card">
        <div class="user-status-top">
          <span class="user-icon-circle">
            <AppIcon :name="userProfile.icon || 'user'" :size="18" color="#ea580c" />
          </span>
          <div>
            <strong class="user-fullname">{{ userProfile.nombre_completo }}</strong>
            <span class="role-pill" :class="'role-' + userProfile.rol">{{ userProfile.rol_descripcion || userProfile.rol }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. Matriz de Permisos por Rol -->
    <div class="card matrix-card">
      <div class="matrix-title-row">
        <div>
          <h2 class="sub-title">Matriz de Acceso por Módulo</h2>
          <p class="sub-desc">Operaciones permitidas para cada perfil sobre las funciones del taller.</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="matrix-table">
          <thead>
            <tr>
              <th class="th-entity">Módulo / Acción</th>
              <th :class="{ 'th-active': isDocente }">
                <AppIcon name="user-check" :size="15" />
                <span>Docente</span>
              </th>
              <th :class="{ 'th-active': isTecnico }">
                <AppIcon name="wrench" :size="15" />
                <span>Técnico</span>
              </th>
              <th :class="{ 'th-active': isConsejo }">
                <AppIcon name="dollar" :size="15" />
                <span>Consejo</span>
              </th>
              <th :class="{ 'th-active': isSindicatura }">
                <AppIcon name="shield" :size="15" />
                <span>Sindicatura</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Cargar Pedido de Reparación</strong>
                <small>Ingreso de solicitudes para aulas y talleres</small>
              </td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Habilitado</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Habilitado</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Habilitado</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Sólo lectura</td>
            </tr>

            <tr>
              <td>
                <strong>Tablero Kanban (Diagnóstico y Reparación)</strong>
                <small>Avanzar estados técnicos y registrar horas</small>
              </td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Sólo lectura</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Total</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Supervisión</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Auditoría</td>
            </tr>

            <tr>
              <td>
                <strong>Inventario de Repuestos (Pañol)</strong>
                <small>Ajustar stock, dar de alta insumos y descontar piezas</small>
              </td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Consulta</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Descontar</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Administrar</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Auditoría</td>
            </tr>

            <tr>
              <td>
                <strong>Libro Diario de Tesorería</strong>
                <small>Registrar ingresos, egresos y comprobantes</small>
              </td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Sin acceso</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Consulta</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Carga oficial</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Fiscalización</td>
            </tr>

            <tr>
              <td>
                <strong>Libro de Actas Rubricadas</strong>
                <small>Asentar actas de asambleas y reuniones de consejo</small>
              </td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Consulta</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Consulta</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Carga oficial</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Consulta</td>
            </tr>

            <tr>
              <td>
                <strong>Confirmar Entrega del Equipo</strong>
                <small>Aceptación del equipo reparado para su regreso al aula</small>
              </td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Docente autor</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Entrega física</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Habilitado</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Sólo lectura</td>
            </tr>

            <tr>
              <td>
                <strong>Cancelación Fundamentada</strong>
                <small>Cancelar orden registrando motivo en historial inmutable</small>
              </td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Si es solicitante</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Irreparable</td>
              <td class="td-perm enabled"><AppIcon name="check" :size="16" /> Habilitado</td>
              <td class="td-perm disabled"><AppIcon name="x" :size="16" /> Sin permisos</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Tarjetas de Roles Institucionales -->
    <div class="roles-cards-grid">
      <div class="card role-info-card" :class="{ 'card-active-role': isDocente }">
        <div class="role-card-top">
          <span class="role-icon-box role-docente">
            <AppIcon name="user-check" :size="20" />
          </span>
          <div>
            <h3 class="role-card-title">Docente / Solicitante</h3>
            <span class="role-scope-tag">Responsable de Aula</span>
          </div>
        </div>
        <p class="role-card-desc">
          Detecta y reporta fallas en computadoras y periféricos de las aulas. Puede seguir el avance del pedido y confirmar la recepción del equipo reparado.
        </p>
      </div>

      <div class="card role-info-card" :class="{ 'card-active-role': isTecnico }">
        <div class="role-card-top">
          <span class="role-icon-box role-tecnico">
            <AppIcon name="wrench" :size="20" />
          </span>
          <div>
            <h3 class="role-card-title">Estudiante Técnico</h3>
            <span class="role-scope-tag">Comisión Técnica</span>
          </div>
        </div>
        <p class="role-card-desc">
          Opera en el tablero Kanban. Realiza el diagnóstico inicial, ejecuta la reparación o debloating, consume piezas del pañol y realiza pruebas de control de calidad.
        </p>
      </div>

      <div class="card role-info-card" :class="{ 'card-active-role': isConsejo }">
        <div class="role-card-top">
          <span class="role-icon-box role-consejo">
            <AppIcon name="dollar" :size="20" />
          </span>
          <div>
            <h3 class="role-card-title">Consejo de Administración</h3>
            <span class="role-scope-tag">Tesorería y Gestión</span>
          </div>
        </div>
        <p class="role-card-desc">
          Supervisa las operaciones generales. Administra el stock del pañol, aprueba compras de insumos, registra asientos en el Libro Diario y redacta las actas oficiales.
        </p>
      </div>

      <div class="card role-info-card" :class="{ 'card-active-role': isSindicatura }">
        <div class="role-card-top">
          <span class="role-icon-box role-sindicatura">
            <AppIcon name="shield" :size="20" />
          </span>
          <div>
            <h3 class="role-card-title">Sindicatura / Asesoría</h3>
            <span class="role-scope-tag">Fiscalización</span>
          </div>
        </div>
        <p class="role-card-desc">
          Comisión docente de fiscalización. Acceso transparente e inmutable en modo lectura a todos los registros contables, órdenes y actas para auditar el ejercicio cooperativo.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'

const { 
  userProfile, 
  isDocente, 
  isTecnico, 
  isConsejo, 
  isSindicatura 
} = useAuth()
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.view-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 0.35rem 0;
  letter-spacing: -0.02em;
}

.view-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.active-user-status-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.25rem;
  box-shadow: var(--shadow-sm);
}

.user-status-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(234, 88, 12, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-fullname {
  display: block;
  font-size: 0.92rem;
  color: var(--text-main);
}

.role-pill {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-sm);
  display: inline-block;
}

.role-pill.role-docente { background: rgba(59, 130, 246, 0.15); color: #1d4ed8; }
.role-pill.role-tecnico { background: rgba(234, 88, 12, 0.15); color: #c2410c; }
.role-pill.role-consejo { background: rgba(16, 185, 129, 0.15); color: #047857; }
.role-pill.role-sindicatura { background: rgba(139, 92, 246, 0.15); color: #6d28d9; }

.matrix-card {
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.matrix-title-row {
  margin-bottom: 1.25rem;
}

.sub-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.sub-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0 0;
}

.table-responsive {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.matrix-table th, .matrix-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.88rem;
}

.matrix-table thead th {
  background: var(--bg-main);
  font-weight: 700;
  color: var(--text-secondary);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.matrix-table thead th.th-active {
  background: rgba(234, 88, 12, 0.1);
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.matrix-table tbody tr:hover {
  background: var(--bg-hover);
}

.matrix-table td strong {
  display: block;
  color: var(--text-main);
}

.matrix-table td small {
  color: var(--text-muted);
  font-size: 0.78rem;
}

.td-perm {
  font-weight: 600;
  font-size: 0.8rem;
}

.td-perm.enabled {
  color: #059669;
}

.td-perm.disabled {
  color: #94a3b8;
}

.roles-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.role-info-card {
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.role-info-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.card-active-role {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.role-card-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.role-icon-box {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-icon-box.role-docente { background: rgba(59, 130, 246, 0.12); color: #2563eb; }
.role-icon-box.role-tecnico { background: rgba(234, 88, 12, 0.12); color: #ea580c; }
.role-icon-box.role-consejo { background: rgba(16, 185, 129, 0.12); color: #059669; }
.role-icon-box.role-sindicatura { background: rgba(139, 92, 246, 0.12); color: #7c3aed; }

.role-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.role-scope-tag {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.role-card-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

@media (max-width: 1024px) {
  .roles-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .roles-cards-grid {
    grid-template-columns: 1fr;
  }
  .view-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
