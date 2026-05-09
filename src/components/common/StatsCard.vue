<template>
  <div
    class="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md"
    dir="rtl"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-[#6B7280]">{{ title }}</p>
        <p class="mt-2 text-3xl font-black tabular-nums text-[#1A1A2E]">{{ displayValue }}</p>
        <p v-if="trend != null" class="mt-1 text-xs font-semibold" :class="trend >= 0 ? 'text-success' : 'text-danger'">
          {{ trend >= 0 ? '+' : '' }}{{ trend }}%
        </p>
      </div>
      <div
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
        :class="iconWrapClass"
      >
        <slot name="icon">
          <span class="text-2xl">{{ fallbackEmoji }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    color?: 'primary' | 'success' | 'warning' | 'danger'
    trend?: number | null
  }>(),
  { color: 'primary', trend: null },
)

const displayValue = computed(() =>
  typeof props.value === 'number' ? new Intl.NumberFormat('ar-IQ').format(props.value) : props.value,
)

const iconWrapClass = computed(() => {
  const m = {
    primary: 'bg-gradient-to-br from-primary to-primary-dark',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }
  return m[props.color]
})

const fallbackEmoji = computed(() => {
  const m = { primary: '📊', success: '✓', warning: '⏳', danger: '!' }
  return m[props.color]
})
</script>
