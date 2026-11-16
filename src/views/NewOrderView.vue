<template>
  <div class="new-order-view">
    <div class="view-header">
      <h1 class="view-title">Nuevo Pedido</h1>
      <p class="view-subtitle">Registrá la falla técnica del equipo para iniciar la atención en taller.</p>
    </div>

    <!-- Alerta si el rol no tiene permisos -->
    <div v-if="!canCreateOrder" class="permission-banner">
      <AppIcon name="alert-triangle" :size="16" />
      <span>Tu rol actual ({{ currentRole }}) no tiene permisos para crear pedidos. Iniciá sesión como <strong>Docente</strong> o <strong>Técnico</strong>.</span>
    </div>

    <div class="form-container">
      <div class="card form-card">
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <!-- Campo Equipo -->
            <div class="form-group">
              <label class="form-label" for="equipo">Equipo o periférico *</label>
              <input 
                id="equipo"
                type="text" 
                v-model="formData.equipo" 
                class="form-input" 
                :class="{ 'is-invalid': errors.equipo }"
                placeholder="Ej: PC 4, Monitor Samsung, Auriculares x 6..."
                :disabled="!canCreateOrder || isSubmitting"
              />
              <span v-if="errors.equipo" class="form-error">{{ errors.equipo }}</span>
            </div>

            <!-- Campo Aula o Laboratorio -->
            <div class="form-group">
              <label class="form-label" for="aula">Aula o laboratorio *</label>
              <input 
                id="aula"
                type="text" 
                v-model="formData.aula_laboratorio" 
                class="form-input" 
                :class="{ 'is-invalid': errors.aula_laboratorio }"
                placeholder="Ej: Aula 2, Lab de Informática, Biblioteca..."
                :disabled="!canCreateOrder || isSubmitting"
              />
              <span v-if="errors.aula_laboratorio" class="form-error">{{ errors.aula_laboratorio }}</span>
            </div>
          </div>

          <div class="form-row">
            <!-- Campo Comisión Responsable -->
            <div class="form-group">
              <label class="form-label">Comisión responsable *</label>
              <div class="radio-cards-row">
                <label 
                  class="radio-card" 
                  :class="{ active: formData.comision_responsable === 'Hardware' }"
                >
                  <input 
                    type="radio" 
                    value="Hardware" 
                    v-model="formData.comision_responsable" 
                    :disabled="!canCreateOrder || isSubmitting"
                  />
                  <div>
                    <div class="radio-label-top">
                      <AppIcon name="wrench" :size="15" />
                      <strong>Hardware</strong>
                    </div>
                    <small>Componentes, fuentes, placas y soldadura</small>
                  </div>
                </label>

                <label 
                  class="radio-card" 
                  :class="{ active: formData.comision_responsable === 'Software y Redes' }"
                >
                  <input 
                    type="radio" 
                    value="Software y Redes" 
                    v-model="formData.comision_responsable" 
                    :disabled="!canCreateOrder || isSubmitting"
                  />
                  <div>
                    <div class="radio-label-top">
                      <AppIcon name="laptop" :size="15" />
                      <strong>Software y Redes</strong>
                    </div>
                    <small>Sistemas, optimización y conectividad</small>
                  </div>
                </label>
              </div>
            </div>

            <!-- Campo Prioridad -->
            <div class="form-group">
              <label class="form-label">Prioridad *</label>
              <div class="priority-pills-row">
                <label 
                  v-for="prio in ['Baja', 'Media', 'Alta']" 
                  :key="prio"
                  class="priority-pill-label"
                  :class="[prio.toLowerCase(), { active: formData.prioridad === prio }]"
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
          </div>

          <!-- Campo Descripción de la Falla -->
          <div class="form-group">
            <label class="form-label" for="falla">Descripción de la falla reportada *</label>
            <textarea 
              id="falla"
              v-model="formData.descripcion_falla" 
              class="form-textarea" 
              :class="{ 'is-invalid': errors.descripcion_falla }"
              rows="3"
              placeholder="Detallá los síntomas detectados: no enciende, lentitud extrema, zumbidos, cortes..."
              :disabled="!canCreateOrder || isSubmitting"
            ></textarea>
            <span v-if="errors.descripcion_falla" class="form-error">{{ errors.descripcion_falla }}</span>
          </div>

          <!-- Datos de Autoría -->
          <div class="author-info-box">
            <span><AppIcon name="user" :size="13" /> Solicitante: <strong>{{ userProfile.nombre_completo }}</strong></span>
            <span><AppIcon name="tag" :size="13" /> Rol: <strong>{{ userProfile.rol_descripcion || userProfile.rol }}</strong></span>
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
                <span>Enviar Pedido al Taller</span>
              </span>
            </button>
          </div>
        </form>
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
const { currentUser, userProfile, currentRole, canCreateOrder } = useAuth()
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
    errors.equipo = 'El nombre del equipo es obligatorio.'
    isValid = false
  } else if (formData.equipo.trim().length < 3) {
    errors.equipo = 'El nombre del equipo debe tener al menos 3 caracteres.'
    isValid = false
  }

  if (!formData.aula_laboratorio.trim()) {
    errors.aula_laboratorio = 'La ubicación física es obligatoria.'
    isValid = false
  }

  if (!formData.descripcion_falla.trim()) {
    errors.descripcion_falla = 'La descripción de la falla es obligatoria.'
    isValid = false
  } else if (formData.descripcion_falla.trim().length < 10) {
    errors.descripcion_falla = 'Describí la falla con más detalle (mínimo 10 caracteres).'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  try {
    const created = await createOrder(formData, userProfile.value || currentUser.value)
    success(`¡Pedido ${created.codigo_ot} registrado con éxito en el taller!`)
    
    formData.equipo = ''
    formData.aula_laboratorio = ''
    formData.descripcion_falla = ''
    formData.prioridad = 'Media'

    router.push('/taller')
  } catch (err) {
    error('Error al guardar el pedido: ' + err.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.new-order-view {
  max-width: 760px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 1.75rem;
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

.permission-banner {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #b45309;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-lg);
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.form-card {
  padding: 2rem;
  border-radius: var(--radius-xl);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.form-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
}

.form-input, .form-textarea {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-main);
  font-size: 0.92rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus, .form-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
}

.form-input.is-invalid, .form-textarea.is-invalid {
  border-color: #ef4444;
}

.form-error {
  font-size: 0.78rem;
  color: #ef4444;
  font-weight: 500;
}

.radio-cards-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-card {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--bg-main);
  transition: all 0.2s ease;
}

.radio-card:hover {
  border-color: var(--color-primary);
}

.radio-card.active {
  border-color: var(--color-primary);
  background: rgba(234, 88, 12, 0.05);
}

.radio-label-top {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  color: var(--text-main);
}

.radio-card small {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
}

.priority-pills-row {
  display: flex;
  gap: 0.5rem;
  height: 100%;
  align-items: flex-start;
}

.priority-pill-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  background: var(--bg-main);
}

.priority-pill-label input {
  display: none;
}

.priority-pill-label.baja.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
  color: #047857;
}

.priority-pill-label.media.active {
  background: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  color: #b45309;
}

.priority-pill-label.alta.active {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #b91c1c;
}

.author-info-box {
  background: var(--bg-main);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-submit {
  width: 100%;
  padding: 0.85rem;
  font-size: 0.95rem;
  font-weight: 600;
  justify-content: center;
}

.btn-content-flex {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .form-card {
    padding: 1.25rem;
  }
}
</style>
