<template>
  <div class="home-view">
    <!-- Banner Principal -->
    <div class="hero-welcome-card">
      <div class="hero-left">
        <h1 class="hero-title">Hola, {{ userDisplayName }}</h1>
        <p class="hero-subtitle">
          <span>{{ summaryOrdersText }}</span> y 
          <span :class="{ 'text-alert': lowStockCount > 0 }">{{ summaryStockText }}</span>.
        </p>
        <div class="hero-actions">
          <router-link to="/nuevo-pedido" class="btn btn-primary">
            <AppIcon name="plus" :size="16" />
            <span>Nuevo Pedido</span>
          </router-link>
          <router-link v-if="canAccessWorkshop" to="/taller" class="btn btn-secondary">
            <AppIcon name="wrench" :size="16" />
            <span>Ver Taller</span>
          </router-link>
        </div>
      </div>

      <!-- Métricas del taller -->
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

    <!-- Recorrido de una tarea -->
    <TaskJourney />

    <!-- Sección: Pedidos recientes -->
    <div class="recent-orders-section">
      <div class="section-top-row">
        <div>
          <h2 class="section-heading">Pedidos Recientes</h2>
          <p class="section-subtext">Últimos equipos ingresados para diagnóstico o reparación</p>
        </div>
        <router-link v-if="canAccessWorkshop" to="/taller" class="view-all-link">
          Ver todos los pedidos ({{ orders.length }}) →
        </router-link>
      </div>

      <div v-if="recentOrders.length > 0" class="orders-grid">
        <div 
          v-for="order in recentOrders" 
          :key="order.id"
          class="order-card"
          @click="openOrderModal(order)"
        >
          <div class="order-top-row">
            <span class="ot-badge">{{ order.codigo_ot }}</span>
            <span class="badge" :class="order.comision_responsable === 'Hardware' ? 'badge-hardware' : 'badge-software'">
              {{ order.comision_responsable }}
            </span>
          </div>

          <h3 class="order-equipment">{{ order.equipo }}</h3>
          <span class="order-location">
            <AppIcon name="map-pin" :size="12" /> {{ order.aula_laboratorio }}
          </span>
          <p class="order-desc">{{ order.descripcion_falla }}</p>

          <div class="order-bottom-row">
            <span class="badge" :class="getStatusClass(order.estado)">
              {{ order.estado }}
            </span>
            <span class="priority-indicator" :class="(order.prioridad || 'media').toLowerCase()">
              Prioridad {{ order.prioridad || 'Media' }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="empty-orders-banner">
        <AppIcon name="check-circle" :size="32" color="#94a3b8" />
        <p>No hay pedidos activos en este momento.</p>
        <router-link to="/nuevo-pedido" class="btn btn-primary btn-sm">Cargar Nuevo Pedido</router-link>
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

const { userDisplayName, canAccessWorkshop } = useAuth()
const { orders, inventory } = useData()

const selectedOrder = ref(null)

const activeOrdersCount = computed(() => {
  return (orders.value || []).filter(o => o && o.estado !== 'Entregado' && o.estado !== 'Cancelado').length
})

const deliveredCount = computed(() => {
  return (orders.value || []).filter(o => o && o.estado === 'Entregado').length
})

const lowStockCount = computed(() => {
  return (inventory.value || []).filter(i => (Number(i?.stock_actual) || 0) <= (Number(i?.stock_minimo) || 0)).length
})

const summaryOrdersText = computed(() => {
  const count = activeOrdersCount.value
  if (count === 0) return 'No hay pedidos activos en taller'
  if (count === 1) return 'Hay 1 pedido activo en taller'
  return `Hay ${count} pedidos activos en taller`
})

const summaryStockText = computed(() => {
  const count = lowStockCount.value
  if (count === 0) return 'el stock de repuestos está al día'
  if (count === 1) return '1 repuesto con stock bajo'
  return `${count} repuestos con stock bajo`
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
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  border-radius: var(--radius-xl);
  padding: 2.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
  flex-wrap: wrap;
  gap: 1.5rem;
}

.hero-left {
  max-width: 600px;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1rem;
  color: #cbd5e1;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.hero-subtitle strong {
  color: #ffffff;
}

.text-alert {
  color: #fb923c !important;
  font-weight: 600;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero-stats-badge-col {
  display: flex;
  gap: 1rem;
}

.stat-pill-item {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  text-align: center;
  min-width: 120px;
}

.stat-pill-item.pill-success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.25);
}

.stat-number {
  font-size: 2.4rem;
  font-weight: 800;
  display: block;
  line-height: 1;
  color: white;
  margin-bottom: 0.35rem;
}

.pill-success .stat-number {
  color: #34d399;
}

.stat-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.recent-orders-section {
  margin-bottom: 2rem;
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
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.section-subtext {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0 0;
}

.view-all-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.order-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 1.35rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.order-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.order-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.ot-badge {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-primary);
  background: rgba(234, 88, 12, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
}

.order-equipment {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 0.35rem 0;
  line-height: 1.3;
}

.order-location {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.order-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0 0 1rem 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.order-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.priority-indicator {
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-indicator.baja { color: #059669; }
.priority-indicator.media { color: #d97706; }
.priority-indicator.alta { color: #dc2626; }

.empty-orders-banner {
  background: var(--bg-surface);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-orders-banner p {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

@media (max-width: 1024px) {
  .orders-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }
  .hero-welcome-card {
    padding: 1.5rem;
  }
  .hero-title {
    font-size: 1.75rem;
  }
}
</style>
