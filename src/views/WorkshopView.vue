<template>
  <div class="workshop-view">
    <div class="view-header">
      <div class="header-titles">
        <h1 class="view-title">Bandejas del taller</h1>
        <p class="view-subtitle">Tablero Kanban y seguimiento del ciclo de vida de los equipos</p>
      </div>

      <!-- Barra de herramientas: Búsqueda y Filtros (Punto 9) -->
      <div class="toolbar-wrap">
        <!-- Búsqueda rápida -->
        <div class="search-input-wrap">
          <span class="search-icon">
            <AppIcon name="search" :size="15" />
          </span>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por equipo, aula, código OT o falla..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
            <AppIcon name="x" :size="12" />
          </button>
        </div>

        <!-- Filtro de Comisión -->
        <div class="filter-pills">
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
          <span>{{ onlyMine ? 'Mostrando mis pedidos' : 'Solo mis pedidos' }}</span>
        </button>
      </div>
    </div>

    <!-- Layout Dual: Columnas Kanban + Panel de Detalle Derecho (Pantalla 4 del PDF) -->
    <div class="kanban-layout-grid">
      <!-- Tablero de 5 Bandejas -->
      <div class="kanban-columns-container">
        <div 
          v-for="col in kanbanColumns" 
          :key="col.status" 
          class="kanban-column"
        >
          <div class="column-header" :class="col.colorClass">
            <div class="col-title-wrap">
              <AppIcon :name="col.icon" :size="15" />
              <span class="col-title">{{ col.title }}</span>
            </div>
            <span class="col-counter">{{ getColumnOrders(col.status).length }}</span>
          </div>

          <div class="cards-scroll-area">
            <div 
              v-for="order in getColumnOrders(col.status)" 
              :key="order.id"
              class="kanban-card"
              :class="{ 
                selected: activeOrder && activeOrder.id === order.id,
                'cancelled-card': order.estado === 'Cancelado'
              }"
              @click="selectOrder(order)"
            >
              <div class="card-head">
                <span class="ot-code">{{ order.codigo_ot }}</span>
                <span v-if="order.es_dato_prueba" class="badge-mini-mock">DATO DE PRUEBA</span>
                <span class="priority-dot" :class="order.prioridad.toLowerCase()" :title="'Prioridad ' + order.prioridad"></span>
              </div>

              <h4 class="card-equipment">{{ order.equipo }}</h4>
              <span class="card-location">
                <AppIcon name="map-pin" :size="11" /> {{ order.aula_laboratorio }}
              </span>

              <p class="card-desc-snippet">{{ order.descripcion_falla }}</p>

              <div class="card-footer">
                <span class="badge" :class="order.comision_responsable === 'Hardware' ? 'badge-hardware' : 'badge-software'">
                  {{ order.comision_responsable }}
                </span>
                <span class="date-snippet">{{ formatDate(order.fecha_solicitud) }}</span>
              </div>
            </div>

            <!-- Empty state por columna -->
            <div v-if="getColumnOrders(col.status).length === 0" class="empty-column-msg">
              Sin equipos en esta bandeja
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Lateral Derecho de Detalle (Fiel a Pantalla 4) -->
      <div class="detail-sidebar" v-if="activeOrder">
        <div class="detail-sticky-card">
          <div class="sidebar-top">
            <div class="sidebar-ot-badge">{{ activeOrder.codigo_ot }}</div>
            <span class="badge" :class="getStatusClass(activeOrder.estado)">
              {{ activeOrder.estado }}
            </span>
          </div>

          <h2 class="sidebar-title">{{ activeOrder.equipo }}</h2>
          <div class="sidebar-meta-row">
            <span><AppIcon name="map-pin" :size="12" /> {{ activeOrder.aula_laboratorio }}</span>
            <span><AppIcon name="user" :size="12" /> Solicitó: {{ activeOrder.solicitante_nombre }}</span>
          </div>

          <div class="sidebar-tags">
            <span class="badge" :class="activeOrder.comision_responsable === 'Hardware' ? 'badge-hardware' : 'badge-software'">
              {{ activeOrder.comision_responsable }}
            </span>
            <span class="priority-indicator" :class="activeOrder.prioridad.toLowerCase()">
              Prioridad {{ activeOrder.prioridad }}
            </span>
            <span v-if="activeOrder.es_dato_prueba" class="badge badge-mock">DATO DE PRUEBA</span>
          </div>

          <div class="sidebar-section">
            <h5 class="sec-label">Descripción de la falla:</h5>
            <p class="sec-text">{{ activeOrder.descripcion_falla }}</p>
          </div>

          <div v-if="activeOrder.diagnostico" class="sidebar-section highlight-sec">
            <h5 class="sec-label">Diagnóstico de la comisión:</h5>
            <p class="sec-text">{{ activeOrder.diagnostico }}</p>
          </div>

          <div v-if="activeOrder.trabajo_realizado" class="sidebar-section highlight-sec">
            <h5 class="sec-label">Trabajo / Optimización:</h5>
            <p class="sec-text">{{ activeOrder.trabajo_realizado }}</p>
          </div>

          <!-- Botón de apertura de modal completo de gestión -->
          <div class="sidebar-actions">
            <button @click="isDetailModalOpen = true" class="btn btn-primary btn-block">
              <span>Gestionar o avanzar estado</span>
              <AppIcon name="arrow-right" :size="14" />
            </button>
          </div>

          <!-- Mini línea de trazabilidad -->
          <div class="sidebar-mini-history">
            <h5 class="sec-label">Último movimiento registrado:</h5>
            <div v-if="activeOrder.historial && activeOrder.historial.length > 0" class="mini-hist-entry">
              <strong>{{ activeOrder.historial[activeOrder.historial.length - 1].estado }}</strong>
              <span>Por {{ activeOrder.historial[activeOrder.historial.length - 1].responsable }}</span>
              <small>{{ activeOrder.historial[activeOrder.historial.length - 1].fecha }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel placeholder cuando no hay selección -->
      <div v-else class="detail-sidebar detail-empty-placeholder">
        <div class="empty-placeholder-card">
          <AppIcon name="clipboard" :size="36" color="#94a3b8" class="placeholder-icon" />
          <h4>Seleccioná una orden</h4>
          <p>Hacé clic en cualquier tarjeta del tablero para ver su trazabilidad, diagnóstico y opciones operativas.</p>
        </div>
      </div>
    </div>

    <!-- Modal completo de gestión operativa -->
    <OrderDetailModal 
      v-if="isDetailModalOpen && activeOrder"
      :order="activeOrder"
      @close="isDetailModalOpen = false"
      @updated="refreshActiveOrder"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'
import OrderDetailModal from '../components/OrderDetailModal.vue'

const { currentUser } = useAuth()
const { orders } = useData()

const searchQuery = ref('')
const selectedCommission = ref('all')
const onlyMine = ref(false)
const activeOrder = ref(null)
const isDetailModalOpen = ref(false)

const kanbanColumns = [
  { status: 'Recibido', title: 'Recibido', icon: 'inbox', colorClass: 'col-recibido' },
  { status: 'Diagnóstico', title: 'Diagnóstico', icon: 'search', colorClass: 'col-diagnostico' },
  { status: 'Reparar u optimizar', title: 'En reparación', icon: 'wrench', colorClass: 'col-reparar' },
  { status: 'Probado', title: 'Probado', icon: 'flask', colorClass: 'col-probado' },
  { status: 'Entregado', title: 'Entregado', icon: 'check-circle', colorClass: 'col-entregado' }
]

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    // Filtro por texto
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const match = (
        o.equipo.toLowerCase().includes(q) ||
        o.codigo_ot.toLowerCase().includes(q) ||
        o.aula_laboratorio.toLowerCase().includes(q) ||
        o.descripcion_falla.toLowerCase().includes(q)
      )
      if (!match) return false
    }

    // Filtro de comisión
    if (selectedCommission.value !== 'all') {
      if (o.comision_responsable !== selectedCommission.value) return false
    }

    // Filtro solo mis pedidos
    if (onlyMine.value) {
      const isMyRequest = o.solicitante_id === currentUser.value.id || o.solicitante_nombre.includes(currentUser.value.nombre_completo.split(' ')[0])
      const isMyAssigned = o.tecnico_asignado_id === currentUser.value.id || (o.tecnico_asignado_nombre && o.tecnico_asignado_nombre.includes(currentUser.value.nombre_completo.split(' ')[0]))
      if (!isMyRequest && !isMyAssigned) return false
    }

    return true
  })
})

