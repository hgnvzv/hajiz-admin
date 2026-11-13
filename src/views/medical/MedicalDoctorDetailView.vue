<template>
  <div class="space-y-6">
    <PageHeader title="تفاصيل الطبيب" description="لا تُعرض السجلات الطبية أو الوصفات في لوحة الإدارة.">
      <template #actions>
        <RouterLink to="/medical/doctors" class="btn-secondary">رجوع</RouterLink>
      </template>
    </PageHeader>
    <div v-if="loading" class="rounded-2xl border bg-white py-16"><LoadingSpinner /></div>
    <template v-else-if="item">
      <div class="rounded-2xl border border-cyan-100 bg-white p-6">
        <div class="flex flex-wrap justify-between gap-3">
          <h2 class="text-2xl font-black">{{ item.fullName ?? item.nameAr ?? item.name ?? '—' }}</h2>
          <DomainBadge :domain-type="item.domainType" />
        </div>
        <dl class="mt-6 grid gap-3 text-sm md:grid-cols-3">
          <div><dt class="text-slate-500">الهاتف</dt><dd class="font-bold">{{ item.phone ?? '—' }}</dd></div>
          <div><dt class="text-slate-500">الحالة</dt><dd class="font-bold">{{ item.isActive === false ? 'متوقف' : 'نشط' }}</dd></div>
          <div><dt class="text-slate-500">عيادات مرتبطة</dt><dd class="font-bold">{{ clinics.length }}</dd></div>
        </dl>
      </div>
      <div class="rounded-2xl border bg-white p-6">
        <h3 class="font-black">الجداول (إن وُجدت في الاستجابة)</h3>
        <p v-if="!schedules.length" class="mt-3 text-sm text-slate-500">لا توجد جداول في هذه الاستجابة.</p>
        <ul v-else class="mt-3 space-y-2 text-sm">
          <li v-for="(s, i) in schedules" :key="i" class="rounded-xl bg-cyan-50 px-3 py-2">
            {{ s.dayOfWeek ?? s.day }} — {{ s.startTime }} / {{ s.endTime }}
          </li>
        </ul>
      </div>
      <p class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        السجلات الطبية والتشخيصات والوصفات غير معروضة — لا توجد صلاحية أدمن عامة لهذه البيانات في العقد الحالي.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getPublicMedicalDoctor } from '@/api/domains'
import DomainBadge from '@/components/common/DomainBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { apiMessage } from '@/utils/error'

const route = useRoute()
const toast = useToast()
const loading = ref(true)
const item = ref<Record<string, unknown> | null>(null)
const clinics = computed(() => {
  const raw = item.value?.clinics ?? item.value?.affiliations
  return Array.isArray(raw) ? raw : []
})
const schedules = computed(() => {
  const raw = item.value?.schedules
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
})

onMounted(async () => {
  try {
    const res = await getPublicMedicalDoctor(String(route.params.id))
    item.value = res.data as Record<string, unknown>
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الطبيب'))
  } finally {
    loading.value = false
  }
})
</script>
