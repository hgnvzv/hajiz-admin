<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="rounded-xl px-4 py-2 text-sm font-bold transition"
          :class="status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'"
          @click="setStatus(f.value)"
        >
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
      empty-text="لا توجد عروض أو خصومات"
      show-index
      @page-change="onPage"
    >
      <template #cell-businessName="{ row }">
        <p class="font-bold text-slate-900">{{ businessLabel(row) }}</p>
      </template>
      <template #cell-serviceName="{ row }">
        {{ serviceLabel(row) }}
      </template>
      <template #cell-description="{ row }">
        <span class="line-clamp-2 max-w-xs text-sm text-slate-600">{{ descriptionLabel(row) }}</span>
      </template>
      <template #cell-discountPercent="{ row }">
        {{ percentLabel(row) }}
      </template>
      <template #cell-startDate="{ row }">{{ formatDateShort(dateStart(row)) }}</template>
      <template #cell-endDate="{ row }">{{ formatDateShort(dateEnd(row)) }}</template>
      <template #cell-status="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="discountStatusClass(row.status)">
          {{ discountStatusLabel(row.status) }}
        </span>
      </template>
      <template #cell-displayOrder="{ row }">
        <div class="flex flex-wrap items-center gap-1">
          <input
            v-model.number="orderDraft[String(row.id)]"
            type="number"
            min="0"
            class="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm"
            @keydown.enter="applyOrder(row)"
          />
          <button
            type="button"
            class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
            @click="applyOrder(row)"
          >
            تطبيق
          </button>
        </div>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1">
          <button
            v-if="String(row.status) === 'Pending'"
            type="button"
            class="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"
            @click="approve(row)"
          >
            قبول
          </button>
          <button
            v-if="String(row.status) === 'Pending'"
            type="button"
            class="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-700"
            @click="openReject(row)"
          >
            رفض
          </button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
      v-model="rejectOpen"
      title="رفض العرض أو الخصم"
      confirm-text="رفض"
      confirm-color="danger"
      @confirm="confirmReject"
    >
      <textarea v-model="rejectReason" rows="3" class="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="سبب الرفض" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import {
  approveDiscount,
  getAdminDiscounts,
  rejectDiscount,
  updateDiscountOrder,
} from '@/api'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort } from '@/utils/format'
import { discountStatusClass, discountStatusLabel, normalizePaged, valueOf } from '@/utils/admin'

const toast = useToast()
const filters = [
  { value: '', label: 'الكل' },
  { value: 'Pending', label: 'معلق' },
  { value: 'Approved', label: 'مقبول' },
  { value: 'Rejected', label: 'مرفوض' },
  { value: 'Expired', label: 'منتهي' },
]
const columns: ColumnDef[] = [
  { key: 'businessName', label: 'المحل' },
  { key: 'serviceName', label: 'الخدمة' },
  { key: 'description', label: 'الوصف' },
  { key: 'discountPercent', label: 'نسبة الخصم' },
  { key: 'startDate', label: 'من' },
  { key: 'endDate', label: 'إلى' },
  { key: 'status', label: 'الحالة' },
  { key: 'displayOrder', label: 'الترتيب' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const status = ref('')
const orderDraft = ref<Record<string, number>>({})
const rejectOpen = ref(false)
const rejectReason = ref('')
const rejectRow = ref<Record<string, unknown> | null>(null)

function businessLabel(row: Record<string, unknown>) {
  const b = row.business
  if (b && typeof b === 'object' && 'name' in b) {
    const n = (b as { name?: string }).name
    if (n) return n
  }
  return valueOf(row, ['businessName', 'storeName', 'businessTitle'])
}

function serviceLabel(row: Record<string, unknown>) {
  const s = row.service
  if (s && typeof s === 'object' && 'name' in s) {
    const n = (s as { name?: string }).name
    if (n) return n
  }
  return valueOf(row, ['serviceName', 'serviceTitle', 'title'])
}

function descriptionLabel(row: Record<string, unknown>) {
  return valueOf(row, ['description', 'notes', 'note'], '—')
}

function percentLabel(row: Record<string, unknown>) {
  const v = row.discountPercent ?? row.percentage ?? row.discountPercentage
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return `${n}%`
}

function dateStart(row: Record<string, unknown>) {
  return (row.startDate ?? row.validFrom ?? row.fromDate) as string | undefined
}

function dateEnd(row: Record<string, unknown>) {
  return (row.endDate ?? row.validTo ?? row.toDate) as string | undefined
}

function syncOrderDraft() {
  const d: Record<string, number> = { ...orderDraft.value }
  for (const r of rows.value) {
    const id = String(r.id)
    const o = r.displayOrder ?? r.order ?? r.sortOrder
    d[id] = Number(o ?? 0)
  }
  orderDraft.value = d
}

async function load() {
  loading.value = true
  try {
    const res = await getAdminDiscounts({
      status: status.value || undefined,
      page: page.value,
      pageSize,
    })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
    syncOrderDraft()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الخصومات'))
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

async function approve(row: Record<string, unknown>) {
  if (!confirm('قبول هذا العرض؟')) return
  try {
    await approveDiscount(String(row.id))
    toast.success('تم قبول العرض')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

function openReject(row: Record<string, unknown>) {
  rejectRow.value = row
  rejectReason.value = ''
  rejectOpen.value = true
}

async function confirmReject() {
  if (!rejectRow.value?.id) return
  try {
    await rejectDiscount(String(rejectRow.value.id), {
      reason: rejectReason.value.trim() || 'لم يتم تحديد سبب',
    })
    toast.success('تم رفض العرض')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function applyOrder(row: Record<string, unknown>) {
  const id = String(row.id)
  const n = Number(orderDraft.value[id])
  if (Number.isNaN(n) || n < 0) {
    toast.error('أدخل رقماً صحيحاً للترتيب')
    return
  }
  try {
    await updateDiscountOrder(id, n)
    toast.success('تم تحديث الترتيب')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
