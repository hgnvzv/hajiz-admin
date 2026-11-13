<template>
  <div class="space-y-6">
    <PageHeader title="المواعيد الطبية" description="لا توجد واجهة أدمن مخصصة للمواعيد. تُعرض الحجوزات العامة مع الحقول الطبية إن وُجدت. السجلات الطبية مخفية." />
    <div class="rounded-2xl border border-brand/20 bg-brand-light px-4 py-3 text-sm text-brand-dark">
      لا توجد واجهة أدمن مخصصة للمواعيد الطبية في العقد الحالي. تُعرض الحجوزات العامة من
      <code class="font-mono">GET /admin/bookings</code>
      مع إظهار الحقول الطبية فقط إن وُجدت في الاستجابة. السجلات الطبية والوصفات مخفية.
    </div>
    <div class="rounded-2xl border bg-white p-4">
      <div class="flex flex-wrap gap-3">
        <input v-model="date" type="date" class="rounded-xl border px-3 py-2.5" @change="load" />
        <input v-model="businessId" class="min-w-[220px] flex-1 rounded-xl border px-3 py-2.5" placeholder="معرّف العيادة (businessId)" />
        <button type="button" class="rounded-xl bg-teal-700 px-5 py-2.5 font-bold text-white" @click="load">بحث</button>
      </div>
    </div>
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="total" :page="page" :page-size="pageSize" empty-text="لا توجد مواعيد/حجوزات مطابقة" show-index @page-change="onPage">
      <template #cell-createdAt="{ row }">{{ formatDateShort(String(row.appointmentDate ?? row.bookedAt ?? row.createdAt ?? '')) }}</template>
      <template #cell-status="{ row }">{{ statusLabel(row.status) }}</template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getBookings } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { normalizePaged, statusLabel } from '@/utils/admin'
import { apiMessage } from '@/utils/error'
import { formatDateShort } from '@/utils/format'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'customerName', label: 'المريض / الزبون' },
  { key: 'doctorName', label: 'الطبيب' },
  { key: 'clinicName', label: 'العيادة' },
  { key: 'businessName', label: 'النشاط' },
  { key: 'createdAt', label: 'التاريخ' },
  { key: 'medicalVisitType', label: 'نوع الزيارة' },
  { key: 'status', label: 'الحالة' },
  { key: 'consultationFee', label: 'أجر الاستشارة' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const date = ref('')
const businessId = ref('')

async function load() {
  loading.value = true
  try {
    const res = await getBookings({
      page: page.value,
      pageSize,
      date: date.value || undefined,
      businessId: businessId.value || undefined,
    })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل المواعيد'))
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
