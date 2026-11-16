<template>
  <div 
    class="app-combobox-wrapper" 
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }" 
    ref="comboboxRef"
    @keydown.down.prevent="navigateOptions(1)"
    @keydown.up.prevent="navigateOptions(-1)"
    @keydown.enter.prevent="selectHighlighted"
    @keydown.esc.prevent="closeDropdown"
  >
    <!-- Botón disparador del Combobox -->
    <button
      type="button"
      class="combobox-trigger"
      :class="{ 'has-value': hasSelection, 'is-active': isOpen }"
      :disabled="disabled"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <span class="trigger-content">
        <AppIcon v-if="selectedOption?.icon" :name="selectedOption.icon" :size="15" class="trigger-icon" />
        <span class="trigger-label" :class="{ 'placeholder-text': !hasSelection }">
          {{ displayLabel }}
        </span>
      </span>

      <AppIcon 
        name="chevron-down" 
        :size="14" 
        class="combobox-chevron" 
        :class="{ rotated: isOpen }" 
      />
    </button>

    <!-- Menú desplegable flotante -->
    <transition name="combobox-popover">
      <div 
        v-if="isOpen" 
        class="combobox-dropdown"
        role="listbox"
      >
        <!-- Buscador integrado (si searchable está activo o hay más de 6 opciones) -->
        <div v-if="showSearch" class="combobox-search-box">
          <AppIcon name="search" :size="13" class="search-box-icon" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="combobox-search-input"
            :placeholder="searchPlaceholder"
            @click.stop
          />
          <button 
            v-if="searchQuery" 
            type="button" 
            class="search-clear-btn" 
            @click.stop="searchQuery = ''"
          >
            <AppIcon name="x" :size="11" />
          </button>
        </div>

        <!-- Lista de opciones filtradas -->
        <div class="combobox-options-list" role="listbox">
          <button
            v-for="(opt, idx) in filteredOptions"
            :key="opt.value"
            type="button"
            class="combobox-option"
            :class="{ 
              'is-selected': isSelected(opt.value),
              'is-highlighted': highlightedIndex === idx
            }"
            @click="selectOption(opt)"
            @mouseenter="highlightedIndex = idx"
            role="option"
            :aria-selected="isSelected(opt.value)"
          >
            <div class="option-text-group">
              <AppIcon v-if="opt.icon" :name="opt.icon" :size="15" class="option-icon" />
              <div class="option-labels">
                <span class="option-title">{{ opt.label }}</span>
                <span v-if="opt.hint" class="option-hint">{{ opt.hint }}</span>
              </div>
            </div>

            <AppIcon 
              v-if="isSelected(opt.value)" 
              name="check" 
              :size="14" 
              class="option-check-icon" 
            />
          </button>

          <!-- Estado vacío al filtrar sin coincidencias -->
          <div v-if="filteredOptions.length === 0" class="combobox-empty-state">
            <span>Sin resultados para "{{ searchQuery }}"</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, null],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    // Puede ser array de strings ['Hardware', 'Redes']
    // o array de objetos [{ value: 'Hardware', label: 'Hardware', icon: 'laptop', hint: '...' }]
  },
  placeholder: {
    type: String,
    default: 'Seleccionar...'
  },
  searchable: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar opción...'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const comboboxRef = ref(null)
const searchInputRef = ref(null)

// Normalizar opciones a formato estándar: { value, label, icon?, hint? }
const normalizedOptions = computed(() => {
  return (props.options || []).map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label || opt.nombre || String(opt.value),
        icon: opt.icon || null,
        hint: opt.hint || opt.descripcion || null
      }
    }
    return {
      value: opt,
      label: String(opt),
      icon: null,
      hint: null
    }
  })
})

const showSearch = computed(() => {
  return props.searchable || normalizedOptions.value.length > 7
})

const filteredOptions = computed(() => {
  const query = (searchQuery.value || '').trim().toLowerCase()
  if (!query) return normalizedOptions.value

  return normalizedOptions.value.filter(opt => {
    const labelMatch = (opt.label || '').toLowerCase().includes(query)
    const hintMatch = (opt.hint || '').toLowerCase().includes(query)
    const valMatch = String(opt.value || '').toLowerCase().includes(query)
    return labelMatch || hintMatch || valMatch
  })
})

const selectedOption = computed(() => {
  return normalizedOptions.value.find(opt => opt.value === props.modelValue) || null
})

const hasSelection = computed(() => {
  return selectedOption.value !== null
})

const displayLabel = computed(() => {
  return selectedOption.value ? selectedOption.value.label : props.placeholder
})

const isSelected = (val) => {
  return props.modelValue === val
}

