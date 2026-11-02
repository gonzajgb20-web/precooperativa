<template>
  <div class="new-order-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Cargar un pedido al taller</h1>
        <p class="view-subtitle">Poné el taller en movimiento: describí el equipo y la falla reportada en el aula o laboratorio.</p>
      </div>
      <div v-if="!canCreateOrder" class="permission-warning">
        <AppIcon name="alert-triangle" :size="15" />
        <span>Tu rol actual ({{ currentUser.rol }}) no está habilitado para cargar pedidos. Cambiá al rol de <strong>Docente</strong> en la barra superior.</span>
      </div>
    </div>

    <div class="form-layout-grid">
      <!-- Columna Izquierda: Formulario validado -->
      <div class="card form-card">
        <form @submit.prevent="handleSubmit">
          <!-- Campo Equipo -->
          <div class="form-group">
            <label class="form-label" for="equipo">
              <span>Equipo o periférico *</span>
              <small class="field-hint">Ej: PC 7, Monitor Samsung, Auriculares x 6</small>
            </label>
            <input 
              id="equipo"
              type="text" 
              v-model="formData.equipo" 
              class="form-input" 
              :class="{ 'is-invalid': errors.equipo }"
              placeholder="Nombre o identificación del equipo..."
              :disabled="!canCreateOrder || isSubmitting"
            />
            <span v-if="errors.equipo" class="form-error">{{ errors.equipo }}</span>
          </div>

          <!-- Campo Aula o Laboratorio -->
          <div class="form-group">
            <label class="form-label" for="aula">
              <span>Aula o laboratorio *</span>
              <small class="field-hint">Ubicación física en la escuela</small>
            </label>
            <input 
              id="aula"
              type="text" 
              v-model="formData.aula_laboratorio" 
              class="form-input" 
              :class="{ 'is-invalid': errors.aula_laboratorio }"
              placeholder="Ej: Aula 2, Lab Hardware, Biblioteca..."
              :disabled="!canCreateOrder || isSubmitting"
            />
            <span v-if="errors.aula_laboratorio" class="form-error">{{ errors.aula_laboratorio }}</span>
          </div>

          <!-- Campo Descripción de la Falla -->
          <div class="form-group">
            <label class="form-label" for="falla">
              <span>¿Qué le pasa? (Descripción de la falla) *</span>
              <small class="field-hint">Mínimo 10 caracteres</small>
            </label>
            <textarea 
              id="falla"
              v-model="formData.descripcion_falla" 
              class="form-textarea" 
              :class="{ 'is-invalid': errors.descripcion_falla }"
              rows="4" 
              placeholder="Describí los síntomas con claridad: no enciende, lentitud con programas de inicio, se congela, falso contacto en ficha jack..."
              :disabled="!canCreateOrder || isSubmitting"
            ></textarea>
            <span v-if="errors.descripcion_falla" class="form-error">{{ errors.descripcion_falla }}</span>
          </div>

          <!-- Comisión que interviene -->
          <div class="form-group">
            <label class="form-label">Comisión que interviene *</label>
            <div class="commission-toggle-row">
              <label 
                class="commission-option" 
                :class="{ selected: formData.comision_responsable === 'Hardware' }"
              >
                <input 
                  type="radio" 
                  value="Hardware" 
                  v-model="formData.comision_responsable" 
                  :disabled="!canCreateOrder || isSubmitting"
                />
                <div class="opt-body">
                  <span class="opt-icon">
                    <AppIcon name="wrench" :size="20" color="#ea580c" />
                  </span>
                  <div>
                    <strong>Comisión de Hardware</strong>
                    <p>Reparaciones físicas, soldadura, fuentes y periféricos</p>
                  </div>
                </div>
              </label>

              <label 
                class="commission-option" 
                :class="{ selected: formData.comision_responsable === 'Software y Redes' }"
              >
                <input 
                  type="radio" 
                  value="Software y Redes" 
                  v-model="formData.comision_responsable" 
                  :disabled="!canCreateOrder || isSubmitting"
                />
                <div class="opt-body">
                  <span class="opt-icon">
                    <AppIcon name="laptop" :size="20" color="#0284c7" />
                  </span>
                  <div>
                    <strong>Comisión de Software y Redes</strong>
                    <p>Debloating de Windows, lentitud, routers y conectividad</p>
                  </div>
                </div>
              </label>
            </div>
            <span v-if="errors.comision_responsable" class="form-error">{{ errors.comision_responsable }}</span>
          </div>

          <!-- Nivel de Prioridad -->
          <div class="form-group">
            <label class="form-label">Prioridad de atención *</label>
            <div class="priority-selector">
              <label 
                v-for="prio in ['Baja', 'Media', 'Alta']" 
                :key="prio"
                class="priority-chip"
                :class="[prio.toLowerCase(), { selected: formData.prioridad === prio }]"
              >
                <input 
                  type="radio" 
                  :value="prio" 
                  v-model="formData.prioridad" 
                  :disabled="!canCreateOrder || isSubmitting"
                />
                <span>{{ prio }}</span>
              </label>
            </div>
          </div>

          <!-- Datos de Autoría -->
          <div class="author-info-box">
            <span><AppIcon name="user" :size="13" /> Solicitante: <strong>{{ currentUser.nombre_completo }}</strong></span>
            <span><AppIcon name="tag" :size="13" /> Rol: <strong>{{ currentUser.rol_nombre }}</strong></span>
          </div>

          <!-- Botón de Envío -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary btn-submit"
              :disabled="!canCreateOrder || isSubmitting"
            >
              <span v-if="isSubmitting">Enviando pedido al taller...</span>
              <span v-else class="btn-content-flex">
                <AppIcon name="send" :size="16" />
                <span>Enviar pedido</span>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Columna Derecha: Tarjeta Explicativa "Qué guarda el sistema" (Pantalla 3 del PDF) -->
      <div class="system-explainer-card">
        <div class="explainer-header">
          <AppIcon name="clipboard" :size="24" color="#ca8a04" class="explainer-icon" />
          <h3 class="explainer-title">Qué guarda el sistema</h3>
        </div>
        <p class="explainer-intro">
          De cada petición quedan registrados los siguientes datos para garantizar la transparencia y la trazabilidad institucional:
        </p>

        <ul class="explainer-list">
          <li class="explainer-item">
            <AppIcon name="check" :size="15" class="check-bullet" color="#ca8a04" />
            <div>
              <strong>Número de orden único (OT)</strong>
              <p>Código secuencial para seguimiento en pizarrón físico y digital.</p>
            </div>
          </li>
          <li class="explainer-item">
            <AppIcon name="check" :size="15" class="check-bullet" color="#ca8a04" />
            <div>
              <strong>Equipo y aula</strong>
              <p>Identificación exacta para coordinar retiro y devolución.</p>
            </div>
          </li>
          <li class="explainer-item">
            <AppIcon name="check" :size="15" class="check-bullet" color="#ca8a04" />
            <div>
              <strong>Descripción detallada de la falla</strong>
              <p>El punto de partida para el diagnóstico estudiantil.</p>
            </div>
          </li>
          <li class="explainer-item">
            <AppIcon name="check" :size="15" class="check-bullet" color="#ca8a04" />
            <div>
              <strong>Comisión responsable asignada</strong>
              <p>Distribución hacia Hardware o Software y Redes.</p>
            </div>
          </li>
          <li class="explainer-item">
            <AppIcon name="check" :size="15" class="check-bullet" color="#ca8a04" />
            <div>
              <strong>Nivel de prioridad</strong>
              <p>Baja, Media o Alta según el impacto pedagógico en el aula.</p>
            </div>
          </li>
          <li class="explainer-item">
            <AppIcon name="check" :size="15" class="check-bullet" color="#ca8a04" />
            <div>
              <strong>Quién lo pidió y cuándo</strong>
              <p>Docente solicitante con marca temporal precisa (timestamp).</p>
            </div>
          </li>
          <li class="explainer-item">
            <AppIcon name="check" :size="15" class="check-bullet" color="#ca8a04" />
            <div>
              <strong>Cada cambio de estado con revisor y fecha</strong>
              <p>Historial inmutable de auditoría para la Sindicatura y Asamblea.</p>
            </div>
          </li>
        </ul>

        <div class="explainer-footer">
          <span class="badge badge-mock">REGLAMENTO PRECOOPERATIVO</span>
          <p>
            Cumple con el derecho del docente a conocer el progreso de sus órdenes y respalda la evaluación técnica de los estudiantes.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { currentUser, canCreateOrder } = useAuth()
