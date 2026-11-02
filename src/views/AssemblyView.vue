<template>
  <div class="assembly-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Asamblea y Registros Institucionales</h1>
        <p class="view-subtitle">Libros oficiales rubricados, Actas del Consejo, Libro Diario y Padrón Cooperativo (Pantalla 7)</p>
      </div>

      <!-- Botón de Cierre del Ejercicio (31 de Octubre) -->
      <button @click="showYearEndModal = true" class="btn btn-emerald btn-lg-glow">
        <span>📅</span>
        <span>Cierre del ejercicio (31 de Octubre)</span>
      </button>
    </div>

    <!-- Layout Principal de Pantalla 7 -->
    <div class="assembly-grid">
      <!-- Columna Izquierda: Actas y Libro Diario -->
      <div class="assembly-left-col">
        <!-- 1. Actas Oficiales -->
        <div class="card records-card">
          <div class="card-title-row">
            <div class="title-with-badge">
              <h2 class="sub-title">Actas Rubricadas</h2>
              <span class="badge badge-mock">LIBRO OFICIAL</span>
            </div>
            <button 
              v-if="canManageMinutes" 
              @click="showNewMinuteModal = true" 
              class="btn btn-primary btn-sm"
            >
              ➕ Cargar Acta
            </button>
          </div>

          <div class="minutes-list">
            <div v-for="acta in minutes" :key="acta.id" class="minute-card">
              <div class="minute-top">
                <span class="badge" :class="acta.tipo === 'Asamblea Ordinaria' ? 'badge-hardware' : 'badge-software'">
                  {{ acta.tipo }}
                </span>
                <span class="minute-date">📅 {{ acta.fecha }}</span>
              </div>
              <h3 class="minute-title">{{ acta.titulo }}</h3>
              <p class="minute-summary">{{ acta.resumen }}</p>
              <div class="minute-signatures">
                <span>Firmantes rubricados:</span>
                <strong>{{ acta.firmantes }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Libro Diario de Tesorería -->
        <div class="card ledger-card">
          <div class="card-title-row">
            <div class="title-with-badge">
              <h2 class="sub-title">Libro Diario de Ingresos y Egresos</h2>
              <span class="badge badge-mock">SUPERVISIÓN TESORERÍA</span>
            </div>
            <button 
              v-if="canManageLedger" 
              @click="showNewLedgerModal = true" 
              class="btn btn-primary btn-sm"
            >
              ➕ Asentar Movimiento
            </button>
          </div>

          <!-- Resumen de Saldos -->
          <div class="ledger-stats-banner">
            <div class="stat-mini">
              <span>Ingresos Totales:</span>
              <strong class="text-success">$ {{ totalIncome.toLocaleString() }}</strong>
            </div>
            <div class="stat-mini">
              <span>Egresos en Repuestos:</span>
              <strong class="text-danger">- $ {{ totalExpense.toLocaleString() }}</strong>
            </div>
            <div class="stat-mini">
              <span>Saldo en Caja:</span>
              <strong class="text-primary">$ {{ (totalIncome - totalExpense).toLocaleString() }}</strong>
            </div>
          </div>

          <div class="ledger-table-wrap">
            <table class="ledger-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Concepto / Detalle</th>
                  <th>Comprobante</th>
                  <th>Monto</th>
                  <th>Registrado Por</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="asiento in ledger" :key="asiento.id">
                  <td class="font-mono">{{ asiento.fecha }}</td>
                  <td>
                    <span class="badge" :class="asiento.tipo === 'Ingreso' ? 'badge-entregado' : 'badge-cancelado'">
                      {{ asiento.tipo }}
                    </span>
                  </td>
                  <td>
                    <strong>{{ asiento.concepto }}</strong>
                    <small class="ledger-cat">{{ asiento.categoria }}</small>
                  </td>
                  <td class="font-mono text-dim">{{ asiento.comprobante || 'S/N' }}</td>
                  <td class="font-bold" :class="asiento.tipo === 'Ingreso' ? 'text-success' : 'text-danger'">
                    {{ asiento.tipo === 'Ingreso' ? '+' : '-' }} ${{ Number(asiento.monto).toLocaleString() }}
                  </td>
                  <td class="text-sm">{{ asiento.registrado_por }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Padrón de Asociados Estudiantiles -->
        <div class="card padron-card">
          <div class="card-title-row">
            <h2 class="sub-title">Padrón Oficial de Asociados ({{ associates.length }} estudiantes)</h2>
            <span class="badge badge-emerald">Estatuto: Mínimo 9 asociados</span>
          </div>

          <div class="associates-grid">
            <div v-for="asc in associates" :key="asc.id" class="associate-chip">
              <span class="asc-avatar">🎓</span>
              <div class="asc-info">
                <strong>{{ asc.nombre }}</strong>
                <span>{{ asc.rol }} • {{ asc.curso }}</span>
              </div>
              <span class="badge badge-entregado asc-status">Activo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Tarjeta Oscura "Quién es quién" (Pantalla 7 del PDF) -->
      <div class="card-dark who-is-who-card">
        <div class="who-header">
          <span class="who-icon">🏛️</span>
          <h2 class="who-title">Quién es quién</h2>
          <p class="who-subtitle">Órganos de gobierno institucional y comisiones de trabajo estudiantil</p>
        </div>

        <div class="who-sections-list">
          <div class="who-item">
            <div class="who-item-head">
              <span class="who-dot dot-asamblea"></span>
              <h4>Asamblea de Asociados</h4>
            </div>
            <p>
              Órgano supremo de la cooperativa donde todas las personas asociadas deciden. Cada miembro tiene derecho a voz y <strong>1 voto igualitario</strong>.
            </p>
          </div>

          <div class="who-item">
            <div class="who-item-head">
              <span class="who-dot dot-consejo"></span>
              <h4>Consejo de Administración</h4>
            </div>
            <p>
              Integrado por Presidencia, Secretaría, Tesorería y vocalías. Organizan y ejecutan las actividades diarias de mantenimiento, asignan responsables y llevan el libro contable.
            </p>
          </div>

          <div class="who-item">
            <div class="who-item-head">
              <span class="who-dot dot-sindicatura"></span>
              <h4>Sindicatura</h4>
            </div>
            <p>
              Fiscaliza los movimientos operativos y económicos. Controla que el Consejo cumpla con el estatuto y rinde cuentas a la Asamblea.
            </p>
          </div>

          <div class="who-item">
            <div class="who-item-head">
              <span class="who-dot dot-asesora"></span>
              <h4>Comisión Asesora</h4>
            </div>
            <p>
              Integrada por docentes y directivos que orientan el proceso formativo y pedagógico sin quitarle la gestión a los estudiantes.
            </p>
          </div>

          <div class="who-item">
            <div class="who-item-head">
              <span class="who-dot dot-operativas"></span>
              <h4>Comisiones Operativas</h4>
            </div>
            <p>
              <strong>Comisión de Hardware</strong> (reparaciones físicas, soldaduras y fuentes) y <strong>Comisión de Software y Redes</strong> (debloating, lentitud y routers Wi-Fi).
            </p>
          </div>
        </div>

        <div class="who-footer-note">
          <p>
            📜 Conforme a la reglamentación, todas las resoluciones quedan plasmadas en libros rubricados por la dirección de la escuela técnica.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de Cierre del Ejercicio (31 de Octubre) -->
    <YearEndModal 
      v-if="showYearEndModal" 
      @close="showYearEndModal = false" 
    />

    <!-- Modal para Nueva Acta -->
    <div v-if="showNewMinuteModal" class="modal-backdrop" @click.self="showNewMinuteModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">Cargar Nueva Acta al Libro Oficial</h3>
          <button class="close-btn" @click="showNewMinuteModal = false">✕</button>
        </div>
        <form @submit.prevent="handleCreateMinute" class="modal-body">
          <div class="form-group">
            <label class="form-label">Tipo de Acta</label>
            <select v-model="newMinute.tipo" class="form-select">
              <option value="Asamblea Ordinaria">Asamblea Ordinaria</option>
              <option value="Asamblea Extraordinaria">Asamblea Extraordinaria</option>
              <option value="Consejo de Administración">Consejo de Administración</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Título del Acta *</label>
            <input type="text" v-model="newMinute.titulo" class="form-input" placeholder="Ej: Acta Nº 13 — Plan de mantenimiento..." required />
          </div>
          <div class="form-group">
            <label class="form-label">Resumen de Resoluciones y Acuerdos *</label>
            <textarea v-model="newMinute.resumen" class="form-textarea" rows="4" placeholder="Detalle de temas tratados, votaciones y acuerdos tomados..." required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Firmantes</label>
            <input type="text" v-model="newMinute.firmantes" class="form-input" placeholder="Nombres de autoridades presentes" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showNewMinuteModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Rubricar Acta</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para Nuevo Movimiento en Libro Diario -->
    <div v-if="showNewLedgerModal" class="modal-backdrop" @click.self="showNewLedgerModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">Asentar Movimiento en Libro Diario</h3>
          <button class="close-btn" @click="showNewLedgerModal = false">✕</button>
        </div>
        <form @submit.prevent="handleCreateLedger" class="modal-body">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Tipo de Movimiento</label>
              <select v-model="newLedger.tipo" class="form-select">
                <option value="Ingreso">Ingreso (+)</option>
                <option value="Egreso">Egreso (-)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Monto ($) *</label>
              <input type="number" v-model.number="newLedger.monto" min="1" class="form-input" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Concepto / Motivo *</label>
            <input type="text" v-model="newLedger.concepto" class="form-input" placeholder="Ej: Compra de estaño 60/40 y conectores" required />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Categoría</label>
              <select v-model="newLedger.categoria" class="form-select">
                <option value="Compra de repuestos">Compra de repuestos</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Aporte cooperativo">Aporte cooperativo</option>
                <option value="Donación escolar">Donación escolar</option>
                <option value="Gastos operativos">Gastos operativos</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nº Factura / Comprobante</label>
              <input type="text" v-model="newLedger.comprobante" class="form-input" placeholder="Ej: FAC-B-0003-000122" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showNewLedgerModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar en Libro Diario</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'
import { useToast } from '../composables/useToast'
import YearEndModal from '../components/YearEndModal.vue'

const { currentUser, canManageMinutes, canManageLedger } = useAuth()
const { minutes, ledger, associates, addMinute, addLedgerEntry } = useData()
const { success, error } = useToast()

const showYearEndModal = ref(false)
const showNewMinuteModal = ref(false)
const showNewLedgerModal = ref(false)

const newMinute = reactive({
  tipo: 'Asamblea Ordinaria',
  titulo: '',
  resumen: '',
  firmantes: ''
})

const newLedger = reactive({
  tipo: 'Egreso',
  monto: 15000,
  concepto: '',
  categoria: 'Compra de repuestos',
  comprobante: ''
})

const totalIncome = computed(() => {
  return ledger.value.filter(a => a.tipo === 'Ingreso').reduce((acc, curr) => acc + Number(curr.monto), 0)
})

const totalExpense = computed(() => {
  return ledger.value.filter(a => a.tipo === 'Egreso').reduce((acc, curr) => acc + Number(curr.monto), 0)
})

const handleCreateMinute = async () => {
  try {
    await addMinute(newMinute, currentUser.value)
    success('Acta asentada y rubricada en el libro digital.')
    showNewMinuteModal.value = false
    newMinute.titulo = ''
    newMinute.resumen = ''
  } catch (err) {
    error('Error: ' + err.message)
  }
}

const handleCreateLedger = async () => {
  try {
    await addLedgerEntry(newLedger, currentUser.value)
    success('Asiento contable registrado en el Libro Diario.')
    showNewLedgerModal.value = false
    newLedger.concepto = ''
    newLedger.comprobante = ''
  } catch (err) {
    error('Error: ' + err.message)
  }
}
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
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

.btn-lg-glow {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  border-radius: var(--radius-full);
}

.assembly-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 950px) {
  .assembly-grid {
    grid-template-columns: 1.35fr 1fr;
  }
}

.assembly-left-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-title-row {
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
  font-size: 1.25rem;
  color: var(--text-main);
}

/* Actas */
.minutes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.minute-card {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.1rem;
}

.minute-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.minute-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.minute-title {
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}

.minute-summary {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.45;
  margin-bottom: 0.75rem;
}

.minute-signatures {
  font-size: 0.75rem;
  color: var(--text-dim);
  border-top: 1px dashed var(--border-subtle);
  padding-top: 0.45rem;
}

.minute-signatures strong {
  display: block;
  color: var(--text-main);
  margin-top: 0.15rem;
}

/* Libro Diario */
.ledger-stats-banner {
  display: flex;
  justify-content: space-around;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  margin-bottom: 1.25rem;
  text-align: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat-mini span {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.stat-mini strong {
  font-size: 1.15rem;
}

.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }
.text-primary { color: var(--color-primary); }

.ledger-table-wrap {
  overflow-x: auto;
}

.ledger-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.ledger-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  background: #f1f5f9;
  color: var(--text-muted);
  font-weight: 700;
  border-bottom: 2px solid var(--border-subtle);
}

.ledger-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.ledger-cat {
  display: block;
  font-size: 0.7rem;
  color: var(--text-dim);
}

.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }
.text-sm { font-size: 0.75rem; }

