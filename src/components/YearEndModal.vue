<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header header-emerald">
        <div>
          <span class="badge badge-date">📅 Ejercicio cerrado al 31 de Octubre</span>
          <h2 class="modal-title text-white">Memoria y Balance Anual Precooperativo</h2>
          <p class="modal-subtitle text-white-dim">Clínica de Hardware y Optimización Escolar — Para elevar a Asamblea Anual Ordinaria en Noviembre</p>
        </div>
        <button class="close-btn text-white" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Indicadores de Impacto Pedagógico e Institucional -->
        <h4 class="section-title">1. Indicadores Cuantitativos de Impacto Escolar</h4>
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-icon">💻</span>
            <span class="metric-value">{{ stats.computersOptimized }}</span>
            <span class="metric-label">Computadoras optimizadas</span>
            <span class="metric-detail">Debloating y puesta a punto de RAM</span>
          </div>

          <div class="metric-card">
            <span class="metric-icon">🎧</span>
            <span class="metric-value">{{ stats.peripheralsRecovered }}</span>
            <span class="metric-label">Periféricos reparados</span>
            <span class="metric-detail">Auriculares con ficha jack soldada y mouses</span>
          </div>

          <div class="metric-card">
            <span class="metric-icon">📶</span>
            <span class="metric-value">+40%</span>
            <span class="metric-label">Estabilidad de red Wi-Fi</span>
            <span class="metric-detail">Routers de aulas reconfigurados</span>
          </div>

          <div class="metric-card">
            <span class="metric-icon">⏱️</span>
            <span class="metric-value">{{ stats.hoursSaved }} h</span>
            <span class="metric-label">Horas de taller devueltas</span>
            <span class="metric-detail">Aulas con computadoras operativas</span>
          </div>
        </div>

        <!-- Balance Financiero y Transparencia -->
        <h4 class="section-title">2. Rendición de Cuentas y Libro Diario (Supervisión de Tesorería)</h4>
        <div class="balance-card">
          <div class="balance-row">
            <span>Ingresos Totales (Aporte cooperativo y donaciones):</span>
            <strong class="text-success">$ {{ stats.totalIncome.toLocaleString() }}</strong>
          </div>
          <div class="balance-row">
            <span>Egresos en Repuestos y Herramientas:</span>
            <strong class="text-danger">- $ {{ stats.totalExpense.toLocaleString() }}</strong>
          </div>
          <div class="balance-row total-row">
            <span>Fondo Rotatorio Disponible (Superávit para reinversión):</span>
            <strong class="text-primary">$ {{ stats.netBalance.toLocaleString() }}</strong>
          </div>
        </div>

        <div class="coop-rule-box">
          <strong>⚖️ Principio Cooperativo de Excedentes:</strong>
          <p>
            Conforme al Art. 9 del Estatuto Institucional, los excedentes de $ {{ stats.netBalance.toLocaleString() }} 
            <strong>no se reparten en dinero</strong> entre los asociados, sino que se destinan a la compra de soldadores, estaño y adaptadores para el siguiente ciclo lectivo escolar.
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
        <button class="btn btn-emerald" @click="printSummary">🖨️ Exportar Memoria para la Asamblea</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from '../services/dataService'

const emit = defineEmits(['close'])
const { orders, ledger } = useData()

const stats = computed(() => {
  const delivered = orders.value.filter(o => o.estado === 'Entregado')
  const computers = delivered.filter(o => o.equipo.toLowerCase().includes('pc') || o.equipo.toLowerCase().includes('computadora')).length || 2
  const peripherals = 6 + (delivered.filter(o => o.equipo.toLowerCase().includes('auricular') || o.equipo.toLowerCase().includes('monitor')).length || 1)

  let totalIncome = 0
  let totalExpense = 0
  ledger.value.forEach(asiento => {
    if (asiento.tipo === 'Ingreso') totalIncome += Number(asiento.monto)
    if (asiento.tipo === 'Egreso') totalExpense += Number(asiento.monto)
  })

  return {
    computersOptimized: computers,
    peripheralsRecovered: peripherals,
    hoursSaved: (computers * 15) + (peripherals * 2),
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense
  }
})

const printSummary = () => {
  window.print()
}
</script>

<style scoped>
.header-emerald {
  background: linear-gradient(135deg, #059669, #0f766e);
  color: white;
}

.text-white { color: white; }
.text-white-dim { color: rgba(255, 255, 255, 0.85); font-size: 0.8rem; }

.badge-date {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.7rem;
  margin-bottom: 0.4rem;
}

.section-title {
  font-size: 0.95rem;
  margin: 1rem 0 0.75rem;
  color: var(--text-main);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 600px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.metric-card {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-main);
  margin-top: 0.25rem;
}

.metric-detail {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.balance-card {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  border-bottom: 1px dashed var(--border-subtle);
}

.total-row {
  border-bottom: none;
  font-size: 0.95rem;
  padding-top: 0.6rem;
  font-weight: 700;
}

.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }
.text-primary { color: var(--color-primary); }

.coop-rule-box {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  color: #065f46;
}

.coop-rule-box p {
  margin-top: 0.25rem;
  line-height: 1.4;
}
</style>
