<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      لا توجد قائمة أدمن مخصصة لحجوزات الطاولات في Swagger. تُعرض الحجوزات من
      <code class="font-mono">GET /admin/bookings</code>
      مع تسميات الحالة الرقمية إن وُجدت. منطق التعارض يبقى على الباكند.
    </div>
    <div class="rounded-2xl border bg-white p-4">
      <div class="flex flex-wrap gap-3">
        <input v-model="date" type="date" class="rounded-xl border px-3 py-2.5" />
        <input v-model="businessId" class="min-w-[220px] flex-1 rounded-xl border px-3 py-2.5" placeholder="معرّف المطعم" />
        <select v-model="status" class="rounded-xl border px-3 py-2.5">
          <option value="">كل الحالات</option>
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <button type="button" class="rounded-xl bg-amber-600 px-5 py-2.5 font-bold text-white" @click="load">بحث</button>
      </div>
    </div>
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="total" :page="page" :page-size="pageSize" empty-text="لا توجد حجوزات" show-index @page-change="onPage">
      <template #cell-status="{ row }">{{ reservationStatusLabel(row.status) }}</template>
      <template #cell-date="{ row }">{{ formatDateShort(String(row.bookedAtUtc ?? row.appointmentDate ?? row.createdAt ?? '')) }}</template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getBookings } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { normalizePaged } from '@/utils/admin'
import { apiMessage } from '@/utils/error'
import { formatDateShort } from '@/utils/format'

const toast = useToast()
const statuses = [
  { value: 'Pending', label: 'معلق (Pending)' },
  { value: 'Accepted', label: 'مقبول (Accepted)' },
  { value: 'Rejected', label: 'مرفوض (Rejected)' },
  { value: 'Completed', label: 'مكتمل (Completed)' },
  { value: 'Cancelled', label: 'ملغى (Cancelled)' },
  { value: 'NoShow', label: 'عدم حضور (NoShow)' },
  { value: 'Expired', label: 'منتهي (Expired)' },
]
const columns: ColumnDef[] = [
  { key: 'customerName', label: 'الزبون' },
  { key: 'businessName', label: 'المطعم' },
  { key: 'tableCode', label: 'الطاولة' },
  { key: 'floorName', label: 'الطابق' },
  { key: 'date', label: 'التاريخ' },
  { key: 'numberOfGuests', label: 'الضيوف' },
  { key: 'status', label: 'الحالة' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const date = ref('')
const businessId = ref('')
const status = ref('')

function reservationStatusLabel(status: unknown) {
  const map: Record<string, string> = {
    '1': 'معلق',
    Pending: 'معلق',
    '2': 'مقبول',
    Accepted: 'مقبول',
    '3': 'مرفوض',
    Rejected: 'مرفوض',
    '4': 'مكتمل',
    Completed: 'مكتمل',
    '5': 'ملغى',
    Cancelled: 'ملغى',
    '6': 'عدم حضور',
    NoShow: 'عدم حضور',
    '7': 'منتهي',
    Expired: 'منتهي',
  }
  return map[String(status ?? '')] ?? String(status ?? '—')
}

async function load() {
  loading.value = true
  try {
    const res = await getBookings({
      page: page.value,
      pageSize,
      date: date.value || undefined,
      businessId: businessId.value || undefined,
      status: status.value || undefined,
    })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الحجوزات'))
  } finally {
    loading.value = false
  }
}

function onPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>
