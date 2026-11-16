<template>
  <div class="order-process-view">
    <!-- Barra superior de navegación y retorno -->
    <div class="process-nav-top">
      <router-link to="/taller" class="btn-back">
        <AppIcon name="arrow-left" :size="16" />
        <span>Volver a Pedidos</span>
      </router-link>

      <div class="nav-extra-actions" v-if="order">
        <span class="ot-code-main">{{ order.codigo_ot }}</span>
        <span class="badge" :class="order.comision_responsable === 'Hardware' ? 'badge-hardware' : 'badge-software'">
          {{ order.comision_responsable }}
        </span>
        <span class="badge" :class="getStatusClass(order.estado)">
          {{ order.estado }}
        </span>
      </div>
    </div>

    <!-- Si la orden está cargando o no se encuentra -->
    <div v-if="!order" class="order-not-found-card">
      <div class="empty-icon-box">
        <AppIcon name="clipboard" :size="36" />
      </div>
      <h3>Pedido no encontrado</h3>
      <p>El código o identificador de orden no existe en el sistema.</p>
      <router-link to="/taller" class="btn btn-primary btn-sm">
        Volver al Tablero de Taller
      </router-link>
    </div>

    <!-- Contenido completo del Apartado de Proceso -->
    <div v-else class="process-container">
      <!-- Tarjeta Principal del Equipo -->
      <div class="order-summary-card">
        <div class="summary-main-col">
          <div class="summary-badges-row">
            <span class="priority-pill" :class="(order.prioridad || 'media').toLowerCase()">
              Prioridad {{ order.prioridad || 'Media' }}
            </span>
            <span class="summary-date">Solicitado el {{ formatDate(order.fecha_solicitud) }}</span>
          </div>

          <h1 class="summary-title">{{ order.equipo }}</h1>

          <div class="summary-meta-grid">
            <div class="meta-cell">
              <span class="meta-label">Ubicación escolar</span>
              <span class="meta-val">
                <AppIcon name="map-pin" :size="13" />
                <strong>{{ order.aula_laboratorio }}</strong>
              </span>
            </div>

            <div class="meta-cell">
              <span class="meta-label">Docente solicitante</span>
              <span class="meta-val">
                <AppIcon name="user" :size="13" />
                <strong>{{ order.solicitante_nombre }}</strong>
              </span>
            </div>

            <div class="meta-cell">
              <span class="meta-label">Técnico responsable</span>
              <div class="meta-tech-row">
                <span class="meta-val">
                  <AppIcon name="user-check" :size="13" />
                  <strong>{{ order.tecnico_asignado_nombre || 'Sin asignar aún' }}</strong>
                </span>

                <!-- Acciones para asignar técnico -->
                <div v-if="!isReadOnly && canChangeOrderStatus" class="tech-action-buttons">
                  <button 
                    v-if="!showTechSelector" 
                    @click="showTechSelector = true" 
                    class="btn-tech-pill"
                    title="Asignar o reasignar técnico del equipo"
                  >
                    <AppIcon name="edit" :size="11" />
                    <span>{{ order.tecnico_asignado_nombre ? 'Cambiar' : 'Asignar' }}</span>
                  </button>

                  <button 
                    v-if="!order.tecnico_asignado_nombre && userProfile?.rol === 'tecnico'" 
                    @click="assignSelf" 
                    class="btn-tech-self"
                    title="Asignarme como responsable de este pedido"
                  >
                    <AppIcon name="plus" :size="11" />
                    <span>Tomar pedido</span>
                  </button>
                </div>
              </div>

              <!-- Selector desplegable con AppCombobox -->
              <div v-if="showTechSelector" class="tech-combobox-wrap">
                <div class="combobox-inner">
                  <AppCombobox 
                    v-model="selectedTechId" 
                    :options="technicianOptions" 
                    placeholder="Seleccionar técnico..."
                    searchable
                    search-placeholder="Buscar por nombre..."
                    @update:modelValue="onSelectTechnician"
                  />
                </div>
                <button @click="showTechSelector = false" class="btn-close-selector" title="Cancelar">
                  <AppIcon name="x" :size="13" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN INTERACTIVA: FLUJO DEL PROCESO Y ARRASTRE DE ESTADO -->
      <div class="process-interactive-card">
        <div class="interactive-head">
          <div class="head-titles">
            <h2 class="interactive-title">Flujo del Proceso de Taller</h2>
            <p class="interactive-subtitle">
              <template v-if="canChangeOrderStatus && !isReadOnly && order.estado !== 'Entregado' && order.estado !== 'Cancelado'">
                Arrastrá la tarjeta del estado actual hacia la etapa anterior o siguiente para registrar el avance técnico.
              </template>
              <template v-else-if="order.estado === 'Entregado'">
                Este equipo concluyó exitosamente el ciclo de 5 pasos en la clínica de hardware escolar.
              </template>
              <template v-else-if="order.estado === 'Cancelado'">
                Esta orden está cancelada. El motivo se encuentra registrado en el historial de auditoría.
              </template>
              <template v-else>
                Visualización técnica del avance del equipo en el taller.
              </template>
            </p>
          </div>

          <div class="stage-step-pill">
            <span>Etapa {{ currentStageIndex >= 0 ? currentStageIndex + 1 : '-' }} de 5: <strong>{{ getStageTitle(order.estado) }}</strong></span>
          </div>
        </div>

        <!-- Pipeline horizontal de 5 etapas -->
        <div class="pipeline-scroll-area">
          <div class="pipeline-stages-track">
            <div 
              v-for="(stage, idx) in STAGES" 
              :key="stage.id"
              class="pipeline-node-wrapper"
              :class="{
                'is-completed': idx < currentStageIndex,
                'is-current': idx === currentStageIndex,
                'is-pending': idx > currentStageIndex,
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
              <div v-if="idx > 0" class="connector-line" :class="{ filled: idx <= currentStageIndex }"></div>

              <!-- Tarjeta de etapa -->
              <div 
                class="stage-card-box"
                :draggable="canDrag && idx === currentStageIndex"
                @dragstart="onDragStart($event, stage, idx)"
                @dragend="onDragEnd"
              >
                <!-- Pestaña de arrastre en el estado actual -->
                <div v-if="canDrag && idx === currentStageIndex" class="drag-grip-tab">
                  <AppIcon name="grip-vertical" :size="13" />
                  <span>Arrastrar</span>
                </div>

                <!-- Icono de etapa -->
                <div class="stage-icon-circle">
                  <AppIcon v-if="idx < currentStageIndex" name="check" :size="16" />
                  <AppIcon v-else :name="stage.icon" :size="16" />
                </div>

                <div class="stage-text-block">
                  <span class="stage-step-num">Paso {{ stage.step }}</span>
                  <h4 class="stage-card-title">{{ stage.title }}</h4>
                  <span class="stage-card-subtitle">{{ stage.subtitle }}</span>
                </div>

                <div class="stage-card-status">
                  <span v-if="idx < currentStageIndex" class="status-badge-chip chip-done">Completado</span>
                  <span v-else-if="idx === currentStageIndex" class="status-badge-chip chip-active">En Curso</span>
                  <span v-else class="status-badge-chip chip-pending">Pendiente</span>
                </div>

                <!-- Overlays orientativos al arrastrar -->
                <div v-if="isDragging && idx === currentStageIndex - 1" class="drop-target-overlay overlay-prev">
                  <AppIcon name="arrow-left" :size="14" />
                  <span>Soltar acá para retroceder</span>
                </div>

                <div v-if="isDragging && idx === currentStageIndex + 1" class="drop-target-overlay overlay-next">
                  <span>Soltar acá para avanzar</span>
                  <AppIcon name="arrow-right" :size="14" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones táctiles de navegación rápida -->
        <div v-if="canChangeOrderStatus && !isReadOnly && order.estado !== 'Entregado' && order.estado !== 'Cancelado'" class="tactile-controls-bar">
          <!-- Retroceder -->
          <button 
            v-if="currentStageIndex > 0" 
            class="btn btn-secondary stage-nav-btn"
            @click="setPendingTransition(STAGES[currentStageIndex - 1], 'retroceder')"
          >
            <AppIcon name="arrow-left" :size="15" />
            <span>Retroceder a <strong>{{ STAGES[currentStageIndex - 1].title }}</strong></span>
          </button>
          <div v-else class="controls-spacer"></div>

          <!-- Avanzar -->
          <button 
            v-if="currentStageIndex < 4" 
            class="btn btn-primary stage-nav-btn"
            @click="setPendingTransition(STAGES[currentStageIndex + 1], 'avanzar')"
          >
            <span>Avanzar a <strong>{{ STAGES[currentStageIndex + 1].title }}</strong></span>
            <AppIcon name="arrow-right" :size="15" />
          </button>

          <!-- Confirmación docente en caso de entrega -->
          <button 
            v-else-if="isDocente && order.estado === 'Probado'" 
            class="btn btn-emerald stage-nav-btn"
            @click="confirmDelivery"
            :disabled="isSubmitting"
          >
            <AppIcon name="check" :size="16" />
            <span>Confirmar recepción final del equipo</span>
          </button>
        </div>

        <!-- PANEL DESPLEGABLE DE CONFIRMACIÓN DE CAMBIO DE ESTADO -->
        <div v-if="pendingTargetStage" class="transition-form-panel" :class="transitionDirection">
          <div class="transition-panel-header">
            <div class="transition-pill" :class="transitionDirection === 'avanzar' ? 'pill-advance' : 'pill-rollback'">
              <AppIcon :name="transitionDirection === 'avanzar' ? 'arrow-right' : 'arrow-left'" :size="14" />
              <span>
                {{ transitionDirection === 'avanzar' ? 'Avanzar orden a:' : 'Retroceder orden a:' }}
                <strong>{{ pendingTargetStage.title }}</strong>
              </span>
            </div>

            <button class="btn-cancel-link" @click="cancelPendingTransition">
              <AppIcon name="x" :size="13" />
              <span>Descartar</span>
            </button>
          </div>

          <!-- Observaciones técnicas -->
          <div class="form-group">
            <label class="form-label">
              <span>Notas técnicas / Observaciones de esta etapa:</span>
            </label>
            <textarea 
              v-model="actionNotes" 
              class="form-textarea" 
              rows="2" 
              :placeholder="getPlaceholderForStage(pendingTargetStage.id)"
            ></textarea>
          </div>

          <!-- Selector de repuesto con AppCombobox -->
          <div v-if="pendingTargetStage.id === 'Reparar u optimizar' || pendingTargetStage.id === 'Probado'" class="form-group">
            <label class="form-label">
              <span>Asentar repuesto del inventario institucional (opcional):</span>
            </label>
            <div class="parts-combo-row">
              <div class="combo-col">
                <AppCombobox 
                  v-model="selectedPartId" 
                  :options="inventoryPartOptions" 
                  placeholder="Seleccionar repuesto del inventario..."
                  searchable
                  search-placeholder="Buscar repuesto..."
                />
              </div>
              <input 
                type="number" 
                v-model.number="selectedPartQty" 
                min="1" 
                max="10" 
                class="form-input qty-box" 
                placeholder="Cant."
                title="Cantidad a descontar"
              />
            </div>
          </div>

          <div class="transition-actions-row">
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

      <!-- Banner de Sólo Lectura si aplica -->
      <div v-if="isReadOnly" class="readonly-card">
        <AppIcon name="eye" :size="16" />
        <span>Modo Auditoría (Sindicatura / Asesora): Sólo lectura de trazabilidad. No se permiten modificaciones directas.</span>
      </div>

      <!-- FICHAS TÉCNICAS DEL EQUIPO -->
      <div class="technical-cards-grid">
        <!-- Falla Reportada -->
        <div class="tech-card">
          <span class="tech-card-label">Falla reportada por el solicitante</span>
          <p class="tech-card-body">{{ order.descripcion_falla }}</p>
        </div>

        <!-- Diagnóstico -->
        <div v-if="order.diagnostico" class="tech-card highlight-diagnostico">
          <span class="tech-card-label">Diagnóstico técnico</span>
          <p class="tech-card-body">{{ order.diagnostico }}</p>
        </div>

        <!-- Trabajo Realizado -->
        <div v-if="order.trabajo_realizado" class="tech-card highlight-reparacion">
          <span class="tech-card-label">Trabajo Realizado / Debloating</span>
          <p class="tech-card-body">{{ order.trabajo_realizado }}</p>
        </div>

        <!-- Control de Calidad -->
        <div v-if="order.pruebas_control_calidad" class="tech-card highlight-calidad">
          <span class="tech-card-label">Pruebas de Control de Calidad</span>
          <p class="tech-card-body">{{ order.pruebas_control_calidad }}</p>
        </div>
      </div>

      <!-- Repuestos e insumos consumidos -->
      <div v-if="order.insumos_usados && order.insumos_usados.length > 0" class="parts-summary-card">
        <h4 class="parts-summary-title">Insumos y Repuestos Consumidos</h4>
        <div class="parts-items-grid">
          <div v-for="(part, pIdx) in order.insumos_usados" :key="pIdx" class="part-badge-chip">
            <span class="part-chip-name">
              <AppIcon name="wrench" :size="13" />
              <span>{{ part.nombre }}</span>
            </span>
            <span class="part-chip-qty">x {{ part.cantidad }}</span>
          </div>
        </div>
      </div>

      <!-- Trazabilidad / Historial de Auditoría -->
      <div class="audit-history-card">
        <div class="audit-head">
          <h3 class="audit-title">Historial y Trazabilidad (Auditoría)</h3>
          <span class="audit-subtitle">Registro cronológico inmutable de movimientos técnicos.</span>
        </div>

        <div class="audit-timeline">
          <div 
            v-for="(h, idx) in order.historial" 
            :key="idx" 
            class="timeline-row"
          >
            <div class="timeline-point"></div>
            <div class="timeline-body">
              <div class="timeline-top">
                <span class="timeline-status-badge" :class="getStatusClass(h.estado)">{{ h.estado }}</span>
                <span class="timeline-timestamp">{{ h.fecha }}</span>
              </div>
              <div class="timeline-author">Registrado por: <strong>{{ h.responsable }}</strong></div>
              <p class="timeline-comment">{{ h.nota }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Opción de cancelación fundamentada -->
      <div v-if="canCancelOrder && order.estado !== 'Entregado' && order.estado !== 'Cancelado'" class="cancel-order-wrap">
        <button v-if="!showCancelForm" @click="showCancelForm = true" class="btn-cancel-trigger">
          Cancelar pedido con justificación...
        </button>

        <div v-else class="cancel-form-box">
          <label class="form-label">Motivo fundado de la cancelación:</label>
          <textarea 
            v-model="cancelReason" 
            class="form-textarea" 
            rows="2" 
            placeholder="Detallá por qué se cancela la orden (equipo irreparable, reemplazo directo, etc.)..."
          ></textarea>
          <div class="cancel-actions-row">
            <button @click="showCancelForm = false" class="btn btn-secondary btn-sm">Volver</button>
            <button @click="submitCancel" class="btn btn-danger btn-sm" :disabled="!cancelReason.trim()">
              Confirmar cancelación
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'
import { useToast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()

const { currentUser, userProfile, isDocente, canChangeOrderStatus, canCancelOrder, isReadOnly } = useAuth()
const { orders, inventory, associates, advanceOrderStatus, assignTechnicianToOrder, cancelOrder } = useData()
const { success, error, warning } = useToast()

// Asignación de técnico
const showTechSelector = ref(false)
const selectedTechId = ref('')

const technicianOptions = computed(() => {
  const techs = (associates.value || []).filter(a => a.rol === 'tecnico' || a.rol === 'admin' || a.comision === 'Taller')
  return [
    { value: '', label: '-- Sin técnico asignado --' },
    ...techs.map(t => ({
      value: t.id,
      label: t.nombre_completo,
      icon: 'user-check',
      hint: `${t.cargo || t.rol} • ${t.comision || 'Taller'}`
    }))
  ]
})

const onSelectTechnician = async (techId) => {
  showTechSelector.value = false
  const chosen = (associates.value || []).find(a => a.id === techId)
  const techName = chosen ? chosen.nombre_completo : null

  try {
    await assignTechnicianToOrder(order.value.id, techId || null, techName, userProfile.value || currentUser.value)
    success(techName ? `Técnico ${techName} asignado al pedido` : 'Se desasignó el técnico del pedido')
  } catch (err) {
    error('Error al asignar técnico: ' + err.message)
  }
}

const assignSelf = async () => {
  if (!userProfile.value) return
  try {
    await assignTechnicianToOrder(order.value.id, userProfile.value.id, userProfile.value.nombre_completo, userProfile.value)
    success(`Te has asignado como técnico del pedido ${order.value.codigo_ot}`)
  } catch (err) {
    error('Error al asignarse: ' + err.message)
  }
}

// Obtener orden actual por ID de la URL
const order = computed(() => {
  const paramId = route.params.id
  if (!paramId) return null
  return orders.value.find(o => String(o.id) === String(paramId) || String(o.codigo_ot) === String(paramId)) || null
})

// 5 Etapas ordenadas del flujo
const STAGES = [
  { id: 'Recibido', step: 1, title: 'Recepción', subtitle: 'Ingreso al taller', icon: 'inbox' },
  { id: 'Diagnóstico', step: 2, title: 'Diagnóstico', subtitle: 'Evaluación técnica', icon: 'search' },
  { id: 'Reparar u optimizar', step: 3, title: 'Reparación', subtitle: 'Piezas y debloating', icon: 'wrench' },
  { id: 'Probado', step: 4, title: 'Control Calidad', subtitle: 'Pruebas de estabilidad', icon: 'flask' },
  { id: 'Entregado', step: 5, title: 'Entrega Conforme', subtitle: 'Devolución al aula', icon: 'check-circle' }
]

const currentStageIndex = computed(() => {
  if (!order.value) return -1
  return STAGES.findIndex(s => s.id === order.value.estado)
})

const canDrag = computed(() => {
  return !isReadOnly.value && canChangeOrderStatus.value && order.value?.estado !== 'Entregado' && order.value?.estado !== 'Cancelado'
})

// Drag and drop state
const isDragging = ref(false)
const dragHoverIndex = ref(null)

// Transición pendiente
const pendingTargetStage = ref(null)
const transitionDirection = ref('avanzar') // 'avanzar' | 'retroceder'
const actionNotes = ref('')
const selectedPartId = ref('')
const selectedPartQty = ref(1)
const isSubmitting = ref(false)

// Cancelación
const showCancelForm = ref(false)
const cancelReason = ref('')

// Opciones de inventario para AppCombobox
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

// Drag Handlers
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

// Clic directo en etapa adyacente
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
      return 'Detallá los componentes dañados, causa raíz detectada y plan de trabajo...'
    case 'Reparar u optimizar':
      return 'Detallá repuestos instalados, soldaduras, limpieza térmica o debloating...'
    case 'Probado':
      return 'Detallá pruebas de estrés, temperaturas de CPU/GPU, estabilidad y memoria...'
    case 'Entregado':
      return 'Detalles de la entrega conforme efectuada al aula...'
    default:
      return 'Observaciones de la etapa...'
  }
}

