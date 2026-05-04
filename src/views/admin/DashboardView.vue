<template>
  <div dir="rtl" class="space-y-5">
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in statCards" :key="card.label"
        class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-xs text-slate-500 font-medium mb-1">{{ card.label }}</p>
            <p class="text-3xl font-bold text-slate-900">
              {{ loading ? '—' : card.value }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            :style="`background: ${card.bg}`">{{ card.icon }}</div>
        </div>
        <p class="text-xs text-slate-400">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- Pending Applications -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between"
          style="background: #F8FAFC">
          <h2 class="font-bold text-slate-800">طلبات معلقة</h2>
          <RouterLink to="/applications" class="text-xs font-semibold hover:underline"
            style="color: #2563EB">عرض الكل</RouterLink>
        </div>
        <div v-if="loading" class="p-4 space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 rounded-xl animate-pulse bg-slate-100"></div>
        </div>
        <div v-else-if="pendingApps.length === 0" class="p-8 text-center text-slate-400 text-sm">
          لا توجد طلبات معلقة
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="app in pendingApps.slice(0,4)" :key="app.id"
            class="px-5 py-3 hover:bg-slate-50 transition-all flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style="background: linear-gradient(135deg, #7C3AED, #6D28D9)">
              {{ app.ownerName?.[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 truncate">{{ app.businessName }}</p>
              <p class="text-xs text-slate-500">{{ app.categoryName }} · {{ app.city }}</p>
            </div>
            <RouterLink :to="`/applications/${app.id}`"
              class="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
              style="background: #EFF6FF; color: #2563EB">مراجعة</RouterLink>
          </div>
        </div>
      </div>

      <!-- Top Categories -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100" style="background: #F8FAFC">
          <h2 class="font-bold text-slate-800">التصنيفات الأكثر نشاطاً</h2>
        </div>
        <div class="p-5 space-y-4">
          <div v-if="loading" v-for="i in 4" :key="i"
            class="h-8 rounded-full animate-pulse bg-slate-100"></div>
          <div v-else v-for="(cat, idx) in stats?.topCategories?.slice(0,5) || []" :key="cat.categoryName">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white"
                  style="background: #2563EB">{{ idx+1 }}</span>
                <span class="text-sm font-medium text-slate-700">{{ cat.categoryName }}</span>
              </div>
              <span class="text-xs font-bold" style="color: #2563EB">{{ cat.bookingCount }} حجز</span>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden bg-slate-100">
              <div class="h-full rounded-full transition-all"
                style="background: linear-gradient(90deg, #2563EB, #3B82F6)"
                :style="`width: ${(cat.bookingCount / Math.max(...(stats?.topCategories || []).map((c:any) => c.bookingCount), 1)) * 100}%`">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Cities -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100" style="background: #F8FAFC">
          <h2 class="font-bold text-slate-800">المحافظات الأكثر نشاطاً</h2>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-if="loading" v-for="i in 4" :key="i"
            class="px-5 py-3 animate-pulse">
            <div class="h-4 rounded-full bg-slate-100 w-3/4"></div>
          </div>
          <div v-else v-for="city in stats?.topCities?.slice(0,5) || []" :key="city.cityName"
            class="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
            <div class="flex items-center gap-2">
              <span class="text-lg">📍</span>
              <span class="text-sm font-medium text-slate-700">{{ city.cityName }}</span>
            </div>
            <div class="text-left">
              <span class="text-xs font-bold text-slate-700">{{ city.businessCount }} محل</span>
              <span class="text-xs text-slate-400 mr-2">{{ city.customerCount }} زبون</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const stats = ref<any>(null)
const pendingApps = ref<any[]>([])
const loading = ref(true)

const statCards = computed(() => [
  { label: 'الزبائن', value: stats.value?.totalCustomers || 0, icon: '👥', bg: '#EFF6FF', sub: 'إجمالي المستخدمين' },
  { label: 'المحلات', value: stats.value?.totalBusinesses || 0, icon: '🏪', bg: '#F0FDF4', sub: 'محلات مقبولة' },
  { label: 'حجوزات اليوم', value: stats.value?.todayBookings || 0, icon: '📅', bg: '#FFFBEB', sub: `من ${stats.value?.totalBookings || 0} إجمالي` },
  { label: 'العمولات', value: `${(stats.value?.totalCommissions || 0).toLocaleString()} د.ع`, icon: '💰', bg: '#F5F3FF', sub: `معلق: ${(stats.value?.pendingCommissions || 0).toLocaleString()} د.ع` },
])

onMounted(async () => {
  try {
    const [statsRes, appsRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/applications?status=Pending&pageSize=5')
    ])
    stats.value = statsRes.data
    pendingApps.value = appsRes.data.items || []
  } finally {
    loading.value = false
  }
})
</script>
