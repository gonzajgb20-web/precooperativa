<template>
  <div class="workshop-view">
    <!-- Encabezado directo y conciso (Emil Kowalski) -->
    <div class="view-header">
      <div class="header-titles">
        <h1 class="view-title">Tablero de Taller</h1>
        <p class="view-subtitle">Seguimiento y gestión del flujo técnico de órdenes de trabajo.</p>
      </div>

      <div class="header-actions">
        <router-link to="/nuevo-pedido" class="btn btn-primary new-order-btn">
          <AppIcon name="plus" :size="16" />
          <span>Nuevo Pedido</span>
        </router-link>
      </div>
    </div>

    <!-- Barra de Búsqueda y Filtros Principales -->
    <div class="toolbar-card">
      <div class="toolbar-primary-row">
        <!-- Input de búsqueda -->
        <div class="search-input-wrap">
          <span class="search-icon">
            <AppIcon name="search" :size="16" />
          </span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por equipo, aula, código OT o problema reportado..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn" title="Limpiar búsqueda">
            <AppIcon name="x" :size="13" />
          </button>
        </div>

        <!-- Filtro por Comisión Técnica -->
        <div class="commission-pills">
          <button 
            @click="selectedCommission = 'all'" 
            class="pill-btn" 
            :class="{ active: selectedCommission === 'all' }"
          >
            Todas
          </button>
          <button 
            @click="selectedCommission = 'Hardware'" 
            class="pill-btn" 
            :class="{ active: selectedCommission === 'Hardware' }"
          >
            <AppIcon name="wrench" :size="13" />
            <span>Hardware</span>
          </button>
          <button 
            @click="selectedCommission = 'Software y Redes'" 
            class="pill-btn" 
            :class="{ active: selectedCommission === 'Software y Redes' }"
          >
            <AppIcon name="laptop" :size="13" />
            <span>Software y Redes</span>
          </button>
        </div>

        <!-- Toggle: Solo mis pedidos -->
        <button 
          @click="onlyMine = !onlyMine" 
          class="toggle-mine-btn" 
          :class="{ active: onlyMine }"
        >
          <AppIcon :name="onlyMine ? 'check' : 'user'" :size="14" />
          <span>{{ onlyMine ? 'Mis pedidos asignados' : 'Solo mis pedidos' }}</span>
        </button>
      </div>

      <!-- Pestañas de Filtro por Estado del Proceso -->
      <div class="status-tabs-row">
        <button 
          v-for="tab in statusTabs" 
          :key="tab.id"
          class="status-tab-btn"
          :class="{ active: selectedStatus === tab.id }"
          @click="selectedStatus = tab.id"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-counter">{{ getStatusCount(tab.id) }}</span>
        </button>
      </div>
    </div>

    <!-- Listado de Pedidos en Formato Tarjetas -->
    <div class="orders-section">
      <div class="section-meta">
        <span class="results-text">
          Mostrando <strong>{{ filteredOrders.length }}</strong> {{ filteredOrders.length === 1 ? 'pedido' : 'pedidos' }}
        </span>
      </div>

      <!-- Grilla de Tarjetas -->
      <div v-if="filteredOrders.length > 0" class="orders-cards-grid">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="order-card"
          @click="openOrderProcess(order)"
          tabindex="0"
          @keydown.enter="openOrderProcess(order)"
        >
          <!-- Cabecera de la tarjeta -->
          <div class="card-head">
            <div class="code-and-comision">
              <span class="ot-code">{{ order.codigo_ot }}</span>
              <span class="badge" :class="order.comision_responsable === 'Hardware' ? 'badge-hardware' : 'badge-software'">
                {{ order.comision_responsable }}
              </span>
            </div>
            <div class="card-badges-right">
              <span class="badge" :class="getStatusClass(order.estado)">
                {{ order.estado }}
              </span>
              <span class="priority-dot" :class="(order.prioridad || 'media').toLowerCase()" :title="'Prioridad ' + (order.prioridad || 'Media')"></span>
            </div>
          </div>

          <!-- Título y Ubicación -->
          <h3 class="card-title">{{ order.equipo }}</h3>
          <div class="card-meta">
            <span class="meta-item">
              <AppIcon name="map-pin" :size="12" />
              <span>{{ order.aula_laboratorio }}</span>
            </span>
            <span class="meta-separator">•</span>
            <span class="meta-item">
              <AppIcon name="user" :size="12" />
              <span>{{ order.solicitante_nombre }}</span>
            </span>
          </div>

          <!-- Síntoma o falla reportada -->
          <p class="card-desc">{{ order.descripcion_falla }}</p>

          <!-- Barra de Proceso de 5 Etapas -->
          <div class="card-pipeline-tracker">
            <div class="tracker-header">
              <span class="step-counter">
                Paso {{ getStageStep(order.estado) }} de 5:
                <strong>{{ getStageTitle(order.estado) }}</strong>
              </span>
              <span class="step-progress-percent">
                {{ getStageProgressPercent(order.estado) }}%
              </span>
            </div>
            <div class="tracker-bar">
              <div 
                v-for="(st, idx) in processStages" 
                :key="st.id" 
                class="tracker-segment"
                :class="{
                  completed: idx + 1 < getStageStep(order.estado),
                  active: idx + 1 === getStageStep(order.estado)
                }"
              ></div>
            </div>
          </div>

          <!-- Pie de Tarjeta -->
          <div class="card-foot">
            <div class="foot-info">
              <span class="foot-date">{{ formatDate(order.fecha_solicitud) }}</span>
              <span class="foot-tech">
                <AppIcon name="user-check" :size="12" />
                <span>{{ order.tecnico_asignado_nombre ? order.tecnico_asignado_nombre.split(' ')[0] : 'Sin técnico' }}</span>
              </span>
            </div>

            <div class="view-process-pill">
              <span>Ver proceso</span>
              <AppIcon name="arrow-right" :size="13" />
            </div>
          </div>
        </div>
      </div>

      <!-- Estado Vacío amigable con llamada a la acción (Emil Kowalski) -->
      <div v-else class="empty-orders-card">
        <div class="empty-icon-wrap">
          <AppIcon name="inbox" :size="38" />
        </div>
        <h4 class="empty-title">No hay pedidos para este filtro</h4>
        <p class="empty-desc">Probá cambiando el estado seleccionado o limpiando los términos de búsqueda.</p>
        <div class="empty-actions">
          <button v-if="hasActiveFilters" @click="resetFilters" class="btn btn-secondary btn-sm">
            Limpiar filtros
          </button>
          <router-link to="/nuevo-pedido" class="btn btn-primary btn-sm">
            <AppIcon name="plus" :size="14" />
            <span>Crear nuevo pedido</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'

