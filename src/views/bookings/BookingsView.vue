<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-[180px] flex-1">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">بحث</label>
          <input v-model="search" class="w-full rounded-xl border border-border px-3 py-2.5" placeholder="زبون أو محل" />
        </div>
        <div class="w-full sm:w-40">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">الحالة</label>
          <select v-model="status" class="w-full rounded-xl border border-border px-3 py-2.5">
            <option value="">الكل</option>
            <option value="pending">انتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <div class="w-full sm:w-36">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">من</label>
          <input v-model="dateFrom" type="date" class="w-full rounded-xl border border-border px-3 py-2.5" />
        </div>
        <div class="w-full sm:w-36">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">إلى</label>
          <input v-model="dateTo" type="date" class="w-full rounded-xl border border-border px-3 py-2.5" />
        </div>
        <div class="w-full min-w-[160px] sm:w-56">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">المحل</label>
          <select v-model="businessId" class="w-full rounded-xl border border-border px-3 py-2.5">
            <option value="">كل المحلات</option>
            <option v-for="b in businessOptions" :key="b.id" :value="String(b.id)">{{ b.name }}</option>
          </select>
        </div>
        <button type="button" class="rounded-xl bg-primary px-5 py-2.5 font-bold text-white" @click="apply">
          تطبيق
        </button>
        <button
          type="button"
          class="rounded-xl border border-primary px-5 py-2.5 font-bold text-primary"
          @click="exportCsv"
        >
          تصدير CSV
        </button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      empty-text="لا توجد حجوزات"
      show-index
      @page-change="onPage"
    >
      <template #cell-appointmentDate="{ row }">
        {{ formatDateShort(row.appointmentDate as string) }}
      </template>
      <template #cell-totalPrice="{ row }">
        {{ formatMoney(row.totalPrice as number) }}
      </template>
      <template #cell-commission="{ row }">
        {{ formatMoney(row.commission as number) }}
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="String(row.status ?? 'pending')" />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1">
          <button
            type="button"
            class="rounded-lg bg-primary-light px-2 py-1 text-xs font-bold text-primary-dark"
            @click="openDetail(row)"
          >
            تفاصيل
          </button>
          <button
            v-if="row.status !== 'cancelled' && row.status !== 'completed'"
            type="button"
            class="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-danger"
            @click="openCancel(row)"
          >
            إلغاء
          </button>
        </div>
      </template>
    </DataTable>

    <div
      v-if="detailOpen && selected"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      @click.self="detailOpen = false"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl" dir="rtl">
        <h3 class="text-lg font-black">تفاصيل الحجز</h3>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">المحل</dt><dd class="font-bold">{{ selected.businessName }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">الزبون</dt><dd class="font-bold">{{ selected.customerName }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">الخدمة</dt><dd class="font-bold">{{ selected.serviceName }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">التاريخ</dt><dd>{{ selected.appointmentDate }} {{ selected.appointmentTime }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">المبلغ</dt><dd>{{ formatMoney(selected.totalPrice as number) }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">العمولة</dt><dd>{{ formatMoney(selected.commission as number) }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">الحالة</dt><dd><StatusBadge :status="String(selected.status)" /></dd></div>
        </dl>
        <button type="button" class="mt-6 w-full rounded-xl bg-primary py-2 font-bold text-white" @click="detailOpen = false">
          إغلاق
        </button>
      </div>
    </div>

    <ConfirmModal
      v-model="showCancel"
      title="إلغاء الحجز"
      confirm-text="إلغاء الحجز"
      confirm-color="danger"
      @confirm="confirmCancel"
    >
      <textarea v-model="cancelReason" rows="3" class="mt-2 w-full rounded-xl border p-3" placeholder="السبب" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getBookings, getBookingDetail, cancelBooking, getBusinesses } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatDateShort, formatMoney } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const toast = useToast()

const columns: ColumnDef[] = [
  { key: 'businessName', label: 'المحل' },
  { key: 'customerName', label: 'الزبون' },
  { key: 'serviceName', label: 'الخدمة' },
  { key: 'appointmentDate', label: 'التاريخ' },
  { key: 'appointmentTime', label: 'الوقت' },
  { key: 'totalPrice', label: 'المبلغ' },
  { key: 'commission', label: 'العمولة' },
  { key: 'status', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const search = ref('')
const status = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const businessId = ref('')
const businessOptions = ref<{ id: string; name: string }[]>([])

const detailOpen = ref(false)
const selected = ref<Record<string, unknown> | null>(null)
const showCancel = ref(false)
const cancelRow = ref<Record<string, unknown> | null>(null)
const cancelReason = ref('')

async function loadBusinesses() {
  try {
    const res = await getBusinesses({ page: 1, pageSize: 500 })
    const d = res.data as { items?: { id: string; name: string }[] }
    businessOptions.value = (d.items ?? []).map((x) => ({ id: String(x.id), name: x.name }))
  } catch {
    businessOptions.value = []
  }
}

async function load() {
  loading.value = true
  try {
    const res = await getBookings({
      search: search.value || undefined,
      status: status.value || undefined,
      dateFrom: dateFrom.value || undefined,
      dateTo: dateTo.value || undefined,
      businessId: businessId.value || undefined,
      page: page.value,
      pageSize,
    })
    const d = res.data as { items?: Record<string, unknown>[]; total?: number }
    rows.value = d.items ?? []
    total.value = d.total ?? 0
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    loading.value = false
  }
}

function apply() {
  page.value = 1
  load()
}

function onPage(p: number) {
  page.value = p
  load()
}

async function openDetail(row: Record<string, unknown>) {
  try {
    const res = await getBookingDetail(String(row.id))
    selected.value = res.data as Record<string, unknown>
    detailOpen.value = true
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

function openCancel(row: Record<string, unknown>) {
  cancelRow.value = row
  cancelReason.value = ''
  showCancel.value = true
}

async function confirmCancel() {
  if (!cancelRow.value?.id) return
  try {
    await cancelBooking(String(cancelRow.value.id), cancelReason.value || '—')
    toast.success('تم إلغاء الحجز')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

function exportCsv() {
  if (!rows.value.length) {
    toast.warning('لا توجد بيانات للتصدير في الصفحة الحالية')
    return
  }
  const headers = [
    'المحل',
    'الزبون',
    'الخدمة',
    'التاريخ',
    'الوقت',
    'المبلغ',
    'العمولة',
    'الحالة',
  ]
  const lines = rows.value.map((r) =>
    [
      r.businessName,
      r.customerName,
      r.serviceName,
      r.appointmentDate,
      r.appointmentTime,
      r.totalPrice,
      r.commission,
      r.status,
    ]
      .map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob(['\uFEFF' + headers.join(',') + '\n' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `bookings-${page.value}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
  toast.success('تم تنزيل الملف')
}

onMounted(async () => {
  await loadBusinesses()
  load()
})
</script>