const toggleDropdown = () => {
  if (props.disabled) return
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = () => {
  isOpen.value = true
  searchQuery.value = ''
  
  // Posicionar el índice resaltado en la opción actualmente seleccionada
  const currentIdx = filteredOptions.value.findIndex(o => o.value === props.modelValue)
  highlightedIndex.value = currentIdx >= 0 ? currentIdx : 0

  if (showSearch.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
}

const selectOption = (opt) => {
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  closeDropdown()
}

const selectHighlighted = () => {
  if (!isOpen.value) {
    openDropdown()
    return
  }
  const opts = filteredOptions.value
  if (highlightedIndex.value >= 0 && highlightedIndex.value < opts.length) {
    selectOption(opts[highlightedIndex.value])
  }
}

const navigateOptions = (delta) => {
  if (!isOpen.value) {
    openDropdown()
    return
  }
  const len = filteredOptions.value.length
  if (len === 0) return
  highlightedIndex.value = (highlightedIndex.value + delta + len) % len
}

// Cierre al hacer clic fuera del componente
const handleClickOutside = (event) => {
  if (comboboxRef.value && !comboboxRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.disabled, (newVal) => {
  if (newVal && isOpen.value) closeDropdown()
})
</script>

<style scoped>
.app-combobox-wrapper {
  position: relative;
  width: 100%;
  font-family: inherit;
  user-select: none;
}

.combobox-trigger {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-subtle, #e2e8f0);
  border-radius: var(--radius-md, 8px);
  color: var(--text-main, #0f172a);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease-out, box-shadow 160ms ease-out, transform 120ms ease-out;
}

.combobox-trigger:hover:not(:disabled) {
  border-color: #cbd5e1;
}

.combobox-trigger:focus-visible,
.combobox-trigger.is-active {
  outline: none;
  border-color: #ea580c;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.12);
}

.combobox-trigger:active:not(:disabled) {
  transform: scale(0.985);
}

.combobox-trigger:disabled {
  background: var(--bg-surface-subtle, #f8fafc);
  color: var(--text-muted, #94a3b8);
  cursor: not-allowed;
  opacity: 0.7;
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-icon {
  color: #ea580c;
  flex-shrink: 0;
}

.trigger-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder-text {
  color: var(--text-muted, #94a3b8);
  font-weight: 400;
}

.combobox-chevron {
  color: var(--text-muted, #94a3b8);
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms ease-out;
  flex-shrink: 0;
}

.combobox-chevron.rotated {
  transform: rotate(180deg);
  color: #ea580c;
}

/* Popover desplegable flotante */
.combobox-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  z-index: 1200;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-subtle, #e2e8f0);
  border-radius: var(--radius-md, 10px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.combobox-search-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle, #f1f5f9);
  background: var(--bg-surface-subtle, #f8fafc);
}

.search-box-icon {
  color: var(--text-muted, #94a3b8);
  flex-shrink: 0;
}

.combobox-search-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.82rem;
  color: var(--text-main, #0f172a);
  outline: none;
}

.combobox-search-input::placeholder {
  color: var(--text-muted, #94a3b8);
}

.search-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  padding: 0.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color 120ms ease-out;
}

.search-clear-btn:hover {
  color: var(--text-main, #0f172a);
}

.combobox-options-list {
  max-height: 230px;
  overflow-y: auto;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.combobox-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0.7rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm, 6px);
  color: var(--text-main, #1e293b);
  font-size: 0.86rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 120ms ease-out, color 120ms ease-out;
}

.combobox-option:hover,
.combobox-option.is-highlighted {
  background: rgba(234, 88, 12, 0.08);
  color: #ea580c;
}

.combobox-option.is-selected {
  background: rgba(234, 88, 12, 0.12);
  color: #ea580c;
  font-weight: 600;
}

.option-text-group {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  overflow: hidden;
}

.option-icon {
  color: #ea580c;
  flex-shrink: 0;
}

.option-labels {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.option-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-hint {
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
  font-weight: 400;
}

.option-check-icon {
  color: #ea580c;
  flex-shrink: 0;
}

.combobox-empty-state {
  padding: 1rem 0.75rem;
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-muted, #94a3b8);
}

/* Transición fluida según Emil Kowalski: parte de scale(0.98), no scale(0) */
.combobox-popover-enter-active {
  transition: opacity 160ms cubic-bezier(0.16, 1, 0.3, 1), transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top;
}

.combobox-popover-leave-active {
  transition: opacity 120ms ease-in, transform 120ms ease-in;
  transform-origin: top;
}

.combobox-popover-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.combobox-popover-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>

