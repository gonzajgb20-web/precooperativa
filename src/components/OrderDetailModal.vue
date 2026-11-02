<template>
  <div v-if="order" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div class="header-left">
          <div class="title-row">
            <span class="ot-code-badge">{{ order.codigo_ot }}</span>
            <span v-if="order.es_dato_prueba" class="badge badge-mock">DATO DE PRUEBA</span>
            <span class="badge" :class="order.comision_responsable === 'Hardware' ? 'badge-hardware' : 'badge-software'">
              {{ order.comision_responsable }}
            </span>
          </div>
          <h2 class="modal-title">{{ order.equipo }}</h2>
          <span class="modal-subtitle">📍 {{ order.aula_laboratorio }} • Solicitado por {{ order.solicitante_nombre }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Estado actual y prioridad -->
        <div class="status-summary-bar">
          <div class="status-col">
            <span class="field-label">Estado Actual</span>
            <span class="badge status-pill" :class="getStatusClass(order.estado)">
              {{ order.estado }}
            </span>
          </div>
          <div class="status-col">
            <span class="field-label">Prioridad</span>
            <span class="priority-text" :class="order.prioridad.toLowerCase()">
              {{ order.prioridad }}
            </span>
          </div>
          <div class="status-col">
            <span class="field-label">Técnico Asignado</span>
            <span class="tech-name">{{ order.tecnico_asignado_nombre || 'Sin asignar aún' }}</span>
          </div>
        </div>

        <!-- Descripción de la Falla -->
        <div class="detail-block">
          <h4 class="block-title">Descripción de la falla reportada:</h4>
          <p class="block-text">{{ order.descripcion_falla }}</p>
        </div>

        <!-- Diagnóstico técnico -->
        <div v-if="order.diagnostico" class="detail-block highlight-block">
          <h4 class="block-title">Diagnóstico Técnico:</h4>
          <p class="block-text">{{ order.diagnostico }}</p>
        </div>

        <!-- Trabajo Realizado -->
        <div v-if="order.trabajo_realizado" class="detail-block highlight-block">
          <h4 class="block-title">Trabajo Realizado / Debloating:</h4>
          <p class="block-text">{{ order.trabajo_realizado }}</p>
        </div>

        <!-- Pruebas de control de calidad -->
        <div v-if="order.pruebas_control_calidad" class="detail-block">
          <h4 class="block-title">Pruebas de Control de Calidad:</h4>
          <p class="block-text">{{ order.pruebas_control_calidad }}</p>
        </div>

        <!-- Insumos consumidos -->
        <div v-if="order.insumos_usados && order.insumos_usados.length > 0" class="detail-block">
          <h4 class="block-title">Insumos y repuestos consumidos:</h4>
          <ul class="parts-list">
            <li v-for="part in order.insumos_usados" :key="part.id || part.nombre" class="part-item">
              <span>🔩 {{ part.nombre }}</span>
              <span class="part-qty">x {{ part.cantidad }}</span>
            </li>
          </ul>
        </div>

        <!-- ACCIONES OPERATIVAS SEGÚN ROL -->
        <div v-if="!isReadOnly && order.estado !== 'Entregado' && order.estado !== 'Cancelado'" class="action-panel">
          <h4 class="action-panel-title">Actualizar estado o asentar tareas técnicas</h4>
          
          <div v-if="canChangeOrderStatus" class="next-step-box">
            <div class="form-group">
              <label class="form-label">Siguiente estado del flujo:</label>
              <select v-model="selectedNextStatus" class="form-select">
                <option v-for="st in availableNextStates" :key="st" :value="st">
                  {{ st }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Notas técnicas / Observaciones de esta etapa:</label>
              <textarea 
                v-model="actionNotes" 
                class="form-textarea" 
                rows="2" 
                placeholder="Detalla qué se reparó, qué piezas se usaron o qué prueba se realizó..."
              ></textarea>
            </div>

            <!-- Asignar repuesto si está en reparación o probado -->
            <div v-if="selectedNextStatus === 'Reparar u optimizar' || selectedNextStatus === 'Probado'" class="parts-selector-box">
              <label class="form-label">Asentar repuesto del inventario (opcional):</label>
              <div class="parts-row">
                <select v-model="selectedPartId" class="form-select">
                  <option value="">-- Seleccionar repuesto --</option>
                  <option v-for="item in inventory" :key="item.id" :value="item.id">
                    {{ item.nombre }} (Stock disp: {{ item.stock_actual }})
                  </option>
                </select>
                <input 
                  type="number" 
                  v-model.number="selectedPartQty" 
                  min="1" 
                  max="10" 
                  class="form-input qty-input" 
                  placeholder="Cant."
                />
              </div>
            </div>

            <button 
              @click="submitAdvanceStatus" 
              class="btn btn-primary btn-block"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Guardando...' : `Avanzar orden a: ${selectedNextStatus}` }}
            </button>
          </div>

          <!-- Docente confirmando entrega final -->
          <div v-else-if="isDocente && order.estado === 'Probado'" class="teacher-confirm-box">
            <p>El equipo ya superó el control de calidad. ¿Deseas confirmar la recepción en el aula?</p>
            <button @click="confirmDelivery" class="btn btn-emerald">
              ✓ Confirmar recepción conforme del equipo
            </button>
          </div>

          <!-- Botón de cancelación fundamentada -->
          <div v-if="canCancelOrder" class="cancel-trigger-wrap">
            <button 
              v-if="!showCancelForm" 
              @click="showCancelForm = true" 
              class="btn-text-danger"
            >
              Cancelar pedido...
            </button>
            <div v-else class="cancel-box">
              <label class="form-label">Motivo de cancelación (se conservará en historial):</label>
              <textarea 
                v-model="cancelReason" 
                class="form-textarea" 
                rows="2" 
                placeholder="Ej. El docente consiguió otro reemplazo, equipo irreparable..."
              ></textarea>
              <div class="cancel-actions">
                <button @click="showCancelForm = false" class="btn btn-secondary btn-sm">Volver</button>
                <button @click="submitCancel" class="btn btn-danger btn-sm" :disabled="!cancelReason.trim()">
                  Confirmar cancelación
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isReadOnly" class="read-only-banner">
          👁️ Modo auditoría (Sindicatura / Asesora): Sólo lectura. No se permiten modificaciones directas.
        </div>

        <!-- Trazabilidad / Historial de Estados (Auditoría) -->
        <div class="history-timeline-section">
          <h4 class="block-title">Historial y Trazabilidad (Auditoría):</h4>
          <div class="timeline">
            <div 
              v-for="(h, idx) in order.historial" 
              :key="idx" 
              class="timeline-item"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-meta">
                  <span class="timeline-date">{{ h.fecha }}</span>
                  <span class="badge" :class="getStatusClass(h.estado)">{{ h.estado }}</span>
                </div>
                <div class="timeline-actor">Por: <strong>{{ h.responsable }}</strong></div>
                <p class="timeline-note">{{ h.nota }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'
import { useToast } from '../composables/useToast'

const props = defineProps({
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'updated'])

const { currentUser, isDocente, canChangeOrderStatus, canCancelOrder, isReadOnly } = useAuth()
const { inventory, advanceOrderStatus, cancelOrder } = useData()
const { success, error, warning } = useToast()

const isSubmitting = ref(false)
const actionNotes = ref('')
const selectedPartId = ref('')
const selectedPartQty = ref(1)
const showCancelForm = ref(false)
const cancelReason = ref('')

// Posibles siguientes estados lógicos
const stateFlow = {
  'Recibido': ['Diagnóstico', 'Cancelado'],
  'Diagnóstico': ['Reparar u optimizar', 'Cancelado'],
  'Reparar u optimizar': ['Probado', 'Cancelado'],
  'Probado': ['Entregado', 'Reparar u optimizar'],
  'Entregado': [],
  'Cancelado': []
}

const availableNextStates = computed(() => {
  if (!props.order) return []
  return stateFlow[props.order.estado] || []
})

const selectedNextStatus = ref(availableNextStates.value[0] || 'Diagnóstico')

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

const submitAdvanceStatus = async () => {
  if (!selectedNextStatus.value) return
  isSubmitting.value = true

  try {
    const partsToConsume = []
    if (selectedPartId.value && selectedPartQty.value > 0) {
      const invItem = inventory.value.find(i => i.id === selectedPartId.value)
      if (invItem) {
        if (invItem.stock_actual < selectedPartQty.value) {
          warning(`Stock insuficiente de ${invItem.nombre}. Hay ${invItem.stock_actual} unidades.`)
        } else {
          partsToConsume.push({
            id: invItem.id,
            nombre: invItem.nombre,
            cantidad: selectedPartQty.value
          })
        }
      }
    }

    await advanceOrderStatus(
      props.order.id,
      selectedNextStatus.value,
      currentUser.value,
      actionNotes.value,
      partsToConsume
    )

    success(`Orden ${props.order.codigo_ot} avanzada con éxito a "${selectedNextStatus.value}"`)
    actionNotes.value = ''
    selectedPartId.value = ''
    emit('updated')
    emit('close')
  } catch (err) {
    error('Error al actualizar orden: ' + err.message)
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelivery = async () => {
  isSubmitting.value = true
  try {
    await advanceOrderStatus(
      props.order.id,
      'Entregado',
      currentUser.value,
      'Recepción confirmada conforme por el docente responsable.'
    )
    success(`¡Equipo entregado y registrado con éxito!`)
    emit('updated')
    emit('close')
  } catch (err) {
    error(err.message)
  } finally {
    isSubmitting.value = false
  }
}

const submitCancel = async () => {
  if (!cancelReason.value.trim()) return
  isSubmitting.value = true
  try {
    await cancelOrder(props.order.id, currentUser.value, cancelReason.value)
    warning(`Orden ${props.order.codigo_ot} cancelada (motivo archivado en historial)`)
    emit('updated')
    emit('close')
  } catch (err) {
    error(err.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ot-code-badge {
  font-family: monospace;
  font-weight: 800;
  font-size: 0.85rem;
  background: #0f172a;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
}

.modal-title {
  font-size: 1.35rem;
  margin-top: 0.25rem;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

.status-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-col {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.field-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--text-muted);
}

.priority-text {
  font-weight: 800;
  font-size: 0.85rem;
}

.priority-text.alta { color: var(--color-danger); }
.priority-text.media { color: var(--color-amber); }
.priority-text.baja { color: var(--color-success); }

.tech-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.detail-block {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.highlight-block {
  background: #fffbeb;
  border-color: #fef08a;
}

.block-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.block-text {
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--text-main);
}

.parts-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.part-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  background: #f1f5f9;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-sm);
}

.part-qty {
  color: var(--color-primary);
}

.action-panel {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.action-panel-title {
  font-size: 0.9rem;
  color: #166534;
  margin-bottom: 0.75rem;
}

.parts-selector-box {
  margin-bottom: 1rem;
}

.parts-row {
  display: flex;
  gap: 0.5rem;
}

.qty-input {
  width: 90px;
}

.btn-block {
  width: 100%;
}

.cancel-trigger-wrap {
  margin-top: 1rem;
  text-align: right;
}

.btn-text-danger {
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.cancel-box {
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  margin-top: 0.5rem;
  text-align: left;
}

.cancel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.read-only-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

/* Timeline */
.history-timeline-section {
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 1.25rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  padding-left: 1rem;
  border-left: 2px solid var(--border-subtle);
  margin-top: 0.75rem;
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -1.35rem;
  top: 0.25rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
  box-shadow: 0 0 0 2px var(--color-primary-border);
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.timeline-date {
  font-size: 0.75rem;
  color: var(--text-dim);
  font-family: monospace;
}

.timeline-actor {
  font-size: 0.8rem;
  color: var(--text-main);
}

.timeline-note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}
</style>
