<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-wrap gap-2">
          <button v-for="f in filters" :key="f.value" type="button" class="rounded-xl px-4 py-2 text-sm font-bold" :class="status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'" @click="setStatus(f.value)">
            {{ f.label }}
          </button>
        </div>
        <div class="min-w-[220px] flex-1">
          <input v-model="search" type="search" class="w-full rounded-xl border border-slate-200 px-4 py-2.5" placeholder="بحث بالاسم أو الهاتف" @keyup.enter="apply" />
        </div>
        <button type="button" class="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white" @click="apply">بحث</button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      empty-text="لا توجد حسابات حرفيين"
      show-index
      @page-change="onPage"
    >
      <template #cell-fullName="{ row }">
        <RouterLink :to="`/craftsmen/${row.id}`" class="font-bold text-blue-600 hover:underline">
          {{ row.fullName ?? row.name ?? '—' }}
        </RouterLink>
      </template>
      <template #cell-city="{ row }">
        {{ row.city ?? row.cityName ?? '—' }}
      </template>
      <template #cell-professions="{ row }">
        <div class="flex flex-wrap items-center gap-1">
          <span class="font-bold text-slate-800">{{ professionsCount(row) }}</span>
          <span v-if="professionsCount(row) === 3" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">3/3</span>
          <span v-if="professionsCount(row) > 3" class="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">تجاوز الحد</span>
        </div>
      </template>
      <template #cell-creditsBalance="{ row }">
        <span v-if="row.creditsBalance != null" class="font-bold text-violet-800">{{ formatCredits(row.creditsBalance) }}</span>
        <span v-else class="text-slate-400">—</span>
      </template>
      <template #cell-createdAt="{ row }">
        {{ formatDateShort(row.createdAt as string) }}
      </template>
      <template #cell-status="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(row.status)">
          {{ statusLabel(row.status) }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1.5">
          <RouterLink :to="`/craftsmen/${row.id}`" class="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">تفاصيل</RouterLink>
          <button v-if="row.status === 'Pending'" type="button" class="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700" @click="approve(row)">قبول</button>
          <button v-if="row.status === 'Pending'" type="button" class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700" @click="openReject(row)">رفض</button>
          <button type="button" class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700" @click="toggle(row)">
            {{ row.isActive === false ? 'تفعيل' : 'إيقاف' }}
          </button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal v-model="rejectOpen" title="رفض الحرفي" confirm-text="رفض" confirm-color="danger" @confirm="confirmReject">
      <textarea v-model="rejectReason" rows="3" class="mt-2 w-full rounded-xl border p-3" placeholder="سبب الرفض (مطلوب)" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { approveCraftsman, getCraftsmen, rejectCraftsman, toggleCraftsman } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { apiMessage } from '@/utils/error'
import { formatCredits, formatDateShort } from '@/utils/format'
import { normalizePaged, statusClass, statusLabel } from '@/utils/admin'
import { welcomeCreditsApproveMessage } from '@/utils/settings'

const toast = useToast()
const filters = [
  { value: '', label: 'الكل' },
  { value: 'Pending', label: 'معلقة' },
  { value: 'Approved', label: 'مقبولة' },
  { value: 'Rejected', label: 'مرفوضة' },
]
const columns: ColumnDef[] = [
  { key: 'fullName', label: 'الاسم' },
  { key: 'phone', label: 'الهاتف' },
  { key: 'city', label: 'المحافظة' },
  { key: 'status', label: 'الحالة' },
  { key: 'professions', label: 'عدد الحرف' },
  { key: 'creditsBalance', label: 'رصيد Credits' },
  { key: 'createdAt', label: 'تاريخ التسجيل' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const status = ref('')
const search = ref('')
const rejectOpen = ref(false)
const rejectReason = ref('')
const rejectRow = ref<Record<string, unknown> | null>(null)

function professionsCount(row: Record<string, unknown>) {
  const raw = row.professions
  if (!Array.isArray(raw)) return 0
  return raw.length
}

async function load() {
  loading.value = true
  try {
    const res = await getCraftsmen({ status: status.value || undefined, search: search.value || undefined, page: page.value, pageSize })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الحرفيين'))
  } finally {
    loading.value = false
  }
}

function setStatus(v: string) {
  status.value = v
  apply()
}

function apply() {
  page.value = 1
  load()
}

function onPage(p: number) {
  page.value = p
  load()
}

async function approve(row: Record<string, unknown>) {
  if (!confirm('هل تريد قبول الحرفي؟')) return
  try {
    await approveCraftsman(String(row.id))
    toast.success(await welcomeCreditsApproveMessage('الحرفي'))
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
  if (!rejectReason.value.trim()) {
    toast.warning('يرجى كتابة سبب الرفض')
    rejectOpen.value = true
    return
  }
  try {
    await rejectCraftsman(String(rejectRow.value.id), rejectReason.value.trim())
    toast.success('تم رفض الحرفي')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function toggle(row: Record<string, unknown>) {
  try {
    await toggleCraftsman(String(row.id))
    toast.success('تم تحديث حالة الحرفي')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
