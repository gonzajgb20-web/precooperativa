<template>
  <div class="app-container">
    <!-- Barra Superior de Navegación -->
    <Navbar @open-supabase-modal="showSupabaseModal = true" />

    <!-- Contenido Dinámico de las Vistas -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Contenedor Flotante de Toasts / Mensajes de Feedback (Punto 16) -->
    <ToastContainer />

    <!-- Modal de Configuración e Integración con Supabase (Puntos 14 y 16) -->
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
import { initDataService } from './services/dataService'

const showSupabaseModal = ref(false)

onMounted(async () => {
  await initDataService()
})
</script>

<style>
/* Estilos globales y reset importados en style.css */
</style>