const router = useRouter()
const { userProfile } = useAuth()
const { orders } = useData()

const searchQuery = ref('')
const selectedCommission = ref('all')
const selectedStatus = ref('all')
const onlyMine = ref(false)

// 5 Etapas del flujo de trabajo
const processStages = [
  { id: 'Recibido', step: 1, label: 'Recepción' },
  { id: 'Diagnóstico', step: 2, label: 'Diagnóstico' },
  { id: 'Reparar u optimizar', step: 3, label: 'Reparación' },
  { id: 'Probado', step: 4, label: 'Control Calidad' },
  { id: 'Entregado', step: 5, label: 'Entrega Conforme' }
]

const statusTabs = [
  { id: 'all', label: 'Todas' },
  { id: 'Recibido', label: 'Recibido' },
  { id: 'Diagnóstico', label: 'Diagnóstico' },
  { id: 'Reparar u optimizar', label: 'En reparación' },
  { id: 'Probado', label: 'Probado' },
  { id: 'Entregado', label: 'Entregado' }
]

// Conteo rápido por estado
const getStatusCount = (statusId) => {
  if (statusId === 'all') return orders.value.length
  return orders.value.filter(o => o.estado === statusId).length
}

// Filtro completo reactivo
const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    // Filtro por Estado
    if (selectedStatus.value !== 'all') {
      if (o.estado !== selectedStatus.value) return false
    }

    // Filtro por Búsqueda de texto
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const match = (
        (o.equipo || '').toLowerCase().includes(q) ||
        (o.codigo_ot || '').toLowerCase().includes(q) ||
        (o.aula_laboratorio || '').toLowerCase().includes(q) ||
        (o.descripcion_falla || '').toLowerCase().includes(q) ||
        (o.solicitante_nombre || '').toLowerCase().includes(q)
      )
      if (!match) return false
    }

    // Filtro por Comisión
    if (selectedCommission.value !== 'all') {
      if (o.comision_responsable !== selectedCommission.value) return false
    }

    // Filtro solo mis pedidos
    if (onlyMine.value) {
      const uId = userProfile.value?.id || ''
      const uName = userProfile.value?.nombre_completo ? userProfile.value.nombre_completo.split(' ')[0] : ''
      const isMyRequest = (uId && o.solicitante_id === uId) || (uName && o.solicitante_nombre && o.solicitante_nombre.includes(uName))
      const isMyAssigned = (uId && o.tecnico_asignado_id === uId) || (uName && o.tecnico_asignado_nombre && o.tecnico_asignado_nombre.includes(uName))
      if (!isMyRequest && !isMyAssigned) return false
    }

    return true
  })
})

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || selectedCommission.value !== 'all' || selectedStatus.value !== 'all' || onlyMine.value
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCommission.value = 'all'
  selectedStatus.value = 'all'
  onlyMine.value = false
}

// Helpers de proceso
const getStageStep = (estado) => {
  const match = processStages.find(s => s.id === estado)
  return match ? match.step : 1
}

