<template>
  <div class="space-y-6" dir="rtl">
    <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
      <div v-for="card in summaryCards" :key="card.label" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-black text-slate-900">{{ card.value }}</p>
      </div>
    </div>

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
            <option value="Pending">انتظار</option>
            <option value="Accepted">مقبول</option>
            <option value="Completed">مكتمل</option>
            <option value="Cancelled">ملغي</option>
            <option value="Rejected">مرفوض</option>
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
      <template #cell-customerName="{ row }">
        <div>
          <p class="font-bold text-slate-900">{{ row.customerName ?? '—' }}</p>
          <p class="text-xs text-slate-500">{{ row.customerPhone ?? '—' }}</p>
        </div>
      </template>
      <template #cell-businessName="{ row }">
        <div>
          <p class="font-bold text-slate-900">{{ row.businessName ?? '—' }}</p>
          <p class="text-xs text-slate-500">الموظف: {{ row.staffName ?? '—' }}</p>
        </div>
      </template>
      <template #cell-services="{ row }">
        <div class="flex flex-wrap gap-1">
          <span v-for="service in servicesOf(row)" :key="service" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
            {{ service }}
          </span>
          <span v-if="!servicesOf(row).length">—</span>
        </div>
      </template>
      <template #cell-bookedAt="{ row }">
        {{ formatDate(row.bookedAt as string) }}
      </template>
      <template #cell-totalPrice="{ row }">
        {{ formatMoney(row.totalPrice as number) }}
      </template>
      <template #cell-commission="{ row }">
        {{ formatMoney(row.commission as number) }}
      </template>
      <template #cell-status="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(row.status)">
          {{ statusLabel(row.status) }}
        </span>
      </template>
      <template #cell-createdAt="{ row }">
        {{ formatDateShort(row.createdAt as string) }}
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
            v-if="!['Cancelled', 'Completed', 'Rejected'].includes(String(row.status))"
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
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">هاتف الزبون</dt><dd>{{ selected.customerPhone ?? '—' }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">الموظف</dt><dd>{{ selected.staffName ?? '—' }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">الخدمات</dt><dd class="font-bold">{{ servicesOf(selected).join('، ') || '—' }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">موعد الحجز</dt><dd>{{ formatDate(selected.bookedAt as string) }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">المبلغ</dt><dd>{{ formatMoney(selected.totalPrice as number) }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">العمولة</dt><dd>{{ formatMoney(selected.commission as number) }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">تاريخ الإنشاء</dt><dd>{{ formatDate(selected.createdAt as string) }}</dd></div>
          <div class="flex justify-between gap-2"><dt class="text-[#6B7280]">الحالة</dt><dd><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(selected.status)">{{ statusLabel(selected.status) }}</span></dd></div>
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
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getBookings, cancelBooking, getBusinesses } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatDate, formatDateShort, formatMoney } from '@/utils/format'
import { apiMessage } from '@/utils/error'
import { statusClass, statusLabel } from '@/utils/admin'

const toast = useToast()

const columns: ColumnDef[] = [
  { key: 'customerName', label: 'الزبون' },
  { key: 'businessName', label: 'المحل والموظف' },
  { key: 'services', label: 'الخدمات' },
  { key: 'bookedAt', label: 'موعد الحجز' },
  { key: 'totalPrice', label: 'المبلغ' },
  { key: 'commission', label: 'العمولة' },
  { key: 'status', label: 'الحالة' },
  { key: 'createdAt', label: 'تاريخ الإنشاء' },
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
const summary = ref<Record<string, unknown>>({})
const summaryCards = computed(() => [
  { label: 'الإجمالي', value: summary.value.total ?? total.value },
  { label: 'بانتظار', value: summary.value.pending ?? 0 },
  { label: 'مقبولة', value: summary.value.accepted ?? 0 },
  { label: 'مكتملة', value: summary.value.completed ?? 0 },
  { label: 'ملغية', value: summary.value.cancelled ?? 0 },
  { label: 'مرفوضة', value: summary.value.rejected ?? 0 },
])

function servicesOf(row: Record<string, unknown>) {
  const raw = row.services
  if (!Array.isArray(raw)) return []
  return raw.map((x) => String(x)).filter(Boolean)
}

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
    const d = res.data as { items?: Record<string, unknown>[]; total?: number; summary?: Record<string, unknown> }
    rows.value = d.items ?? []
    summary.value = d.summary ?? {}
    total.value = d.total ?? Number(d.summary?.total ?? 0)
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

function openDetail(row: Record<string, unknown>) {
  selected.value = row
  detailOpen.value = true
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
    'هاتف الزبون',
    'الموظف',
    'الخدمات',
    'موعد الحجز',
    'المبلغ',
    'العمولة',
    'الحالة',
    'تاريخ الإنشاء',
  ]
  const lines = rows.value.map((r) =>
    [
      r.businessName,
      r.customerName,
      r.customerPhone,
      r.staffName,
      servicesOf(r).join(' | '),
      r.bookedAt,
      r.totalPrice,
      r.commission,
      r.status,
      r.createdAt,
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
