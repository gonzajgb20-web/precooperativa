<template>
  <header class="top-header">
    <div class="header-inner">
      <!-- Logo y Nombre -->
      <router-link :to="isAuthenticated ? '/' : '/login'" class="brand-wrapper">
        <div class="brand-logo-icon">C</div>
        <div class="brand-text-col">
          <span class="brand-title">Clínica de Hardware</span>
          <span class="brand-subtitle">Precooperativa Escolar</span>
        </div>
      </router-link>

      <!-- Menú de Navegación Desktop Dinámico según Rol (Sólo si está autenticado y no está en login) -->
      <nav v-if="isAuthenticated && !isAuthPage" class="nav-links">
        <router-link to="/" class="nav-link-item" active-class="active">
          <span>Inicio</span>
        </router-link>

        <router-link 
          v-if="canCreateOrder" 
          to="/nuevo-pedido" 
          class="nav-link-item" 
          active-class="active"
        >
          <span>Nuevo Pedido</span>
        </router-link>

        <router-link 
          v-if="canAccessWorkshop" 
          to="/taller" 
          class="nav-link-item" 
          active-class="active"
        >
          <span>Taller</span>
        </router-link>

        <router-link 
          v-if="canAccessInventory" 
          to="/inventario" 
          class="nav-link-item" 
          active-class="active"
        >
          <span>Inventario</span>
        </router-link>

        <router-link 
          v-if="canAccessAssembly" 
          to="/asamblea" 
          class="nav-link-item" 
          active-class="active"
        >
          <span>Asamblea</span>
        </router-link>

        <router-link 
          v-if="canAccessUsers" 
          to="/usuarios" 
          class="nav-link-item" 
          active-class="active"
        >
          <span>Usuarios</span>
        </router-link>

        <router-link 
          v-else-if="canAccessPermissions" 
          to="/permisos" 
          class="nav-link-item" 
          active-class="active"
        >
          <span>Permisos</span>
        </router-link>
      </nav>

      <!-- Acciones de Usuario -->
      <div class="header-actions">
        <!-- Usuario Autenticado / Menú de Perfil (Oculto en páginas de autenticación) -->
        <div v-if="isAuthenticated && userProfile && !isAuthPage" class="role-selector-wrap">
          <button 
            @click="showRoleDropdown = !showRoleDropdown" 
            class="user-profile-btn"
            :class="{ open: showRoleDropdown }"
            aria-haspopup="true"
            :aria-expanded="showRoleDropdown"
          >
            <span class="user-avatar-badge" :class="'avatar-' + userProfile.rol">
              <AppIcon :name="getRoleIcon(userProfile.rol)" :size="15" />
            </span>
            <span class="user-display-name">{{ userDisplayName }}</span>
            <span class="user-role-pill" :class="'role-' + userProfile.rol">
              {{ formatRole(userProfile.rol) }}
            </span>
            <AppIcon 
              name="chevron-down" 
              :size="13" 
              class="chevron-icon" 
              :class="{ rotated: showRoleDropdown }" 
            />
          </button>

          <!-- Backdrop transparente para cerrar al hacer clic afuera -->
          <div 
            v-if="showRoleDropdown" 
            class="dropdown-backdrop" 
            @click="showRoleDropdown = false"
          ></div>

          <!-- Dropdown de perfil -->
          <div v-if="showRoleDropdown" class="role-dropdown-menu">
            <div class="dropdown-header">
              <div class="header-user-row">
                <div class="dropdown-user-avatar" :class="'avatar-' + userProfile.rol">
                  <AppIcon :name="getRoleIcon(userProfile.rol)" :size="18" />
                </div>
                <div class="dropdown-user-info">
                  <strong class="user-full-name">{{ userProfile.nombre_completo }}</strong>
                  <p class="user-email-text">{{ userProfile.email }}</p>
                </div>
              </div>
              <div class="user-meta-tags">
                <span class="meta-tag">{{ userProfile.rol_descripcion || formatRole(userProfile.rol) }}</span>
                <span v-if="userProfile.comision" class="meta-tag comision-tag">{{ userProfile.comision }}</span>
              </div>
            </div>

            <!-- Accesos según rol -->
            <div class="dropdown-links-section">
              <router-link 
                v-if="canAccessUsers" 
                to="/usuarios" 
                class="dropdown-item-link"
                @click="showRoleDropdown = false"
              >
                <AppIcon name="users" :size="15" />
                <span class="link-label">Gestión de Usuarios</span>
              </router-link>

              <router-link 
                v-if="canAccessPermissions && !canAccessUsers" 
                to="/permisos" 
                class="dropdown-item-link"
                @click="showRoleDropdown = false"
              >
                <AppIcon name="shield" :size="15" />
                <span class="link-label">Matriz de Permisos</span>
              </router-link>

              <button 
                v-if="isAdmin"
                @click="openSupabaseFromDropdown" 
                class="dropdown-item-link"
              >
                <span class="db-status-dot-mini" :class="dataSource === 'supabase' ? 'online' : 'offline'"></span>
                <span class="link-label">Servidor Base de Datos</span>
                <span class="server-status-pill">{{ dataSource === 'supabase' ? 'Supabase' : 'Local' }}</span>
              </button>
            </div>

            <div class="dropdown-actions">
              <button @click="handleLogout" class="btn btn-outline-danger btn-sm btn-full">
                <AppIcon name="x" :size="14" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Botón para iniciar sesión si no está autenticado (Oculto en páginas de auth) -->
        <router-link 
          v-else-if="!isAuthPage" 
          to="/login" 
          class="btn btn-primary btn-sm btn-login"
        >
          <AppIcon name="user" :size="15" />
          <span>Iniciar Sesión</span>
        </router-link>
      </div>
    </div>
  </header>

  <!-- Barra de navegación inferior móvil filtrada por rol (Oculta si no está autenticado o está en login) -->
  <nav v-if="isAuthenticated && !isAuthPage" class="mobile-nav-bar">
    <router-link to="/" class="mobile-nav-item" active-class="active">
      <AppIcon name="home" :size="18" />
      <span>Inicio</span>
    </router-link>

    <router-link 
      v-if="canCreateOrder" 
      to="/nuevo-pedido" 
      class="mobile-nav-item" 
      active-class="active"
    >
      <AppIcon name="plus" :size="18" />
      <span>Pedido</span>
    </router-link>

    <router-link 
      v-if="canAccessWorkshop" 
      to="/taller" 
      class="mobile-nav-item" 
      active-class="active"
    >
      <AppIcon name="wrench" :size="18" />
      <span>Taller</span>
    </router-link>

    <router-link 
      v-if="canAccessInventory" 
      to="/inventario" 
      class="mobile-nav-item" 
      active-class="active"
    >
      <AppIcon name="package" :size="18" />
      <span>Stock</span>
    </router-link>

    <router-link 
      v-if="canAccessAssembly" 
      to="/asamblea" 
      class="mobile-nav-item" 
      active-class="active"
    >
      <AppIcon name="users" :size="18" />
      <span>Asamblea</span>
    </router-link>

    <router-link 
      v-if="canAccessUsers" 
      to="/usuarios" 
      class="mobile-nav-item" 
      active-class="active"
    >
      <AppIcon name="user-check" :size="18" />
      <span>Usuarios</span>
    </router-link>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth, getRoleIcon } from '../composables/useAuth'
