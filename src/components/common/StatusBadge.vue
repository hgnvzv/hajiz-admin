<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
    :class="classes"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const map: Record<
  string,
  { label: string; classes: string }
> = {
  active: { label: 'نشط', classes: 'bg-emerald-50 text-success ring-1 ring-emerald-200' },
  pending: { label: 'قيد الانتظار', classes: 'bg-amber-50 text-warning ring-1 ring-amber-200' },
  suspended: { label: 'موقوف', classes: 'bg-red-50 text-danger ring-1 ring-red-200' },
  confirmed: { label: 'مؤكد', classes: 'bg-emerald-50 text-success ring-1 ring-emerald-200' },
  completed: { label: 'مكتمل', classes: 'bg-primary-light text-primary-dark ring-1 ring-primary/30' },
  cancelled: { label: 'ملغي', classes: 'bg-red-50 text-danger ring-1 ring-red-200' },
  blocked: { label: 'محظور', classes: 'bg-red-50 text-danger ring-1 ring-red-200' },
  open: { label: 'مفتوح', classes: 'bg-emerald-50 text-success ring-1 ring-emerald-200' },
  closed: { label: 'مغلق', classes: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200' },
}

const label = computed(() => map[props.status]?.label ?? props.status)
const classes = computed(() => map[props.status]?.classes ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200')
</script>
