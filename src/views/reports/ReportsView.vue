<template>
  <div class="space-y-6" dir="rtl">
    <div class="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface p-2 shadow-sm">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="rounded-xl px-4 py-2 text-sm font-black transition"
        :class="section === t.id ? 'bg-primary text-white' : 'text-[#6B7280] hover:bg-primary-light'"
        @click="section = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Bookings report -->
    <div v-if="section === 'bookings'" class="space-y-6">
      <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <div class="w-full sm:w-40">
            <label class="mb-1 block text-xs font-bold">من</label>
            <input v-model="bDateFrom" type="date" class="w-full rounded-xl border px-3 py-2" />
          </div>
          <div class="w-full sm:w-40">
            <label class="mb-1 block text-xs font-bold">إلى</label>
            <input v-model="bDateTo" type="date" class="w-full rounded-xl border px-3 py-2" />
          </div>
          <div class="w-full sm:w-40">
            <label class="mb-1 block text-xs font-bold">تجميع</label>
            <select v-model="bGroup" class="w-full rounded-xl border px-3 py-2">
              <option value="day">يوم</option>
              <option value="week">أسبوع</option>
              <option value="month">شهر</option>
            </select>
          </div>
          <button type="button" class="rounded-xl bg-primary px-6 py-2 font-bold text-white" @click="loadBookingsRep">
            تحديث
          </button>
        </div>
      </div>
      <LoadingSpinner v-if="bLoading" />
      <template v-else>
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 class="mb-4 font-black">منحنى الحجوزات</h3>
          <div class="h-72">
            <LineChart
              v-if="bLabels.length"
              :labels="bLabels"
              :values="bCounts"
              label="عدد الحجوزات"
            />
            <p v-else class="py-12 text-center text-[#6B7280]">لا توجد بيانات</p>
          </div>
        </div>
        <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">الفترة</th>
                <th class="px-4 py-3">العدد</th>
                <th class="px-4 py-3">الإيرادات</th>
                <th class="px-4 py-3">العمولة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(row, i) in bRows" :key="i">
                <td class="px-4 py-3">{{ row.period }}</td>
                <td class="px-4 py-3">{{ row.count }}</td>
                <td class="px-4 py-3">{{ formatMoney(row.revenue) }}</td>
                <td class="px-4 py-3">{{ formatMoney(row.commission) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- Businesses report -->
    <div v-if="section === 'businesses'" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <label class="text-sm font-bold">ترتيب حسب</label>
        <select v-model="bizSort" class="rounded-xl border px-3 py-2" @change="loadBizRep">
          <option value="bookings">الحجوزات</option>
          <option value="revenue">الإيرادات</option>
          <option value="rating">التقييم</option>
        </select>
      </div>
      <LoadingSpinner v-if="bizLoading" />
      <div v-else class="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
        <table class="w-full min-w-[720px] text-sm">
          <thead class="bg-primary text-white">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">المحل</th>
              <th class="px-4 py-3">الحجوزات</th>
              <th class="px-4 py-3">الإيرادات</th>
              <th class="px-4 py-3">التقييم</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="!bizRows.length">
              <td colspan="5" class="px-4 py-12 text-center text-[#6B7280]">لا توجد بيانات</td>
            </tr>
            <tr v-for="(r, i) in bizRows" :key="'biz-' + i">
              <td class="px-4 py-3">{{ i + 1 }}</td>
              <td class="px-4 py-3 font-bold">{{ r.name ?? r.businessName }}</td>
              <td class="px-4 py-3">{{ r.totalBookings ?? r.bookingCount ?? '—' }}</td>
              <td class="px-4 py-3">{{ formatMoney(r.totalRevenue ?? r.revenue) }}</td>
              <td class="px-4 py-3">{{ ratingFmt(r.avgRating ?? r.rating) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Categories report -->
    <div v-if="section === 'categories'" class="space-y-6">
      <LoadingSpinner v-if="catLoading" />
      <template v-else>
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 class="mb-4 font-black">الإيرادات حسب التصنيف</h3>
          <div class="h-72">
            <BarChart
              v-if="catLabels.length"
              :labels="catLabels"
              :revenue="catRevenue"
              :commission="catCommission"
            />
            <p v-else class="py-12 text-center text-[#6B7280]">لا توجد بيانات</p>
          </div>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">التصنيف</th>
                <th class="px-4 py-3">الحجوزات</th>
                <th class="px-4 py-3">الإيرادات</th>
                <th class="px-4 py-3">العمولة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(r, i) in catRows" :key="i">
                <td class="px-4 py-3 font-bold">{{ r.categoryName }}</td>
                <td class="px-4 py-3">{{ r.bookingCount ?? '—' }}</td>
                <td class="px-4 py-3">{{ formatMoney(r.revenue) }}</td>
                <td class="px-4 py-3">{{ formatMoney(r.commission) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { getBookingsReport, getBusinessesReport, getCategoriesReport } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import { formatMoney } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const toast = useToast()

const tabs = [
  { id: 'bookings' as const, label: 'تقرير الحجوزات' },
  { id: 'businesses' as const, label: 'أفضل المحلات' },
  { id: 'categories' as const, label: 'تقرير التصنيفات' },
]

const section = ref<(typeof tabs)[number]['id']>('bookings')

const bDateFrom = ref('')
const bDateTo = ref('')
const bGroup = ref<'day' | 'week' | 'month'>('day')
const bLoading = ref(false)
const bRaw = ref<Record<string, unknown>[]>([])

const bRows = computed(() =>
  bRaw.value.map((x) => ({
    period: String(x.period ?? x.date ?? '—'),
    count: Number(x.count ?? 0),
    revenue: Number(x.revenue ?? 0),
    commission: Number(x.commission ?? 0),
  })),
)

const bLabels = computed(() => bRows.value.map((r) => r.period))
const bCounts = computed(() => bRows.value.map((r) => r.count))

async function loadBookingsRep() {
  bLoading.value = true
  try {
    const res = await getBookingsReport({
      dateFrom: bDateFrom.value || undefined,
      dateTo: bDateTo.value || undefined,
      groupBy: bGroup.value,
    })
    const d = res.data as { data?: Record<string, unknown>[] }
    bRaw.value = Array.isArray(d.data) ? d.data : []
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    bLoading.value = false
  }
}

const bizSort = ref<'bookings' | 'revenue' | 'rating'>('bookings')
const bizLoading = ref(false)
const bizRows = ref<Record<string, unknown>[]>([])

async function loadBizRep() {
  bizLoading.value = true
  try {
    const res = await getBusinessesReport()
    const d = res.data as Record<string, unknown>
    let list: Record<string, unknown>[] = []
    if (Array.isArray(d)) list = d
    else if (Array.isArray(d.topBusinesses)) list = d.topBusinesses as Record<string, unknown>[]
    else if (Array.isArray(d.items)) list = d.items as Record<string, unknown>[]
    const key =
      bizSort.value === 'bookings'
        ? 'totalBookings'
        : bizSort.value === 'revenue'
          ? 'totalRevenue'
          : 'avgRating'
    bizRows.value = [...list]
      .sort((a, b) => Number(b[key] ?? 0) - Number(a[key] ?? 0))
      .slice(0, 20)
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    bizLoading.value = false
  }
}

const catLoading = ref(false)
const catRows = ref<{ categoryName?: string; bookingCount?: number; revenue?: number; commission?: number }[]>([])

const catLabels = computed(() => catRows.value.map((x) => String(x.categoryName ?? '')))
const catRevenue = computed(() => catRows.value.map((x) => Number(x.revenue ?? 0)))
const catCommission = computed(() => catRows.value.map((x) => Number(x.commission ?? 0)))

async function loadCatRep() {
  catLoading.value = true
  try {
    const res = await getCategoriesReport()
    const d = res.data as Record<string, unknown>
    const raw = Array.isArray(d)
      ? d
      : Array.isArray(d.categories)
        ? d.categories
        : Array.isArray(d.items)
          ? d.items
          : []
    catRows.value = raw as typeof catRows.value
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    catLoading.value = false
  }
}

function ratingFmt(v: unknown) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : n.toFixed(1)
}

watch(section, (s) => {
  if (s === 'bookings') loadBookingsRep()
  if (s === 'businesses') loadBizRep()
  if (s === 'categories') loadCatRep()
})

onMounted(() => {
  loadBookingsRep()
})
</script>
