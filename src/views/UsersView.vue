<template>
  <div class="users-view">
    <!-- Encabezado de la Vista -->
    <div class="view-header">
      <div class="header-titles">
        <h1 class="view-title">Gestión de Usuarios</h1>
        <p class="view-subtitle">Asignación de roles institucionales, permisos de acceso y control de cuentas.</p>
      </div>

      <button @click="openCreateModal" class="btn btn-primary">
        <AppIcon name="plus" :size="15" />
        <span>Nuevo Usuario</span>
      </button>
    </div>

    <!-- Barra de Herramientas: Búsqueda y Filtros de Rol -->
    <div class="toolbar-wrap">
      <!-- Búsqueda rápida -->
      <div class="search-input-wrap">
        <span class="search-icon">
          <AppIcon name="search" :size="15" />
        </span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar por nombre, email o comisión..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
          <AppIcon name="x" :size="12" />
        </button>
      </div>

      <!-- Filtros por Rol -->
      <div class="filter-pills">
        <button 
          v-for="f in filterOptions" 
          :key="f.id"
          class="pill-btn" 
          :class="{ active: selectedFilter === f.id }"
          @click="selectedFilter = f.id"
        >
          <span>{{ f.label }}</span>
          <span class="pill-counter">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <!-- Tabla de Usuarios Registrados -->
    <div class="card users-table-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando padrón de usuarios...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-users-state">
        <AppIcon name="users" :size="36" color="#94a3b8" />
        <h3>Sin resultados</h3>
        <p>No se encontraron usuarios con los filtros seleccionados.</p>
        <button v-if="searchQuery || selectedFilter !== 'all'" @click="resetFilters" class="btn btn-secondary btn-sm">
          Limpiar Filtros
        </button>
      </div>

      <div v-else class="table-responsive">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol Institucional</th>
              <th>Comisión / Curso</th>
              <th>Estado</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filteredUsers" :key="u.id" :class="{ 'row-inactive': !u.activo }">
              <td class="td-user">
                <div class="user-row-flex">
                  <div class="user-avatar-circle" :class="'avatar-' + u.rol">
                    <AppIcon :name="getRoleIcon(u.rol)" :size="16" />
                  </div>
                  <div>
                    <strong class="user-name">{{ u.nombre_completo }}</strong>
                    <span class="user-email">{{ u.email }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="role-badge" :class="'role-' + u.rol">
                  {{ formatRole(u.rol) }}
                </span>
              </td>
              <td>
                <span class="meta-field">{{ u.comision || '—' }}</span>
                <small v-if="u.curso" class="meta-sub">{{ u.curso }}</small>
              </td>
              <td>
                <span class="status-indicator" :class="u.activo ? 'status-active' : 'status-inactive'">
                  <span class="dot"></span>
                  <span>{{ u.activo ? 'Activo' : 'Inactivo' }}</span>
                </span>
              </td>
              <td class="td-actions">
                <div class="actions-group">
                  <button 
                    @click="openEditModal(u)" 
                    class="btn-action edit"
                    title="Editar rol y permisos"
                  >
                    <AppIcon name="edit" :size="14" />
                    <span>Editar Rol</span>
                  </button>
                  <button 
                    v-if="u.id !== userProfile?.id"
                    @click="confirmDeleteUser(u)" 
                    class="btn-action delete"
                    title="Eliminar usuario"
                  >
                    <AppIcon name="trash" :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Editar Rol y Estado -->
    <div v-if="editingUser" class="modal-backdrop" @click.self="editingUser = null">
      <div class="modal-card">
        <div class="modal-header">
          <div class="header-titles">
            <h3 class="modal-title">Modificar Rol y Acceso</h3>
            <p class="modal-subtitle">{{ editingUser.nombre_completo }} • {{ editingUser.email }}</p>
          </div>
          <button @click="editingUser = null" class="close-btn" aria-label="Cerrar modal">
            <AppIcon name="x" :size="16" />
          </button>
        </div>

        <form @submit.prevent="saveUserEdit" class="modal-form">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Nombre completo *</label>
              <input 
                v-model="editForm.nombre_completo" 
                type="text" 
                required
                class="form-input" 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Rol institucional (Nivel de Acceso) *</label>
              <AppCombobox 
                v-model="editForm.rol" 
                :options="roleOptions" 
                placeholder="Seleccionar rol..."
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Comisión asignada</label>
              <input 
                v-model="editForm.comision" 
                type="text" 
                placeholder="Ej: Hardware, Software y Redes..."
                class="form-input" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">Curso o Ubicación</label>
              <input 
                v-model="editForm.curso" 
                type="text" 
                placeholder="Ej: 6to Año / Aula 3"
                class="form-input" 
              />
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="editForm.activo" />
              <span>Cuenta Activa (Habilitada para iniciar sesión)</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="editingUser = null" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving">Guardando...</span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Crear Nuevo Usuario por Administrador -->
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div class="header-titles">
            <h3 class="modal-title">Crear Nuevo Usuario</h3>
            <p class="modal-subtitle">Asigná la identidad y el rol institucional autorizado.</p>
          </div>
          <button @click="showCreateModal = false" class="close-btn" aria-label="Cerrar modal">
            <AppIcon name="x" :size="16" />
          </button>
        </div>

        <form @submit.prevent="handleCreateUser" class="modal-form">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Nombre y Apellido *</label>
              <input 
                v-model="newForm.nombre_completo" 
                type="text" 
                required
                placeholder="Ej: Gonzalo Gomez"
                class="form-input" 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Correo institucional *</label>
              <input 
                v-model="newForm.email" 
                type="email" 
                required
                placeholder="usuario@precoop.escuela.edu.ar"
                class="form-input" 
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Contraseña inicial *</label>
              <input 
                v-model="newForm.password" 
                type="password" 
                required
                minlength="6"
                placeholder="••••••••"
                class="form-input" 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Rol institucional asignado *</label>
              <AppCombobox 
                v-model="newForm.rol" 
                :options="roleOptions" 
                placeholder="Seleccionar rol..."
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Comisión</label>
              <input 
                v-model="newForm.comision" 
                type="text" 
                placeholder="Ej: Hardware, Software..."
                class="form-input" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">Curso o Aula</label>
              <input 
                v-model="newForm.curso" 
                type="text" 
                placeholder="Ej: 6to Año / Informática"
                class="form-input" 
              />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving">Creando...</span>
              <span v-else>Crear Usuario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth, getRoleIcon } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

