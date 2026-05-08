<template>
  <div dir="rtl" class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in statCards" :key="card.label"
        class="card group cursor-pointer">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500 mb-2">{{ card.label }}</p>
              <p class="text-3xl font-bold text-teal-700">
                {{ loading ? '—' : card.value }}
              </p>
            </div>
            <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transform group-hover:scale-110 transition-transform"
              :style="`background: linear-gradient(135deg, ${card.bgFrom}, ${card.bgTo})`">{{ card.icon }}</div>
          </div>
          <p class="text-xs text-gray-400">{{ card.sub }}</p>
        </div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Pending Applications -->
      <div class="card lg:col-span-1">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
          style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4)">
          <h2 class="font-bold text-teal-700 flex items-center gap-2">
            <span>📋</span> طلبات معلقة
          </h2>
          <RouterLink to="/applications" class="text-xs font-bold text-gold-600 hover:text-gold-700 transition-colors">
            عرض الكل →
          </RouterLink>
        </div>
        <div v-if="loading" class="p-4 space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 rounded-lg animate-pulse" style="background: linear-gradient(90deg, #f0f4f3, #e8f5f4)"></div>
        </div>
        <div v-else-if="pendingApps.length === 0" class="p-8 text-center text-gray-400 text-sm">
          ✅ لا توجد طلبات معلقة
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="app in pendingApps.slice(0,4)" :key="app.id"
            class="px-6 py-3 hover:bg-gray-50 transition-all flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style="background: linear-gradient(135deg, #f2b415, #d4990f)">
              {{ app.ownerName?.[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-teal-700 truncate">{{ app.businessName }}</p>
              <p class="text-xs text-gray-500">{{ app.categoryName }} • {{ app.city }}</p>
            </div>
            <RouterLink :to="`/applications/${app.id}`"
              class="text-xs px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap"
              style="background: linear-gradient(135deg, #e8f5f4, #d1ece9); color: #1d6560">مراجعة</RouterLink>
          </div>
        </div>
      </div>

      <!-- Top Categories -->
      <div class="card lg:col-span-1">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2"
          style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4)">
          <span>🏆</span>
          <h2 class="font-bold text-teal-700">التصنيفات الأكثر نشاطاً</h2>
        </div>
        <div class="p-6 space-y-4">
          <div v-if="loading" v-for="i in 4" :key="i"
            class="h-8 rounded-full animate-pulse" style="background: linear-gradient(90deg, #f0f4f3, #e8f5f4)"></div>
          <div v-else v-for="(cat, idx) in stats?.topCategories?.slice(0,5) || []" :key="cat.categoryName">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style="background: linear-gradient(135deg, #257d75, #1d6560)">{{ idx+1 }}</span>
                <span class="text-sm font-medium text-teal-700">{{ cat.categoryName }}</span>
              </div>
              <span class="text-xs font-bold text-gold-600">{{ cat.bookingCount }} 📅</span>
            </div>
            <div class="h-2 rounded-full overflow-hidden" style="background: #e8f5f4">
              <div class="h-full rounded-full transition-all"
                style="background: linear-gradient(90deg, #257d75, #f2b415)"
                :style="`width: ${(cat.bookingCount / Math.max(...(stats?.topCategories || []).map((c:any) => c.bookingCount), 1)) * 100}%`">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Cities -->
      <div class="card lg:col-span-1">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2"
          style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4)">
          <span>📍</span>
          <h2 class="font-bold text-teal-700">المحافظات الأكثر نشاطاً</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <div v-if="loading" v-for="i in 4" :key="i"
            class="px-6 py-3 animate-pulse">
            <div class="h-4 rounded-full w-3/4" style="background: linear-gradient(90deg, #f0f4f3, #e8f5f4)"></div>
          </div>
          <div v-else v-for="city in stats?.topCities?.slice(0,5) || []" :key="city.cityName"
            class="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-all">
            <div class="flex items-center gap-2">
              <span class="text-lg">🏙️</span>
              <span class="text-sm font-medium text-teal-700">{{ city.cityName }}</span>
            </div>
            <div class="text-left">
              <p class="text-xs font-bold text-teal-700">{{ city.businessCount }} 🏪</p>
              <p class="text-xs text-gray-400">{{ city.customerCount }} 👥</p>
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
  { label: 'الزبائن', value: stats.value?.totalCustomers || 0, icon: '👥', bgFrom: '#257d75', bgTo: '#1d6560', sub: 'إجمالي المستخدمين النشطين' },
  { label: 'المحلات', value: stats.value?.totalBusinesses || 0, icon: '🏪', bgFrom: '#f2b415', bgTo: '#d4990f', sub: 'محلات مقبولة وفعالة' },
  { label: 'حجوزات اليوم', value: stats.value?.todayBookings || 0, icon: '📅', bgFrom: '#5db5ad', bgTo: '#257d75', sub: `من ${stats.value?.totalBookings || 0} إجمالي` },
  { label: 'العمولات', value: `${(stats.value?.totalCommissions || 0).toLocaleString()}`, icon: '💰', bgFrom: '#fde68a', bgTo: '#f2b415', sub: `معلق: ${(stats.value?.pendingCommissions || 0).toLocaleString()}` },
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
