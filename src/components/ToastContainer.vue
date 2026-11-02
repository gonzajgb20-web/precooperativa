<template>
  <div class="toast-container">
    <div 
      v-for="toast in toasts" 
      :key="toast.id" 
      class="toast-item"
      :class="`toast-${toast.type}`"
    >
      <div class="toast-msg">
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span>{{ toast.message }}</span>
      </div>
      <button class="toast-close" @click="dismiss(toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismiss } = useToast()

const getIcon = (type) => {
  switch (type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'warning': return '⚠️'
    default: return 'ℹ️'
  }
}
</script>

<style scoped>
.toast-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toast-close {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1rem;
  opacity: 0.7;
  cursor: pointer;
}

.toast-close:hover {
  opacity: 1;
}
</style>
