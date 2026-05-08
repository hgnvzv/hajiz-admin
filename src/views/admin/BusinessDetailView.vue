<template>
  <div dir="rtl" class="space-y-6">
    <RouterLink to="/businesses" class="text-teal-700 hover:text-gold-600 text-sm font-bold flex items-center gap-1 transition-colors">← 🏪 المحلات</RouterLink>
    
    <div v-if="loading" class="card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 rounded-full animate-spin" style="border-color: #d1ece9; border-top-color: #257d75;"></div>
    </div>
    
    <div v-else-if="biz" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-teal-700">{{ biz.name }}</h2>
              <p class="text-gray-600 text-sm mt-2">📋 {{ biz.ownerName }} • 📄 {{ biz.phone }}</p>
              <p class="text-teal-600 text-sm font-medium mt-1">{{ biz.category }} • {{ biz.city }}</p>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-1 mb-2">
                <span class="text-yellow-500 text-lg">⭐</span>
                <span class="font-bold text-lg text-teal-700">{{ biz.avgRating?.toFixed(1) }}</span>
                <span class="text-xs text-gray-500 font-medium">({{ biz.totalReviews }})</span>
              </div>
              <span class="text-xs font-bold px-3 py-1 rounded-full"
                :style="biz.isActive ? 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54; border: 1px solid #a8e6d8;' : 'background: #fee; color: #a00; border: 1px solid #fcc;'">
                {{ biz.isActive ? '🟢 نشط' : '🔴 موقوف' }}
              </span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div v-for="s in bizStats" :key="s.label" class="p-4 rounded-lg text-center" style="background: linear-gradient(135deg, #e8f5f4, #d1ece9);">
              <p class="text-2xl font-bold text-teal-700">{{ s.value }}</p>
              <p class="text-xs text-gray-600 mt-1 font-medium">{{ s.label }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-bold text-teal-700 mb-4 flex items-center gap-2"><span>✨</span> الخدمات</h3>
          <div class="space-y-3">
            <div v-for="s in biz.services" :key="s.id"
              class="flex items-center justify-between p-3 rounded-lg text-sm font-medium" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
              <span class="text-teal-700">{{ s.name }}</span>
              <div class="flex items-center gap-4">
                <span class="text-gray-600 text-xs">🕐 {{ s.durationMinutes }} د</span>
                <span class="font-bold text-gold-600">{{ s.price?.toLocaleString() }} د.ع</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-6">
          <button @click="toggleStatus" class="w-full py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105"
            :style="biz.isActive
              ? 'background: #fee; color: #a00; border: 2px solid #dc2626;'
              : 'background: linear-gradient(135deg, #257d75, #1d6560); color: white;'">
            {{ biz.isActive ? '⏸️ إيقاف المحل' : '▶️ تفعيل المحل' }}
          </button>
        </div>
        <div class="card p-6">
          <h3 class="font-bold text-teal-700 mb-4 text-sm flex items-center gap-2"><span>ℹ️</span> معلومات</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center p-3 rounded-lg" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
              <span class="text-gray-600 font-medium">📍 العنوان</span>
              <span class="font-medium text-teal-700 text-left max-w-32 truncate">{{ biz.address }}</span>
            </div>
            <div class="flex justify-between items-center p-3 rounded-lg" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
              <span class="text-gray-600 font-medium">👥 الموظفون</span>
              <span class="font-bold text-teal-700">{{ biz.staff?.length || 0 }}</span>
            </div>
            <div class="flex justify-between items-center p-3 rounded-lg" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
              <span class="text-gray-600 font-medium">📅 تاريخ الإنشاء</span>
              <span class="font-medium text-teal-700">{{ formatDate(biz.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const biz = ref<any>(null)
const loading = ref(true)

const bizStats = computed(() => [
  { label: 'الحجوزات', value: biz.value?.stats?.totalBookings || 0 },
  { label: 'الإيراد', value: `${(biz.value?.stats?.totalRevenue || 0).toLocaleString()} د.ع` },
  { label: 'العمولات', value: `${(biz.value?.stats?.totalCommissions || 0).toLocaleString()} د.ع` },
])

onMounted(async () => {
  try {
    const res = await api.get(`/admin/businesses/${route.params.id}`)
    biz.value = res.data
  } finally { loading.value = false }
})

async function toggleStatus() {
  await api.put(`/admin/businesses/${route.params.id}/toggle`)
  const res = await api.get(`/admin/businesses/${route.params.id}`)
  biz.value = res.data
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
