<template>
  <div class="inventory-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Inventario y Equipos Atendidos</h1>
        <p class="view-subtitle">Supervisión de pañol, insumos de soldadura y periféricos recuperados (Pantalla 5)</p>
      </div>

      <!-- Acciones de cabecera -->
      <div class="header-actions-row">
        <button 
          v-if="canEditInventory" 
          @click="showNewItemModal = true" 
          class="btn btn-primary btn-sm"
        >
          <AppIcon name="plus" :size="14" />
          <span>Nuevo repuesto / insumo</span>
        </button>
        <span v-if="!canEditInventory" class="role-notice">
          <AppIcon name="info" :size="14" />
          <span>Tu rol actual ({{ currentUser.rol }}) tiene permiso de sólo lectura en el pañol de repuestos.</span>
        </span>
      </div>
    </div>

    <!-- Layout Dual de Pantalla 5 -->
    <div class="inventory-dual-grid">
      <!-- Columna Izquierda: Repuestos e Insumos -->
      <div class="card inventory-left-card">
        <div class="section-title-row">
          <div class="title-with-badge">
            <h2 class="sub-title">Repuestos e Insumos</h2>
            <span class="badge badge-mock">DATOS DE PRUEBA</span>
          </div>
          <span class="stock-alerts-count" v-if="lowStockItemsCount > 0">
            <AppIcon name="alert-triangle" :size="13" />
            <span>{{ lowStockItemsCount }} bajo stock mínimo</span>
          </span>
        </div>

        <div class="items-list">
          <div 
            v-for="item in inventory" 
            :key="item.id" 
            class="item-card"
            :class="{ 'item-low-stock': item.stock_actual <= item.stock_minimo }"
          >
            <div class="item-icon-box">
              <AppIcon :name="getItemIcon(item.categoria)" :size="20" color="#ea580c" />
            </div>

            <div class="item-info">
              <div class="item-title-line">
                <h4 class="item-name">{{ item.nombre }}</h4>
                <span v-if="item.stock_actual <= item.stock_minimo" class="alert-pill">
                  Stock Bajo
                </span>
              </div>

              <div class="item-meta">
                <span><AppIcon name="map-pin" :size="12" /> {{ item.ubicacion }}</span>
                <span>• Categoría: {{ item.categoria }}</span>
                <span>• Est.: ${{ item.precio_estimado.toLocaleString() }} c/u</span>
              </div>

              <div class="stock-progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.min(100, (item.stock_actual / (item.stock_minimo * 2)) * 100) + '%' }"
                  :class="item.stock_actual <= item.stock_minimo ? 'fill-danger' : 'fill-good'"
                ></div>
              </div>
            </div>

            <div class="item-stock-actions">
              <div class="stock-count-display">
                <span class="current-stock">{{ item.stock_actual }}</span>
                <span class="min-stock">mín. {{ item.stock_minimo }}</span>
              </div>

              <!-- Controles de stock para técnicos y consejo -->
              <div v-if="canEditInventory" class="stock-buttons">
                <button 
                  @click="adjustStock(item, -1)" 
                  class="btn-stock-adj"
                  :disabled="item.stock_actual <= 0"
                  title="Descontar 1 unidad"
                >
                  -
                </button>
                <button 
                  @click="adjustStock(item, 1)" 
                  class="btn-stock-adj btn-stock-add"
                  title="Sumar 1 unidad"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Equipos Atendidos (Dark Theme Card de Pantalla 5) -->
      <div class="card-dark attended-right-card">
        <div class="attended-header">
          <div>
            <h2 class="sub-title-dark">Equipos atendidos</h2>
            <p class="sub-title-dark-muted">Historial de intervenciones escolares concluidas o en fase de prueba</p>
          </div>
          <span class="badge badge-emerald-dark">{{ attendedOrders.length }} equipos</span>
        </div>

        <div class="attended-list">
          <div 
            v-for="order in attendedOrders" 
            :key="order.id"
            class="attended-card-item"
            @click="selectedOrder = order"
          >
            <div class="att-head">
              <span class="att-code">{{ order.codigo_ot }}</span>
              <span class="badge" :class="getStatusClass(order.estado)">{{ order.estado }}</span>
            </div>

            <h4 class="att-title">{{ order.equipo }}</h4>
            <span class="att-loc">
              <AppIcon name="map-pin" :size="12" /> {{ order.aula_laboratorio }} • Solicitó: {{ order.solicitante_nombre }}
            </span>

            <p v-if="order.trabajo_realizado" class="att-work">
              {{ order.trabajo_realizado }}
            </p>
            <p v-else class="att-work">
              {{ order.descripcion_falla }}
            </p>

            <div class="att-foot">
              <span class="att-tech">Técnico: {{ order.tecnico_asignado_nombre || 'Comisión de Taller' }}</span>
              <span class="att-comision">{{ order.comision_responsable }}</span>
            </div>
          </div>
        </div>

        <!-- Indicador de Rescate Escolar -->
        <div class="attended-impact-box">
          <div class="impact-stat">
            <strong>100%</strong>
            <span>Equipos conservados en la escuela pública</span>
          </div>
          <div class="impact-stat">
            <strong>$ 0</strong>
            <span>Costo cobrado a la institución escolar</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para nuevo repuesto / insumo -->
    <div v-if="showNewItemModal" class="modal-backdrop" @click.self="showNewItemModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">Registrar nuevo repuesto o insumo</h3>
          <button class="close-btn" @click="showNewItemModal = false">✕</button>
        </div>

        <form @submit.prevent="handleCreateItem" class="modal-body">
          <div class="form-group">
            <label class="form-label">Nombre del repuesto o material *</label>
            <input 
              type="text" 
              v-model="newItem.nombre" 
              class="form-input" 
              placeholder="Ej. Pasta térmica, Cable UTP Cat 6, Fichas RJ45..." 
              required
            />
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Categoría *</label>
              <select v-model="newItem.categoria" class="form-select">
                <option value="Hardware">Hardware</option>
                <option value="Redes">Redes</option>
                <option value="Insumos">Insumos</option>
                <option value="Herramientas">Herramientas</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Ubicación en taller</label>
              <input type="text" v-model="newItem.ubicacion" class="form-input" placeholder="Ej: Gavetero B2" />
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Stock inicial</label>
              <input type="number" v-model.number="newItem.stock_actual" min="0" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Stock mínimo</label>
              <input type="number" v-model.number="newItem.stock_minimo" min="1" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Precio est. ($)</label>
              <input type="number" v-model.number="newItem.precio_estimado" min="0" class="form-input" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showNewItemModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar en inventario</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalle de orden si se hace clic en un equipo atendido -->
    <OrderDetailModal 
      v-if="selectedOrder" 
      :order="selectedOrder" 
      @close="selectedOrder = null" 
      @updated="selectedOrder = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'
