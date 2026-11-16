import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NewOrderView from '../views/NewOrderView.vue'
import WorkshopView from '../views/WorkshopView.vue'
import InventoryView from '../views/InventoryView.vue'
import AssemblyView from '../views/AssemblyView.vue'
import PermissionsView from '../views/PermissionsView.vue'
import LoginView from '../views/LoginView.vue'
import UsersView from '../views/UsersView.vue'
import UnauthorizedView from '../views/UnauthorizedView.vue'
import OrderProcessView from '../views/OrderProcessView.vue'
import { useAuth, initAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { 
      title: 'Inicio — Clínica de Hardware',
      requiresAuth: true 
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Acceso al Sistema — Clínica de Hardware' }
  },
  {
    path: '/registro',
    name: 'Register',
    redirect: '/login?tab=register'
  },
  {
    path: '/nuevo-pedido',
    name: 'NewOrder',
    component: NewOrderView,
    meta: { 
      title: 'Nuevo Pedido — Clínica de Hardware',
      requiresAuth: true,
      roles: ['docente', 'tecnico', 'consejo', 'admin']
    }
  },
  {
    path: '/taller',
    name: 'Workshop',
    component: WorkshopView,
    meta: { 
      title: 'Tablero de Taller — Clínica de Hardware',
      requiresAuth: true,
      roles: ['tecnico', 'consejo', 'admin']
    }
  },
  {
    path: '/taller/pedido/:id',
    name: 'OrderProcess',
    component: OrderProcessView,
    meta: { 
      title: 'Proceso de Pedido — Clínica de Hardware',
      requiresAuth: true,
      roles: ['docente', 'tecnico', 'sindicatura', 'consejo', 'admin']
    }
  },
  {
    path: '/inventario',
    name: 'Inventory',
    component: InventoryView,
    meta: { 
      title: 'Inventario y Pañol — Clínica de Hardware',
      requiresAuth: true,
      roles: ['tecnico', 'sindicatura', 'consejo', 'admin']
    }
  },
  {
    path: '/asamblea',
    name: 'Assembly',
    component: AssemblyView,
    meta: { 
      title: 'Asamblea y Registros — Clínica de Hardware',
      requiresAuth: true,
      roles: ['sindicatura', 'consejo', 'admin']
    }
  },
  {
    path: '/usuarios',
    name: 'Users',
    component: UsersView,
    meta: { 
      title: 'Gestión de Usuarios — Clínica de Hardware',
      requiresAuth: true,
      roles: ['consejo', 'admin']
    }
  },
  {
    path: '/permisos',
    name: 'Permissions',
    component: PermissionsView,
    meta: { 
      title: 'Roles y Permisos — Clínica de Hardware',
      requiresAuth: true,
      roles: ['sindicatura', 'consejo', 'admin']
    }
  },
  {
    path: '/sin-acceso',
    name: 'Unauthorized',
    component: UnauthorizedView,
    meta: { title: 'Acceso Restringido — Clínica de Hardware' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  // Asegurar que la sesión de Supabase esté resuelta antes de tomar decisiones de navegación
  await initAuth()

  const { isAuthenticated, currentRole } = useAuth()

  const publicRoutes = ['/login', '/registro']
  const isPublic = publicRoutes.includes(to.path)

  // Si no está autenticado y la ruta es privada, enviar al login
  if (!isAuthenticated.value && !isPublic) {
    const redirectParam = to.path !== '/' ? { redirect: to.fullPath } : undefined
    return next({ path: '/login', query: redirectParam })
  }

  // Si ya está autenticado y quiere ir al login/registro, redirigir al inicio
  if (isAuthenticated.value && isPublic) {
    return next('/')
  }

  // Si la ruta tiene restricción por rol
  if (to.meta.roles && isAuthenticated.value) {
    if (!to.meta.roles.includes(currentRole.value)) {
      return next('/sin-acceso')
    }
  }

  next()
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
})

export default router
