<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-[#F8F8FC] px-4 py-3">
    <p class="text-sm text-[#6B7280]">
      عرض
      <span class="font-bold text-[#1A1A2E]">{{ pageStart }}</span>
      –
      <span class="font-bold text-[#1A1A2E]">{{ pageEnd }}</span>
      من
      <span class="font-bold text-[#1A1A2E]">{{ total }}</span>
    </p>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold transition hover:bg-primary-light disabled:opacity-40"
        :disabled="page <= 1"
        @click="emit('change', page - 1)"
      >
        السابق
      </button>
      <span class="px-2 text-sm font-bold text-[#1A1A2E]">{{ page }} / {{ totalPages }}</span>
      <button
        type="button"
        class="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold transition hover:bg-primary-light disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="emit('change', page + 1)"
      >
        التالي
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize) || 1))

const pageStart = computed(() => {
  if (props.total === 0) return 0
  return (props.page - 1) * props.pageSize + 1
})

const pageEnd = computed(() => Math.min(props.page * props.pageSize, props.total))
</script>
