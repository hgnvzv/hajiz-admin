<template>
  <div class="space-y-6">
    <PageHeader title="تفاصيل العيادة">
      <template #actions>
        <RouterLink to="/medical/clinics" class="btn-secondary">رجوع</RouterLink>
      </template>
    </PageHeader>
    <div v-if="loading" class="rounded-2xl border bg-white py-16"><LoadingSpinner /></div>
    <template v-else-if="item">
      <div class="rounded-2xl border border-teal-100 bg-white p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-2xl font-black">{{ item.nameAr ?? item.name ?? '—' }}</h2>
            <p class="mt-1 text-sm text-slate-500">{{ item.address ?? '—' }}</p>
          </div>
          <DomainBadge :domain-type="item.domainType" />
        </div>
        <dl class="mt-6 grid gap-3 text-sm md:grid-cols-3">
          <div><dt class="text-slate-500">الهاتف</dt><dd class="font-bold">{{ item.phone ?? '—' }}</dd></div>
          <div><dt class="text-slate-500">المحافظة</dt><dd class="font-bold">{{ item.governorateName ?? '—' }}</dd></div>
          <div><dt class="text-slate-500">المنطقة</dt><dd class="font-bold">{{ item.areaName ?? '—' }}</dd></div>
          <div><dt class="text-slate-500">الحالة</dt><dd class="font-bold">{{ item.isActive === false ? 'متوقف' : 'نشط' }}</dd></div>
        </dl>
        <RouterLink :to="`/businesses/${item.businessId ?? item.id}`" class="mt-4 inline-flex rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">
          فتح ملف العمل
        </RouterLink>
      </div>

      <div class="rounded-2xl border bg-white p-6">
        <h3 class="font-black">الأطباء المرتبطون</h3>
        <p v-if="!doctors.length" class="mt-3 text-sm text-slate-500">لا يوجد أطباء في الاستجابة الحالية.</p>
        <ul v-else class="mt-3 space-y-2">
          <li v-for="d in doctors" :key="String(d.id)" class="rounded-xl bg-teal-50 px-3 py-2 text-sm font-bold text-teal-950">
            {{ d.fullName ?? d.nameAr ?? d.name ?? '—' }}
          </li>
        </ul>
      </div>
    </template>
    <p v-else class="rounded-2xl border bg-white p-10 text-center text-slate-500">تعذر تحميل العيادة</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getPublicMedicalClinic } from '@/api/domains'
import DomainBadge from '@/components/common/DomainBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { apiMessage } from '@/utils/error'

const route = useRoute()
const toast = useToast()
const loading = ref(true)
const item = ref<Record<string, unknown> | null>(null)
const doctors = computed(() => {
  const raw = item.value?.doctors ?? item.value?.affiliations
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
})

onMounted(async () => {
  try {
    const res = await getPublicMedicalClinic(String(route.params.id))
    item.value = res.data as Record<string, unknown>
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل العيادة'))
  } finally {
    loading.value = false
  }
})
</script>
