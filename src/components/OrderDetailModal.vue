<template>
  <div v-if="order" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card modal-card-lg">
      <!-- Cabecera del Modal -->
      <div class="modal-header">
        <div class="header-left">
          <div class="title-row">
            <span class="ot-code-badge">{{ currentOrder.codigo_ot }}</span>
            <span class="badge" :class="currentOrder.comision_responsable === 'Hardware' ? 'badge-hardware' : 'badge-software'">
              {{ currentOrder.comision_responsable }}
            </span>
            <span class="badge" :class="getStatusClass(currentOrder.estado)">
              {{ currentOrder.estado }}
            </span>
            <span class="priority-pill" :class="(currentOrder.prioridad || 'media').toLowerCase()">
              Prioridad {{ currentOrder.prioridad || 'Media' }}
            </span>
          </div>
          <h2 class="modal-title">{{ currentOrder.equipo }}</h2>
          <span class="modal-subtitle">
            <AppIcon name="map-pin" :size="13" /> {{ currentOrder.aula_laboratorio }} • Solicitado por {{ currentOrder.solicitante_nombre }}
          </span>
        </div>
        <button class="close-btn" @click="$emit('close')" title="Cerrar modal">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="modal-body">
        <!-- SECCIÓN PRINCIPAL: FLUJO DE PROCESO Y ARRASTRE DE ESTADO (5 ETAPAS) -->
        <div class="process-section-card">
          <div class="process-section-head">
            <div class="process-head-titles">
              <h3 class="process-title">Proceso de Trabajo</h3>
              <p class="process-subtitle">
                <template v-if="!isReadOnly && canChangeOrderStatus && currentOrder.estado !== 'Entregado' && currentOrder.estado !== 'Cancelado'">
                  Arrastrá el estado actual hacia la etapa anterior o siguiente para actualizar el flujo.
                </template>
                <template v-else-if="currentOrder.estado === 'Entregado'">
                  Este equipo completó satisfactoriamente las 5 etapas del taller escolar.
                </template>
                <template v-else-if="currentOrder.estado === 'Cancelado'">
                  Esta orden fue cancelada y archivada en el historial de auditoría.
                </template>
                <template v-else>
                  Visualización del avance técnico de la orden.
                </template>
              </p>
            </div>
            
            <div class="stage-step-pill">
              <span>Etapa {{ currentStageIndex >= 0 ? currentStageIndex + 1 : '-' }} de 5</span>
            </div>
          </div>

          <!-- Pipeline Interactivo de 5 Etapas -->
          <div class="stages-pipeline-wrap">
            <div class="stages-pipeline">
              <div 
                v-for="(stage, idx) in STAGES" 
                :key="stage.id"
                class="stage-node-container"
                :class="{
                  'is-completed': idx < currentStageIndex,
                  'is-current': idx === currentStageIndex,
                  'is-pending': idx > currentStageIndex,
                  'is-drop-target': isDragging && (idx === currentStageIndex - 1 || idx === currentStageIndex + 1),
                  'is-drop-prev': isDragging && idx === currentStageIndex - 1,
                  'is-drop-next': isDragging && idx === currentStageIndex + 1,
                  'is-drag-hover': dragHoverIndex === idx
                }"
                @dragover.prevent="onDragOver($event, stage, idx)"
                @dragenter.prevent="onDragEnter(stage, idx)"
                @dragleave="onDragLeave(stage, idx)"
                @drop.prevent="onDrop(stage, idx)"
                @click="onStageClick(stage, idx)"
              >
                <!-- Línea conectora entre nodos -->
                <div v-if="idx > 0" class="stage-connector-line" :class="{ filled: idx <= currentStageIndex }"></div>

                <!-- Tarjeta / Nodo de la etapa -->
                <div 
                  class="stage-card"
                  :draggable="canDrag && idx === currentStageIndex"
                  @dragstart="onDragStart($event, stage, idx)"
                  @dragend="onDragEnd"
                >
                  <!-- Drag handle visible en el estado actual -->
                  <div v-if="canDrag && idx === currentStageIndex" class="drag-handle-tab" title="Arrastrar para mover de estado">
                    <AppIcon name="grip-vertical" :size="14" />
                    <span>Arrastrar</span>
                  </div>

                  <div class="stage-icon-circle">
                    <AppIcon v-if="idx < currentStageIndex" name="check" :size="16" />
                    <AppIcon v-else :name="stage.icon" :size="16" />
                  </div>

                  <div class="stage-info">
                    <span class="stage-step-num">Paso {{ stage.step }}</span>
                    <strong class="stage-title">{{ stage.title }}</strong>
                    <span class="stage-subtitle">{{ stage.subtitle }}</span>
                  </div>

                  <!-- Badge de estado de nodo -->
                  <div class="stage-status-indicator">
                    <span v-if="idx < currentStageIndex" class="status-tag tag-completed">Listo</span>
                    <span v-else-if="idx === currentStageIndex" class="status-tag tag-current">En Curso</span>
                    <span v-else class="status-tag tag-pending">Pendiente</span>
                  </div>

                  <!-- Dropzone hint overlay visible durante el arrastre -->
                  <div v-if="isDragging && idx === currentStageIndex - 1" class="drop-hint-overlay prev-hint">
                    <AppIcon name="arrow-left" :size="14" />
                    <span>Soltá para retroceder</span>
                  </div>
                  <div v-if="isDragging && idx === currentStageIndex + 1" class="drop-hint-overlay next-hint">
                    <span>Soltá para avanzar</span>
                    <AppIcon name="arrow-right" :size="14" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones táctiles de acción directa (accesibilidad móvil y escritorio) -->
          <div v-if="!isReadOnly && canChangeOrderStatus && currentOrder.estado !== 'Entregado' && currentOrder.estado !== 'Cancelado'" class="tactile-nav-bar">
            <!-- Botón Retroceder -->
            <button 
              v-if="currentStageIndex > 0" 
              class="btn btn-secondary nav-action-btn"
              @click="setPendingTransition(STAGES[currentStageIndex - 1], 'retroceder')"
            >
              <AppIcon name="arrow-left" :size="15" />
              <span>Retroceder a <strong>{{ STAGES[currentStageIndex - 1].title }}</strong></span>
            </button>
            <div v-else class="nav-placeholder"></div>

            <!-- Botón Avanzar -->
            <button 
              v-if="currentStageIndex < 4" 
              class="btn btn-primary nav-action-btn"
              @click="setPendingTransition(STAGES[currentStageIndex + 1], 'avanzar')"
            >
              <span>Avanzar a <strong>{{ STAGES[currentStageIndex + 1].title }}</strong></span>
              <AppIcon name="arrow-right" :size="15" />
            </button>

            <!-- Docente confirmando entrega final si está en Probado -->
            <button 
              v-else-if="isDocente && currentOrder.estado === 'Probado'"
              class="btn btn-emerald nav-action-btn"
              @click="confirmDelivery"
              :disabled="isSubmitting"
            >
              <AppIcon name="check" :size="16" />
              <span>Confirmar recepción final</span>
            </button>
          </div>

          <!-- FORMULARIO DESPLEGABLE DE CONFIRMACIÓN DE TRANSICIÓN -->
          <div v-if="pendingTargetStage" class="transition-form-box" :class="transitionDirection">
            <div class="transition-form-head">
              <div class="transition-badge" :class="transitionDirection === 'avanzar' ? 'badge-advance' : 'badge-rollback'">
                <AppIcon :name="transitionDirection === 'avanzar' ? 'arrow-right' : 'arrow-left'" :size="14" />
                <span>{{ transitionDirection === 'avanzar' ? 'Avanzar orden' : 'Retroceder orden' }} a: <strong>{{ pendingTargetStage.title }}</strong></span>
              </div>
              <button class="btn-ghost-sm" @click="cancelPendingTransition">
                <AppIcon name="x" :size="14" />
                <span>Cancelar</span>
              </button>
            </div>

            <!-- Notas técnicas de esta etapa -->
            <div class="form-group">
              <label class="form-label">
                <span>Observaciones técnicas / Tareas realizadas en esta etapa:</span>
              </label>
              <textarea 
                v-model="actionNotes" 
                class="form-textarea" 
                rows="2" 
                :placeholder="getPlaceholderForStage(pendingTargetStage.id)"
              ></textarea>
            </div>

            <!-- Selector de repuesto reutilizable con AppCombobox -->
            <div v-if="pendingTargetStage.id === 'Reparar u optimizar' || pendingTargetStage.id === 'Probado'" class="form-group">
              <label class="form-label">
                <span>Asignar repuesto del inventario institucional (opcional):</span>
              </label>
              <div class="parts-selector-row">
                <div class="combobox-flex-item">
                  <AppCombobox 
                    v-model="selectedPartId" 
                    :options="inventoryPartOptions" 
                    placeholder="Seleccionar repuesto del inventario..."
                    searchable
                    search-placeholder="Buscar por repuesto..."
                  />
                </div>
                <input 
                  type="number" 
                  v-model.number="selectedPartQty" 
                  min="1" 
                  max="10" 
                  class="form-input qty-input" 
                  placeholder="Cant."
                  title="Cantidad a descontar del inventario"
                />
              </div>
            </div>

            <div class="transition-actions">
              <button @click="cancelPendingTransition" class="btn btn-secondary btn-sm">
                Cancelar
              </button>
              <button 
                @click="submitTransition" 
                class="btn btn-primary btn-sm"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Guardando...' : `Confirmar y registrar en: ${pendingTargetStage.title}` }}
              </button>
            </div>
          </div>
        </div>

        <!-- Banner de modo auditoría -->
        <div v-if="isReadOnly" class="read-only-banner">
          <AppIcon name="eye" :size="16" />
          <span>Modo Auditoría (Sindicatura / Asesora): Sólo lectura de trazabilidad. No se permiten modificaciones directas.</span>
        </div>

        <!-- DETALLES TÉCNICOS DE LA ORDEN -->
        <div class="details-grid">
          <!-- Falla reportada -->
          <div class="detail-card">
            <h4 class="detail-card-title">Falla reportada por el solicitante:</h4>
            <p class="detail-card-text">{{ currentOrder.descripcion_falla }}</p>
          </div>

          <!-- Diagnóstico Técnico -->
          <div v-if="currentOrder.diagnostico" class="detail-card highlight-amber">
            <h4 class="detail-card-title">Diagnóstico Técnico:</h4>
            <p class="detail-card-text">{{ currentOrder.diagnostico }}</p>
          </div>

          <!-- Trabajo Realizado -->
          <div v-if="currentOrder.trabajo_realizado" class="detail-card highlight-blue">
            <h4 class="detail-card-title">Trabajo Realizado / Debloating:</h4>
            <p class="detail-card-text">{{ currentOrder.trabajo_realizado }}</p>
          </div>

          <!-- Pruebas de Calidad -->
          <div v-if="currentOrder.pruebas_control_calidad" class="detail-card highlight-green">
            <h4 class="detail-card-title">Pruebas de Control de Calidad:</h4>
            <p class="detail-card-text">{{ currentOrder.pruebas_control_calidad }}</p>
          </div>
        </div>

        <!-- Insumos consumidos -->
        <div v-if="currentOrder.insumos_usados && currentOrder.insumos_usados.length > 0" class="parts-consumed-card">
          <h4 class="detail-card-title">Insumos y repuestos consumidos del inventario:</h4>
          <ul class="parts-list">
            <li v-for="(part, pIdx) in currentOrder.insumos_usados" :key="pIdx" class="part-item">
              <span class="part-name">
                <AppIcon name="wrench" :size="14" />
                <span>{{ part.nombre }}</span>
              </span>
              <span class="part-qty">x {{ part.cantidad }}</span>
            </li>
          </ul>
        </div>

        <!-- Cancelación fundamentada -->
        <div v-if="canCancelOrder && currentOrder.estado !== 'Entregado' && currentOrder.estado !== 'Cancelado'" class="cancel-order-section">
          <button v-if="!showCancelForm" @click="showCancelForm = true" class="btn-text-danger">
            Cancelar este pedido...
          </button>

          <div v-else class="cancel-form-box">
            <label class="form-label">Motivo de cancelación (se conservará en historial):</label>
            <textarea 
              v-model="cancelReason" 
              class="form-textarea" 
              rows="2" 
              placeholder="Detallá el motivo fundado (ej. equipo irreparable, reemplazado por la escuela)..."
            ></textarea>
            <div class="cancel-actions">
              <button @click="showCancelForm = false" class="btn btn-secondary btn-sm">Volver</button>
              <button @click="submitCancel" class="btn btn-danger btn-sm" :disabled="!cancelReason.trim()">
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>

        <!-- Trazabilidad / Historial de Estados (Auditoría) -->
        <div class="history-timeline-section">
          <h4 class="detail-card-title">Historial y Trazabilidad de Estados:</h4>
          <div class="timeline">
            <div 
              v-for="(h, idx) in currentOrder.historial" 
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
import { ref, computed, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'
import { useToast } from '../composables/useToast'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const { currentUser, userProfile, isDocente, canChangeOrderStatus, canCancelOrder, isReadOnly } = useAuth()
const { inventory, advanceOrderStatus, cancelOrder } = useData()
const { success, error, warning } = useToast()

// Estado local de la orden para actualización reactiva fluida
const currentOrder = ref({ ...props.order })

watch(() => props.order, (newVal) => {
  if (newVal) {
    currentOrder.value = { ...newVal }
  }
}, { deep: true })

// 5 Etapas ordenadas del flujo
const STAGES = [
  { id: 'Recibido', step: 1, title: 'Recepción', subtitle: 'Ingreso al taller', icon: 'inbox' },
  { id: 'Diagnóstico', step: 2, title: 'Diagnóstico', subtitle: 'Evaluación técnica', icon: 'search' },
  { id: 'Reparar u optimizar', step: 3, title: 'Reparación', subtitle: 'Piezas y debloating', icon: 'wrench' },
  { id: 'Probado', step: 4, title: 'Control Calidad', subtitle: 'Pruebas de estabilidad', icon: 'flask' },
  { id: 'Entregado', step: 5, title: 'Entrega Conforme', subtitle: 'Devolución al aula', icon: 'check-circle' }
]

const currentStageIndex = computed(() => {
  return STAGES.findIndex(s => s.id === currentOrder.value.estado)
})

const canDrag = computed(() => {
  return !isReadOnly.value && canChangeOrderStatus.value && currentOrder.value.estado !== 'Entregado' && currentOrder.value.estado !== 'Cancelado'
})

// Drag and drop state
const isDragging = ref(false)
const dragHoverIndex = ref(null)

// Transición en espera de confirmación
const pendingTargetStage = ref(null)
const transitionDirection = ref('avanzar') // 'avanzar' | 'retroceder'
const actionNotes = ref('')
const selectedPartId = ref('')
const selectedPartQty = ref(1)
const isSubmitting = ref(false)

// Cancelación
const showCancelForm = ref(false)
const cancelReason = ref('')

// Opciones de repuestos para AppCombobox
const inventoryPartOptions = computed(() => {
  return [
    { value: '', label: '-- Ningún repuesto asignado --' },
    ...(inventory.value || []).map(item => ({
      value: item.id,
      label: `${item.nombre} (Stock: ${item.stock_actual ?? 0})`,
      icon: 'wrench',
      hint: `${item.ubicacion || 'Taller'} • Est.: $${(item.precio_unitario_estimado || item.precio_estimado || 0).toLocaleString()}`
    }))
  ]
})

// Drag handlers
const onDragStart = (event, stage, index) => {
  if (!canDrag.value || index !== currentStageIndex.value) return
  isDragging.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', stage.id)
}

const onDragEnd = () => {
  isDragging.value = false
  dragHoverIndex.value = null
}

const onDragOver = (event, stage, index) => {
  if (!isDragging.value) return
  // Solo permitir drop en etapa anterior o siguiente
  if (index === currentStageIndex.value - 1 || index === currentStageIndex.value + 1) {
    event.dataTransfer.dropEffect = 'move'
  } else {
    event.dataTransfer.dropEffect = 'none'
  }
}

const onDragEnter = (stage, index) => {
  if (isDragging.value && (index === currentStageIndex.value - 1 || index === currentStageIndex.value + 1)) {
    dragHoverIndex.value = index
  }
}

const onDragLeave = (stage, index) => {
  if (dragHoverIndex.value === index) {
    dragHoverIndex.value = null
  }
}

const onDrop = (stage, index) => {
  if (!isDragging.value) return
  isDragging.value = false
  dragHoverIndex.value = null

  if (index === currentStageIndex.value + 1) {
    setPendingTransition(stage, 'avanzar')
  } else if (index === currentStageIndex.value - 1) {
    setPendingTransition(stage, 'retroceder')
  } else {
    warning('Solo podés arrastrar la orden hacia la etapa anterior o siguiente.')
  }
}

// Clic en un nodo de etapa
const onStageClick = (stage, index) => {
  if (!canChangeOrderStatus.value || isReadOnly.value) return
  if (index === currentStageIndex.value + 1) {
    setPendingTransition(stage, 'avanzar')
  } else if (index === currentStageIndex.value - 1) {
    setPendingTransition(stage, 'retroceder')
  }
}

// Configurar transición pendiente
const setPendingTransition = (targetStage, direction) => {
  pendingTargetStage.value = targetStage
  transitionDirection.value = direction
  actionNotes.value = ''
  selectedPartId.value = ''
  selectedPartQty.value = 1
}

const cancelPendingTransition = () => {
  pendingTargetStage.value = null
  actionNotes.value = ''
  selectedPartId.value = ''
}

const getPlaceholderForStage = (stageId) => {
  switch (stageId) {
    case 'Diagnóstico':
      return 'Detallá los hallazgos técnicos, componentes dañados y plan de acción...'
    case 'Reparar u optimizar':
      return 'Detallá el reemplazo de piezas, soldadura, debloating o cambios realizados...'
    case 'Probado':
      return 'Detallá las pruebas de estrés, temperaturas, chequeo de memoria y estabilidad...'
    case 'Entregado':
      return 'Confirmación de entrega conforme al docente responsable...'
    default:
      return 'Observaciones de la etapa...'
  }
}

// Confirmar y persistir cambio de estado
const submitTransition = async () => {
  if (!pendingTargetStage.value) return
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

    const updatedOrder = await advanceOrderStatus(
      currentOrder.value.id,
      pendingTargetStage.value.id,
      userProfile.value || currentUser.value,
      actionNotes.value,
      partsToConsume
    )

    currentOrder.value = { ...updatedOrder }
    success(`Orden ${currentOrder.value.codigo_ot} actualizada a "${pendingTargetStage.value.title}"`)
    pendingTargetStage.value = null
    emit('updated')
  } catch (err) {
    error('Error al actualizar orden: ' + err.message)
  } finally {
    isSubmitting.value = false
  }
}