const getColumnOrders = (status) => {
  return filteredOrders.value.filter(o => o.estado === status)
}

const selectOrder = (order) => {
  activeOrder.value = order
}

const refreshActiveOrder = () => {
  if (activeOrder.value) {
    const updated = orders.value.find(o => o.id === activeOrder.value.id)
    if (updated) activeOrder.value = updated
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

onMounted(() => {
  // Preseleccionar la primera orden de prueba si existe
  if (orders.value.length > 0) {
    activeOrder.value = orders.value[0]
  }
})
</script>

<style scoped>
.view-header {
  margin-bottom: 1.5rem;
}

.view-title {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.view-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.toolbar-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  font-size: 0.85rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.55rem 2rem 0.55rem 2.25rem;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.12);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-dim);
}

.filter-pills {
  display: flex;
  gap: 0.35rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: var(--radius-full);
}

.pill-btn {
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

.pill-btn.active {
  background: white;
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.toggle-mine-btn {
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  background: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-main);
  transition: all var(--transition-fast);
}

.toggle-mine-btn.active {
  background: var(--color-amber-light);
  border-color: var(--color-amber-border);
  color: #92400e;
}

/* Kanban Layout */
.kanban-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (min-width: 1100px) {
  .kanban-layout-grid {
    grid-template-columns: 1fr 360px;
  }
}

.kanban-columns-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .kanban-columns-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .kanban-columns-container {
    grid-template-columns: repeat(5, 1fr);
  }
}