// Confirmar y guardar avance de estado
const submitTransition = async () => {
  if (!pendingTargetStage.value || !order.value) return
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
      order.value.id,
      pendingTargetStage.value.id,
      userProfile.value || currentUser.value,
      actionNotes.value,
      partsToConsume
    )

    success(`Orden ${order.value.codigo_ot} actualizada a "${pendingTargetStage.value.title}"`)
    pendingTargetStage.value = null
  } catch (err) {
    error('Error al actualizar estado: ' + err.message)
  } finally {
    isSubmitting.value = false
  }
}

// Confirmación de entrega
const confirmDelivery = async () => {
  if (!order.value) return
  isSubmitting.value = true
  try {
    await advanceOrderStatus(
      order.value.id,
      'Entregado',
      userProfile.value || currentUser.value,
      'Recepción confirmada conforme por el docente solicitante.'
    )
    success('¡Equipo entregado y registrado con éxito!')
  } catch (err) {
    error(err.message)
  } finally {
    isSubmitting.value = false
  }
}

// Cancelación de orden
const submitCancel = async () => {
  if (!cancelReason.value.trim() || !order.value) return
  isSubmitting.value = true
  try {
    await cancelOrder(order.value.id, userProfile.value || currentUser.value, cancelReason.value)
    warning(`Orden ${order.value.codigo_ot} cancelada.`)
    showCancelForm.value = false
  } catch (err) {
    error(err.message)
  } finally {
    isSubmitting.value = false
  }
}

