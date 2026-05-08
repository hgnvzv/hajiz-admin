<template>
  <div dir="rtl" class="space-y-6">
    <RouterLink to="/applications" class="text-teal-700 hover:text-gold-600 text-sm font-bold flex items-center gap-1 transition-colors">← 📋 طلبات الانضمام</RouterLink>

    <div v-if="loading" class="card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 rounded-full animate-spin" style="border-color: #d1ece9; border-top-color: #257d75;"></div>
    </div>

    <div v-else-if="app" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Header Card -->
        <div class="card p-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-teal-700">{{ app.businessName }}</h2>
              <p class="text-gray-600 text-sm mt-2">📋 {{ app.ownerName }} • 📄 {{ app.phone }}</p>
            </div>
            <span class="text-sm font-bold px-4 py-2 rounded-full" :style="statusStyle(app.status)">
              {{ statusLabel(app.status) }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
              <p class="text-xs text-gray-500 mb-1 font-medium">🏷️ التصنيف</p>
              <p class="font-semibold text-teal-700">{{ app.categoryName }}</p>
            </div>
            <div class="p-4 rounded-lg" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
              <p class="text-xs text-gray-500 mb-1 font-medium">📍 المحافظة</p>
              <p class="font-semibold text-teal-700">{{ app.city }}</p>
            </div>
            <div class="p-4 rounded-lg col-span-2" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
              <p class="text-xs text-gray-500 mb-1 font-medium">📮 العنوان</p>
              <p class="font-semibold text-teal-700">{{ app.address }}</p>
            </div>
          </div>
          <div v-if="app.description" class="mt-6 p-4 rounded-lg border-l-4" style="background: linear-gradient(135deg, #e8f5f4, #d1ece9); border-left-color: #257d75;">
            <p class="text-xs text-gray-500 mb-2 font-medium">📝 وصف المحل</p>
            <p class="text-teal-700 text-sm leading-relaxed">{{ app.description }}</p>
          </div>
        </div>

        <!-- Images -->
        <div v-if="app.imageUrls?.length" class="card p-6">
          <h3 class="font-bold text-teal-700 mb-4 flex items-center gap-2"><span>🖼️</span> صور المحل</h3>
          <div class="grid grid-cols-3 gap-3">
            <img v-for="(img, i) in app.imageUrls" :key="i" :src="img"
              class="w-full h-28 object-cover rounded-lg border-2 border-gray-200 hover:border-teal-600 transition-all cursor-pointer"
              @error="e => (e.target as any).src = 'https://via.placeholder.com/150?text=صورة'" />
          </div>
        </div>

        <!-- Working Hours -->
        <div class="card p-6">
          <h3 class="font-bold text-teal-700 mb-4 flex items-center gap-2"><span>⏰</span> أوقات العمل</h3>
          <div class="space-y-3">
            <div v-for="wh in app.workingHours" :key="wh.dayName"
              class="flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all"
              :style="wh.isOpen ? 'background: linear-gradient(135deg, #e8f5f4, #d1ece9); color: #1d6560;' : 'background: linear-gradient(135deg, #f0f4f3, #e8f5f4); color: #999;'">
              <span>{{ wh.dayName }}</span>
              <span v-if="wh.isOpen">🕕 {{ wh.startTime }} — {{ wh.endTime }}</span>
              <span v-else class="text-xs italic">إجازة</span>
            </div>
          </div>
        </div>

        <!-- Sub Categories -->
        <div v-if="app.subCategories?.length" class="card p-6">
          <h3 class="font-bold text-teal-700 mb-4 flex items-center gap-2"><span>✓️</span> الخدمات المقدمة</h3>
          <div class="flex flex-wrap gap-3">
            <span v-for="sub in app.subCategories" :key="sub"
              class="text-sm px-4 py-2 rounded-full font-semibold transition-all transform hover:scale-105"
              style="background: linear-gradient(135deg, #e8f5f4, #d1ece9); color: #1d6560;">{{ sub }}</span>
          </div>
        </div>
      </div>

      <!-- Actions Sidebar -->
      <div class="space-y-4">
        <!-- Action Card -->
        <div v-if="app.status === 'Pending'" class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-bold text-slate-800 mb-4">اتخاذ قرار</h3>

          <button @click="approve" :disabled="actionLoading"
            class="w-full py-3 rounded-xl font-bold text-white mb-3 transition-all shadow-md"
            style="background: linear-gradient(135deg, #059669, #047857)">
            <span v-if="actionLoading === 'approve'">جاري القبول...</span>
            <span v-else>✓ قبول الطلب</span>
          </button>

          <div class="space-y-2">
            <textarea v-model="rejectReason" rows="3" placeholder="سبب الرفض (مطلوب عند الرفض)"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none"></textarea>
            <button @click="reject" :disabled="actionLoading || !rejectReason"
              class="w-full py-2.5 rounded-xl font-bold transition-all text-sm"
              style="border: 1.5px solid #DC2626; color: #DC2626"
              :style="(!rejectReason || actionLoading) ? 'opacity: 0.5' : ''">
              <span v-if="actionLoading === 'reject'">جاري الرفض...</span>
              <span v-else>✕ رفض الطلب</span>
            </button>
          </div>
        </div>

        <!-- Already Reviewed -->
        <div v-else class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-bold text-slate-800 mb-3">نتيجة المراجعة</h3>
          <div class="p-3 rounded-xl text-sm" :style="statusStyle(app.status)">
            <p class="font-bold mb-1">{{ statusLabel(app.status) }}</p>
            <p v-if="app.reviewedBy" class="text-xs opacity-70">بواسطة: {{ app.reviewedBy }}</p>
            <p v-if="app.reviewedAt" class="text-xs opacity-70">{{ formatDate(app.reviewedAt) }}</p>
            <p v-if="app.rejectionReason" class="mt-2 text-xs">السبب: {{ app.rejectionReason }}</p>
          </div>
        </div>

        <!-- Quick Info -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">تاريخ التقديم</span>
            <span class="font-semibold text-slate-800">{{ formatDate(app.createdAt) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">عدد الخدمات</span>
            <span class="font-semibold text-slate-800">{{ app.subCategories?.length || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">الصور</span>
            <span class="font-semibold text-slate-800">{{ app.imageUrls?.length || 0 }} صورة</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const app = ref<any>(null)
const loading = ref(true)
const actionLoading = ref<string | null>(null)
const rejectReason = ref('')

onMounted(async () => {
  try {
    const res = await api.get(`/admin/applications/${route.params.id}`)
    app.value = res.data
  } finally {
    loading.value = false
  }
})

async function approve() {
  actionLoading.value = 'approve'
  try {
    await api.put(`/admin/applications/${route.params.id}/approve`)
    router.push('/applications')
  } finally {
    actionLoading.value = null
  }
}

async function reject() {
  if (!rejectReason.value) return
  actionLoading.value = 'reject'
  try {
    await api.put(`/admin/applications/${route.params.id}/reject`, { reason: rejectReason.value })
    router.push('/applications')
  } finally {
    actionLoading.value = null
  }
}

function statusStyle(s: string) {
  const map: any = {
    Pending: 'background: #FFFBEB; color: #B45309',
    Approved: 'background: #F0FDF4; color: #047857',
    Rejected: 'background: #FEF2F2; color: #B91C1C',
  }
  return map[s] || ''
}
function statusLabel(s: string) {
  return { Pending: 'معلق', Approved: 'مقبول', Rejected: 'مرفوض' }[s] || s
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