.kanban-column {
  background: #f1f5f9;
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  min-height: 480px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  background: white;
  box-shadow: var(--shadow-sm);
}

.col-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.col-counter {
  background: #e2e8f0;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
}

.cards-scroll-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.kanban-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.kanban-card:hover {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kanban-card.selected {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.ot-code {
  font-family: monospace;
  font-weight: 800;
  font-size: 0.75rem;
  background: #0f172a;
  color: white;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-sm);
}

.badge-mini-mock {
  font-size: 0.6rem;
  font-weight: 800;
  background: #fef08a;
  color: #713f12;
  padding: 0.05rem 0.3rem;
  border-radius: var(--radius-sm);
  border: 1px dashed #ca8a04;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-dot.alta { background: var(--color-danger); }
.priority-dot.media { background: var(--color-amber); }
.priority-dot.baja { background: var(--color-success); }

.card-equipment {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.2rem;
  line-height: 1.3;
}

.card-location {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: 0.45rem;
}

.card-desc-snippet {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.35;
  margin-bottom: 0.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px dashed var(--border-subtle);
  padding-top: 0.45rem;
}

.date-snippet {
  font-size: 0.68rem;
  color: var(--text-dim);
}

.empty-column-msg {
  text-align: center;
  padding: 2rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-dim);
  font-style: italic;
}

/* Detail Sidebar */
.detail-sidebar {
  display: none;
}

@media (min-width: 1100px) {
  .detail-sidebar {
    display: block;
  }
}

.detail-sticky-card {
  position: sticky;
  top: 5rem;
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.sidebar-ot-badge {
  font-family: monospace;
  font-weight: 800;
  font-size: 1rem;
  background: #0f172a;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
}

.sidebar-title {
  font-size: 1.25rem;
  margin-bottom: 0.35rem;
}

.sidebar-meta-row {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.sidebar-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.priority-indicator {
  font-size: 0.75rem;
  font-weight: 700;
}

.priority-indicator.alta { color: var(--color-danger); }
.priority-indicator.media { color: var(--color-amber); }
.priority-indicator.baja { color: var(--color-success); }

.sidebar-section {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
  border: 1px solid var(--border-subtle);
}

.highlight-sec {
  background: #fffbeb;
  border-color: #fef08a;
}

.sec-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.sec-text {
  font-size: 0.8rem;
  color: var(--text-main);
  line-height: 1.35;
}

.sidebar-actions {
  margin: 1.25rem 0;
}

.sidebar-mini-history {
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.75rem;
}

.mini-hist-entry {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.75rem;
}

.mini-hist-entry small {
  color: var(--text-dim);
}

.empty-placeholder-card {
  background: #f8fafc;
  border: 2px dashed var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--text-muted);
}

.placeholder-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}
</style>
