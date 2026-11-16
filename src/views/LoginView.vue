<template>
  <div class="auth-page-container">
    <div class="auth-card" :class="{ 'wide-register-card': activeTab === 'register' }">
      <!-- Encabezado -->
      <div class="auth-header">
        <h1 class="auth-title">{{ activeTab === 'login' ? 'Iniciar Sesión' : 'Nueva Cuenta' }}</h1>
        <p class="auth-subtitle">Clínica de Hardware — Precooperativa Escolar</p>
      </div>

      <!-- Selector de Pestañas (Emil Kowalski segmented control) -->
      <div class="auth-tabs-bar">
        <button 
          type="button"
          class="auth-tab-btn" 
          :class="{ active: activeTab === 'login' }"
          @click="switchTab('login')"
        >
          Iniciar Sesión
        </button>
        <button 
          type="button"
          class="auth-tab-btn" 
          :class="{ active: activeTab === 'register' }"
          @click="switchTab('register')"
        >
          Registrarse
        </button>
      </div>

      <!-- Alerta de Error -->
      <div v-if="errorMessage" class="auth-alert-error">
        <AppIcon name="alert-triangle" :size="16" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Formulario 1: Iniciar Sesión -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="login-email">Correo institucional</label>
          <div class="input-icon-wrap">
            <AppIcon name="user" :size="16" class="field-icon" />
            <input 
              id="login-email"
              v-model="loginForm.email"
              type="email" 
              required
              placeholder="tu.usuario@escuela.edu.ar"
              class="form-input with-icon"
              :disabled="isLoading"
              autocomplete="email"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="login-pass">Contraseña</label>
          <div class="input-icon-wrap">
            <AppIcon name="lock" :size="16" class="field-icon" />
            <input 
              id="login-pass"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'" 
              required
              placeholder="••••••••"
              class="form-input with-icon"
              :disabled="isLoading"
              autocomplete="current-password"
            />
            <button 
              type="button" 
              class="toggle-eye-btn" 
              @click="showPassword = !showPassword"
              title="Mostrar u ocultar contraseña"
            >
              <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="15" />
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-submit"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Ingresando...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <!-- Formulario 2: Registrarse (Diseño en 2 columnas lado a lado) -->
      <form v-else @submit.prevent="handleRegister" class="auth-form reg-columns-layout">
        <div class="form-columns-split">
          <!-- Columna 1: Datos Personales e Institucionales -->
          <div class="form-column">
            <div class="form-group">
              <label class="form-label" for="reg-name">Nombre y Apellido *</label>
              <input 
                id="reg-name"
                v-model="regForm.nombre_completo"
                type="text" 
                required
                placeholder="Ej: Prof. Carlos Benítez"
                class="form-input"
                :disabled="isLoading"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">Correo institucional *</label>
              <input 
                id="reg-email"
                v-model="regForm.email"
                type="email" 
                required
                placeholder="carlos@escuela.edu.ar"
                class="form-input"
                :disabled="isLoading"
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-dept">Aula o Laboratorio (opcional)</label>
              <input 
                id="reg-dept"
                v-model="regForm.curso"
                type="text" 
                placeholder="Ej: Laboratorio 2 / Ciclo Básico"
                class="form-input"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Columna 2: Claves de Acceso y Nivel de Rol -->
          <div class="form-column">
            <div class="form-group">
              <label class="form-label" for="reg-pass">Contraseña *</label>
              <div class="input-icon-wrap">
                <input 
                  id="reg-pass"
                  v-model="regForm.password"
                  :type="showRegPassword ? 'text' : 'password'" 
                  required
                  minlength="6"
                  placeholder="Mínimo 6 caracteres"
                  class="form-input"
                  :disabled="isLoading"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  class="toggle-eye-btn" 
                  @click="showRegPassword = !showRegPassword"
                  title="Mostrar u ocultar contraseña"
                >
                  <AppIcon :name="showRegPassword ? 'eye-off' : 'eye'" :size="15" />
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-confirm">Confirmar contraseña *</label>
              <div class="input-icon-wrap">
                <input 
                  id="reg-confirm"
                  v-model="regForm.password_confirm"
                  :type="showRegConfirmPassword ? 'text' : 'password'" 
                  required
                  placeholder="Repetí tu contraseña"
                  class="form-input"
                  :disabled="isLoading"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  class="toggle-eye-btn" 
                  @click="showRegConfirmPassword = !showRegConfirmPassword"
                  title="Mostrar u ocultar contraseña"
                >
                  <AppIcon :name="showRegConfirmPassword ? 'eye-off' : 'eye'" :size="15" />
                </button>
              </div>
            </div>

            <!-- Aviso de Rol Institucional -->
            <div class="security-role-notice">
              <AppIcon name="shield" :size="15" color="#ea580c" />
              <p>
                Cuenta creada como <strong>Docente / Solicitante</strong>. Los roles de Taller son asignados por Administración.
              </p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-submit"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Registrando...</span>
          <span v-else>Crear Cuenta</span>
        </button>
      </form>

      <!-- Pie de tarjeta -->
      <div class="auth-card-footer">
        <p class="auth-footer-note">Sistema de Gestión de Taller y Precooperativa Escolar</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

