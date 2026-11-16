<template>
  <div class="app-container">
    <!-- Barra Superior de Navegación -->
    <Navbar 
      @open-supabase-modal="showSupabaseModal = true"
    />

    <!-- Contenido Dinámico de las Vistas -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Contenedor Flotante de Notificaciones -->
    <ToastContainer />

    <!-- Modal de Configuración e Integración con Supabase (Sólo accesible desde menú admin) -->
    <SupabaseModal 
      v-if="showSupabaseModal" 
      @close="showSupabaseModal = false" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import ToastContainer from './components/ToastContainer.vue'
import SupabaseModal from './components/SupabaseModal.vue'
import { initAuth } from './composables/useAuth'
import { initDataService } from './services/dataService'

const showSupabaseModal = ref(false)

onMounted(async () => {
  await initAuth()
  await initDataService()
})
</script>

<style>
/* Estilos globales y reset importados en style.css */
</style>
