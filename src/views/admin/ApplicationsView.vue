<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="f in filters"
            :key="f.value"
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-bold transition"
            :class="status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="setStatus(f.value)"
          >
            {{ f.label }}
          </button>
        </div>
        <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600" @click="load">
          تحديث
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
      empty-text="لا توجد طلبات انضمام"
      show-index
      @page-change="onPage"
    >
      <template #cell-name="{ row }">
        <RouterLink :to="`/applications/${row.id}`" class="font-bold text-blue-600 hover:underline">
          {{ row.businessName ?? row.name ?? '—' }}
        </RouterLink>
        <p class="text-xs text-slate-500">{{ row.ownerName ?? row.userName ?? '—' }}</p>
      </template>
      <template #cell-status="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(row.status)">
          {{ statusLabel(row.status) }}
        </span>
      </template>
      <template #cell-createdAt="{ row }">{{ formatDateShort(row.createdAt as string) }}</template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1.5">
          <RouterLink :to="`/applications/${row.id}`" class="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
            التفاصيل
          </RouterLink>
          <button v-if="row.status === 'Pending'" type="button" class="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700" @click="approve(row)">
            قبول
          </button>
          <button v-if="row.status === 'Pending'" type="button" class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700" @click="openReject(row)">
            رفض
          </button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
      v-model="rejectOpen"
      title="رفض طلب الانضمام"
      message="اكتب سبب الرفض ليتم حفظه مع الطلب"
      confirm-text="رفض الطلب"
      confirm-color="danger"
      @confirm="confirmReject"
    >
      <textarea v-model="rejectReason" rows="3" class="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="سبب الرفض" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { approveApplication, getApplications, rejectApplication } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort } from '@/utils/format'
import { normalizePaged, statusClass, statusLabel } from '@/utils/admin'

const toast = useToast()
const route = useRoute()
const filters = [
  { value: '', label: 'الكل' },
  { value: 'Pending', label: 'معلقة' },
  { value: 'Approved', label: 'مقبولة' },
  { value: 'Rejected', label: 'مرفوضة' },
]
const columns: ColumnDef[] = [
  { key: 'name', label: 'المحل' },
  { key: 'phone', label: 'الهاتف' },
  { key: 'cityName', label: 'المحافظة' },
  { key: 'categoryName', label: 'التصنيف' },
  { key: 'status', label: 'الحالة' },
  { key: 'createdAt', label: 'تاريخ الطلب' },
  { key: 'actions', label: 'إجراءات' },
]

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 15
const status = ref(typeof route.query.status === 'string' ? route.query.status : '')
const rejectOpen = ref(false)
const rejectReason = ref('')
const rejectRow = ref<Record<string, unknown> | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await getApplications({ status: status.value || undefined, page: page.value, pageSize })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل طلبات الانضمام'))
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
  if (!confirm('هل تريد قبول طلب الانضمام؟')) return
  try {
    await approveApplication(String(row.id))
    toast.success('تم قبول الطلب')
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
    await rejectApplication(String(rejectRow.value.id), rejectReason.value || 'لم يتم تحديد سبب')
    toast.success('تم رفض الطلب')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
