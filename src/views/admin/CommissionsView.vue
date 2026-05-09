<template>
  <div class="space-y-6" dir="rtl">
    <div class="grid gap-4 md:grid-cols-3">
      <div v-for="card in summaryCards" :key="card.label" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-bold text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-black text-slate-900">{{ formatMoney(card.value) }}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap gap-2">
        <button v-for="f in filters" :key="f.value" type="button" class="rounded-xl px-4 py-2 text-sm font-bold" :class="status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'" @click="setStatus(f.value)">
          {{ f.label }}
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
      empty-text="لا توجد عمولات"
      show-index
      @page-change="onPage"
    >
      <template #cell-amount="{ row }">{{ formatMoney(row.amount ?? row.totalAmount) }}</template>
      <template #cell-status="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(row.status)">
          {{ statusLabel(row.status) }}
        </span>
      </template>
      <template #cell-createdAt="{ row }">{{ formatDateShort(row.createdAt as string) }}</template>
      <template #cell-actions="{ row }">
        <button v-if="row.status !== 'Paid'" type="button" class="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700" @click="markPaid(row)">
          تعليم كمدفوعة
        </button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getCommissions, markCommissionPaid } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort, formatMoney } from '@/utils/format'
import { normalizePaged, statusClass, statusLabel } from '@/utils/admin'

const toast = useToast()
const filters = [
  { value: '', label: 'الكل' },
  { value: 'Pending', label: 'معلقة' },
  { value: 'Paid', label: 'مدفوعة' },
]
const columns: ColumnDef[] = [
  { key: 'businessName', label: 'المحل' },
  { key: 'bookingId', label: 'رقم الحجز' },
  { key: 'amount', label: 'المبلغ' },
  { key: 'status', label: 'الحالة' },
  { key: 'createdAt', label: 'التاريخ' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const summary = ref<Record<string, unknown>>({})
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const status = ref('')
const summaryCards = computed(() => [
  { label: 'إجمالي العمولات', value: summary.value.totalAmount },
  { label: 'المعلقة', value: summary.value.pendingAmount },
  { label: 'المدفوعة', value: summary.value.paidAmount },
])

async function load() {
  loading.value = true
  try {
    const res = await getCommissions({ status: status.value || undefined, page: page.value, pageSize })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
    summary.value = d.summary ?? {}
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل العمولات'))
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

async function markPaid(row: Record<string, unknown>) {
  if (!confirm('هل تريد تعليم العمولة كمدفوعة؟')) return
  try {
    await markCommissionPaid(String(row.id))
    toast.success('تم تحديث العمولة')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
