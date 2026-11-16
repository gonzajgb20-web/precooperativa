import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../supabase'

const defaultProfile = {
  id: '',
  email: '',
  nombre_completo: 'Invitado',
  rol: 'docente',
  rol_descripcion: 'Invitado / Consulta',
  comision: 'General',
  curso: '',
  activo: true,
  icon: 'user'
}

// Estado reactivo global de autenticación
const currentUser = ref(null)      // Objeto de Supabase Auth
const userProfile = ref({ ...defaultProfile }) // Perfil de 'public.profiles'
const isAuthLoading = ref(true)
const authError = ref(null)

// Lista de cuentas institucionales autorizadas
export const INSTITUTIONAL_ACCOUNTS = [
  {
    email: 'admin@precoop.escuela.edu.ar',
    nombre_completo: 'Administrador General',
    rol: 'admin',
    rol_nombre: 'Administrador General / Acceso Total',
    comision: 'Dirección General',
    icon: 'shield',
    descripcion_permisos: 'Acceso total a todos los módulos, gestión de usuarios, asignación de roles y control del sistema.'
  },
  {
    email: 'lucas@precoop.escuela.edu.ar',
    nombre_completo: 'Lucas Martínez',
    rol: 'consejo',
    rol_nombre: 'Consejo de Administración (Tesorero)',
    comision: 'Tesorería y Administración',
    icon: 'dollar',
    descripcion_permisos: 'Controla el pañol de repuestos, asientos del Libro Diario, actas y gestión de la precooperativa.'
  },
  {
    email: 'gonzalo@precoop.escuela.edu.ar',
    nombre_completo: 'Gonzalo Gomez Bustamante',
    rol: 'tecnico',
    rol_nombre: 'Estudiante Asociado / Técnico Hardware',
    comision: 'Hardware',
    icon: 'wrench',
    descripcion_permisos: 'Gestiona el tablero Kanban, repara hardware y descuenta repuestos del pañol.'
  },
  {
    email: 'sofia@precoop.escuela.edu.ar',
    nombre_completo: 'Sofía Valenzuela',
    rol: 'tecnico',
    rol_nombre: 'Estudiante Asociada / Técnica Software y Redes',
    comision: 'Software y Redes',
    icon: 'laptop',
    descripcion_permisos: 'Diagnóstico de sistemas, debloating, redes y horas de taller.'
  },
  {
    email: 'mariana.rossi@escuela.edu.ar',
    nombre_completo: 'Prof. Mariana Rossi',
    rol: 'sindicatura',
    rol_nombre: 'Sindicatura / Auditoría Institucional',
    comision: 'Comisión Asesora Docente',
    icon: 'shield',
    descripcion_permisos: 'Fiscalización general en modo auditoría sobre actas, libro diario e inventario.'
  },
  {
    email: 'aragon@escuela.edu.ar',
    nombre_completo: 'Prof. Juan Aragón',
    rol: 'docente',
    rol_nombre: 'Docente / Solicitante',
    comision: 'Docente de Taller',
    icon: 'user-check',
    descripcion_permisos: 'Solicita reparaciones para aulas, consulta avances de sus pedidos y confirma recepción.'
  }
]

export const getRoleIcon = (rol) => {
  switch (rol) {
    case 'admin': return 'shield'
    case 'tecnico': return 'wrench'
    case 'consejo': return 'dollar'
    case 'sindicatura': return 'shield'
    case 'docente':
    default: return 'user-check'
  }
}

export const getRoleDescription = (rol) => {
  switch (rol) {
    case 'admin': return 'Administrador General / Acceso Total'
    case 'tecnico': return 'Estudiante Asociado / Técnico de Taller'
    case 'consejo': return 'Consejo de Administración (Tesorero)'
    case 'sindicatura': return 'Sindicatura / Auditoría Institucional'
    case 'docente':
    default: return 'Docente / Solicitante de Taller'
  }
}

