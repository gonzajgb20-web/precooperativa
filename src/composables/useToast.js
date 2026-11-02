import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  const show = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }

  const success = (message, duration = 4000) => show(message, 'success', duration)
  const error = (message, duration = 5000) => show(message, 'error', duration)
  const warning = (message, duration = 4500) => show(message, 'warning', duration)
  const info = (message, duration = 4000) => show(message, 'info', duration)

  const dismiss = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    dismiss
  }
}
