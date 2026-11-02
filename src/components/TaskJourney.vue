<template>
  <div class="journey-card">
    <div class="journey-header">
      <div>
        <h3 class="journey-title">Recorrido de una tarea</h3>
        <p class="journey-subtitle">Flujo operativo estándar: de la falla reportada al equipo funcional entregado</p>
      </div>
      <span class="journey-badge">Ciclo de 5 etapas</span>
    </div>

    <div class="steps-grid">
      <div 
        v-for="(step, index) in steps" 
        :key="step.title"
        class="step-card"
        :class="{ active: currentActiveStep === index }"
        @click="currentActiveStep = index"
      >
        <div class="step-top">
          <div class="step-number-circle">
            <AppIcon :name="step.icon" :size="18" color="#ea580c" />
          </div>
          <span class="step-tag">Paso {{ index + 1 }}</span>
        </div>
        <h4 class="step-name">{{ step.title }}</h4>
        <p class="step-desc">{{ step.desc }}</p>
        <div class="step-actor">
          <span class="actor-label">Responsable:</span>
          <span class="actor-name">{{ step.actor }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentActiveStep = ref(0)

const steps = [
  {
    icon: 'clipboard',
    title: 'Cargar el pedido',
    desc: 'El docente o encargado detalla la falla, aula y prioridad en el formulario.',
    actor: 'Docente / Solicitante'
  },
  {
    icon: 'search',
    title: 'Diagnóstico',
    desc: 'Comisión evalúa el equipo, identifica daño en componentes o software.',
    actor: 'Técnico de Comisión'
  },
  {
    icon: 'wrench',
    title: 'Reparar u optimizar',
    desc: 'Soldadura de periféricos, cambio de piezas o debloating de Windows.',
    actor: 'Hardware / Soft y Redes'
  },
  {
    icon: 'flask',
    title: 'Probar',
    desc: 'Control de calidad estricto y registro de materiales/insumos consumidos.',
    actor: 'Control de Calidad'
  },
  {
    icon: 'check-circle',
    title: 'Entregar',
    desc: 'El docente verifica funcionamiento y se asienta el cierre en el historial.',
    actor: 'Docente y Consejo'
  }
]
</script>

<style scoped>
.journey-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.journey-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.journey-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
}

.journey-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.journey-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .steps-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.step-card {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.step-card:hover {
  background: #ffffff;
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.step-card.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.step-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.step-number-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  font-size: 1.1rem;
}

.step-tag {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
}

.step-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.4rem;
}

.step-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 0.75rem;
  flex: 1;
}

.step-actor {
  border-top: 1px dashed var(--border-subtle);
  padding-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.actor-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--text-dim);
}

.actor-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