// Confirmación de entrega conforme por el docente
const confirmDelivery = async () => {
  isSubmitting.value = true
  try {
    const updatedOrder = await advanceOrderStatus(
      currentOrder.value.id,
      'Entregado',
      userProfile.value || currentUser.value,
      'Recepción confirmada conforme por el docente solicitante.'
    )
    currentOrder.value = { ...updatedOrder }
    success('¡Equipo entregado y registrado con éxito!')
    emit('updated')
  } catch (err) {
    error(err.message)
  } finally {
    isSubmitting.value = false
  }
}

// Cancelación fundamentada
const submitCancel = async () => {
  if (!cancelReason.value.trim()) return
  isSubmitting.value = true
  try {
    await cancelOrder(currentOrder.value.id, userProfile.value || currentUser.value, cancelReason.value)
    currentOrder.value.estado = 'Cancelado'
    warning(`Orden ${currentOrder.value.codigo_ot} cancelada.`)
    emit('updated')
    showCancelForm.value = false
  } catch (err) {
    error(err.message)
  } finally {
    isSubmitting.value = false
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
  gap: 0.45rem;
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

.priority-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-full);
}

.priority-pill.alta { background: var(--color-danger-light); color: var(--color-danger); }
.priority-pill.media { background: var(--color-amber-light); color: #92400e; }
.priority-pill.baja { background: var(--color-success-light); color: var(--color-success); }

.modal-title {
  font-size: 1.35rem;
  margin-top: 0.25rem;
  color: var(--text-main);
  line-height: 1.25;
}

.modal-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.45rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

/* SECCIÓN DEL PROCESO Y ARRASTRE */
.process-section-card {
  background: #f8fafc;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.process-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.15rem;
  gap: 1rem;
}

.process-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.2rem;
}

