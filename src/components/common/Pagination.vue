<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-slate-50 px-4 py-3" :dir="dir">
    <p class="text-sm text-app-muted">
      {{ t('common.showing') }}
      <span class="font-bold text-app-text">{{ pageStart }}</span>
      –
      <span class="font-bold text-app-text">{{ pageEnd }}</span>
      {{ t('common.of') }}
      <span class="font-bold text-app-text">{{ total }}</span>
    </p>
    <div class="flex items-center gap-1">
      <button type="button" class="btn-secondary text-xs" :disabled="page <= 1" @click="emit('change', page - 1)">
        {{ t('common.prev') }}
      </button>
      <span class="px-2 text-sm font-bold">{{ page }} / {{ totalPages }}</span>
      <button type="button" class="btn-secondary text-xs" :disabled="page >= totalPages" @click="emit('change', page + 1)">
        {{ t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{ change: [page: number] }>()
const { t, dir } = useI18n()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize) || 1))
const pageStart = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const pageEnd = computed(() => Math.min(props.page * props.pageSize, props.total))
</script>
