<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <label class="mb-1 block text-xs font-bold text-[#6B7280]">بحث بالاسم أو الهاتف</label>
      <div class="flex flex-wrap gap-2">
        <input
          v-model="search"
          type="search"
          class="min-w-[200px] flex-1 rounded-xl border border-border px-4 py-2.5"
          placeholder="ابحث…"
          @keyup.enter="apply"
        />
        <button type="button" class="rounded-xl bg-primary px-6 py-2.5 font-bold text-white" @click="apply">
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
      empty-text="لا يوجد زبائن"
      show-index
      @page-change="onPage"
    >
      <template #cell-fullName="{ row }">
        <RouterLink :to="`/customers/${row.id}`" class="font-bold text-primary hover:underline">
          {{ row.fullName ?? row.name }}
        </RouterLink>
      </template>
      <template #cell-totalSpent="{ row }">
        {{ formatMoney(row.totalSpent as number) }}
      </template>
      <template #cell-createdAt="{ row }">
        {{ formatDateShort(row.createdAt as string) }}
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="isBlocked(row) ? 'blocked' : 'active'" />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1">
          <RouterLink
            :to="`/customers/${row.id}`"
            class="rounded-lg bg-primary-light px-2 py-1 text-xs font-bold text-primary-dark"
          >
            عرض
          </RouterLink>
          <button
            v-if="!isBlocked(row)"
            type="button"
            class="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-danger"
            @click="openBlock(row)"
          >
            حظر
          </button>
          <button
            v-else
            type="button"
            class="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"
            @click="doUnblock(row)"
          >
            إلغاء الحظر
          </button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal v-model="showBlock" title="حظر الزبون" confirm-text="حظر" confirm-color="danger" @confirm="confirmBlock">
      <textarea v-model="blockReason" rows="3" class="mt-2 w-full rounded-xl border border-border p-3" placeholder="السبب" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getCustomers, blockCustomer, unblockCustomer } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatDateShort, formatMoney } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const toast = useToast()

function isBlocked(row: Record<string, unknown>) {
  return !!(row.isBlocked ?? row.blocked)
}

const columns: ColumnDef[] = [
  { key: 'fullName', label: 'الاسم' },
  { key: 'phone', label: 'الهاتف' },
  { key: 'totalBookings', label: 'الحجوزات' },
  { key: 'totalSpent', label: 'المبلغ الكلي' },
  { key: 'createdAt', label: 'التسجيل' },
  { key: 'status', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const search = ref('')

const showBlock = ref(false)
const blockReason = ref('')
const blockRow = ref<Record<string, unknown> | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await getCustomers({
      search: search.value || undefined,
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

function openBlock(row: Record<string, unknown>) {
  blockRow.value = row
  blockReason.value = ''
  showBlock.value = true
}

async function confirmBlock() {
  if (!blockRow.value?.id) return
  try {
    await blockCustomer(String(blockRow.value.id), blockReason.value || '—')
    toast.success('تم حظر الزبون')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function doUnblock(row: Record<string, unknown>) {
  try {
    await unblockCustomer(String(row.id))
    toast.success('تم إلغاء الحظر')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
