<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />
      <div
        class="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
        dir="rtl"
      >
        <h3 class="text-lg font-bold text-[#1A1A2E]">{{ title }}</h3>
        <p v-if="message" class="mt-3 text-sm leading-relaxed text-[#6B7280]">{{ message }}</p>
        <div v-if="$slots.default" class="mt-4">
          <slot />
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-[#1A1A2E] hover:bg-[#F8F8FC]"
            @click="close"
          >
            إلغاء
          </button>
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-bold text-white"
            :class="
              confirmColor === 'danger'
                ? 'bg-danger hover:bg-red-600'
                : 'bg-primary hover:bg-primary-dark'
            "
            @click="confirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  message?: string
  confirmText?: string
  confirmColor?: 'danger' | 'primary'
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  confirm: []
}>()

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>
