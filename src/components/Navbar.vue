<template>
  <header class="top-header">
    <div class="header-inner">
      <!-- Logo y Nombre -->
      <router-link to="/" class="brand-wrapper">
        <div class="brand-logo-icon">C</div>
        <div class="brand-text-col">
          <span class="brand-title">Clínica de Hardware</span>
          <span class="brand-subtitle">Precooperativa Escolar</span>
        </div>
      </router-link>

      <!-- Menú de Navegación Desktop -->
      <nav class="nav-links">
        <router-link to="/" class="nav-link-item" active-class="active">
          <span>Inicio</span>
        </router-link>
        <router-link to="/nuevo-pedido" class="nav-link-item" active-class="active">
          <span>Nuevo pedido</span>
        </router-link>
        <router-link to="/taller" class="nav-link-item" active-class="active">
          <span>Taller</span>
        </router-link>
        <router-link to="/inventario" class="nav-link-item" active-class="active">
          <span>Inventario</span>
        </router-link>
        <router-link to="/asamblea" class="nav-link-item" active-class="active">
          <span>Asamblea</span>
        </router-link>
        <router-link to="/permisos" class="nav-link-item" active-class="active">
          <span>Datos y permisos</span>
        </router-link>
      </nav>

      <!-- Acciones de Usuario y Estado BD -->
      <div class="header-actions">
        <!-- Indicador de Base de Datos Supabase -->
        <button 
          @click="openSupabaseModal" 
          class="db-status-pill" 
          :class="dataSource === 'supabase' ? 'online' : 'offline'"
          title="Configuración de base de datos y sincronización"
        >
          <span class="status-dot"></span>
          <span>{{ dataSource === 'supabase' ? 'Supabase Conectado' : 'Modo Demo Local' }}</span>
        </button>

        <!-- Selector de Rol Simulado (Punto 4 del enunciado) -->
        <div class="role-selector-wrap">
          <button @click="showRoleDropdown = !showRoleDropdown" class="role-badge-btn">
            <span class="role-avatar">{{ currentUser.avatar }}</span>
            <span class="role-name-text">{{ userDisplayName }}</span>
            <span class="role-tag-pill">ROL: {{ currentUser.rol }}</span>
            <span class="arrow-down">▾</span>
          </button>

          <!-- Dropdown de simulación de roles -->
          <div v-if="showRoleDropdown" class="role-dropdown-menu">
            <div class="dropdown-header">
              <strong>Simular tipo de usuario (v1):</strong>
              <p>Cambia el perfil para probar permisos y vistas</p>
            </div>
            <button 
              v-for="user in users" 
              :key="user.id" 
              @click="selectUser(user.id)"
              class="dropdown-user-item"
              :class="{ selected: user.id === currentUser.id }"
            >
              <span class="item-avatar">{{ user.avatar }}</span>
              <div class="item-details">
                <span class="item-name">{{ user.nombre_completo }}</span>
                <span class="item-role-desc">{{ user.rol_nombre }}</span>
              </div>
              <span v-if="user.id === currentUser.id" class="check-mark">✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Barra de navegación inferior móvil -->
  <nav class="mobile-nav-bar">
    <router-link to="/" class="mobile-nav-item" active-class="active">
      <span>🏠</span>
      <span>Inicio</span>
    </router-link>
    <router-link to="/nuevo-pedido" class="mobile-nav-item" active-class="active">
      <span>➕</span>
      <span>Pedido</span>
    </router-link>
    <router-link to="/taller" class="mobile-nav-item" active-class="active">
      <span>🛠️</span>
      <span>Taller</span>
    </router-link>
    <router-link to="/inventario" class="mobile-nav-item" active-class="active">
      <span>📦</span>
      <span>Stock</span>
    </router-link>
    <router-link to="/asamblea" class="mobile-nav-item" active-class="active">
      <span>👥</span>
      <span>Asamblea</span>
    </router-link>
    <router-link to="/permisos" class="mobile-nav-item" active-class="active">
      <span>🔒</span>
      <span>Permisos</span>
    </router-link>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useData } from '../services/dataService'

const emit = defineEmits(['open-supabase-modal'])

const { currentUser, users, switchUser } = useAuth()
const { dataSource } = useData()
const showRoleDropdown = ref(false)

const userDisplayName = computed(() => {
  if (currentUser.value.nombre_completo.includes('Aragón')) return 'Aragón'
  return currentUser.value.nombre_completo.split(' ')[0]
})

const selectUser = (userId) => {
  switchUser(userId)
  showRoleDropdown.value = false
}

const openSupabaseModal = () => {
  emit('open-supabase-modal')
}
</script>

<style scoped>
.role-selector-wrap {
  position: relative;
}

.role-avatar {
  font-size: 1.1rem;
}

.role-name-text {
  font-weight: 700;
}

.role-tag-pill {
  background: rgba(0, 0, 0, 0.08);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  text-transform: uppercase;
}

.arrow-down {
  font-size: 0.75rem;
  margin-left: 0.2rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.db-status-pill.online .status-dot {
  background: var(--color-success);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.db-status-pill.offline .status-dot {
  background: var(--color-amber);
}

.role-dropdown-menu {
  position: absolute;
  top: 110%;
  right: 0;
  width: 320px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 0.5rem;
  z-index: 100;
  animation: slideIn 0.2s ease;
}

.dropdown-header {
  padding: 0.5rem 0.75rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.dropdown-header strong {
  display: block;
  color: var(--text-main);
  font-size: 0.85rem;
}

.dropdown-user-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
}

.dropdown-user-item:hover {
  background: #f8fafc;
}

.dropdown-user-item.selected {
  background: var(--color-primary-light);
}

.item-avatar {
  font-size: 1.4rem;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
}

.item-role-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.check-mark {
  color: var(--color-primary);
  font-weight: 800;
  font-size: 1rem;
}
</style>
