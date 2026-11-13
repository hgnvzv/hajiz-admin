<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-black/40" @click="close" />
      <div class="relative z-10 w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-float" :dir="dir">
        <h3 class="text-lg font-black text-app-text">{{ title }}</h3>
        <p v-if="message" class="mt-3 text-sm leading-relaxed text-app-muted">{{ message }}</p>
        <div v-if="$slots.default" class="mt-4">
          <slot />
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="btn-secondary" :disabled="busy" @click="close">{{ t('common.cancel') }}</button>
          <button
            type="button"
            class="text-sm font-bold text-white"
            :class="confirmColor === 'danger' ? 'btn-danger' : 'btn-primary'"
            :disabled="busy"
            @click="confirm"
          >
            {{ busy ? t('common.loading') : confirmText || t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

defineProps<{
  modelValue: boolean
  title: string
  message?: string
  confirmText?: string
  confirmColor?: 'danger' | 'primary'
  busy?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  confirm: []
}>()

const { t, dir } = useI18n()

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
}
</script>
