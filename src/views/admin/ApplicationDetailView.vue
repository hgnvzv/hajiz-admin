<template>
  <div dir="rtl" class="space-y-5">
    <div class="flex items-center gap-3">
      <RouterLink to="/applications" class="text-blue-600 hover:underline text-sm">← طلبات الانضمام</RouterLink>
    </div>

    <div v-if="loading" class="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <div class="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="app" class="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Header Card -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-slate-900">{{ app.businessName }}</h2>
              <p class="text-slate-500 text-sm mt-1">{{ app.ownerName }} · {{ app.phone }}</p>
            </div>
            <span class="text-sm font-bold px-3 py-1.5 rounded-full" :style="statusStyle(app.status)">
              {{ statusLabel(app.status) }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="p-3 rounded-xl" style="background: #F8FAFC">
              <p class="text-xs text-slate-500 mb-0.5">التصنيف</p>
              <p class="font-semibold text-slate-800">{{ app.categoryName }}</p>
            </div>
            <div class="p-3 rounded-xl" style="background: #F8FAFC">
              <p class="text-xs text-slate-500 mb-0.5">المحافظة</p>
              <p class="font-semibold text-slate-800">{{ app.city }}</p>
            </div>
            <div class="p-3 rounded-xl col-span-2" style="background: #F8FAFC">
              <p class="text-xs text-slate-500 mb-0.5">العنوان</p>
              <p class="font-semibold text-slate-800">{{ app.address }}</p>
            </div>
          </div>
          <div v-if="app.description" class="mt-3 p-3 rounded-xl" style="background: #F8FAFC">
            <p class="text-xs text-slate-500 mb-1">وصف المحل</p>
            <p class="text-slate-700 text-sm leading-relaxed">{{ app.description }}</p>
          </div>
        </div>

        <!-- Images -->
        <div v-if="app.imageUrls?.length" class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-bold text-slate-800 mb-3">صور المحل</h3>
          <div class="grid grid-cols-3 gap-2">
            <img v-for="(img, i) in app.imageUrls" :key="i" :src="img"
              class="w-full h-24 object-cover rounded-xl border border-slate-200"
              @error="e => (e.target as any).src = 'https://via.placeholder.com/150?text=صورة'" />
          </div>
        </div>

        <!-- Working Hours -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-bold text-slate-800 mb-3">أوقات العمل</h3>
          <div class="space-y-2">
            <div v-for="wh in app.workingHours" :key="wh.dayName"
              class="flex items-center justify-between p-2.5 rounded-xl text-sm"
              :style="wh.isOpen ? 'background: #EFF6FF' : 'background: #F8FAFC'">
              <span class="font-semibold" :style="wh.isOpen ? 'color: #1D4ED8' : 'color: #94A3B8'">
                {{ wh.dayName }}
              </span>
              <span v-if="wh.isOpen" class="text-slate-600">{{ wh.startTime }} — {{ wh.endTime }}</span>
              <span v-else class="text-xs text-slate-400">إجازة</span>
            </div>
          </div>
        </div>

        <!-- Sub Categories -->
        <div v-if="app.subCategories?.length" class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-bold text-slate-800 mb-3">الخدمات المقدمة</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="sub in app.subCategories" :key="sub"
              class="text-sm px-3 py-1.5 rounded-full font-medium"
              style="background: #EFF6FF; color: #2563EB">{{ sub }}</span>
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