const getStageTitle = (estado) => {
  const match = STAGES.find(s => s.id === estado)
  return match ? match.title : estado
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
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.order-process-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 4rem;
  max-width: 1100px;
  margin: 0 auto;
}

/* Barra superior de retorno */
.process-nav-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md);
  background: white;
  border: 1px solid var(--border-subtle);
  transition: all var(--transition-fast);
}

.btn-back:hover {
  color: var(--text-main);
  border-color: var(--border-strong);
  background: #f8fafc;
}

.btn-back:active {
  transform: scale(0.97);
}

.nav-extra-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ot-code-main {
  font-family: monospace;
  font-weight: 800;
  font-size: 0.9rem;
  background: #0f172a;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
}

/* Tarjeta Principal Resumen */
.order-summary-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.summary-badges-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.5rem;
}

.priority-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}

.priority-pill.alta { background: var(--color-danger-light); color: var(--color-danger); }
.priority-pill.media { background: var(--color-amber-light); color: #92400e; }
.priority-pill.baja { background: var(--color-success-light); color: var(--color-success); }

.summary-date {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.summary-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
  margin-bottom: 1.15rem;
  line-height: 1.25;
}

.summary-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

.meta-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.meta-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.03em;
}

.meta-val {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--text-main);
}

.meta-tech-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tech-action-buttons {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-tech-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.15rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-tech-pill:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
}