const { createOrder } = useData()
const { success, error } = useToast()

const isSubmitting = ref(false)

const formData = reactive({
  equipo: '',
  aula_laboratorio: '',
  descripcion_falla: '',
  comision_responsable: 'Hardware',
  prioridad: 'Media'
})

const errors = reactive({
  equipo: '',
  aula_laboratorio: '',
  descripcion_falla: '',
  comision_responsable: ''
})

const validate = () => {
  let isValid = true
  errors.equipo = ''
  errors.aula_laboratorio = ''
  errors.descripcion_falla = ''
  errors.comision_responsable = ''

  if (!formData.equipo.trim()) {
    errors.equipo = 'El nombre o tipo de equipo es obligatorio.'
    isValid = false
  } else if (formData.equipo.trim().length < 3) {
    errors.equipo = 'Debe tener al menos 3 caracteres.'
    isValid = false
  }

  if (!formData.aula_laboratorio.trim()) {
    errors.aula_laboratorio = 'El aula o laboratorio es obligatorio.'
    isValid = false
  }

  if (!formData.descripcion_falla.trim()) {
    errors.descripcion_falla = 'Por favor detallá la falla observada.'
    isValid = false
  } else if (formData.descripcion_falla.trim().length < 10) {
    errors.descripcion_falla = 'La descripción de la falla debe ser más precisa (mínimo 10 caracteres).'
    isValid = false
  }

  if (!formData.comision_responsable) {
    errors.comision_responsable = 'Seleccioná la comisión que intervendrá.'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  try {
    const created = await createOrder(formData, currentUser.value)
    success(`¡Pedido ${created.codigo_ot} registrado con éxito en el taller!`)
    
    // Limpiar formulario
    formData.equipo = ''
    formData.aula_laboratorio = ''
    formData.descripcion_falla = ''
    formData.prioridad = 'Media'

    // Redirigir a la vista de taller
    router.push('/taller')
  } catch (err) {
    error('Error al guardar el pedido: ' + err.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.view-header {
  margin-bottom: 2rem;
}

.view-title {
  font-size: 2rem;
  color: var(--text-main);
  margin-bottom: 0.35rem;
}

.view-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.permission-warning {
  margin-top: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.form-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .form-layout-grid {
    grid-template-columns: 1.3fr 1fr;
  }
}

.form-card {
  padding: 1.75rem;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-dim);
  font-weight: 500;
}

.commission-toggle-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

@media (min-width: 500px) {
  .commission-toggle-row {
    grid-template-columns: 1fr 1fr;
  }
}

.commission-option {
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  transition: all var(--transition-fast);
}

.commission-option input {
  margin-top: 0.2rem;
}

.commission-option:hover {
  background: #f8fafc;
  border-color: var(--border-strong);
}

.commission-option.selected {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.opt-body {
  display: flex;
  gap: 0.5rem;
}

.opt-icon {
  font-size: 1.3rem;
}

.opt-body strong {
  display: block;
  font-size: 0.85rem;
  color: var(--text-main);
}

.opt-body p {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.3;
}

.priority-selector {
  display: flex;
  gap: 0.75rem;
}

.priority-chip {
  flex: 1;
  text-align: center;
  padding: 0.55rem;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-subtle);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all var(--transition-fast);
}

.priority-chip input {
  display: none;
}

.priority-chip.baja.selected {
  background: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success);
}

.priority-chip.media.selected {
  background: var(--color-amber-light);
  border-color: var(--color-amber);
  color: var(--color-amber);
}

.priority-chip.alta.selected {
  background: var(--color-danger-light);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.author-info-box {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.9rem;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-submit {
  width: 100%;
  padding: 0.85rem;
  font-size: 1rem;
}

/* Columna Derecha: Tarjeta Ámbar "Qué guarda el sistema" */
.system-explainer-card {
  background: #fefce8;
  border: 1.5px solid #fde047;
  border-radius: var(--radius-xl);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.explainer-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.explainer-icon {
  font-size: 1.5rem;
}

.explainer-title {
  font-size: 1.25rem;
  color: #713f12;
}

.explainer-intro {
  font-size: 0.85rem;
  color: #854d0e;
  margin-bottom: 1.25rem;
  line-height: 1.45;
}

.explainer-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
}

.explainer-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: white;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid #fef08a;
}

.check-bullet {
  color: #ca8a04;
  font-weight: 800;
}

.explainer-item strong {
  display: block;
  font-size: 0.82rem;
  color: #713f12;
}

.explainer-item p {
  font-size: 0.75rem;
  color: #854d0e;
  line-height: 1.3;
}

.explainer-footer {
  margin-top: 1.5rem;
  border-top: 1px solid #fde047;
  padding-top: 1rem;
}

.explainer-footer p {
  font-size: 0.75rem;
  color: #854d0e;
  margin-top: 0.4rem;
}
</style>