import { useToast } from '../composables/useToast'
import OrderDetailModal from '../components/OrderDetailModal.vue'

const { currentUser, canEditInventory } = useAuth()
const { inventory, orders, updateInventoryStock, createInventoryItem } = useData()
const { success, warning, error } = useToast()

const selectedOrder = ref(null)
const showNewItemModal = ref(false)

const newItem = reactive({
  nombre: '',
  categoria: 'Hardware',
  ubicacion: 'Taller de Hardware',
  stock_actual: 5,
  stock_minimo: 2,
  precio_estimado: 5000
})

const lowStockItemsCount = computed(() => {
  return inventory.value.filter(i => i.stock_actual <= i.stock_minimo).length
})

const attendedOrders = computed(() => {
  return orders.value.filter(o => ['Probado', 'Entregado'].includes(o.estado))
})

const getItemIcon = (cat) => {
  switch (cat) {
    case 'Hardware': return 'laptop'
    case 'Redes': return 'wifi'
    case 'Insumos': return 'cpu'
    case 'Herramientas': return 'wrench'
    default: return 'package'
  }
}

const adjustStock = async (item, delta) => {
  try {
    const updated = await updateInventoryStock(item.id, delta, currentUser.value)
    if (updated.alerta_stock) {
      warning(`¡Atención! El stock de ${updated.nombre} cayó al nivel mínimo (${updated.stock_actual} unidades).`)
    } else {
      success(`Stock de ${updated.nombre} actualizado (${updated.stock_actual} unidades).`)
    }
  } catch (err) {
    error('Error al actualizar stock: ' + err.message)
  }
}