import { useData } from '../services/dataService'

const emit = defineEmits(['open-supabase-modal'])
const router = useRouter()
const route = useRoute()

const isAuthPage = computed(() => route.path === '/login' || route.path === '/registro')

const { 
  userProfile, 
  isAuthenticated, 
  logout, 
  isAdmin,
  canAccessWorkshop,
  canAccessInventory,
  canAccessAssembly,
  canAccessUsers,
  canAccessPermissions,
  canCreateOrder
} = useAuth()

const { dataSource } = useData()
const showRoleDropdown = ref(false)

const userDisplayName = computed(() => {
  if (!userProfile.value) return 'Usuario'
  const name = userProfile.value.nombre_completo || ''
  if (name.includes('Aragón')) return 'Prof. Aragón'
  return name.split(' ')[0]
})

const formatRole = (r) => {
  if (!r) return ''
  switch (r.toLowerCase()) {
    case 'admin': return 'Admin'
    case 'docente': return 'Docente'
    case 'tecnico': return 'Técnico'
    case 'consejo': return 'Consejo'
    case 'sindicatura': return 'Sindicatura'
    default: return r.charAt(0).toUpperCase() + r.slice(1)
  }
}

const openSupabaseFromDropdown = () => {
  showRoleDropdown.value = false
  emit('open-supabase-modal')
}

