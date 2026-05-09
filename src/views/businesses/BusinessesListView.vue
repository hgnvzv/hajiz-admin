<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-[200px] flex-1">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">بحث</label>
          <input
            v-model="search"
            type="search"
            placeholder="اسم المحل أو الهاتف"
            class="w-full rounded-xl border border-border px-4 py-2.5"
            @keyup.enter="applyFilters"
          />
        </div>
        <div class="w-full sm:w-44">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">الحالة</label>
          <select v-model="status" class="w-full rounded-xl border border-border px-3 py-2.5">
            <option value="">الكل</option>
            <option value="pending">بانتظار الموافقة</option>
            <option value="active">نشط</option>
            <option value="suspended">موقوف</option>
          </select>
        </div>
        <div class="w-full sm:w-48">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">التصنيف</label>
          <select v-model="categoryId" class="w-full rounded-xl border border-border px-3 py-2.5">
            <option value="">كل التصنيفات</option>
            <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.nameAr ?? c.nameEn }}</option>
          </select>
        </div>
        <button
          type="button"
          class="rounded-xl bg-primary px-6 py-2.5 font-bold text-white hover:bg-primary-dark"
          @click="applyFilters"
        >
          بحث
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
      empty-text="لا توجد محلات مطابقة للبحث"
      show-index
      @page-change="onPage"
    >
      <template #cell-name="{ row }">
        <div>
          <RouterLink
            :to="`/businesses/${row.id}`"
            class="font-bold text-primary hover:underline"
          >
            {{ row.name }}
          </RouterLink>
          <p class="text-xs text-[#6B7280]">{{ row.ownerName }} • {{ row.phone }}</p>
        </div>
      </template>
      <template #cell-status="{ row }">
        <span
          class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold"
          :class="statusClass(row.status)"
        >
          {{ statusLabel(row.status) }}
        </span>
      </template>
      <template #cell-avgRating="{ row }">
        {{ formatAvg(row.avgRating) }}
      </template>
      <template #cell-createdAt="{ row }">
        {{ formatDateShort(row.createdAt as string) }}
      </template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1">
          <RouterLink
            :to="`/businesses/${row.id}`"
            class="rounded-lg bg-primary-light px-2 py-1 text-xs font-bold text-primary-dark"
            title="عرض"
          >
            👁️
          </RouterLink>
          <button
            v-if="row.status === 'pending'"
            type="button"
            class="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"
            @click="openApprove(row)"
          >
            موافقة
          </button>
          <button
            v-if="row.status === 'active'"
            type="button"
            class="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800"
            @click="openSuspend(row)"
          >
            إيقاف
          </button>
          <button
            v-if="row.status === 'suspended'"
            type="button"
            class="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"
            @click="doActivate(row)"
          >
            تفعيل
          </button>
          <button
            type="button"
            class="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-danger"
            @click="openDelete(row)"
          >
            حذف
          </button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
      v-model="showSuspend"
      title="إيقاف المحل"
      message="أدخل سبب الإيقاف"
      confirm-text="إيقاف"
      confirm-color="danger"
      @confirm="confirmSuspend"
    >
      <textarea
        v-model="suspendReason"
        rows="3"
        class="mt-2 w-full rounded-xl border border-border p-3 text-sm"
        placeholder="السبب"
      />
    </ConfirmModal>

    <ConfirmModal
      v-model="showDelete"
      title="حذف المحل نهائياً"
      message="لا يمكن التراجع عن هذا الإجراء."
      confirm-text="حذف"
      confirm-color="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  getBusinesses,
  getCategories,
  approveBusiness,
  suspendBusiness,
  activateBusiness,
  deleteBusiness,
} from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatDateShort } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const toast = useToast()
const route = useRoute()

const columns: ColumnDef[] = [
  { key: 'name', label: 'المحل' },
  { key: 'categoryName', label: 'التصنيف' },
  { key: 'phone', label: 'الهاتف' },
  { key: 'status', label: 'الحالة' },
  { key: 'totalBookings', label: 'الحجوزات' },
  { key: 'avgRating', label: 'التقييم' },
  { key: 'createdAt', label: 'التسجيل' },
  { key: 'actions', label: 'إجراءات' },
]

const rows = ref<Record<string, unknown>[]>([])
const categories = ref<{ id: string; nameAr?: string; nameEn?: string }[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const search = ref('')
const status = ref('')
const categoryId = ref('')

const showSuspend = ref(false)
const suspendReason = ref('')
const suspendRow = ref<Record<string, unknown> | null>(null)

const showDelete = ref(false)
const deleteRow = ref<Record<string, unknown> | null>(null)

function statusLabel(s: unknown) {
  const m: Record<string, string> = {
    pending: 'بانتظار الموافقة',
    active: 'نشط',
    suspended: 'موقوف',
  }
  return m[String(s)] ?? String(s ?? '—')
}

function formatAvg(v: unknown) {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return n.toFixed(1)
}

function statusClass(s: unknown) {
  const v = String(s)
  if (v === 'active') return 'bg-emerald-50 text-success ring-1 ring-emerald-200'
  if (v === 'pending') return 'bg-amber-50 text-warning ring-1 ring-amber-200'
  if (v === 'suspended') return 'bg-red-50 text-danger ring-1 ring-red-200'
  return 'bg-gray-100 text-gray-700'
}

async function load() {
  loading.value = true
  try {
    const res = await getBusinesses({
      status: status.value || undefined,
      categoryId: categoryId.value || undefined,
      search: search.value || undefined,
      page: page.value,
      pageSize,
    })
    const d = res.data as { items?: Record<string, unknown>[]; total?: number }
    rows.value = d.items ?? []
    total.value = d.total ?? 0
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل المحلات'))
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  load()
}

function onPage(p: number) {
  page.value = p
  load()
}

function openApprove(row: Record<string, unknown>) {
  void (async () => {
    try {
      await approveBusiness(String(row.id))
      toast.success('تمت الموافقة على المحل')
      load()
    } catch (e) {
      toast.error(apiMessage(e))
    }
  })()
}

function openSuspend(row: Record<string, unknown>) {
  suspendRow.value = row
  suspendReason.value = ''
  showSuspend.value = true
}

async function confirmSuspend() {
  if (!suspendRow.value?.id) return
  try {
    await suspendBusiness(String(suspendRow.value.id), suspendReason.value || '—')
    toast.success('تم إيقاف المحل')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function doActivate(row: Record<string, unknown>) {
  try {
    await activateBusiness(String(row.id))
    toast.success('تم تفعيل المحل')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

function openDelete(row: Record<string, unknown>) {
  deleteRow.value = row
  showDelete.value = true
}

async function confirmDelete() {
  if (!deleteRow.value?.id) return
  try {
    await deleteBusiness(String(deleteRow.value.id))
    toast.success('تم حذف المحل')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(async () => {
  const q = route.query.status
  if (typeof q === 'string') status.value = q
  try {
    const c = await getCategories()
    const list = c.data as { id: string; nameAr?: string; nameEn?: string }[]
    categories.value = Array.isArray(list) ? list : []
  } catch {
    categories.value = []
  }
  load()
})

watch(
  () => route.query.status,
  (v) => {
    if (typeof v === 'string') status.value = v
    else status.value = ''
    page.value = 1
    load()
  },
)
</script>
