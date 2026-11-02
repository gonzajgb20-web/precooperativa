<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Conexión con Supabase</h2>
          <p class="modal-subtitle">Integración con PostgreSQL en la nube para persistencia multi-usuario</p>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Estado de la conexión -->
        <div class="connection-status-card" :class="dataSource === 'supabase' ? 'status-connected' : 'status-local'">
          <div class="status-icon">
            {{ dataSource === 'supabase' ? '🟢' : '🟡' }}
          </div>
          <div class="status-info">
            <strong>{{ dataSource === 'supabase' ? 'Supabase Activo y Conectado' : 'Operando en Modo Demo Local' }}</strong>
            <p v-if="dataSource === 'supabase'">
              Las consultas y escrituras se realizan en la base de datos PostgreSQL remota mediante las políticas RLS.
            </p>
            <p v-else>
              Las órdenes, inventario y libro diario se guardan en el LocalStorage de tu navegador. Podés conectar tu proyecto de Supabase ingresando la URL y Anon Key a continuación.
            </p>
          </div>
        </div>

        <!-- Formulario de credenciales seguras -->
        <div class="config-form">
          <div class="form-group">
            <label class="form-label">
              <span>Project URL de Supabase</span>
              <span class="safe-tag">Público</span>
            </label>
            <input 
              type="text" 
              v-model="inputUrl" 
              class="form-input" 
              placeholder="https://xyzcompany.supabase.co"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>Anon Public Key (Clave Anónima del Cliente)</span>
              <span class="safe-tag">Seguro para Frontend</span>
            </label>
            <textarea 
              v-model="inputKey" 
              class="form-textarea" 
              rows="3" 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            ></textarea>
            <small class="form-hint">
              🛡️ <strong>Aviso de seguridad (Punto 16):</strong> Utilizá únicamente la clave pública <code>anon</code>. NUNCA ingreses la <code>service_role</code> en la aplicación cliente.
            </small>
          </div>

          <div class="credentials-actions">
            <button @click="saveCredentials" class="btn btn-primary btn-sm">
              Guardar credenciales y conectar
            </button>
            <button v-if="hasStoredCredentials" @click="clearCredentials" class="btn btn-secondary btn-sm">
              Restablecer a Modo Local
            </button>
          </div>
        </div>

        <!-- Botones de sincronización y semilla -->
        <div class="seed-section">
          <h4 class="seed-title">Población de datos simulados (Punto 14):</h4>
          <p class="seed-desc">
            Carga el lote inicial de 5 órdenes, catálogo de 6 repuestos con alertas de stock, asientos del Libro Diario y actas en tu base de datos o almacenamiento local.
          </p>

          <div class="seed-buttons">
            <button 
              v-if="dataSource === 'supabase'" 
              @click="handleSeedSupabase" 
              class="btn btn-emerald btn-sm"
              :disabled="isSeeding"
            >
              {{ isSeeding ? 'Poblando tablas...' : '⚡ Cargar registros simulados a Supabase' }}
            </button>
            <button @click="handleResetLocal" class="btn btn-secondary btn-sm">
              🔄 Restaurar datos de prueba locales
            </button>
          </div>
        </div>

        <!-- Instrucciones SQL -->
        <div class="sql-hint-box">
          <span class="hint-icon">📄</span>
          <div>
            <strong>Script SQL disponible en el proyecto:</strong>
            <p>
              El archivo <code>supabase_schema.sql</code> contiene la definición completa de tablas, claves foráneas, políticas RLS y datos iniciales para ejecutar en el SQL Editor de Supabase.
            </p>
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
import { ref } from 'vue'
import { supabaseUrl, supabaseAnonKey, updateSupabaseCredentials } from '../supabase'
import { useData } from '../services/dataService'
import { useToast } from '../composables/useToast'

const emit = defineEmits(['close'])

const { dataSource, seedSupabaseData, resetToMockData } = useData()
const { success, error, info } = useToast()

const inputUrl = ref(localStorage.getItem('preco_supabase_url') || supabaseUrl || '')
const inputKey = ref(localStorage.getItem('preco_supabase_key') || supabaseAnonKey || '')
const hasStoredCredentials = ref(Boolean(localStorage.getItem('preco_supabase_url')))
const isSeeding = ref(false)

const saveCredentials = () => {
  if (!inputUrl.value.trim() || !inputKey.value.trim()) {
    error('Por favor completa tanto la URL como la Anon Key.')
    return
  }
  updateSupabaseCredentials(inputUrl.value, inputKey.value)
}

const clearCredentials = () => {
  updateSupabaseCredentials('', '')
}

const handleSeedSupabase = async () => {
  isSeeding.value = true
  try {
    await seedSupabaseData()
    success('¡Tablas de Supabase pobladas con éxito con los datos simulados!')
    emit('close')
  } catch (err) {
    error('Error al poblar Supabase: ' + err.message)
  } finally {
    isSeeding.value = false
  }
}

const handleResetLocal = () => {
  resetToMockData()
  info('Datos locales restablecidos al estado inicial del informe técnico.')
  emit('close')
}
</script>

<style scoped>
.modal-title {
  font-size: 1.25rem;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-muted);
}

.connection-status-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1.25rem;
}

.status-connected {
  background: var(--color-success-light);
  border: 1px solid var(--color-success-border);
  color: #064e3b;
}

.status-local {
  background: #fefce8;
  border: 1px solid #fef08a;
  color: #713f12;
}

.status-icon {
  font-size: 1.5rem;
}

.status-info p {
  font-size: 0.8rem;
  margin-top: 0.2rem;
  opacity: 0.9;
}

.config-form {
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.safe-tag {
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  background: #e2e8f0;
  color: #475569;
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.35rem;
}

.credentials-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.seed-section {
  border-top: 1px solid var(--border-subtle);
  padding-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.seed-title {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.seed-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.seed-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sql-hint-box {
  display: flex;
  gap: 0.75rem;
  background: #f1f5f9;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  color: var(--text-main);
  align-items: center;
}

.hint-icon {
  font-size: 1.25rem;
}
</style>
