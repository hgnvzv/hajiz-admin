<template>
  <div class="space-y-6">
    <PageHeader title="الأطباء المستقلون" description="الواجهة العامة مع independentOnly. المجال IndependentDoctor من الباكند." />
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="total" :page="page" :page-size="pageSize" empty-text="لا يوجد أطباء مستقلون" show-index @page-change="onPage">
      <template #cell-name="{ row }">
        <RouterLink :to="`/medical/doctors/${row.id ?? row.doctorProfileId}`" class="font-bold text-cyan-800 hover:underline">
          {{ row.fullName ?? row.nameAr ?? row.name ?? '—' }}
        </RouterLink>
      </template>
      <template #cell-specialties="{ row }">{{ specialtyText(row) }}</template>
      <template #cell-domain="{ row }">
        <DomainBadge :domain-type="row.domainType" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getPublicMedicalDoctors } from '@/api/domains'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import DomainBadge from '@/components/common/DomainBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { normalizePaged } from '@/utils/admin'
import { apiMessage } from '@/utils/error'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'name', label: 'الطبيب' },
  { key: 'specialties', label: 'التخصصات' },
  { key: 'domain', label: 'المجال' },
  { key: 'phone', label: 'الهاتف' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20

function specialtyText(row: Record<string, unknown>) {
  const raw = row.specialties ?? row.specialtyNames
  if (Array.isArray(raw)) {
    return raw
      .map((s) => (typeof s === 'string' ? s : String((s as Record<string, unknown>).nameAr ?? (s as Record<string, unknown>).name ?? '')))
      .filter(Boolean)
      .join('، ') || '—'
  }
  return String(row.specialtyName ?? '—')
}

async function load() {
  loading.value = true
  try {
    const res = await getPublicMedicalDoctors({ independentOnly: true, page: page.value, pageSize })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الأطباء'))
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
