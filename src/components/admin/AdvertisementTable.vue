<template>
  <DataTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :total="total"
    :page="page"
    :page-size="pageSize"
    empty-text="لا توجد إعلانات"
    show-index
    @page-change="emit('page-change', $event)"
  >
    <template #cell-thumbnail="{ row }">
      <button type="button" class="inline-block" @click="emit('view', asAd(row))">
        <img
          v-if="row.imageUrl"
          :src="String(row.imageUrl)"
          alt=""
          class="h-14 w-20 rounded-lg border border-slate-200 object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="flex h-14 w-20 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400"
        >
          —
        </div>
      </button>
    </template>

    <template #cell-titleBusiness="{ row }">
      <p class="font-bold text-slate-900">{{ row.title ?? '—' }}</p>
      <p class="text-xs text-slate-500">{{ row.businessName ?? '—' }}</p>
    </template>

    <template #cell-status="{ row }">
      <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="advertisementStatusClass(row.status)">
        {{ advertisementStatusLabel(row.status) }}
      </span>
    </template>

    <template #cell-durationDays="{ row }">
      {{ row.durationDays ?? '—' }} يوم
    </template>

    <template #cell-totalCost="{ row }">
      {{ formatMoney(row.totalCost) }} د.ع
    </template>

    <template #cell-dates="{ row }">
      <p class="text-xs text-slate-600">{{ formatDateShort(row.startDate as string) }}</p>
      <p class="text-xs text-slate-400">{{ formatDateShort(row.endDate as string) }}</p>
    </template>

    <template #cell-displayOrder="{ row }">
      <span class="font-bold text-slate-800">{{ row.displayOrder ?? 0 }}</span>
    </template>

    <template #cell-actions="{ row }">
      <div class="flex max-w-[220px] flex-wrap gap-1">
        <button type="button" class="action-btn bg-slate-100 text-slate-700" @click="emit('view', asAd(row))">عرض</button>
        <button
          v-if="canEdit(asAd(row))"
          type="button"
          class="action-btn bg-blue-50 text-blue-700"
          @click="emit('edit', asAd(row))"
        >
          تعديل
        </button>
        <button
          v-if="row.status === 'Pending'"
          type="button"
          class="action-btn bg-emerald-50 text-emerald-700"
          @click="emit('approve', asAd(row))"
        >
          قبول
        </button>
        <button
          v-if="row.status === 'Pending'"
          type="button"
          class="action-btn bg-red-50 text-red-700"
          @click="emit('reject', asAd(row))"
        >
          رفض
        </button>
        <button
          v-if="row.status === 'Active'"
          type="button"
          class="action-btn bg-violet-50 text-violet-700"
          @click="emit('change-image', asAd(row))"
        >
          صورة
        </button>
        <button
          v-if="row.status === 'Active'"
          type="button"
          class="action-btn bg-amber-50 text-amber-700"
          @click="emit('change-order', asAd(row))"
        >
          ترتيب
        </button>
        <button
          v-if="canDelete(asAd(row))"
          type="button"
          class="action-btn bg-red-50 text-red-700"
          @click="emit('delete', asAd(row))"
        >
          حذف
        </button>
      </div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { advertisementStatusClass, advertisementStatusLabel } from '@/utils/admin'
import { formatDateShort, formatMoney } from '@/utils/format'
import type { AdvertisementDto } from '@/types/advertisement'

defineProps<{
  rows: Record<string, unknown>[]
  loading: boolean
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  'page-change': [page: number]
  view: [row: AdvertisementDto]
  edit: [row: AdvertisementDto]
  approve: [row: AdvertisementDto]
  reject: [row: AdvertisementDto]
  delete: [row: AdvertisementDto]
  'change-image': [row: AdvertisementDto]
  'change-order': [row: AdvertisementDto]
}>()

function asAd(row: Record<string, unknown>): AdvertisementDto {
  return row as unknown as AdvertisementDto
}

const columns: ColumnDef[] = [
  { key: 'thumbnail', label: 'صورة' },
  { key: 'titleBusiness', label: 'العنوان / المحل' },
  { key: 'status', label: 'الحالة' },
  { key: 'durationDays', label: 'المدة' },
  { key: 'totalCost', label: 'التكلفة' },
  { key: 'dates', label: 'البداية / النهاية' },
  { key: 'displayOrder', label: 'الترتيب' },
  { key: 'actions', label: 'إجراءات' },
]

function canEdit(row: AdvertisementDto) {
  return ['Pending', 'Active', 'Rejected', 'Approved'].includes(String(row.status))
}

function canDelete(row: AdvertisementDto) {
  return ['Pending', 'Active', 'Rejected', 'Expired', 'Approved'].includes(String(row.status))
}
</script>

<style scoped>
.action-btn {
  @apply rounded-lg px-2 py-1 text-xs font-bold;
}
</style>