const router = useRouter()
const route = useRoute()
const { login, register, isAuthenticated } = useAuth()
const { success } = useToast()

const activeTab = ref('login')
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showRegPassword = ref(false)
const showRegConfirmPassword = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const regForm = reactive({
  nombre_completo: '',
  email: '',
  curso: '',
  password: '',
  password_confirm: ''
})

onMounted(() => {
  if (route.query.tab === 'register') {
    activeTab.value = 'register'
  }
  if (isAuthenticated.value) {
    router.replace('/')
  }
})

const switchTab = (tab) => {
  activeTab.value = tab
  errorMessage.value = ''
}

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await login(loginForm.email, loginForm.password)
    success('Sesión iniciada correctamente.')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    console.error('Error de login:', err)
    if (err.message.includes('Invalid login credentials')) {
      errorMessage.value = 'Correo electrónico o contraseña incorrectos.'
    } else {
      errorMessage.value = err.message || 'No se pudo iniciar sesión.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  if (regForm.password !== regForm.password_confirm) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  if (regForm.password.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  isLoading.value = true
  try {
    await register({
      email: regForm.email,
      password: regForm.password,
      nombre_completo: regForm.nombre_completo,
      curso: regForm.curso
    })
    success('Cuenta creada exitosamente con rol Docente.')
    router.push('/')
  } catch (err) {
    console.error('Error de registro:', err)
    errorMessage.value = err.message || 'Error al registrar usuario.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page-container {
  display: flex;
  justify-content: center;
  padding: 0.25rem 1rem 2.5rem;
  margin-top: -0.75rem;
}

@media (min-width: 768px) {
  .auth-page-container {
    margin-top: -1.25rem;
  }
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: max-width 220ms cubic-bezier(0.23, 1, 0.32, 1);
}

.auth-card.wide-register-card {
  max-width: 680px;
}

.reg-columns-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-columns-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .form-columns-split {
    grid-template-columns: 1fr;
  }
}

.auth-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.02em;
}

.auth-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0.2rem 0 0 0;
}

/* Segmented control tab bar */
.auth-tabs-bar {
  display: flex;
  background: var(--bg-main);
  padding: 0.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  gap: 0.25rem;
}

.auth-tab-btn {
  flex: 1;
  padding: 0.45rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: transform 140ms ease-out, background-color 140ms ease-out, color 140ms ease-out;
}

.auth-tab-btn:active {
  transform: scale(0.97);
}

.auth-tab-btn.active {
  background: var(--bg-surface);
  color: var(--text-main);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.auth-alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  line-height: 1.4;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
}

.input-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-muted);
  pointer-events: none;
}

.form-input.with-icon {
  padding-left: 2.35rem;
}

.input-icon-wrap .form-input {
  padding-right: 2.35rem;
}

.toggle-eye-btn {
  position: absolute;
  right: 0.65rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.toggle-eye-btn:hover {
  color: var(--text-main);
}

.security-role-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(234, 88, 12, 0.07);
  border: 1px solid rgba(234, 88, 12, 0.18);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
}

.security-role-notice p {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.35;
}

.security-role-notice strong {
  color: var(--color-primary);
}

.btn-submit {
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.65rem;
}

.auth-card-footer {
  text-align: center;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.85rem;
}

.auth-footer-note {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}
</style>