/* Padrón */
.associates-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.75rem;
}

@media (min-width: 600px) {
  .associates-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.associate-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
}

.asc-avatar {
  font-size: 1.3rem;
}

.asc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.asc-info strong {
  font-size: 0.8rem;
  color: var(--text-main);
}

.asc-info span {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.asc-status {
  font-size: 0.65rem;
}

/* Columna Derecha: Quién es quién (Dark Mode) */
.who-is-who-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.who-header {
  margin-bottom: 1.5rem;
}

.who-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.35rem;
}

.who-title {
  font-size: 1.5rem;
  color: white;
}

.who-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}

.who-sections-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}

.who-item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: var(--radius-md);
  padding: 0.9rem;
}

.who-item-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.who-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-asamblea { background: #38bdf8; }
.dot-consejo { background: #f59e0b; }
.dot-sindicatura { background: #ec4899; }
.dot-asesora { background: #10b981; }
.dot-operativas { background: #f97316; }

.who-item h4 {
  font-size: 0.95rem;
  color: white;
}

.who-item p {
  font-size: 0.78rem;
  color: #cbd5e1;
  line-height: 1.4;
}

.who-footer-note {
  margin-top: 1.5rem;
  border-top: 1px solid #334155;
  padding-top: 1rem;
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.4;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