.process-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.stage-step-pill {
  background: #e2e8f0;
  color: var(--text-main);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Pipeline horizontal de 5 etapas */
.stages-pipeline-wrap {
  overflow-x: auto;
  padding: 0.5rem 0.25rem 0.75rem 0.25rem;
}

.stages-pipeline {
  display: flex;
  align-items: stretch;
  gap: 0.65rem;
  min-width: 620px;
}

.stage-node-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: stretch;
}

.stage-connector-line {
  position: absolute;
  top: 30px;
  left: -0.65rem;
  width: 0.65rem;
  height: 3px;
  background: #e2e8f0;
  z-index: 1;
}

.stage-connector-line.filled {
  background: var(--color-success);
}

.stage-card {
  width: 100%;
  background: white;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  position: relative;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  user-select: none;
}

/* Estado completado */
.stage-node-container.is-completed .stage-card {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.stage-node-container.is-completed .stage-icon-circle {
  background: var(--color-success);
  color: white;
}

/* Estado actual / Activo (draggable) */
.stage-node-container.is-current .stage-card {
  background: white;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15), var(--shadow-md);
  cursor: grab;
}

.stage-node-container.is-current .stage-card:active {
  cursor: grabbing;
}

.stage-node-container.is-current .stage-icon-circle {
  background: var(--color-primary);
  color: white;
}

