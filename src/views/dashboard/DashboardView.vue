<template>
  <div class="space-y-6" :dir="dir">
    <PageHeader :title="t('dash.title')" :description="t('dash.desc')">
      <template #actions>
        <RouterLink to="/applications?status=Pending" class="btn-primary">{{ t('dash.quickApps') }}</RouterLink>
        <RouterLink to="/restaurants" class="btn-secondary">{{ t('dash.quickRestaurants') }}</RouterLink>
        <RouterLink to="/medical/clinics" class="btn-secondary">{{ t('dash.quickClinics') }}</RouterLink>
      </template>
    </PageHeader>

    <ErrorBanner v-if="error" :message="error" :retry="load" :retry-label="t('common.retry')" />

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard :title="t('dash.pendingApps')" :value="pendingApplications" :failed="failed.apps" color="warning" to="/applications?status=Pending" />
      <StatsCard :title="t('dash.businesses')" :value="data?.totalBusinesses ?? null" :failed="failed.stats" to="/businesses" />
      <StatsCard :title="t('dash.customers')" :value="data?.totalCustomers ?? null" :failed="failed.stats" to="/customers" />
      <StatsCard :title="t('dash.todayBookings')" :value="data?.todayBookings ?? null" :failed="failed.stats" to="/bookings" />
      <StatsCard :title="t('dash.restaurants')" :value="restaurantCount" :failed="failed.restaurants" to="/restaurants" />
      <StatsCard :title="t('dash.bookable')" :value="bookableCount" :failed="failed.restaurants" to="/restaurants" />
      <StatsCard :title="t('dash.clinics')" :value="clinicCount" :failed="failed.clinics" to="/medical/clinics" />
      <StatsCard :title="t('dash.doctors')" :value="doctorCount" :failed="failed.doctors" to="/medical/doctors" />
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div class="page-card p-5">
        <h2 class="mb-4 text-lg font-black">{{ t('dash.bookingsChart') }}</h2>
        <div class="h-72">
          <LineChart v-if="!loading && bookingLabels.length" :labels="bookingLabels" :values="bookingValues" :label="t('dash.todayBookings')" />
          <div v-else-if="loading" class="flex h-72 items-center justify-center"><LoadingSpinner /></div>
          <p v-else class="py-12 text-center text-app-muted">{{ t('dash.noChart') }}</p>
        </div>
      </div>
      <div class="page-card p-5">
        <h2 class="mb-4 text-lg font-black">{{ t('dash.revenueChart') }}</h2>
        <div class="h-72">
          <BarChart v-if="!loading && revenueLabels.length" :labels="revenueLabels" :revenue="revenueBars" :commission="commissionBars" />
          <div v-else-if="loading" class="flex h-72 items-center justify-center"><LoadingSpinner /></div>
          <p v-else class="py-12 text-center text-app-muted">{{ t('dash.noChart') }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div class="page-card overflow-hidden">
        <div class="border-b border-border px-5 py-4 font-black">{{ t('dash.recentApps') }}</div>
        <ul v-if="recentApps.length" class="divide-y divide-border">
          <li v-for="a in recentApps" :key="String(a.id)">
            <RouterLink :to="`/applications/${a.id}`" class="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
              <div>
                <p class="font-bold text-app-text">{{ a.businessName ?? '—' }}</p>
                <p class="text-xs text-app-muted">{{ a.ownerName }} · {{ a.phone }}</p>
              </div>
              <span class="rounded-full px-2 py-0.5 text-xs font-bold" :class="statusClass(a.status)">{{ statusLabel(a.status) }}</span>
            </RouterLink>
          </li>
        </ul>
        <p v-else class="px-5 py-10 text-center text-sm text-app-muted">{{ t('common.empty') }}</p>
      </div>
      <div class="page-card overflow-hidden">
        <div class="border-b border-border px-5 py-4 font-black">{{ t('dash.recentBookings') }}</div>
        <ul v-if="recent.length" class="divide-y divide-border">
          <li v-for="b in recent" :key="String(b.id)" class="flex items-center justify-between px-5 py-3">
            <div>
              <p class="font-bold">{{ b.businessName ?? '—' }}</p>
              <p class="text-xs text-app-muted">{{ b.customerName ?? '—' }}</p>
            </div>
            <StatusBadge :status="String(b.status ?? '')" />
          </li>
        </ul>
        <p v-else class="px-5 py-10 text-center text-sm text-app-muted">{{ t('common.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getApplications, getDashboard } from '@/api'
import { getPublicMedicalClinics, getPublicMedicalDoctors, getPublicRestaurants } from '@/api/domains'
import PageHeader from '@/components/common/PageHeader.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { apiMessage } from '@/utils/error'
import { statusClass, statusLabel, normalizePaged } from '@/utils/admin'
import { useI18n } from '@/composables/useI18n'

const { t, dir } = useI18n()

interface DashboardPayload {
  pendingApplications?: number
  pendingBusinesses?: number
  totalBusinesses?: number
  totalCustomers?: number
  todayBookings?: number
  recentBookings?: unknown[]
  bookingsByDay?: { date?: string; count?: number }[]
  revenueByMonth?: { month?: string; revenue?: number; commission?: number }[]
}

const loading = ref(true)
const error = ref('')
const data = ref<DashboardPayload | null>(null)
const pendingApplications = ref<number | null>(null)
const clinicCount = ref<number | null>(null)
const doctorCount = ref<number | null>(null)
const restaurantCount = ref<number | null>(null)
const bookableCount = ref<number | null>(null)
const recentApps = ref<Record<string, unknown>[]>([])
const failed = ref({ stats: false, apps: false, clinics: false, doctors: false, restaurants: false })

const recent = computed(() => {
  const r = data.value?.recentBookings
  return Array.isArray(r) ? (r as { id?: string; businessName?: string; customerName?: string; status?: string }[]) : []
})
const bookingLabels = computed(() => (data.value?.bookingsByDay ?? []).map((x) => (x.date ?? '').slice(0, 10)))
const bookingValues = computed(() => (data.value?.bookingsByDay ?? []).map((x) => Number(x.count ?? 0)))
const revenueLabels = computed(() => (data.value?.revenueByMonth ?? []).map((x) => String(x.month ?? '')))
const revenueBars = computed(() => (data.value?.revenueByMonth ?? []).map((x) => Number(x.revenue ?? 0)))
const commissionBars = computed(() => (data.value?.revenueByMonth ?? []).map((x) => Number(x.commission ?? 0)))

async function load() {
  loading.value = true
  error.value = ''
  failed.value = { stats: false, apps: false, clinics: false, doctors: false, restaurants: false }
  const tasks = [
    getDashboard()
      .then((r) => {
        data.value = r.data as DashboardPayload
      })
      .catch(() => {
        failed.value.stats = true
      }),
    getApplications({ status: 'Pending', page: 1, pageSize: 6 })
      .then((r) => {
        const d = normalizePaged(r.data)
        pendingApplications.value = d.total
        recentApps.value = d.items
      })
      .catch(() => {
        failed.value.apps = true
        pendingApplications.value = null
      }),
    getPublicMedicalClinics({ page: 1, pageSize: 1 })
      .then((r) => {
        clinicCount.value = normalizePaged(r.data).total
      })
      .catch(() => {
        failed.value.clinics = true
        clinicCount.value = null
      }),
    getPublicMedicalDoctors({ independentOnly: true, page: 1, pageSize: 1 })
      .then((r) => {
        doctorCount.value = normalizePaged(r.data).total
      })
      .catch(() => {
        failed.value.doctors = true
        doctorCount.value = null
      }),
    getPublicRestaurants({ page: 1, pageSize: 50 })
      .then((r) => {
        const d = normalizePaged(r.data)
        restaurantCount.value = d.total
        bookableCount.value =
          d.total <= d.items.length
            ? d.items.filter((x) => x.isPubliclyBookable === true).length
            : null
      })
      .catch(() => {
        failed.value.restaurants = true
        restaurantCount.value = null
        bookableCount.value = null
      }),
  ]
  await Promise.all(tasks)
  if (Object.values(failed.value).every(Boolean)) error.value = t('dash.loadFailed')
  loading.value = false
}

onMounted(load)
</script>
