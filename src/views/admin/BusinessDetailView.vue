<template>
  <div dir="rtl" class="space-y-5">
    <RouterLink to="/businesses" class="text-blue-600 hover:underline text-sm">← المحلات</RouterLink>
    <div v-if="loading" class="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <div class="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <div v-else-if="biz" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-slate-900">{{ biz.name }}</h2>
              <p class="text-slate-500 text-sm mt-1">{{ biz.ownerName }} · {{ biz.phone }}</p>
              <p class="text-blue-600 text-sm">{{ biz.category }} · {{ biz.city }}</p>
            </div>
            <div class="text-left">
              <div class="flex items-center gap-1 mb-1">
                <span class="text-yellow-400">⭐</span>
                <span class="font-bold">{{ biz.avgRating?.toFixed(1) }}</span>
                <span class="text-xs text-slate-400">({{ biz.totalReviews }})</span>
              </div>
              <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                :style="biz.isActive ? 'background:#F0FDF4;color:#047857' : 'background:#FEF2F2;color:#B91C1C'">
                {{ biz.isActive ? 'نشط' : 'موقوف' }}
              </span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="s in bizStats" :key="s.label" class="p-3 rounded-xl text-center" style="background:#F8FAFC">
              <p class="text-lg font-bold text-slate-900">{{ s.value }}</p>
              <p class="text-xs text-slate-500">{{ s.label }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-bold text-slate-800 mb-3">الخدمات</h3>
          <div class="space-y-2">
            <div v-for="s in biz.services" :key="s.id"
              class="flex items-center justify-between p-2.5 rounded-xl text-sm" style="background:#F8FAFC">
              <span class="font-medium text-slate-700">{{ s.name }}</span>
              <div class="flex items-center gap-3">
                <span class="text-slate-500">{{ s.durationMinutes }} د</span>
                <span class="font-bold" style="color:#2563EB">{{ s.price?.toLocaleString() }} د.ع</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <button @click="toggleStatus" class="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
            :style="biz.isActive
              ? 'background:#FEF2F2;color:#B91C1C;border:1.5px solid #DC2626'
              : 'background: linear-gradient(135deg,#059669,#047857);color:white'">
            {{ biz.isActive ? '⏸ إيقاف المحل' : '▶ تفعيل المحل' }}
          </button>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-bold text-slate-800 mb-3 text-sm">معلومات</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">العنوان</span>
              <span class="font-medium text-slate-800 text-left max-w-32 truncate">{{ biz.address }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">الموظفون</span>
              <span class="font-bold text-slate-800">{{ biz.staff?.length || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">تاريخ الإنشاء</span>
              <span class="font-medium text-slate-800">{{ formatDate(biz.createdAt) }}</span>
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
