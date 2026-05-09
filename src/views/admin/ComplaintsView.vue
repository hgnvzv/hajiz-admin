<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap gap-2">
        <button v-for="f in filters" :key="f.value" type="button" class="rounded-xl px-4 py-2 text-sm font-bold" :class="status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'" @click="setStatus(f.value)">
          {{ f.label }}
        </button>
      </div>
    </div>
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="total" :page="page" :page-size="pageSize" empty-text="لا توجد شكاوى" show-index @page-change="onPage">
      <template #cell-userName="{ row }">
        <RouterLink :to="`/complaints/${row.id}`" class="font-bold text-blue-600 hover:underline">{{ row.userName ?? '—' }}</RouterLink>
      </template>
      <template #cell-userType="{ row }">{{ userTypeLabel(row.userType) }}</template>
      <template #cell-type="{ row }">{{ complaintTypeLabel(row.type) }}</template>
      <template #cell-status="{ row }"><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span></template>
      <template #cell-createdAt="{ row }">{{ formatDateShort(row.createdAt as string) }}</template>
      <template #cell-actions="{ row }"><RouterLink :to="`/complaints/${row.id}`" class="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">عرض التفاصيل</RouterLink></template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getComplaints } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort } from '@/utils/format'
import { complaintTypeLabel, normalizePaged, statusClass, statusLabel, userTypeLabel } from '@/utils/admin'

const toast = useToast()
const filters = [
  { value: '', label: 'الكل' },
  { value: 'Open', label: 'مفتوحة' },
  { value: 'InProgress', label: 'قيد المعالجة' },
  { value: 'Resolved', label: 'تم الحل' },
  { value: 'Closed', label: 'مغلقة' },
]
const columns: ColumnDef[] = [
  { key: 'userName', label: 'المستخدم' },
  { key: 'userPhone', label: 'الهاتف' },
  { key: 'userType', label: 'نوع المستخدم' },
  { key: 'type', label: 'نوع الشكوى' },
  { key: 'subject', label: 'الموضوع' },
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
    const res = await getComplaints({ status: status.value || undefined, page: page.value, pageSize })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الشكاوى'))
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
