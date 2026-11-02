import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NewOrderView from '../views/NewOrderView.vue'
import WorkshopView from '../views/WorkshopView.vue'
import InventoryView from '../views/InventoryView.vue'
import AssemblyView from '../views/AssemblyView.vue'
import PermissionsView from '../views/PermissionsView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Inicio — Clínica de Hardware' }
  },
  {
    path: '/nuevo-pedido',
    name: 'NewOrder',
    component: NewOrderView,
    meta: { title: 'Nuevo Pedido — Clínica de Hardware' }
  },
  {
    path: '/taller',
    name: 'Workshop',
    component: WorkshopView,
    meta: { title: 'Bandejas del Taller — Clínica de Hardware' }
  },
  {
    path: '/inventario',
    name: 'Inventory',
    component: InventoryView,
    meta: { title: 'Inventario y Equipos — Clínica de Hardware' }
  },
  {
    path: '/asamblea',
    name: 'Assembly',
    component: AssemblyView,
    meta: { title: 'Asamblea y Registros — Clínica de Hardware' }
  },
  {
    path: '/permisos',
    name: 'Permissions',
    component: PermissionsView,
    meta: { title: 'Datos y Permisos — Clínica de Hardware' }
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

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
})

export default router