.btn-tech-pill:active {
  transform: scale(0.97);
}

.btn-tech-self {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: var(--color-success-light);
  border: 1px solid var(--color-success-border);
  border-radius: var(--radius-full);
  padding: 0.15rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-success);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-tech-self:hover {
  background: #dcfce7;
}

.btn-tech-self:active {
  transform: scale(0.97);
}

.tech-combobox-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.35rem;
  width: 100%;
}

.combobox-inner {
  flex: 1;
  min-width: 0;
}

.btn-close-selector {
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  flex-shrink: 0;
}

.btn-close-selector:hover {
  background: #cbd5e1;
  color: var(--text-main);
}

/* SECCIÓN INTERACTIVA DE PROCESO */
.process-interactive-card {
  background: white;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.interactive-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.interactive-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.2rem;
}

.interactive-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 650px;
  line-height: 1.4;
}

.stage-step-pill {
  background: #f1f5f9;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  color: var(--text-main);
  border: 1px solid var(--border-subtle);
}

.stage-step-pill strong {
  color: var(--color-primary);
}

/* Pipeline horizontal */
.pipeline-scroll-area {
  overflow-x: auto;
  padding: 0.5rem 0.25rem;
}

.pipeline-stages-track {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  min-width: 680px;
}

.pipeline-node-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: stretch;
}

