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
        <div class="w-full sm:w-48">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">المحافظة</label>
          <input v-model="city" class="w-full rounded-xl border border-border px-3 py-2.5" placeholder="Baghdad" />
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
            {{ row.name || '—' }}
          </RouterLink>
          <p class="text-xs text-[#6B7280]">{{ row.ownerName }} • {{ row.phone }}</p>
        </div>
      </template>
      <template #cell-primaryImage="{ row }">
        <img
          v-if="row.primaryImage"
          :src="String(row.primaryImage)"
          alt="صورة المحل"
          class="h-12 w-16 rounded-xl object-cover"
        />
        <span v-else class="text-xs text-slate-400">لا توجد</span>
      </template>
      <template #cell-category="{ row }">{{ row.category ?? '—' }}</template>
      <template #cell-isApproved="{ row }">
        <span
          class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold"
          :class="row.isApproved ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'"
        >
          {{ row.isApproved ? 'موافق عليه' : 'بانتظار الموافقة' }}
        </span>
      </template>
      <template #cell-isActive="{ row }">
        <span
          class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold"
          :class="row.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'"
        >
          {{ row.isActive ? 'نشط' : 'متوقف' }}
        </span>
      </template>
      <template #cell-avgRating="{ row }">
        {{ formatAvg(row.avgRating) }} ({{ row.totalReviews ?? 0 }})
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
          <button type="button" class="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800" @click="toggle(row)">
            {{ row.isActive ? 'إيقاف' : 'تفعيل' }}
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
  toggleBusiness,
  deleteBusiness,
} from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatDateShort } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const toast = useToast()
const route = useRoute()

const columns: ColumnDef[] = [
  { key: 'primaryImage', label: 'الصورة' },
  { key: 'name', label: 'المحل' },
  { key: 'category', label: 'التصنيف' },
  { key: 'city', label: 'المحافظة' },
  { key: 'phone', label: 'الهاتف' },
  { key: 'isApproved', label: 'الموافقة' },
  { key: 'isActive', label: 'النشاط' },
  { key: 'avgRating', label: 'التقييم والمراجعات' },
  { key: 'createdAt', label: 'التسجيل' },
  { key: 'actions', label: 'إجراءات' },
]

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const search = ref('')
const status = ref('')
const city = ref('')

const showDelete = ref(false)
const deleteRow = ref<Record<string, unknown> | null>(null)

function formatAvg(v: unknown) {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return n.toFixed(1)
}

async function load() {
  loading.value = true
  try {
    const res = await getBusinesses({
      search: search.value || undefined,
      city: city.value || undefined,
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

async function toggle(row: Record<string, unknown>) {
  try {
    await toggleBusiness(String(row.id))
    toast.success('تم تحديث حالة المحل')
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
