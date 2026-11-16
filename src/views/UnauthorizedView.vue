<template>
  <div class="unauthorized-container">
    <div class="unauthorized-card">
      <div class="icon-circle">
        <AppIcon name="lock" :size="32" color="#ea580c" />
      </div>

      <h1 class="unauthorized-title">Acceso Restringido</h1>
      <p class="unauthorized-desc">
        Tu rol actual (<strong>{{ currentRoleLabel }}</strong>) no tiene autorización operativa para acceder a esta sección de la precooperativa.
      </p>

      <div class="role-info-box">
        <div class="role-badge-row">
          <span class="user-role-pill" :class="'role-' + currentRole">
            {{ currentRoleLabel }}
          </span>
          <span class="user-name-text">{{ userProfile?.nombre_completo || 'Usuario' }}</span>
        </div>
        <p class="role-note">
          Si necesitás acceso a este módulo (Taller, Inventario o Asambleas), solicitá la asignación de permisos a la <strong>Administración de la Precooperativa</strong>.
        </p>
      </div>

      <div class="unauthorized-actions">
        <router-link to="/" class="btn btn-primary">
          <AppIcon name="home" :size="15" />
          <span>Volver al Inicio</span>
        </router-link>
        <button v-if="isAuthenticated" @click="handleLogout" class="btn btn-secondary">
          <span>Cambiar de Cuenta</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { userProfile, currentRole, isAuthenticated, logout } = useAuth()

const currentRoleLabel = computed(() => {
  switch (currentRole.value) {
    case 'admin': return 'Administrador'
    case 'consejo': return 'Consejo de Administración'
    case 'tecnico': return 'Técnico de Taller'
    case 'sindicatura': return 'Sindicatura'
    case 'docente': return 'Docente / Solicitante'
    default: return currentRole.value
  }
})

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.unauthorized-container {
  min-height: calc(100vh - 180px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.unauthorized-card {
  max-width: 480px;
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  padding: 2.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.15rem;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(234, 88, 12, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.unauthorized-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.02em;
}

.unauthorized-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.unauthorized-desc strong {
  color: var(--text-main);
}

.role-info-box {
  width: 100%;
  background: var(--bg-main);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.role-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-role-pill {
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.user-role-pill.role-docente { background: #eff6ff; color: #1d4ed8; }
.user-role-pill.role-tecnico { background: #fff7ed; color: #c2410c; }
.user-role-pill.role-consejo { background: #ecfdf5; color: #047857; }
.user-role-pill.role-sindicatura { background: #f5f3ff; color: #6d28d9; }
.user-role-pill.role-admin { background: #fef2f2; color: #b91c1c; }

.user-name-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.role-note {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.unauthorized-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>

