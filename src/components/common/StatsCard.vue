<template>
  <component
    :is="to ? 'RouterLink' : 'div'"
    :to="to"
    class="page-card block p-5 transition hover:shadow-float"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-app-muted">{{ title }}</p>
        <p class="mt-2 text-3xl font-black tabular-nums text-app-text">{{ display }}</p>
      </div>
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" :class="wrap">
        <slot name="icon" />
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number | null
    color?: 'primary' | 'success' | 'warning' | 'danger'
    to?: string
    failed?: boolean
  }>(),
  { color: 'primary', failed: false },
)

const display = computed(() => {
  if (props.failed || props.value == null) return '—'
  return typeof props.value === 'number' ? new Intl.NumberFormat().format(props.value) : props.value
})

const wrap = computed(() => {
  const m = {
    primary: 'bg-brand-light text-brand',
    success: 'bg-brand-light text-brand',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-600',
  }
  return m[props.color]
})
</script>