const handleCreateItem = async () => {
  try {
    await createInventoryItem(newItem, currentUser.value)
    success(`Repuesto ${newItem.nombre} agregado al inventario.`)
    showNewItemModal.value = false
    newItem.nombre = ''
    newItem.stock_actual = 5
    newItem.stock_minimo = 2
  } catch (err) {
    error('Error: ' + err.message)
  }
}

const getStatusClass = (st) => {
  switch (st) {
    case 'Probado': return 'badge-probado'
    case 'Entregado': return 'badge-entregado'
    default: return 'badge-recibido'
  }
}
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.75rem;
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

.role-notice {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: #f1f5f9;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-full);
}

.inventory-dual-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 950px) {
  .inventory-dual-grid {
    grid-template-columns: 1.25fr 1fr;
  }
}

/* Columna Izquierda: Repuestos */
.inventory-left-card {
  padding: 1.5rem;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sub-title {
  font-size: 1.3rem;
  color: var(--text-main);
}

.stock-alerts-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  transition: all var(--transition-fast);
}

.item-card:hover {
  background: white;
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-sm);
}

.item-card.item-low-stock {
  border-left: 4px solid var(--color-danger);
  background: #fffafa;
}

.item-icon-box {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: var(--shadow-sm);
}

.item-info {
  flex: 1;
}

.item-title-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.alert-pill {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-danger);
  background: #fee2e2;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
}

.item-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.2rem 0 0.4rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stock-progress-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.fill-good { background: var(--color-success); }
.fill-danger { background: var(--color-danger); }

.item-stock-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.stock-count-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.current-stock {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1;
}

.min-stock {
  font-size: 0.68rem;
  color: var(--text-dim);
}

.stock-buttons {
  display: flex;
  gap: 0.25rem;
}

.btn-stock-adj {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  background: white;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.btn-stock-adj:hover:not(:disabled) {
  background: #f1f5f9;
  color: var(--text-main);
  border-color: var(--border-strong);
}

.btn-stock-add:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Columna Derecha: Equipos Atendidos (Dark Mode) */
.attended-right-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.attended-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.sub-title-dark {
  font-size: 1.3rem;
  color: white;
}

.sub-title-dark-muted {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}

.badge-emerald-dark {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.attended-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.attended-card-item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: var(--radius-md);
  padding: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.attended-card-item:hover {
  border-color: #38bdf8;
  background: #243248;
}

.att-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.att-code {
  font-family: monospace;
  font-size: 0.75rem;
  color: #94a3b8;
}

.att-title {
  font-size: 0.95rem;
  color: white;
  margin-bottom: 0.2rem;
}

.att-loc {
  font-size: 0.75rem;
  color: #94a3b8;
  display: block;
  margin-bottom: 0.45rem;
}

.att-work {
  font-size: 0.8rem;
  color: #cbd5e1;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
  line-height: 1.35;
}

.att-foot {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #64748b;
  border-top: 1px dashed #334155;
  padding-top: 0.4rem;
}

.attended-impact-box {
  margin-top: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.impact-stat strong {
  display: block;
  font-size: 1.25rem;
  color: #38bdf8;
}

.impact-stat span {
  font-size: 0.7rem;
  color: #94a3b8;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}
</style>
