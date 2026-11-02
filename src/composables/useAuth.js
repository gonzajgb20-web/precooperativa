import { ref, computed } from 'vue'
import { MOCK_USERS } from '../data/mockData'

const currentUser = ref(MOCK_USERS[0]) // Default: Prof. Aragón (Docente Solicitante)

export function useAuth() {
  const users = MOCK_USERS

  const currentRole = computed(() => currentUser.value.rol)

  const isDocente = computed(() => currentUser.value.rol === 'docente')
  const isTecnico = computed(() => currentUser.value.rol === 'tecnico')
  const isConsejo = computed(() => currentUser.value.rol === 'consejo')
  const isSindicatura = computed(() => currentUser.value.rol === 'sindicatura')

  // Permisos granulares según la Matriz de Permisos (Pantalla 6)
  const canCreateOrder = computed(() => isDocente.value || isConsejo.value)
  const canChangeOrderStatus = computed(() => isTecnico.value || isConsejo.value)
  const canEditInventory = computed(() => isTecnico.value || isConsejo.value)
  const canManageLedger = computed(() => isConsejo.value)
  const canManageMinutes = computed(() => isConsejo.value)
  const canCancelOrder = computed(() => isDocente.value || isConsejo.value || isTecnico.value)
  const isReadOnly = computed(() => isSindicatura.value)

  const switchUser = (userId) => {
    const found = MOCK_USERS.find(u => u.id === userId)
    if (found) {
      currentUser.value = found
      localStorage.setItem('preco_current_user_id', userId)
    }
  }

  // Cargar usuario guardado si existe
  const savedUserId = localStorage.getItem('preco_current_user_id')
  if (savedUserId) {
    const found = MOCK_USERS.find(u => u.id === savedUserId)
    if (found) {
      currentUser.value = found
    }
  }

  return {
    currentUser,
    users,
    currentRole,
    isDocente,
    isTecnico,
    isConsejo,
    isSindicatura,
    canCreateOrder,
    canChangeOrderStatus,
    canEditInventory,
    canManageLedger,
    canManageMinutes,
    canCancelOrder,
    isReadOnly,
    switchUser
  }
}
