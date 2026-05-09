<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap gap-2">
        <button v-for="f in filters" :key="f.value" type="button" class="rounded-xl px-4 py-2 text-sm font-bold" :class="status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'" @click="setStatus(f.value)">
          {{ f.label }}
        </button>
      </div>
    </div>

    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="total" :page="page" :page-size="pageSize" empty-text="لا توجد طلبات خدمات موقعية" show-index @page-change="onPage">
      <template #cell-customerName="{ row }">
        <RouterLink :to="`/service-requests/${row.id}`" class="font-bold text-blue-600 hover:underline">{{ row.customerName ?? '—' }}</RouterLink>
        <p class="text-xs text-slate-500">{{ row.customerPhone ?? '' }}</p>
      </template>
      <template #cell-proposedPrice="{ row }">{{ formatMoney(row.proposedPrice ?? row.price) }}</template>
      <template #cell-status="{ row }"><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span></template>
      <template #cell-createdAt="{ row }">{{ formatDateShort(row.createdAt as string) }}</template>
      <template #cell-actions="{ row }">
        <RouterLink :to="`/service-requests/${row.id}`" class="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">تفاصيل</RouterLink>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getServiceRequests } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort, formatMoney } from '@/utils/format'
import { normalizePaged, statusClass, statusLabel } from '@/utils/admin'

const toast = useToast()
const filters = [
  { value: '', label: 'الكل' },
  { value: 'Open', label: 'مفتوحة' },
  { value: 'Accepted', label: 'مقبولة' },
  { value: 'Completed', label: 'مكتملة' },
  { value: 'Cancelled', label: 'ملغاة' },
]
const columns: ColumnDef[] = [
  { key: 'customerName', label: 'الزبون' },
  { key: 'professionName', label: 'الحرفة' },
  { key: 'cityName', label: 'المحافظة' },
  { key: 'proposedPrice', label: 'السعر المقترح' },
  { key: 'status', label: 'الحالة' },
  { key: 'createdAt', label: 'التاريخ' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const status = ref('')

async function load() {
  loading.value = true
  try {
    const res = await getServiceRequests({ status: status.value || undefined, page: page.value, pageSize })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل طلبات الخدمات'))
  } finally {
    loading.value = false
  }
}

function setStatus(v: string) {
  status.value = v
  page.value = 1
  load()
}

function onPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>