.drag-handle-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: #fff7ed;
  color: var(--color-primary);
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-primary-border);
  align-self: flex-start;
  margin-bottom: 0.15rem;
}

/* Drop targets durante el arrastre */
.stage-node-container.is-drop-prev .stage-card {
  border: 2px dashed #d97706;
  background: #fffbeb;
  animation: pulse-drop 1.5s infinite;
}

.stage-node-container.is-drop-next .stage-card {
  border: 2px dashed #059669;
  background: #ecfdf5;
  animation: pulse-drop 1.5s infinite;
}

.stage-node-container.is-drag-hover .stage-card {
  transform: scale(1.03);
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.25);
}

@keyframes pulse-drop {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.drop-hint-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-align: center;
  padding: 0.25rem;
  pointer-events: none;
}

.prev-hint { color: #d97706; }
.next-hint { color: #059669; }

/* Icono y textos de etapa */
.stage-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.stage-info {
  display: flex;
  flex-direction: column;
}

.stage-step-num {
  font-size: 0.65rem;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 700;
}

.stage-title {
  font-size: 0.82rem;
  color: var(--text-main);
  line-height: 1.2;
}

.stage-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted);
  line-height: 1.25;
  margin-top: 0.15rem;
}

.stage-status-indicator {
  margin-top: auto;
  padding-top: 0.35rem;
}

