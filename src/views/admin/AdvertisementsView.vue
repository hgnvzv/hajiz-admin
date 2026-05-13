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
      empty-text="لا توجد إعلانات"
      show-index
      @page-change="onPage"
    >
      <template #cell-thumbnail="{ row }">
        <a
          v-if="imageUrl(row)"
          :href="imageUrl(row)!"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block"
        >
          <img
            :src="imageUrl(row)!"
            alt=""
            class="h-14 w-20 rounded-lg border border-slate-200 object-cover"
            loading="lazy"
          />
        </a>
        <div
          v-else
          class="flex h-14 w-20 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400"
        >
          —
        </div>
      </template>
      <template #cell-businessName="{ row }">
        <p class="font-bold text-slate-900">{{ businessLabel(row) }}</p>
      </template>
      <template #cell-title="{ row }">
        {{ valueOf(row, ['title', 'headline']) }}
      </template>
      <template #cell-durationDays="{ row }">
        {{ durationDays(row) }}
      </template>
      <template #cell-cost="{ row }">{{ formatMoney(costAmount(row)) }}</template>
      <template #cell-startDate="{ row }">{{ formatDateShort(startDate(row)) }}</template>
      <template #cell-endDate="{ row }">{{ formatDateShort(endDate(row)) }}</template>
      <template #cell-status="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="advertisementStatusClass(row.status)">
          {{ advertisementStatusLabel(row.status) }}
        </span>
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
      title="رفض الإعلان"
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
import { approveAdvertisement, getAdminAdvertisements, rejectAdvertisement } from '@/api'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort, formatMoney } from '@/utils/format'
import {
  advertisementStatusClass,
  advertisementStatusLabel,
  normalizePaged,
  numberOf,
  valueOf,
} from '@/utils/admin'

const toast = useToast()
const filters = [
  { value: '', label: 'الكل' },
  { value: 'Pending', label: 'معلق' },
  { value: 'Approved', label: 'مقبول' },
  { value: 'Active', label: 'نشط' },
  { value: 'Rejected', label: 'مرفوض' },
  { value: 'Expired', label: 'منتهي' },
]
const columns: ColumnDef[] = [
  { key: 'thumbnail', label: 'صورة' },
  { key: 'businessName', label: 'المحل' },
  { key: 'title', label: 'العنوان' },
  { key: 'durationDays', label: 'المدة (أيام)' },
  { key: 'cost', label: 'التكلفة' },
  { key: 'startDate', label: 'تاريخ البدء' },
  { key: 'endDate', label: 'تاريخ الانتهاء' },
  { key: 'status', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const status = ref('')
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

function imageUrl(row: Record<string, unknown>): string | null {
  const u = row.imageUrl ?? row.image ?? row.thumbnailUrl ?? row.photoUrl
  if (typeof u === 'string' && u.length > 0) return u
  return null
}

function durationDays(row: Record<string, unknown>) {
  const n = numberOf(row, ['durationDays', 'duration', 'days'])
  return n > 0 ? String(n) : '—'
}

function costAmount(row: Record<string, unknown>) {
  const direct = row.totalCost ?? row.cost ?? row.amount ?? row.price
  if (direct != null && direct !== '') {
    const x = Number(direct)
    if (!Number.isNaN(x)) return x
  }
  const days = numberOf(row, ['durationDays', 'duration', 'days'], 0)
  const perDay = numberOf(row, ['pricePerDay', 'dailyPrice', 'adPricePerDay'], 0)
  if (days > 0 && perDay > 0) return days * perDay
  return null
}

function startDate(row: Record<string, unknown>) {
  return (row.startDate ?? row.startsAt ?? row.approvedStartDate) as string | undefined
}

function endDate(row: Record<string, unknown>) {
  return (row.endDate ?? row.endsAt ?? row.expiresAt ?? row.approvedEndDate) as string | undefined
}

async function load() {
  loading.value = true
  try {
    const res = await getAdminAdvertisements({
      status: status.value || undefined,
      page: page.value,
      pageSize,
    })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الإعلانات'))
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
  if (!confirm('قبول هذا الإعلان؟ سيتم ضبط تواريخ البدء والانتهاء تلقائياً.')) return
  try {
    await approveAdvertisement(String(row.id))
    toast.success('تم قبول الإعلان')
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
    await rejectAdvertisement(String(rejectRow.value.id), {
      reason: rejectReason.value.trim() || 'لم يتم تحديد سبب',
    })
    toast.success('تم رفض الإعلان')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
