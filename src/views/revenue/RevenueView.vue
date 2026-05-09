<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-3">
        <div class="w-full sm:w-40">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">من</label>
          <input v-model="dateFrom" type="date" class="w-full rounded-xl border border-border px-3 py-2.5" />
        </div>
        <div class="w-full sm:w-40">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">إلى</label>
          <input v-model="dateTo" type="date" class="w-full rounded-xl border border-border px-3 py-2.5" />
        </div>
        <div class="min-w-[200px] flex-1">
          <label class="mb-1 block text-xs font-bold text-[#6B7280]">محل (اختياري)</label>
          <select v-model="businessId" class="w-full rounded-xl border border-border px-3 py-2.5">
            <option value="">الكل</option>
            <option v-for="b in businessOptions" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
        <button type="button" class="rounded-xl bg-primary px-6 py-2.5 font-bold text-white" @click="load">
          تطبيق
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />
    <template v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p class="text-sm text-[#6B7280]">إجمالي الإيرادات</p>
          <p class="mt-2 text-3xl font-black text-primary">{{ formatMoney(data?.totalRevenue as number) }}</p>
        </div>
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p class="text-sm text-[#6B7280]">عمولة المنصة (٪٥)</p>
          <p class="mt-2 text-3xl font-black text-success">{{ formatMoney(data?.totalCommission as number) }}</p>
        </div>
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p class="text-sm text-[#6B7280]">عدد الحجوزات المكتملة</p>
          <p class="mt-2 text-3xl font-black text-[#1A1A2E]">{{ completedCount }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 class="mb-4 font-black text-[#1A1A2E]">الإيرادات والعمولة حسب الشهر</h2>
        <div class="h-72">
          <BarChart
            v-if="monthLabels.length"
            :labels="monthLabels"
            :revenue="monthRevenue"
            :commission="monthCommission"
          />
          <p v-else class="py-12 text-center text-[#6B7280]">لا توجد بيانات</p>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface shadow-sm">
        <div class="border-b border-border px-5 py-4 font-black">حسب المحل</div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">المحل</th>
                <th class="px-4 py-3">الحجوزات</th>
                <th class="px-4 py-3">الإيرادات</th>
                <th class="px-4 py-3">العمولة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="!byBiz.length">
                <td colspan="4" class="px-4 py-10 text-center text-[#6B7280]">لا توجد بيانات</td>
              </tr>
              <tr v-for="r in byBiz" :key="r.businessId">
                <td class="px-4 py-3 font-bold">{{ r.businessName }}</td>
                <td class="px-4 py-3">{{ r.bookingCount ?? '—' }}</td>
                <td class="px-4 py-3">{{ formatMoney(r.totalRevenue) }}</td>
                <td class="px-4 py-3">{{ formatMoney(r.commission) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface shadow-sm">
        <div class="border-b border-border px-5 py-4 font-black">حسب التصنيف</div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">التصنيف</th>
                <th class="px-4 py-3">الإيرادات</th>
                <th class="px-4 py-3">العمولة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="!byCat.length">
                <td colspan="3" class="px-4 py-10 text-center text-[#6B7280]">لا توجد بيانات</td>
              </tr>
              <tr v-for="(r, i) in byCat" :key="i">
                <td class="px-4 py-3 font-bold">{{ r.categoryName }}</td>
                <td class="px-4 py-3">{{ formatMoney(r.revenue) }}</td>
                <td class="px-4 py-3">{{ formatMoney(r.commission) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getRevenue, getBusinesses } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { formatMoney } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const toast = useToast()

const loading = ref(true)
const data = ref<Record<string, unknown> | null>(null)
const dateFrom = ref('')
const dateTo = ref('')
const businessId = ref('')
const businessOptions = ref<{ id: string; name: string }[]>([])

const byBiz = computed(() => {
  const r = data.value?.byBusiness
  return Array.isArray(r) ? r : []
})

const byCat = computed(() => {
  const r = data.value?.byCategory
  return Array.isArray(r) ? r : []
})

const monthLabels = computed(() => {
  const r = data.value?.byMonth
  if (!Array.isArray(r)) return [] as string[]
  return r.map((x: { month?: string }) => String(x.month ?? ''))
})

const monthRevenue = computed(() => {
  const r = data.value?.byMonth
  if (!Array.isArray(r)) return [] as number[]
  return r.map((x: { revenue?: number }) => Number(x.revenue ?? 0))
})

const monthCommission = computed(() => {
  const r = data.value?.byMonth
  if (!Array.isArray(r)) return [] as number[]
  return r.map((x: { commission?: number }) => Number(x.commission ?? 0))
})

const completedCount = computed(() => {
  const raw =
    data.value?.completedBookings ??
    data.value?.completedBookingCount ??
    data.value?.totalCompletedBookings
  if (raw != null && raw !== '') return Number(raw)
  let sum = 0
  for (const r of byBiz.value) {
    sum += Number((r as { bookingCount?: number }).bookingCount ?? 0)
  }
  return sum || '—'
})

async function loadBusinesses() {
  try {
    const res = await getBusinesses({ page: 1, pageSize: 500 })
    const d = res.data as { items?: { id: string; name: string }[] }
    businessOptions.value = (d.items ?? []).map((x) => ({ id: String(x.id), name: x.name }))
  } catch {
    businessOptions.value = []
  }
}

async function load() {
  loading.value = true
  try {
    const res = await getRevenue({
      dateFrom: dateFrom.value || undefined,
      dateTo: dateTo.value || undefined,
      businessId: businessId.value || undefined,
    })
    data.value = res.data as Record<string, unknown>
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadBusinesses()
  load()
})
</script>
