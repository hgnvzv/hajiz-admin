<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-white shadow-card" :dir="dir">
    <div v-if="loading">
      <SkeletonRows />
    </div>
    <template v-else>
      <div v-if="error" class="p-4">
        <ErrorBanner :message="error" :retry="onRetry" :retry-label="t('common.retry')" />
      </div>
      <div v-else-if="rows.length === 0" class="p-4">
        <EmptyState :title="emptyText || t('common.empty')" />
      </div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-sm">
            <thead class="bg-slate-50 text-xs font-black uppercase tracking-wide text-app-muted">
              <tr>
                <th v-if="showIndex" class="px-4 py-3">#</th>
                <th v-for="col in columns" :key="col.key" class="px-4 py-3">{{ col.label }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(row, idx) in rows" :key="rowKey(row, idx)" class="transition hover:bg-slate-50">
                <td v-if="showIndex" class="px-4 py-3 text-app-muted">
                  {{ (page - 1) * pageSize + idx + 1 }}
                </td>
                <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-app-text">
                  <slot :name="`cell-${col.key}`" :row="row" :value="getCell(row, col.key)">
                    {{ formatCell(getCell(row, col.key)) }}
                  </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="total > 0"
          :total="total"
          :page="page"
          :page-size="pageSize"
          @change="$emit('page-change', $event)"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import EmptyState from './EmptyState.vue'
import ErrorBanner from './ErrorBanner.vue'
import Pagination from './Pagination.vue'
import SkeletonRows from './SkeletonRows.vue'
import { useI18n } from '@/composables/useI18n'

export interface ColumnDef {
  key: string
  label: string
}

const props = defineProps<{
  columns: ColumnDef[]
  rows: Record<string, unknown>[]
  loading?: boolean
  error?: string | null
  total: number
  page: number
  pageSize: number
  emptyText?: string
  showIndex?: boolean
}>()

const emit = defineEmits<{
  'page-change': [page: number]
  retry: []
}>()

const { t, dir } = useI18n()

function onRetry() {
  emit('retry')
}

function getCell(row: Record<string, unknown>, key: string) {
  return row[key]
}

function formatCell(v: unknown) {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function rowKey(row: Record<string, unknown>, idx: number) {
  const id = row.id ?? row.businessId
  return typeof id === 'string' || typeof id === 'number' ? String(id) : String(idx)
}
</script>
