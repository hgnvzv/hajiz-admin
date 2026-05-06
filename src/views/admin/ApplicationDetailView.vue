<template>
  <div dir="rtl" class="space-y-5">
    <RouterLink to="/applications"
      class="inline-flex items-center gap-2 text-sm font-semibold transition-all"
      style="color: #257d75">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      طلبات الانضمام
    </RouterLink>

    <div v-if="loading" class="rounded-2xl p-10 text-center"
      style="background: white; border: 1px solid #e2eded">
      <div class="inline-block w-7 h-7 border-2 rounded-full animate-spin"
        style="border-color: rgba(37,125,117,0.2); border-top-color: #257d75"></div>
    </div>

    <div v-else-if="app" class="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Header Card -->
        <div class="rounded-2xl overflow-hidden"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <div class="px-6 py-4 border-b" style="background: linear-gradient(135deg, #f8fbfb, #f0f4f3); border-color: #e2eded">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-black" style="color: #0a2c2a">{{ app.businessName }}</h2>
                <p class="text-sm mt-1" style="color: #6b7f7e">{{ app.ownerName }} · {{ app.phone }}</p>
              </div>
              <span class="text-sm font-bold px-3 py-1.5 rounded-full" :style="statusStyle(app.status)">
                {{ statusLabel(app.status) }}
              </span>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="p-3.5 rounded-xl" style="background: #f8fbfb; border: 1px solid #f0f4f3">
                <p class="text-xs font-semibold mb-1" style="color: #9aadac">التصنيف</p>
                <p class="font-bold" style="color: #0a2c2a">{{ app.categoryName }}</p>
              </div>
              <div class="p-3.5 rounded-xl" style="background: #f8fbfb; border: 1px solid #f0f4f3">
                <p class="text-xs font-semibold mb-1" style="color: #9aadac">المحافظة</p>
                <p class="font-bold" style="color: #0a2c2a">{{ app.city }}</p>
              </div>
              <div class="p-3.5 rounded-xl col-span-2" style="background: #f8fbfb; border: 1px solid #f0f4f3">
                <p class="text-xs font-semibold mb-1" style="color: #9aadac">العنوان</p>
                <p class="font-semibold" style="color: #0a2c2a">{{ app.address }}</p>
              </div>
            </div>
            <div v-if="app.description" class="mt-3 p-3.5 rounded-xl" style="background: #f8fbfb; border: 1px solid #f0f4f3">
              <p class="text-xs font-semibold mb-1.5" style="color: #9aadac">وصف المحل</p>
              <p class="text-sm leading-relaxed" style="color: #1a3c3a">{{ app.description }}</p>
            </div>
          </div>
        </div>

        <!-- Images -->
        <div v-if="app.imageUrls?.length" class="rounded-2xl p-5"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <h3 class="font-bold mb-3" style="color: #0a2c2a">صور المحل</h3>
          <div class="grid grid-cols-3 gap-2">
            <img v-for="(img, i) in app.imageUrls" :key="i" :src="img"
              class="w-full h-28 object-cover rounded-xl"
              style="border: 1px solid #e2eded"
              @error="e => (e.target as any).src = 'https://via.placeholder.com/150?text=صورة'" />
          </div>
        </div>

        <!-- Working Hours -->
        <div class="rounded-2xl p-5"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <h3 class="font-bold mb-3" style="color: #0a2c2a">أوقات العمل</h3>
          <div class="space-y-2">
            <div v-for="wh in app.workingHours" :key="wh.dayName"
              class="flex items-center justify-between p-3 rounded-xl text-sm"
              :style="wh.isOpen
                ? 'background: #e8f5f4; border: 1px solid #d1ece9'
                : 'background: #f8fbfb; border: 1px solid #f0f4f3'">
              <span class="font-bold" :style="wh.isOpen ? 'color: #1d6560' : 'color: #9aadac'">
                {{ wh.dayName }}
              </span>
              <span v-if="wh.isOpen" class="font-semibold" style="color: #257d75">{{ wh.startTime }} — {{ wh.endTime }}</span>
              <span v-else class="text-xs" style="color: #9aadac">إجازة</span>
            </div>
          </div>
        </div>

        <!-- Sub Categories -->
        <div v-if="app.subCategories?.length" class="rounded-2xl p-5"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <h3 class="font-bold mb-3" style="color: #0a2c2a">الخدمات المقدمة</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="sub in app.subCategories" :key="sub"
              class="text-sm px-3 py-1.5 rounded-full font-semibold"
              style="background: #e8f5f4; color: #257d75; border: 1px solid #d1ece9">{{ sub }}</span>
          </div>
        </div>
      </div>

      <!-- Actions Sidebar -->
      <div class="space-y-4">
        <!-- Action Card -->
        <div v-if="app.status === 'Pending'" class="rounded-2xl p-5"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <h3 class="font-bold mb-4" style="color: #0a2c2a">اتخاذ قرار</h3>

          <button @click="approve" :disabled="actionLoading !== null"
            class="w-full py-3 rounded-xl font-black text-white mb-3 transition-all"
            style="background: linear-gradient(135deg, #257d75, #1d6560); box-shadow: 0 3px 12px rgba(37,125,117,0.25)">
            <span v-if="actionLoading === 'approve'">جاري القبول...</span>
            <span v-else>✓ قبول الطلب</span>
          </button>

          <div class="space-y-2">
            <textarea v-model="rejectReason" rows="3" placeholder="سبب الرفض (مطلوب عند الرفض)"
              class="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
              style="border: 1.5px solid #e2eded; background: #f8fbfb"
              onfocus="this.style.borderColor='#dc2626'"
              onblur="this.style.borderColor='#e2eded'"></textarea>
            <button @click="reject" :disabled="actionLoading !== null || !rejectReason"
              class="w-full py-2.5 rounded-xl font-bold transition-all text-sm"
              style="border: 1.5px solid #dc2626; color: #dc2626; background: #fef2f2"
              :style="(!rejectReason || actionLoading) ? 'opacity: 0.5; cursor: not-allowed' : ''">
              <span v-if="actionLoading === 'reject'">جاري الرفض...</span>
              <span v-else>✕ رفض الطلب</span>
            </button>
          </div>
        </div>

        <!-- Already Reviewed -->
        <div v-else class="rounded-2xl p-5"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <h3 class="font-bold mb-3" style="color: #0a2c2a">نتيجة المراجعة</h3>
          <div class="p-3.5 rounded-xl text-sm" :style="statusStyle(app.status)">
            <p class="font-black mb-1">{{ statusLabel(app.status) }}</p>
            <p v-if="app.reviewedBy" class="text-xs opacity-70">بواسطة: {{ app.reviewedBy }}</p>
            <p v-if="app.reviewedAt" class="text-xs opacity-70">{{ formatDate(app.reviewedAt) }}</p>
            <p v-if="app.rejectionReason" class="mt-2 text-xs">السبب: {{ app.rejectionReason }}</p>
          </div>
        </div>

        <!-- Quick Info -->
        <div class="rounded-2xl p-5 space-y-3 text-sm"
          style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
          <div class="flex justify-between items-center">
            <span style="color: #9aadac">تاريخ التقديم</span>
            <span class="font-bold" style="color: #0a2c2a">{{ formatDate(app.createdAt) }}</span>
          </div>
          <div class="h-px" style="background: #f0f4f3"></div>
          <div class="flex justify-between items-center">
            <span style="color: #9aadac">عدد الخدمات</span>
            <span class="font-bold px-2 py-0.5 rounded-full text-xs" style="background: #e8f5f4; color: #257d75">
              {{ app.subCategories?.length || 0 }}
            </span>
          </div>
          <div class="h-px" style="background: #f0f4f3"></div>
          <div class="flex justify-between items-center">
            <span style="color: #9aadac">الصور</span>
            <span class="font-bold px-2 py-0.5 rounded-full text-xs" style="background: #fef9e7; color: #b45309">
              {{ app.imageUrls?.length || 0 }} صورة
            </span>
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
    Pending: 'background: #fef9e7; color: #b45309; border: 1px solid #fde68a',
    Approved: 'background: #e8f5f4; color: #1d6560; border: 1px solid #d1ece9',
    Rejected: 'background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca',
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
