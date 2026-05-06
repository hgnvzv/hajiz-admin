<template>
  <div dir="rtl" class="space-y-5">
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in statCards" :key="card.label"
        class="rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-xs font-semibold mb-1" style="color: #6b7f7e">{{ card.label }}</p>
            <p class="text-3xl font-black" style="color: #0a2c2a">
              {{ loading ? '—' : card.value }}
            </p>
          </div>
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            :style="`background: ${card.bg}`">{{ card.icon }}</div>
        </div>
        <div class="h-1 rounded-full overflow-hidden" style="background: #f0f4f3">
          <div class="h-full rounded-full w-3/4 transition-all" :style="`background: ${card.accent}`"></div>
        </div>
        <p class="text-xs mt-2" style="color: #9aadac">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- Pending Applications -->
      <div class="rounded-2xl overflow-hidden"
        style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
        <div class="px-5 py-4 flex items-center justify-between border-b" style="border-color: #f0f4f3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" style="background: #f2b415"></div>
            <h2 class="font-bold text-sm" style="color: #0a2c2a">طلبات معلقة</h2>
          </div>
          <RouterLink to="/applications"
            class="text-xs font-bold px-3 py-1 rounded-full transition-all"
            style="background: #e8f5f4; color: #257d75">عرض الكل</RouterLink>
        </div>
        <div v-if="loading" class="p-4 space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 rounded-xl animate-pulse" style="background: #f0f4f3"></div>
        </div>
        <div v-else-if="pendingApps.length === 0"
          class="p-10 text-center text-sm" style="color: #9aadac">
          <div class="text-3xl mb-2">✨</div>
          لا توجد طلبات معلقة
        </div>
        <div v-else class="divide-y" style="divide-color: #f0f4f3">
          <div v-for="app in pendingApps.slice(0,4)" :key="app.id"
            class="px-5 py-3.5 flex items-center gap-3 hover:bg-opacity-50 transition-all"
            style="hover: background: #f8fafa">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
              style="background: linear-gradient(135deg, #f2b415, #d4990f)">
              {{ app.ownerName?.[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold truncate" style="color: #0a2c2a">{{ app.businessName }}</p>
              <p class="text-xs" style="color: #9aadac">{{ app.categoryName }} · {{ app.city }}</p>
            </div>
            <RouterLink :to="`/applications/${app.id}`"
              class="text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex-shrink-0"
              style="background: #e8f5f4; color: #257d75">مراجعة</RouterLink>
          </div>
        </div>
      </div>

      <!-- Top Categories -->
      <div class="rounded-2xl overflow-hidden"
        style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
        <div class="px-5 py-4 border-b" style="border-color: #f0f4f3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" style="background: #257d75"></div>
            <h2 class="font-bold text-sm" style="color: #0a2c2a">التصنيفات الأكثر نشاطاً</h2>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <template v-if="loading">
            <div v-for="i in 4" :key="i" class="h-8 rounded-full animate-pulse" style="background: #f0f4f3"></div>
          </template>
          <div v-else v-for="(cat, idx) in stats?.topCategories?.slice(0,5) || []" :key="cat.categoryName">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black"
                  :style="idx === 0 ? 'background:#f2b415;color:#0a2c2a' : 'background:#e8f5f4;color:#257d75'">
                  {{ idx + 1 }}
                </span>
                <span class="text-sm font-semibold" style="color: #1a3c3a">{{ cat.categoryName }}</span>
              </div>
              <span class="text-xs font-black" style="color: #f2b415">{{ cat.bookingCount }} حجز</span>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden" style="background: #f0f4f3">
              <div class="h-full rounded-full transition-all"
                :style="`background: linear-gradient(90deg, #257d75, #f2b415); width: ${(cat.bookingCount / Math.max(...(stats?.topCategories || []).map((c:any) => c.bookingCount), 1)) * 100}%`">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Cities -->
      <div class="rounded-2xl overflow-hidden"
        style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
        <div class="px-5 py-4 border-b" style="border-color: #f0f4f3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" style="background: #f2b415"></div>
            <h2 class="font-bold text-sm" style="color: #0a2c2a">المحافظات الأكثر نشاطاً</h2>
          </div>
        </div>
        <div class="divide-y" style="divide-color: #f0f4f3">
          <template v-if="loading">
            <div v-for="i in 4" :key="i" class="px-5 py-3 animate-pulse">
              <div class="h-4 rounded-full w-3/4" style="background: #f0f4f3"></div>
            </div>
          </template>
          <div v-else v-for="(city, idx) in stats?.topCities?.slice(0,5) || []" :key="city.cityName"
            class="px-5 py-3.5 flex items-center justify-between transition-all"
            style="hover:background: #f8fafa">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                :style="idx === 0 ? 'background: linear-gradient(135deg,#f2b415,#d4990f); color:#0a2c2a' : 'background:#f0f4f3; color:#6b7f7e'">
                {{ idx + 1 }}
              </span>
              <span class="text-sm font-semibold" style="color: #1a3c3a">{{ city.cityName }}</span>
            </div>
            <div class="text-left flex items-center gap-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background: #e8f5f4; color: #257d75">
                {{ city.businessCount }} محل
              </span>
              <span class="text-xs" style="color: #9aadac">{{ city.customerCount }} زبون</span>
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
  {
    label: 'الزبائن', value: stats.value?.totalCustomers || 0,
    icon: '👥', bg: '#e8f5f4', accent: '#257d75', sub: 'إجمالي المستخدمين'
  },
  {
    label: 'المحلات', value: stats.value?.totalBusinesses || 0,
    icon: '🏪', bg: '#fef9e7', accent: '#f2b415', sub: 'محلات مقبولة'
  },
  {
    label: 'حجوزات اليوم', value: stats.value?.todayBookings || 0,
    icon: '📅', bg: '#e8f5f4', accent: '#257d75', sub: `من ${stats.value?.totalBookings || 0} إجمالي`
  },
  {
    label: 'العمولات', value: `${(stats.value?.totalCommissions || 0).toLocaleString()} د.ع`,
    icon: '💰', bg: '#fef9e7', accent: '#f2b415', sub: `معلق: ${(stats.value?.pendingCommissions || 0).toLocaleString()} د.ع`
  },
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
