<template>
  <div class="home-view">
    <!-- Banner de Bienvenida (Pantalla 1 del PDF) -->
    <div class="hero-welcome-card">
      <div class="hero-left">
        <span class="hero-pre-badge">Panel de la Precooperativa Escolar</span>
        <h1 class="hero-title">Hola, {{ userDisplayName }} 👋</h1>
        <p class="hero-subtitle">
          Hoy tenemos <strong>{{ activeOrdersCount }} equipos</strong> en el taller y 
          <strong :class="{ 'text-alert': lowStockCount > 0 }">{{ lowStockCount }} repuestos</strong> por debajo del stock mínimo.
        </p>
        <div class="hero-actions">
          <router-link to="/nuevo-pedido" class="btn btn-primary">
            <span>➕</span>
            <span>Nuevo pedido</span>
          </router-link>
          <router-link to="/taller" class="btn btn-secondary">
            <span>🛠️</span>
            <span>Ver órdenes de trabajo</span>
          </router-link>
        </div>
      </div>

      <!-- Métricas destacadas en el hero -->
      <div class="hero-stats-badge-col">
        <div class="stat-pill-item">
          <span class="stat-number">{{ activeOrdersCount }}</span>
          <span class="stat-label">En Taller</span>
        </div>
        <div class="stat-pill-item pill-success">
          <span class="stat-number">{{ deliveredCount }}</span>
          <span class="stat-label">Entregados</span>
        </div>
      </div>
    </div>

    <!-- Componente: Recorrido de una tarea (Pantalla 1 del PDF) -->
    <TaskJourney />

    <!-- Sección: Órdenes de trabajo recientes -->
    <div class="recent-orders-section">
      <div class="section-top-row">
        <div>
          <h2 class="section-heading">Órdenes de trabajo</h2>
          <p class="section-subtext">Seguimiento de pedidos técnicos activos en laboratorios y aulas</p>
        </div>
        <router-link to="/taller" class="view-all-link">
          Ver todas las órdenes ({{ orders.length }}) →
        </router-link>
      </div>

      <div class="orders-grid">
        <div 
          v-for="order in recentOrders" 
          :key="order.id"
          class="order-card"
          @click="openOrderModal(order)"
        >
          <div class="order-top-row">
            <span class="ot-badge">{{ order.codigo_ot }}</span>
            <span v-if="order.es_dato_prueba" class="badge badge-mock">DATO DE PRUEBA</span>
            <span class="badge" :class="order.comision_responsable === 'Hardware' ? 'badge-hardware' : 'badge-software'">
              {{ order.comision_responsable }}
            </span>
          </div>

          <h3 class="order-equipment">{{ order.equipo }}</h3>
          <span class="order-location">📍 {{ order.aula_laboratorio }}</span>
          <p class="order-desc">{{ order.descripcion_falla }}</p>

          <div class="order-bottom-row">
            <span class="badge" :class="getStatusClass(order.estado)">
              {{ order.estado }}
            </span>
            <span class="priority-indicator" :class="order.prioridad.toLowerCase()">
              Prioridad {{ order.prioridad }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalle de orden -->
    <OrderDetailModal 
      v-if="selectedOrder" 
      :order="selectedOrder" 
      @close="selectedOrder = null"
      @updated="selectedOrder = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'
import TaskJourney from '../components/TaskJourney.vue'
import OrderDetailModal from '../components/OrderDetailModal.vue'

const { currentUser } = useAuth()
const { orders, inventory } = useData()

const selectedOrder = ref(null)

const userDisplayName = computed(() => {
  if (currentUser.value.nombre_completo.includes('Aragón')) return 'Aragón'
  return currentUser.value.nombre_completo.split(' ')[0]
})

const activeOrdersCount = computed(() => {
  return orders.value.filter(o => o.estado !== 'Entregado' && o.estado !== 'Cancelado').length
})

const deliveredCount = computed(() => {
  return orders.value.filter(o => o.estado === 'Entregado').length
})

const lowStockCount = computed(() => {
  return inventory.value.filter(i => i.stock_actual <= i.stock_minimo).length
})

const recentOrders = computed(() => {
  return orders.value.slice(0, 3)
})

const openOrderModal = (order) => {
  selectedOrder.value = order
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
</script>

<style scoped>
.hero-welcome-card {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #fed7aa 100%);
  border: 1px solid #fed7aa;
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.hero-welcome-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.hero-left {
  max-width: 650px;
  z-index: 1;
}

.hero-pre-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary);
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
  display: inline-block;
}

.hero-title {
  font-size: 2.25rem;
  color: #7c2d12;
  margin-bottom: 0.5rem;
  font-weight: 800;
}

.hero-subtitle {
  font-size: 1rem;
  color: #9a3412;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.text-alert {
  color: #b91c1c;
  text-decoration: underline;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero-stats-badge-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 1;
}

.stat-pill-item {
  background: white;
  border: 1.5px solid #fdba74;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-sm);
  min-width: 100px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-top: 0.2rem;
}

.pill-success {
  border-color: #86efac;
}

.pill-success .stat-number {
  color: var(--color-success);
}

/* Sección de órdenes recientes */
.recent-orders-section {
  margin-top: 2rem;
}

.section-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-heading {
  font-size: 1.35rem;
  color: var(--text-main);
}

.section-subtext {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.view-all-link {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.875rem;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .orders-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.order-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.order-card:hover {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.order-top-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.ot-badge {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 800;
  background: #0f172a;
  color: white;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
}

.order-equipment {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.order-location {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.order-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 1rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.order-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.75rem;
}

.priority-indicator {
  font-size: 0.75rem;
  font-weight: 700;
}

.priority-indicator.alta { color: var(--color-danger); }
.priority-indicator.media { color: var(--color-amber); }
.priority-indicator.baja { color: var(--color-success); }
</style>