// Cargar perfil desde la tabla 'public.profiles'
export const loadUserProfile = async (userId, userEmail) => {
  if (!supabase) return userProfile.value

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      userProfile.value = {
        ...data,
        icon: getRoleIcon(data.rol)
      }
      return userProfile.value
    }

    if (userEmail) {
      const { data: byEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle()

      if (byEmail) {
        userProfile.value = {
          ...byEmail,
          icon: getRoleIcon(byEmail.rol)
        }
        return userProfile.value
      }
    }

    const meta = currentUser.value?.user_metadata || {}
    const fallback = {
      id: userId,
      email: userEmail,
      nombre_completo: meta.nombre_completo || userEmail.split('@')[0],
      rol: meta.rol || 'docente',
      rol_descripcion: getRoleDescription(meta.rol || 'docente'),
      comision: meta.comision || 'Taller',
      curso: meta.curso || '',
      activo: true,
      icon: getRoleIcon(meta.rol || 'docente')
    }
    userProfile.value = fallback
    return fallback
  } catch (err) {
    console.error('Error al cargar perfil de usuario:', err)
    return userProfile.value
  }
}

// Inicialización de la sesión Supabase (Singleton Promise para evitar condiciones de carrera)
let authInitPromise = null

export const initAuth = () => {
  if (!authInitPromise) {
    authInitPromise = (async () => {
      isAuthLoading.value = true
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            currentUser.value = session.user
            await loadUserProfile(session.user.id, session.user.email)
          } else {
            currentUser.value = null
            userProfile.value = { ...defaultProfile }
          }

          // Escuchar eventos de cambio de sesión
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              currentUser.value = session.user
              await loadUserProfile(session.user.id, session.user.email)
            } else {
              currentUser.value = null
              userProfile.value = { ...defaultProfile }
            }
          })
        } catch (err) {
          console.error('Error inicializando autenticación Supabase:', err)
          currentUser.value = null
          userProfile.value = { ...defaultProfile }
        }
      }
      isAuthLoading.value = false
    })()
  }
  return authInitPromise
}

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(currentUser.value))

  const currentRole = computed(() => userProfile.value?.rol || 'docente')

  const userDisplayName = computed(() => {
    if (!isAuthenticated.value || !userProfile.value?.nombre_completo) return 'Invitado'
    const name = userProfile.value.nombre_completo
    if (name.includes('Aragón')) return 'Prof. Aragón'
    return name.split(' ')[0]
  })

  // Verificación de roles
  const isAdmin = computed(() => currentRole.value === 'admin' || currentRole.value === 'consejo')
  const isDocente = computed(() => currentRole.value === 'docente')
  const isTecnico = computed(() => currentRole.value === 'tecnico')
  const isConsejo = computed(() => currentRole.value === 'consejo')
  const isSindicatura = computed(() => currentRole.value === 'sindicatura')

  // Permisos granulares de navegación y módulos
  const canAccessWorkshop = computed(() => isAdmin.value || isTecnico.value)
  const canAccessInventory = computed(() => isAdmin.value || isTecnico.value || isSindicatura.value)
  const canAccessAssembly = computed(() => isAdmin.value || isSindicatura.value)
  const canAccessUsers = computed(() => isAdmin.value)
  const canAccessPermissions = computed(() => isAdmin.value || isSindicatura.value)

  // Permisos operativos
  const canCreateOrder = computed(() => isAuthenticated.value && (isDocente.value || isAdmin.value || isTecnico.value))
  const canChangeOrderStatus = computed(() => isAuthenticated.value && (isTecnico.value || isAdmin.value))
  const canEditInventory = computed(() => isAuthenticated.value && (isTecnico.value || isAdmin.value))
  const canManageLedger = computed(() => isAuthenticated.value && isAdmin.value)
  const canManageMinutes = computed(() => isAuthenticated.value && isAdmin.value)
  const canCancelOrder = computed(() => isAuthenticated.value && (isDocente.value || isAdmin.value || isTecnico.value))
  const isReadOnly = computed(() => !isAuthenticated.value || isSindicatura.value)

  // Iniciar sesión con email y contraseña
  const login = async (email, password) => {
    if (!supabase) throw new Error('Supabase no está conectado')
    authError.value = null

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error) {
      authError.value = error.message
      throw error
    }

    currentUser.value = data.user
    await loadUserProfile(data.user.id, data.user.email)

    // Verificar si la cuenta está activa
    if (userProfile.value && userProfile.value.activo === false) {
      await logout()
      throw new Error('Esta cuenta ha sido desactivada por la Administración de la Precooperativa.')
    }

    return data.user
  }

  // Registro público: SIEMPRE se registra como 'docente' (sin selector de rol)
  const register = async ({ email, password, nombre_completo, curso }) => {
    if (!supabase) throw new Error('Supabase no está conectado')
    authError.value = null

    // El rol público se fija estrictamente en 'docente' por seguridad
    const defaultPublicRole = 'docente'

    const { data, error } = await supabase.rpc('crear_usuario', {
      p_email: email.trim(),
      p_password: password,
      p_nombre_completo: nombre_completo.trim(),
      p_rol: defaultPublicRole,
      p_rol_descripcion: getRoleDescription(defaultPublicRole),
      p_comision: 'Docente Solicitante',
      p_curso: curso || 'Aulas y Laboratorios'
    })

    if (error) {
      authError.value = error.message
      throw error
    }

    return await login(email, password)
  }

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    currentUser.value = null
    userProfile.value = { ...defaultProfile }
  }

  // --- Funciones de administración para el usuario con acceso total ---
  const fetchAllUsers = async () => {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nombre_completo', { ascending: true })

    if (error) throw error
    return data || []
  }

  const updateUserByAdmin = async ({ id, nombre_completo, rol, rol_descripcion, comision, curso, activo }) => {
    if (!supabase) throw new Error('Supabase no conectado')
    const { data, error } = await supabase.rpc('admin_actualizar_usuario', {
      p_user_id: id,
      p_nombre_completo: nombre_completo.trim(),
      p_rol: rol,
      p_rol_descripcion: rol_descripcion || getRoleDescription(rol),
      p_comision: comision || '',
      p_curso: curso || '',
      p_activo: activo !== undefined ? activo : true
    })

    if (error) throw error
    return data
  }

  const deleteUserByAdmin = async (userId) => {
    if (!supabase) throw new Error('Supabase no conectado')
    const { data, error } = await supabase.rpc('admin_eliminar_usuario', {
      p_user_id: userId
    })

    if (error) throw error
    return data
  }

  const createUserByAdmin = async ({ email, password, nombre_completo, rol, comision, curso }) => {
    if (!supabase) throw new Error('Supabase no conectado')
    const { data, error } = await supabase.rpc('crear_usuario', {
      p_email: email.trim(),
      p_password: password,
      p_nombre_completo: nombre_completo.trim(),
      p_rol: rol,
      p_rol_descripcion: getRoleDescription(rol),
      p_comision: comision || 'Taller',
      p_curso: curso || 'General'
    })

    if (error) throw error
    return data
  }

  return {
    currentUser,
    userProfile,
    userDisplayName,
    isAuthenticated,
    isAuthLoading,
    authError,
    currentRole,
    isAdmin,
    isDocente,
    isTecnico,
    isConsejo,
    isSindicatura,
    canAccessWorkshop,
    canAccessInventory,
    canAccessAssembly,
    canAccessUsers,
    canAccessPermissions,
    canCreateOrder,
    canChangeOrderStatus,
    canEditInventory,
    canManageLedger,
    canManageMinutes,
    canCancelOrder,
    isReadOnly,
    login,
    register,
    logout,
    fetchAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
    createUserByAdmin,
    institutionalAccounts: INSTITUTIONAL_ACCOUNTS
  }
}