const handleLogout = async () => {
  showRoleDropdown.value = false
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.role-selector-wrap {
  position: relative;
}

/* Botón de perfil refinado con microinteracción Emil Kowalski */
.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.28rem 0.65rem 0.28rem 0.35rem;
  cursor: pointer;
  color: var(--text-main);
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1),
              background-color 160ms ease-out,
              border-color 160ms ease-out;
}

.user-profile-btn:hover {
  background: var(--bg-hover);
  border-color: #cbd5e1;
}

.user-profile-btn:active {
  transform: scale(0.97);
}

.user-profile-btn.open {
  border-color: var(--color-primary);
  background: var(--bg-hover);
}

.user-avatar-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-badge.avatar-docente { background: #eff6ff; color: #1d4ed8; }
.user-avatar-badge.avatar-tecnico { background: #fff7ed; color: #c2410c; }
.user-avatar-badge.avatar-consejo { background: #ecfdf5; color: #047857; }
.user-avatar-badge.avatar-sindicatura { background: #f5f3ff; color: #6d28d9; }
.user-avatar-badge.avatar-admin { background: #fef2f2; color: #b91c1c; }

.user-display-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-main);
}

.user-role-pill {
  padding: 0.12rem 0.45rem;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  font-weight: 600;
}

.user-role-pill.role-docente { background: #eff6ff; color: #1d4ed8; }
.user-role-pill.role-tecnico { background: #fff7ed; color: #c2410c; }
.user-role-pill.role-consejo { background: #ecfdf5; color: #047857; }
.user-role-pill.role-sindicatura { background: #f5f3ff; color: #6d28d9; }
.user-role-pill.role-admin { background: #fef2f2; color: #b91c1c; }

.chevron-icon {
  color: var(--text-muted);
  transition: transform 180ms cubic-bezier(0.23, 1, 0.32, 1);
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* Backdrop para clic afuera */
.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: transparent;
}

/* Dropdown animado según los principios de Emil Kowalski */
.role-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  padding: 0.75rem;
  z-index: 90;
  transform-origin: top right;
  animation: dropdownEnter 180ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

@keyframes dropdownEnter {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-header {
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.header-user-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dropdown-user-avatar.avatar-docente { background: #eff6ff; color: #1d4ed8; }
.dropdown-user-avatar.avatar-tecnico { background: #fff7ed; color: #c2410c; }
.dropdown-user-avatar.avatar-consejo { background: #ecfdf5; color: #047857; }
.dropdown-user-avatar.avatar-sindicatura { background: #f5f3ff; color: #6d28d9; }
.dropdown-user-avatar.avatar-admin { background: #fef2f2; color: #b91c1c; }

.dropdown-user-info {
  overflow: hidden;
}

.user-full-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email-text {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.15rem;
}

.meta-tag {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-weight: 500;
}

.comision-tag {
  background: rgba(234, 88, 12, 0.1);
  color: var(--color-primary);
  font-weight: 600;
}

/* Enlaces del menú desplegable */
.dropdown-links-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-item-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.45rem 0.55rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-main);
  text-decoration: none;
  transition: background-color 150ms ease-out, transform 140ms ease-out;
}

.dropdown-item-link:hover {
  background: var(--bg-hover);
}

.dropdown-item-link:active {
  transform: scale(0.98);
}

.link-label {
  flex: 1;
  text-align: left;
}

.db-status-dot-mini {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.db-status-dot-mini.online {
  background: var(--color-success);
}

.db-status-dot-mini.offline {
  background: var(--color-amber);
}

.server-status-pill {
  font-size: 0.68rem;
  padding: 0.08rem 0.35rem;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-muted);
  font-family: monospace;
}

.dropdown-actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.55rem;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
}

.btn-outline-danger:hover {
  background: rgba(239, 68, 68, 0.08);
}

.btn-login {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
