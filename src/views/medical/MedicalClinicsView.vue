<template>
  <div class="space-y-6">
    <PageHeader title="العيادات" description="قائمة العيادات من الواجهة العامة للمجال Clinic." />
    <p class="text-sm text-app-muted">لا يُستنتج المجال من اسم التصنيف.</p>
    <div class="rounded-2xl border bg-white p-4">
      <div class="flex flex-wrap gap-3">
        <input v-model="search" type="search" class="min-w-[200px] flex-1 rounded-xl border px-4 py-2.5" placeholder="بحث بالاسم" @keyup.enter="load" />
        <button type="button" class="rounded-xl bg-teal-700 px-5 py-2.5 font-bold text-white" @click="load">بحث</button>
      </div>
    </div>
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="total" :page="page" :page-size="pageSize" empty-text="لا توجد عيادات" show-index @page-change="onPage">
      <template #cell-name="{ row }">
        <RouterLink :to="`/medical/clinics/${row.businessId ?? row.id}`" class="font-bold text-teal-800 hover:underline">
          {{ row.nameAr ?? row.name ?? '—' }}
        </RouterLink>
        <p class="text-xs text-slate-500">{{ row.ownerName ?? '' }}</p>
      </template>
      <template #cell-domain="{ row }">
        <DomainBadge :domain-type="row.domainType" />
      </template>
      <template #cell-actions="{ row }">
        <RouterLink :to="`/medical/clinics/${row.businessId ?? row.id}`" class="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-800">تفاصيل</RouterLink>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getPublicMedicalClinics } from '@/api/domains'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import DomainBadge from '@/components/common/DomainBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { normalizePaged } from '@/utils/admin'
import { apiMessage } from '@/utils/error'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'name', label: 'العيادة' },
  { key: 'domain', label: 'المجال' },
  { key: 'governorateName', label: 'المحافظة' },
  { key: 'areaName', label: 'المنطقة' },
  { key: 'phone', label: 'الهاتف' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const search = ref('')

async function load() {
  loading.value = true
  try {
    const res = await getPublicMedicalClinics({ page: page.value, pageSize, search: search.value || undefined })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل العيادات'))
  } finally {
    loading.value = false
  }
}

function onPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>
