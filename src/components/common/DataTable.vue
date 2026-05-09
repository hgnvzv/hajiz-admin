<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm" dir="rtl">
    <div v-if="loading" class="py-16">
      <LoadingSpinner />
    </div>
    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-right text-sm">
          <thead class="bg-gradient-to-l from-primary to-primary-dark text-white">
            <tr>
              <th v-if="showIndex" class="px-4 py-3 font-bold">#</th>
              <th v-for="col in columns" :key="col.key" class="px-4 py-3 font-bold">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="rows.length === 0">
              <td
                :colspan="columns.length + (showIndex ? 1 : 0)"
                class="px-4 py-16 text-center text-[#6B7280]"
              >
                {{ emptyText }}
              </td>
            </tr>
            <tr
              v-for="(row, idx) in rows"
              v-else
              :key="rowKey(row, idx)"
              class="transition hover:bg-primary-light/40"
            >
              <td v-if="showIndex" class="px-4 py-3 text-[#6B7280]">
                {{ (page - 1) * pageSize + idx + 1 }}
              </td>
              <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-[#1A1A2E]">
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
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'
import Pagination from './Pagination.vue'

export interface ColumnDef {
  key: string
  label: string
}

defineProps<{
  columns: ColumnDef[]
  rows: Record<string, unknown>[]
  loading?: boolean
  total: number
  page: number
  pageSize: number
  emptyText?: string
  showIndex?: boolean
}>()

defineEmits<{
  'page-change': [page: number]
}>()

function getCell(row: Record<string, unknown>, key: string) {
  return row[key]
}

function formatCell(v: unknown) {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function rowKey(row: Record<string, unknown>, idx: number) {
  const id = row.id
  return typeof id === 'string' || typeof id === 'number' ? String(id) : String(idx)
}
</script>
