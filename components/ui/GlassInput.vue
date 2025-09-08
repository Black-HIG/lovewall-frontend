<template>
  <div v-bind="$attrs">
    <div class="relative">
      <!-- Prefix slot -->
      <div v-if="$slots.prefix" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        <slot name="prefix" />
      </div>
      
      <input
        :id="id"
        :type="actualType"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :value="modelValue"
        :class="[
          'glass-input w-full py-3 text-sm',
          {
            'border-red-400 focus:ring-red-300/60': hasError,
            'pl-10': $slots.prefix,
            'pl-4': !$slots.prefix,
            'pr-10': (type === 'password' && showPasswordToggle) || $slots.suffix,
            'pr-4': !(type === 'password' && showPasswordToggle) && !$slots.suffix
          }
          , inputClass
        ]"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keyup.enter="$emit('keyup', $event)"
      >
      
      <!-- Suffix slot -->
      <div v-if="$slots.suffix" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        <slot name="suffix" />
      </div>
      
      <!-- Password toggle button -->
      <button
        v-if="type === 'password' && showPasswordToggle"
        type="button"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        @click="togglePasswordVisibility"
      >
        <EyeIcon v-if="showPassword" class="w-4 h-4" />
        <EyeOffIcon v-else class="w-4 h-4" />
      </button>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="mt-1 text-sm text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

interface Props {
  id?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'datetime-local'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  modelValue?: string | number | null
  error?: string
  showPasswordToggle?: boolean
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  showPasswordToggle: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  blur: [event: Event]
  focus: [event: Event]
  keyup: [event: KeyboardEvent]
  input: [event: Event]
}>()

const showPassword = ref(false)

const actualType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

const hasError = computed(() => !!props.error)
const inputClass = computed(() => props.inputClass)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}
</script>
