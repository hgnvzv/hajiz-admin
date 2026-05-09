<template>
  <div class="space-y-6" dir="rtl">
    <div class="grid gap-3 md:grid-cols-3">
      <RouterLink
        to="/applications?status=Pending"
        class="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm transition hover:bg-amber-100"
      >
        <span class="font-bold">طلبات انضمام معلقة: {{ pendingApplications }}</span>
        <span class="text-xl">←</span>
      </RouterLink>
      <RouterLink
        to="/craftsmen?status=Pending"
        class="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm transition hover:bg-amber-100"
      >
        <span class="font-bold">طلبات حرفيين معلقة: {{ pendingCraftsmen }}</span>
        <span class="text-xl">←</span>
      </RouterLink>
      <RouterLink
        to="/complaints?status=Open"
        class="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900 shadow-sm transition hover:bg-blue-100"
      >
        <span class="font-bold">شكاوى مفتوحة: {{ openComplaints }}</span>
        <span class="text-xl">←</span>
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard title="إجمالي المحلات" :value="data?.totalBusinesses ?? 0" color="primary">
        <template #icon><BuildingStorefrontIcon class="h-8 w-8 text-white" /></template>
      </StatsCard>
      <StatsCard title="طلبات انضمام معلقة" :value="pendingApplications" color="warning">
        <template #icon><ClockIcon class="h-8 w-8 text-white" /></template>
      </StatsCard>
      <StatsCard title="إجمالي الزبائن" :value="data?.totalCustomers ?? 0" color="success">
        <template #icon><UsersIcon class="h-8 w-8 text-white" /></template>
      </StatsCard>
      <StatsCard title="إجمالي الحرفيين" :value="totalCraftsmen" color="primary">
        <template #icon><span class="text-3xl">🔧</span></template>
      </StatsCard>
      <StatsCard title="حجوزات اليوم" :value="data?.todayBookings ?? 0" color="primary">
        <template #icon><CalendarDaysIcon class="h-8 w-8 text-white" /></template>
      </StatsCard>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p class="text-sm font-medium text-[#6B7280]">إجمالي الحجوزات</p>
        <p class="mt-2 text-2xl font-black text-primary">{{ formatMoney(data?.totalBookings ?? data?.monthRevenue) }}</p>
      </div>
      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p class="text-sm font-medium text-[#6B7280]">إجمالي العمولات</p>
        <p class="mt-2 text-2xl font-black text-success">{{ formatMoney(data?.totalCommissions ?? data?.monthCommission) }}</p>
      </div>
      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p class="text-sm font-medium text-[#6B7280]">عمولات معلقة</p>
        <p class="mt-2 text-2xl font-black text-[#1A1A2E]">{{ formatMoney(data?.pendingCommissions ?? data?.totalRevenue) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 class="mb-4 text-lg font-black text-[#1A1A2E]">الحجوزات آخر 30 يوم</h2>
        <div class="h-72">
          <LineChart
            v-if="!loading && bookingLabels.length"
            :labels="bookingLabels"
            :values="bookingValues"
            label="عدد الحجوزات"
          />
          <div v-else-if="loading" class="flex h-72 items-center justify-center">
            <LoadingSpinner />
          </div>
          <p v-else class="py-12 text-center text-[#6B7280]">لا توجد بيانات كافية للرسم</p>
        </div>
      </div>
      <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 class="mb-4 text-lg font-black text-[#1A1A2E]">الإيرادات الشهرية</h2>
        <div class="h-72">
          <BarChart
            v-if="!loading && revenueLabels.length"
            :labels="revenueLabels"
            :revenue="revenueBars"
            :commission="commissionBars"
          />
          <div v-else-if="loading" class="flex h-72 items-center justify-center">
            <LoadingSpinner />
          </div>
          <p v-else class="py-12 text-center text-[#6B7280]">لا توجد بيانات كافية للرسم</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div class="rounded-2xl border border-border bg-surface shadow-sm">
        <div class="border-b border-border px-5 py-4">
          <h2 class="text-lg font-black text-[#1A1A2E]">آخر الحجوزات</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[320px] text-right text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">المحل</th>
                <th class="px-4 py-3">الزبون</th>
                <th class="px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="loading">
                <td colspan="3" class="py-10"><LoadingSpinner inline /></td>
              </tr>
              <tr v-else-if="!recent.length">
                <td colspan="3" class="px-4 py-10 text-center text-[#6B7280]">لا توجد حجوزات حديثة</td>
              </tr>
              <tr v-for="b in recent" v-else :key="b.id" class="hover:bg-primary-light/30">
                <td class="px-4 py-3 font-semibold">{{ b.businessName ?? '—' }}</td>
                <td class="px-4 py-3">{{ b.customerName ?? '—' }}</td>
                <td class="px-4 py-3">
                  <StatusBadge :status="String(b.status ?? 'pending')" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface shadow-sm">
        <div class="border-b border-border px-5 py-4">
          <h2 class="text-lg font-black text-[#1A1A2E]">أفضل المحلات</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[320px] text-right text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">المحل</th>
                <th class="px-4 py-3">الإيرادات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="loading">
                <td colspan="2" class="py-10"><LoadingSpinner inline /></td>
              </tr>
              <tr v-else-if="!top.length">
                <td colspan="2" class="px-4 py-10 text-center text-[#6B7280]">لا توجد بيانات</td>
              </tr>
              <tr v-for="t in top" v-else :key="t.businessId ?? t.id" class="hover:bg-primary-light/30">
                <td class="px-4 py-3 font-semibold">{{ t.businessName ?? t.name ?? '—' }}</td>
                <td class="px-4 py-3 font-bold text-primary">{{ formatMoney(t.totalRevenue ?? t.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  BuildingStorefrontIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/vue/24/solid'
import { getApplications, getComplaints, getCraftsmen, getDashboard } from '@/api'
import StatsCard from '@/components/common/StatsCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { formatMoney } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const toast = useToast()

interface DashboardPayload {
  pendingBusinesses?: number
  pendingApplications?: number
  totalBusinesses?: number
  totalCustomers?: number
  totalBookings?: number
  totalCommissions?: number
  pendingCommissions?: number
  todayBookings?: number
  monthRevenue?: number
  monthCommission?: number
  totalRevenue?: number
  recentBookings?: unknown[]
  topBusinesses?: unknown[]
  bookingsByDay?: { date?: string; count?: number }[]
  revenueByMonth?: { month?: string; revenue?: number; commission?: number }[]
}

const loading = ref(true)
const data = ref<DashboardPayload | null>(null)
const pendingApplications = ref(0)
const pendingCraftsmen = ref(0)
const openComplaints = ref(0)
const totalCraftsmen = ref(0)

interface RecentBookingRow {
  id?: string
  businessName?: string
  customerName?: string
  status?: string
}

interface TopBizRow {
  businessId?: string
  id?: string
  businessName?: string
  name?: string
  totalRevenue?: number
  revenue?: number
}

const recent = computed((): RecentBookingRow[] => {
  const r = data.value?.recentBookings
  return Array.isArray(r) ? (r as RecentBookingRow[]) : []
})

const top = computed((): TopBizRow[] => {
  const r = data.value?.topBusinesses
  return Array.isArray(r) ? (r as TopBizRow[]) : []
})

const bookingLabels = computed(() => {
  const raw = data.value?.bookingsByDay
  if (!Array.isArray(raw)) return [] as string[]
  return raw.map((x: { date?: string }) => (x.date ?? '').slice(0, 10))
})

const bookingValues = computed(() => {
  const raw = data.value?.bookingsByDay
  if (!Array.isArray(raw)) return [] as number[]
  return raw.map((x: { count?: number }) => Number(x.count ?? 0))
})

const revenueLabels = computed(() => {
  const raw = data.value?.revenueByMonth
  if (!Array.isArray(raw)) return [] as string[]
  return raw.map((x: { month?: string }) => String(x.month ?? ''))
})

const revenueBars = computed(() => {
  const raw = data.value?.revenueByMonth
  if (!Array.isArray(raw)) return [] as number[]
  return raw.map((x: { revenue?: number }) => Number(x.revenue ?? 0))
})

const commissionBars = computed(() => {
  const raw = data.value?.revenueByMonth
  if (!Array.isArray(raw)) return [] as number[]
  return raw.map((x: { commission?: number }) => Number(x.commission ?? 0))
})

onMounted(async () => {
  loading.value = true
  try {
    const [statsRes, appsRes, craftsmenRes, complaintsRes, allCraftsmenRes] = await Promise.all([
      getDashboard(),
      getApplications({ status: 'Pending', page: 1, pageSize: 1 }),
      getCraftsmen({ status: 'Pending', page: 1, pageSize: 1 }),
      getComplaints({ status: 'Open', page: 1, pageSize: 1 }),
      getCraftsmen({ page: 1, pageSize: 1 }),
    ])
    data.value = statsRes.data as DashboardPayload
    const apps = appsRes.data as { total?: number; totalCount?: number }
    const craftsmen = craftsmenRes.data as { total?: number; totalCount?: number }
    const complaints = complaintsRes.data as { total?: number; totalCount?: number }
    const allCraftsmen = allCraftsmenRes.data as { total?: number; totalCount?: number }
    pendingApplications.value = Number(apps.total ?? apps.totalCount ?? data.value.pendingApplications ?? data.value.pendingBusinesses ?? 0)
    pendingCraftsmen.value = Number(craftsmen.total ?? craftsmen.totalCount ?? 0)
    openComplaints.value = Number(complaints.total ?? complaints.totalCount ?? 0)
    totalCraftsmen.value = Number(allCraftsmen.total ?? allCraftsmen.totalCount ?? 0)
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل لوحة التحكم'))
  } finally {
    loading.value = false
  }
})
</script>