const getStageTitle = (estado) => {
  const match = processStages.find(s => s.id === estado)
  return match ? match.label : estado
}

const getStageProgressPercent = (estado) => {
  const step = getStageStep(estado)
  return Math.round((step / 5) * 100)
}

const getStatusClass = (st) => {
  switch (st) {
    case 'Recibido': return 'badge-recibido'
    case 'Diagnóstico': return 'badge-diagnostico'
    case 'Reparar u optimizar': return 'badge-reparar'
    case 'Probado': return 'badge-probado'
    case 'Entregado': return 'badge-entregado'
    case 'Cancelado': return 'badge-cancelado'
    default: return ''
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
}

// Navegación al apartado dedicado de proceso
const openOrderProcess = (order) => {
  router.push(`/taller/pedido/${order.id}`)
}
</script>

<style scoped>
.workshop-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 3rem;
}

/* Header */
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-main);
  line-height: 1.2;
}

.view-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.new-order-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

/* Barra de herramientas */
.toolbar-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.toolbar-primary-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-dim);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.55rem 2.2rem 0.55rem 2.35rem;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  background: #f8fafc;
  color: var(--text-main);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  background: white;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.12);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: background var(--transition-fast);
}

.clear-btn:hover {
  background: #cbd5e1;
  color: var(--text-main);
}

.commission-pills {
  display: flex;
  gap: 0.25rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: var(--radius-full);
}

.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pill-btn:hover {
  color: var(--text-main);
}

.pill-btn.active {
  background: white;
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.toggle-mine-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  background: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-main);
  transition: all var(--transition-fast);
}

.toggle-mine-btn:hover {
  border-color: var(--border-strong);
  background: #f8fafc;
}

.toggle-mine-btn.active {
  background: var(--color-amber-light);
  border-color: var(--color-amber-border);
  color: #92400e;
}

/* Pestañas de estado */
.status-tabs-row {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.75rem;
}

.status-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: #f8fafc;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.status-tab-btn:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

.status-tab-btn.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}

.tab-counter {
  background: rgba(148, 163, 184, 0.2);
  color: inherit;
  font-size: 0.72rem;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-full);
  font-weight: 700;
}

/* Sección de Tarjetas */
.orders-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.section-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.orders-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.15rem;
}

/* Tarjeta de Orden (Artesanía Emil Kowalski) */
.order-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.15rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), 
              box-shadow var(--transition-fast), 
              border-color var(--transition-fast);
  position: relative;
  outline: none;
}

.order-card:hover {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.order-card:active {
  transform: scale(0.985);
}

.order-card:focus-visible {
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.25);
  border-color: var(--color-primary);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
  gap: 0.5rem;
}

.code-and-comision {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ot-code {
  font-family: monospace;
  font-weight: 800;
  font-size: 0.78rem;
  background: #0f172a;
  color: white;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
}

.card-badges-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.priority-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-dot.alta { background: var(--color-danger); box-shadow: 0 0 0 2px var(--color-danger-light); }
.priority-dot.media { background: var(--color-amber); box-shadow: 0 0 0 2px var(--color-amber-light); }
.priority-dot.baja { background: var(--color-success); box-shadow: 0 0 0 2px var(--color-success-light); }

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
  margin-bottom: 0.35rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 0.65rem;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-separator {
  color: var(--text-dim);
}

.card-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

/* Indicador de barra de progreso de 5 etapas */
.card-pipeline-tracker {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
  margin-bottom: 0.85rem;
}

.tracker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.4rem;
}

.step-counter {
  color: var(--text-muted);
}

.step-counter strong {
  color: var(--color-primary);
  margin-left: 0.2rem;
}

.step-progress-percent {
  font-weight: 700;
  color: var(--text-main);
  font-size: 0.72rem;
}

.tracker-bar {
  display: flex;
  gap: 4px;
  height: 5px;
}

.tracker-segment {
  flex: 1;
  background: #e2e8f0;
  border-radius: 9999px;
  transition: background var(--transition-fast);
}

.tracker-segment.completed {
  background: var(--color-success);
}

.tracker-segment.active {
  background: var(--color-primary);
  box-shadow: 0 0 6px rgba(234, 88, 12, 0.4);
}

/* Pie de tarjeta */
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px dashed var(--border-subtle);
  padding-top: 0.75rem;
  gap: 0.5rem;
}

.foot-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-dim);
}

.foot-tech {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
}

.view-process-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary);
  transition: transform var(--transition-fast);
}

.order-card:hover .view-process-pill {
  transform: translateX(3px);
}

/* Estado Vacío */
.empty-orders-card {
  background: white;
  border: 2px dashed var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  margin-bottom: 0.25rem;
}

.empty-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.empty-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  max-width: 400px;
}

.empty-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.75rem;
}
</style>