.connector-line {
  position: absolute;
  top: 32px;
  left: -0.75rem;
  width: 0.75rem;
  height: 3px;
  background: #e2e8f0;
  z-index: 1;
}

.connector-line.filled {
  background: var(--color-success);
}

.stage-card-box {
  width: 100%;
  background: white;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 0.95rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  position: relative;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  user-select: none;
}

/* Estados de los nodos */
.pipeline-node-wrapper.is-completed .stage-card-box {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.pipeline-node-wrapper.is-completed .stage-icon-circle {
  background: var(--color-success);
  color: white;
}

.pipeline-node-wrapper.is-current .stage-card-box {
  background: white;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.18), var(--shadow-md);
  cursor: grab;
}

.pipeline-node-wrapper.is-current .stage-card-box:active {
  cursor: grabbing;
}

.pipeline-node-wrapper.is-current .stage-icon-circle {
  background: var(--color-primary);
  color: white;
}

.drag-grip-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #fff7ed;
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-primary-border);
  align-self: flex-start;
}

/* Drop targets */
.pipeline-node-wrapper.is-drop-prev .stage-card-box {
  border: 2px dashed #d97706;
  background: #fffbeb;
  animation: pulse-drop 1.5s infinite;
}

.pipeline-node-wrapper.is-drop-next .stage-card-box {
  border: 2px dashed #059669;
  background: #ecfdf5;
  animation: pulse-drop 1.5s infinite;
}