.status-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-sm);
  display: inline-block;
}

.tag-completed { background: #dcfce7; color: #15803d; }
.tag-current { background: #ffedd5; color: #c2410c; }
.tag-pending { background: #f1f5f9; color: var(--text-dim); }

/* Barra táctil de navegación */
.tactile-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--border-subtle);
}

.nav-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  padding: 0.45rem 0.9rem;
}

.nav-placeholder {
  flex: 1;
}

/* Formulario de confirmación de transición */
.transition-form-box {
  background: white;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-top: 1rem;
  box-shadow: var(--shadow-sm);
  animation: slide-down 200ms ease-out;
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.transition-form-box.avanzar {
  border-color: #86efac;
}

.transition-form-box.retroceder {
  border-color: #fde68a;
}

.transition-form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.transition-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
}

.badge-advance {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.badge-rollback {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.btn-ghost-sm {
  background: transparent;
  border: none;
  font-size: 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-ghost-sm:hover {
  color: var(--text-main);
}

.parts-selector-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.combobox-flex-item {
  flex: 1;
  min-width: 0;
}

.qty-input {
  width: 85px;
}

.transition-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

/* Banner de sólo lectura */
.read-only-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.65rem 0.95rem;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Grilla de detalles */
.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

@media (min-width: 600px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.detail-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
}

.highlight-amber {
  background: #fffbeb;
  border-color: #fef08a;
}

.highlight-blue {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.highlight-green {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.detail-card-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
  font-weight: 700;
}

.detail-card-text {
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--text-main);
}

/* Insumos consumidos */
.parts-consumed-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}

.parts-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.45rem;
}

.part-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
}

.part-name {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-main);
  font-weight: 600;
}

.part-qty {
  font-weight: 700;
  color: var(--color-primary);
}

/* Cancelación */
.cancel-order-section {
  text-align: right;
  margin-bottom: 1rem;
}

.btn-text-danger {
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.cancel-form-box {
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  margin-top: 0.5rem;
  text-align: left;
}

.cancel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* Historial y Trazabilidad */
.history-timeline-section {
  border-top: 1px solid var(--border-subtle);
  padding-top: 1.15rem;
  margin-top: 1rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  position: relative;
  padding-left: 1.25rem;
  border-left: 2px solid var(--border-subtle);
  margin-top: 0.75rem;
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -1.6rem;
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
  font-size: 0.78rem;
  color: var(--text-main);
}

.timeline-note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}
</style>
