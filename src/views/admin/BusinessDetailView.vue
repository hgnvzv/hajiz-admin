<template>
  <div dir="rtl" class="space-y-5">
    <RouterLink to="/businesses"
      class="inline-flex items-center gap-2 text-sm font-semibold transition-all"
      style="color: #257d75">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      المحلات
    </RouterLink>

    <div v-if="loading" class="rounded-2xl p-10 text-center"
      style="background: white; border: 1px solid #e2eded">
      <div class="inline-block w-7 h-7 border-2 rounded-full animate-spin"
        style="border-color: rgba(37,125,117,0.2); border-top-color: #257d75"></div>
    </div>

    <div v-else-if="biz" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 space-y-4">

        <!-- Main Info -->
        <div class="rounded-2xl overflow-hidden"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <div class="px-6 py-4 border-b"
            style="background: linear-gradient(135deg, #f8fbfb, #f0f4f3); border-color: #e2eded">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-black" style="color: #0a2c2a">{{ biz.name }}</h2>
                <p class="text-sm mt-1" style="color: #6b7f7e">{{ biz.ownerName }} · {{ biz.phone }}</p>
                <p class="text-sm font-semibold mt-0.5" style="color: #257d75">{{ biz.category }} · {{ biz.city }}</p>
              </div>
              <div class="text-left">
                <div class="flex items-center gap-1 mb-1.5">
                  <span style="color: #f2b415">⭐</span>
                  <span class="font-black" style="color: #0a2c2a">{{ biz.avgRating?.toFixed(1) }}</span>
                  <span class="text-xs" style="color: #9aadac">({{ biz.totalReviews }})</span>
                </div>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                  :style="biz.isActive
                    ? 'background:#e8f5f4;color:#1d6560;border:1px solid #d1ece9'
                    : 'background:#fef2f2;color:#b91c1c;border:1px solid #fecaca'">
                  {{ biz.isActive ? 'نشط' : 'موقوف' }}
                </span>
              </div>
            </div>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-3 gap-3">
              <div v-for="s in bizStats" :key="s.label" class="p-4 rounded-xl text-center"
                style="background: #f8fbfb; border: 1px solid #f0f4f3">
                <p class="text-xl font-black" style="color: #0a2c2a">{{ s.value }}</p>
                <p class="text-xs mt-1" style="color: #9aadac">{{ s.label }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div class="rounded-2xl p-5"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <h3 class="font-bold mb-3" style="color: #0a2c2a">الخدمات</h3>
          <div class="space-y-2">
            <div v-for="s in biz.services" :key="s.id"
              class="flex items-center justify-between p-3 rounded-xl text-sm"
              style="background: #f8fbfb; border: 1px solid #f0f4f3">
              <span class="font-semibold" style="color: #1a3c3a">{{ s.name }}</span>
              <div class="flex items-center gap-3">
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: #f0f4f3; color: #6b7f7e">
                  {{ s.durationMinutes }} د
                </span>
                <span class="font-black text-sm" style="color: #f2b415">{{ s.price?.toLocaleString() }} د.ع</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <div class="rounded-2xl p-5"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <button @click="toggleStatus"
            class="w-full py-3 rounded-xl font-bold text-sm transition-all"
            :style="biz.isActive
              ? 'background:#fef2f2;color:#b91c1c;border:1.5px solid #fecaca'
              : 'background: linear-gradient(135deg,#257d75,#1d6560);color:white;box-shadow:0 3px 12px rgba(37,125,117,0.25)'">
            {{ biz.isActive ? '⏸ إيقاف المحل' : '▶ تفعيل المحل' }}
          </button>
        </div>

        <div class="rounded-2xl p-5"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <h3 class="font-bold mb-3 text-sm" style="color: #0a2c2a">معلومات</h3>
          <div class="space-y-2.5 text-sm">
            <div class="flex justify-between items-center">
              <span style="color: #9aadac">العنوان</span>
              <span class="font-semibold text-left max-w-36 truncate" style="color: #1a3c3a">{{ biz.address }}</span>
            </div>
            <div class="h-px" style="background: #f0f4f3"></div>
            <div class="flex justify-between items-center">
              <span style="color: #9aadac">الموظفون</span>
              <span class="font-black px-2.5 py-0.5 rounded-full text-xs" style="background: #e8f5f4; color: #257d75">
                {{ biz.staff?.length || 0 }}
              </span>
            </div>
            <div class="h-px" style="background: #f0f4f3"></div>
            <div class="flex justify-between items-center">
              <span style="color: #9aadac">تاريخ الإنشاء</span>
              <span class="font-semibold" style="color: #1a3c3a">{{ formatDate(biz.createdAt) }}</span>
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