.pipeline-node-wrapper.is-drag-hover .stage-card-box {
  transform: scale(1.03);
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.25);
}

@keyframes pulse-drop {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.drop-target-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.94);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-align: center;
  padding: 0.35rem;
  pointer-events: none;
}

.overlay-prev { color: #d97706; }
.overlay-next { color: #059669; }

.stage-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.2rem;
}

.stage-text-block {
  display: flex;
  flex-direction: column;
}

.stage-step-num {
  font-size: 0.68rem;
  color: var(--text-dim);
  text-transform: uppercase;
  font-weight: 700;
}

.stage-card-title {
  font-size: 0.875rem;
  color: var(--text-main);
  line-height: 1.25;
  font-weight: 700;
}

.stage-card-subtitle {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.stage-card-status {
  margin-top: auto;
  padding-top: 0.35rem;
}

.status-badge-chip {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  display: inline-block;
}

.chip-done { background: #dcfce7; color: #15803d; }
.chip-active { background: #ffedd5; color: #c2410c; }
.chip-pending { background: #f1f5f9; color: var(--text-dim); }

/* Controles táctiles */
.tactile-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--border-subtle);
}

.stage-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
}

.controls-spacer {
  flex: 1;
}

/* Panel de confirmación de transición */
.transition-form-panel {
  background: #f8fafc;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  animation: slide-in-top 200ms ease-out;
}

@keyframes slide-in-top {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.transition-form-panel.avanzar {
  border-color: #86efac;
}

.transition-form-panel.retroceder {
  border-color: #fde68a;
}

.transition-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.transition-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-full);
}

.pill-advance {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.pill-rollback {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.btn-cancel-link {
  background: transparent;
  border: none;
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-cancel-link:hover {
  color: var(--text-main);
}

.parts-combo-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.combo-col {
  flex: 1;
  min-width: 0;
}

.qty-box {
  width: 90px;
}

.transition-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1rem;
}

/* Fichas técnicas */
.technical-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 680px) {
  .technical-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.tech-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.15rem;
}

.highlight-diagnostico { background: #fffbeb; border-color: #fef08a; }
.highlight-reparacion { background: #f0f9ff; border-color: #bae6fd; }
.highlight-calidad { background: #f0fdf4; border-color: #bbf7d0; }

.tech-card-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-muted);
  font-weight: 700;
  display: block;
  margin-bottom: 0.45rem;
}

.tech-card-body {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-main);
}

/* Resumen de partes */
.parts-summary-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.15rem;
}

.parts-summary-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.parts-items-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.part-badge-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
}

.part-chip-name {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-main);
  font-weight: 600;
}

.part-chip-qty {
  font-weight: 700;
  color: var(--color-primary);
}

/* Auditoría y Trazabilidad */
.audit-history-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
}

.audit-head {
  margin-bottom: 1.25rem;
}

.audit-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
}

.audit-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.audit-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  padding-left: 1.35rem;
  border-left: 2px solid var(--border-subtle);
}

.timeline-row {
  position: relative;
}

.timeline-point {
  position: absolute;
  left: -1.75rem;
  top: 0.25rem;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
  box-shadow: 0 0 0 2px var(--color-primary-border);
}

.timeline-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.timeline-status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
}

.timeline-timestamp {
  font-size: 0.75rem;
  color: var(--text-dim);
  font-family: monospace;
}

.timeline-author {
  font-size: 0.8rem;
  color: var(--text-main);
}

.timeline-comment {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

/* Cancelación */
.cancel-order-wrap {
  text-align: right;
  margin-top: 0.5rem;
}

.btn-cancel-trigger {
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.cancel-form-box {
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 0.5rem;
  text-align: left;
}

.cancel-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.readonly-card {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-not-found-card {
  background: white;
  border: 2px dashed var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 4rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
}
</style>

