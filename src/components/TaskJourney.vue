<template>
  <div class="journey-card">
    <div class="journey-header">
      <h3 class="journey-title">Flujo del Taller</h3>
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
            <AppIcon :name="step.icon" :size="15" color="#ea580c" />
          </div>
          <span class="step-tag">Paso {{ index + 1 }}</span>
        </div>
        <h4 class="step-name">{{ step.title }}</h4>
        <p class="step-desc">{{ step.desc }}</p>
        <span class="actor-badge">{{ step.actor }}</span>
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
    title: 'Recepción',
    desc: 'Registro inicial de la falla y aula de origen.',
    actor: 'Docente'
  },
  {
    icon: 'search',
    title: 'Diagnóstico',
    desc: 'Evaluación técnica de componentes y estado general.',
    actor: 'Técnico'
  },
  {
    icon: 'wrench',
    title: 'Reparación',
    desc: 'Sustitución de piezas, soldadura y optimización.',
    actor: 'Comisión'
  },
  {
    icon: 'check-circle',
    title: 'Control',
    desc: 'Pruebas de estabilidad, temperatura y rendimiento.',
    actor: 'Técnico'
  },
  {
    icon: 'package',
    title: 'Entrega',
    desc: 'Recepción firmada y devolución conforme al aula.',
    actor: 'Docente'
  }
]
</script>

<style scoped>
.journey-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}

.journey-header {
  margin-bottom: 1.25rem;
}

.journey-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.85rem;
}

.step-card {
  background: var(--bg-main);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  cursor: pointer;
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1),
              border-color 160ms ease-out,
              background-color 160ms ease-out;
}

.step-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.step-card:active {
  transform: scale(0.98);
}

.step-card.active {
  background: rgba(234, 88, 12, 0.04);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.step-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-number-circle {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: rgba(234, 88, 12, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.step-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  line-height: 1.25;
}

.step-desc {
  font-size: 0.76rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.35;
  flex: 1;
}

.actor-badge {
  align-self: flex-start;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.12rem 0.45rem;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .steps-grid {
    grid-template-columns: 1fr;
  }
}
</style>