const { userProfile, fetchAllUsers, updateUserByAdmin, deleteUserByAdmin, createUserByAdmin } = useAuth()
const { success, error: toastError } = useToast()

const users = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const searchQuery = ref('')
const selectedFilter = ref('all')

const editingUser = ref(null)
const editForm = reactive({
  nombre_completo: '',
  rol: 'docente',
  comision: '',
  curso: '',
  activo: true
})

const showCreateModal = ref(false)
const newForm = reactive({
  nombre_completo: '',
  email: '',
  password: '',
  rol: 'tecnico',
  comision: 'Hardware',
  curso: ''
})

const loadUsers = async () => {
  isLoading.value = true
  try {
    users.value = await fetchAllUsers()
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
    toastError('No se pudo cargar la lista de usuarios.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

const filterOptions = computed(() => {
  const all = users.value.length
  const docentes = users.value.filter(u => u.rol === 'docente').length
  const tecnicos = users.value.filter(u => u.rol === 'tecnico').length
  const admins = users.value.filter(u => u.rol === 'consejo' || u.rol === 'admin').length
  const sindicatura = users.value.filter(u => u.rol === 'sindicatura').length

  return [
    { id: 'all', label: 'Todos', count: all },
    { id: 'docente', label: 'Docentes', count: docentes },
    { id: 'tecnico', label: 'Técnicos', count: tecnicos },
    { id: 'admin', label: 'Consejo / Admin', count: admins },
    { id: 'sindicatura', label: 'Sindicatura', count: sindicatura }
  ]
})

const roleOptions = [
  { value: 'docente', label: 'Docente / Solicitante', icon: 'user-check', hint: 'Carga pedidos y confirma recepción' },
  { value: 'tecnico', label: 'Técnico de Taller', icon: 'wrench', hint: 'Tablero Kanban de Taller y Pañol de Inventario' },
  { value: 'sindicatura', label: 'Sindicatura', icon: 'shield', hint: 'Auditoría y fiscalización de actas, caja e inventario' },
  { value: 'consejo', label: 'Consejo de Administración', icon: 'dollar', hint: 'Tesorería, Libro Diario y gestión cooperativa' },
  { value: 'admin', label: 'Administrador General', icon: 'shield', hint: 'Acceso total y control de usuarios' }
]

const filteredUsers = computed(() => {
  let list = users.value

  if (selectedFilter.value !== 'all') {
    if (selectedFilter.value === 'admin') {
      list = list.filter(u => u.rol === 'admin' || u.rol === 'consejo')
    } else {
      list = list.filter(u => u.rol === selectedFilter.value)
    }
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(u => 
      (u.nombre_completo && u.nombre_completo.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.comision && u.comision.toLowerCase().includes(q)) ||
      (u.rol && u.rol.toLowerCase().includes(q))
    )
  }

  return list
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedFilter.value = 'all'
}

const formatRole = (r) => {
  switch (r) {
    case 'admin': return 'Administrador'
    case 'consejo': return 'Consejo (Tesorero)'
    case 'tecnico': return 'Técnico de Taller'
    case 'sindicatura': return 'Sindicatura'
    case 'docente': return 'Docente'
    default: return r
  }
}

const openEditModal = (u) => {
  editingUser.value = u
  editForm.nombre_completo = u.nombre_completo || ''
  editForm.rol = u.rol || 'docente'
  editForm.comision = u.comision || ''
  editForm.curso = u.curso || ''
  editForm.activo = u.activo !== false
}

const saveUserEdit = async () => {
  if (!editingUser.value) return
  isSaving.value = true
  try {
    await updateUserByAdmin({
      id: editingUser.value.id,
      nombre_completo: editForm.nombre_completo,
      rol: editForm.rol,
      comision: editForm.comision,
      curso: editForm.curso,
      activo: editForm.activo
    })
    success('Rol y permisos actualizados correctamente.')
    editingUser.value = null
    await loadUsers()
  } catch (err) {
    console.error('Error actualizando usuario:', err)
    toastError(err.message || 'No se pudo actualizar el usuario.')
  } finally {
    isSaving.value = false
  }
}

const openCreateModal = () => {
  newForm.nombre_completo = ''
  newForm.email = ''
  newForm.password = ''
  newForm.rol = 'tecnico'
  newForm.comision = 'Hardware'
  newForm.curso = ''
  showCreateModal.value = true
}

const handleCreateUser = async () => {
  isSaving.value = true
  try {
    await createUserByAdmin({
      email: newForm.email,
      password: newForm.password,
      nombre_completo: newForm.nombre_completo,
      rol: newForm.rol,
      comision: newForm.comision,
      curso: newForm.curso
    })
    success(`Usuario ${newForm.nombre_completo} creado con rol ${formatRole(newForm.rol)}.`)
    showCreateModal.value = false
    await loadUsers()
  } catch (err) {
    console.error('Error creando usuario:', err)
    toastError(err.message || 'Error al crear usuario.')
  } finally {
    isSaving.value = false
  }
}

const confirmDeleteUser = async (u) => {
  if (!confirm(`¿Estás seguro de que deseás eliminar a ${u.nombre_completo} (${u.email})? Esta acción es irreversible.`)) {
    return
  }

  try {
    await deleteUserByAdmin(u.id)
    success(`Usuario ${u.nombre_completo} eliminado.`)
    await loadUsers()
  } catch (err) {
    console.error('Error al eliminar usuario:', err)
    toastError(err.message || 'Error al eliminar usuario.')
  }
}
</script>

<style scoped>
.users-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.02em;
}

.view-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0 0;
}

.toolbar-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-input-wrap {
  position: relative;
  min-width: 280px;
  max-width: 380px;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.35rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  color: var(--text-main);
  transition: border-color 150ms ease-out;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.filter-pills {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.pill-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: transform 140ms ease-out, background-color 140ms ease-out, color 140ms ease-out;
}

.pill-btn:active {
  transform: scale(0.97);
}

.pill-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.pill-counter {
  font-size: 0.72rem;
  padding: 0.05rem 0.35rem;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.06);
}

.pill-btn.active .pill-counter {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

/* Tabla de usuarios */
.users-table-card {
  padding: 0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.users-table th {
  background: var(--bg-main);
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border-subtle);
}

.users-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
  color: var(--text-main);
  vertical-align: middle;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:hover td {
  background: rgba(0, 0, 0, 0.015);
}

.row-inactive td {
  opacity: 0.6;
}

.user-row-flex {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(234, 88, 12, 0.1);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar-circle.avatar-docente { background: #eff6ff; color: #1d4ed8; }
.user-avatar-circle.avatar-tecnico { background: #fff7ed; color: #c2410c; }
.user-avatar-circle.avatar-consejo { background: #ecfdf5; color: #047857; }
.user-avatar-circle.avatar-sindicatura { background: #f5f3ff; color: #6d28d9; }
.user-avatar-circle.avatar-admin { background: #fef2f2; color: #b91c1c; }

.user-name {
  display: block;
  font-weight: 700;
  color: var(--text-main);
}

.user-email {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: monospace;
}

.role-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.role-badge.role-docente { background: #eff6ff; color: #1d4ed8; }
.role-badge.role-tecnico { background: #fff7ed; color: #c2410c; }
.role-badge.role-consejo { background: #ecfdf5; color: #047857; }
.role-badge.role-sindicatura { background: #f5f3ff; color: #6d28d9; }
.role-badge.role-admin { background: #fef2f2; color: #b91c1c; }

.meta-field {
  display: block;
  font-weight: 500;
}

.meta-sub {
  display: block;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-indicator .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-active { color: #059669; }
.status-active .dot { background: #10b981; }

.status-inactive { color: #94a3b8; }
.status-inactive .dot { background: #cbd5e1; }

.actions-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: flex-end;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-md);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-secondary);
  transition: transform 140ms ease-out, background-color 140ms ease-out, color 140ms ease-out;
}

.btn-action:active {
  transform: scale(0.97);
}

.btn-action.edit:hover {
  background: var(--bg-hover);
  color: var(--text-main);
  border-color: #cbd5e1;
}

.btn-action.delete {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-action.delete:hover {
  background: rgba(239, 68, 68, 0.08);
}

/* Modales */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-form {
  padding: 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  overflow-y: auto;
}

.field-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.checkbox-group {
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 1rem;
}

.loading-state, .empty-users-state {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
}
</style>

