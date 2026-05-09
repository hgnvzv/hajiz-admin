<template>
  <div class="space-y-6" dir="rtl">
    <RouterLink to="/businesses" class="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
      ← العودة للمحلات
    </RouterLink>

    <LoadingSpinner v-if="loading" />
    <template v-else-if="biz">
      <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 class="text-2xl font-black text-[#1A1A2E]">{{ biz.name }}</h1>
            <p class="mt-1 text-[#6B7280]">{{ biz.categoryName ?? biz.category }} • {{ biz.phone }}</p>
            <p class="mt-2 text-sm">{{ biz.address }}</p>
            <p class="mt-1 text-xs text-[#6B7280]">تاريخ التسجيل: {{ formatDateShort(biz.createdAt as string) }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-3 py-1 text-sm font-bold"
              :class="statusClass(biz.status)"
            >
              {{ statusLabel(biz.status) }}
            </span>
            <button
              v-if="biz.status === 'pending'"
              type="button"
              class="rounded-xl bg-success px-4 py-2 font-bold text-white"
              @click="doApprove"
            >
              موافقة
            </button>
            <button
              v-if="biz.status === 'active'"
              type="button"
              class="rounded-xl bg-warning px-4 py-2 font-bold text-white"
              @click="showSuspend = true"
            >
              إيقاف
            </button>
            <button
              v-if="biz.status === 'suspended'"
              type="button"
              class="rounded-xl bg-success px-4 py-2 font-bold text-white"
              @click="doActivate"
            >
              تفعيل
            </button>
            <button type="button" class="rounded-xl bg-danger px-4 py-2 font-bold text-white" @click="showDelete = true">
              حذف
            </button>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div class="rounded-xl bg-primary-light/60 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ stats?.totalBookings ?? 0 }}</p>
            <p class="text-xs text-[#6B7280]">إجمالي الحجوزات</p>
          </div>
          <div class="rounded-xl bg-primary-light/60 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ stats?.completedBookings ?? 0 }}</p>
            <p class="text-xs text-[#6B7280]">المكتملة</p>
          </div>
          <div class="rounded-xl bg-primary-light/60 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ formatMoney(stats?.totalRevenue) }}</p>
            <p class="text-xs text-[#6B7280]">الإيرادات</p>
          </div>
          <div class="rounded-xl bg-primary-light/60 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ ratingFmt(stats?.avgRating) }}</p>
            <p class="text-xs text-[#6B7280]">التقييم ({{ stats?.totalReviews ?? 0 }})</p>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 border-b border-border">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          class="rounded-t-xl px-4 py-2 text-sm font-bold transition"
          :class="tab === t.id ? 'bg-primary text-white' : 'bg-[#F8F8FC] text-[#6B7280]'"
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <div v-show="tab === 'info'" class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h3 class="mb-4 font-black text-[#1A1A2E]">معلومات إضافية</h3>
        <dl class="grid gap-3 text-sm md:grid-cols-2">
          <div><dt class="text-[#6B7280]">المالك</dt><dd class="font-bold">{{ biz.ownerName ?? '—' }}</dd></div>
          <div><dt class="text-[#6B7280]">مفتوح الآن</dt><dd class="font-bold">{{ biz.isOpen ? 'نعم' : 'لا' }}</dd></div>
        </dl>
        <div v-if="hours.length" class="mt-6 overflow-x-auto">
          <h4 class="mb-2 font-bold">أوقات الدوام</h4>
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-3 py-2">اليوم</th>
                <th class="px-3 py-2">من</th>
                <th class="px-3 py-2">إلى</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(h, i) in hours" :key="i">
                <td class="px-3 py-2">{{ h.day ?? h.dayOfWeek ?? i + 1 }}</td>
                <td class="px-3 py-2">{{ h.open ?? h.from ?? '—' }}</td>
                <td class="px-3 py-2">{{ h.close ?? h.to ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="tab === 'services'" class="rounded-2xl border border-border bg-surface shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3 text-right">الخدمة</th>
                <th class="px-4 py-3 text-right">السعر</th>
                <th class="px-4 py-3 text-right">المدة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="!services.length">
                <td colspan="3" class="px-4 py-10 text-center text-[#6B7280]">لا توجد خدمات</td>
              </tr>
              <tr v-for="(s, si) in services" :key="(s as { id?: string }).id ?? si">
                <td class="px-4 py-3 font-semibold">{{ s.name }}</td>
                <td class="px-4 py-3">{{ formatMoney(s.price as number) }}</td>
                <td class="px-4 py-3">{{ s.durationMinutes ?? s.duration ?? '—' }} د</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="tab === 'staff'" class="rounded-2xl border border-border bg-surface shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">الاسم</th>
                <th class="px-4 py-3">الهاتف</th>
                <th class="px-4 py-3">الدور</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="!staff.length">
                <td colspan="3" class="px-4 py-10 text-center text-[#6B7280]">لا يوجد موظفون</td>
              </tr>
              <tr v-for="(s, si) in staff" :key="(s as { id?: string }).id ?? si">
                <td class="px-4 py-3 font-semibold">{{ s.name ?? s.fullName }}</td>
                <td class="px-4 py-3">{{ s.phone ?? '—' }}</td>
                <td class="px-4 py-3">{{ s.role ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="tab === 'images'" class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div v-if="!images.length" class="py-10 text-center text-[#6B7280]">لا توجد صور</div>
        <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <img
            v-for="(im, i) in images"
            :key="i"
            :src="imgUrl(im)"
            alt=""
            class="h-36 w-full rounded-xl object-cover ring-1 ring-border"
          />
        </div>
      </div>

      <div v-show="tab === 'bookings'" class="rounded-2xl border border-border bg-surface shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">الزبون</th>
                <th class="px-4 py-3">الخدمة</th>
                <th class="px-4 py-3">التاريخ</th>
                <th class="px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="!recentBookings.length">
                <td colspan="4" class="px-4 py-10 text-center text-[#6B7280]">لا توجد حجوزات</td>
              </tr>
              <tr v-for="b in recentBookings" :key="b.id">
                <td class="px-4 py-3">{{ b.customerName ?? '—' }}</td>
                <td class="px-4 py-3">{{ b.serviceName ?? '—' }}</td>
                <td class="px-4 py-3">{{ formatDateShort(b.appointmentDate as string) }}</td>
                <td class="px-4 py-3"><StatusBadge :status="String(b.status ?? 'pending')" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <p v-else class="text-center text-danger">تعذر تحميل بيانات المحل</p>

    <ConfirmModal
      v-model="showSuspend"
      title="إيقاف المحل"
      confirm-text="إيقاف"
      confirm-color="danger"
      @confirm="confirmSuspend"
    >
      <textarea v-model="suspendReason" rows="3" class="mt-2 w-full rounded-xl border border-border p-3" placeholder="السبب" />
    </ConfirmModal>

    <ConfirmModal
      v-model="showDelete"
      title="حذف المحل"
      message="سيتم الحذف نهائياً."
      confirm-text="حذف"
      confirm-color="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  getBusinessDetail,
  approveBusiness,
  suspendBusiness,
  activateBusiness,
  deleteBusiness,
} from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatDateShort, formatMoney } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const biz = ref<Record<string, unknown> | null>(null)
const tab = ref<'info' | 'services' | 'staff' | 'images' | 'bookings'>('info')

const tabs = [
  { id: 'info' as const, label: 'معلومات' },
  { id: 'services' as const, label: 'الخدمات' },
  { id: 'staff' as const, label: 'الموظفون' },
  { id: 'images' as const, label: 'الصور' },
  { id: 'bookings' as const, label: 'آخر الحجوزات' },
]

const stats = computed(() => biz.value?.stats as Record<string, unknown> | undefined)
const services = computed(() => {
  const s = biz.value?.services
  return Array.isArray(s) ? s : []
})
const staff = computed(() => {
  const s = biz.value?.staff
  return Array.isArray(s) ? s : []
})
const images = computed(() => {
  const s = biz.value?.images
  return Array.isArray(s) ? s : []
})
const hours = computed(() => {
  const s = biz.value?.workingHours
  return Array.isArray(s) ? s : []
})
const recentBookings = computed(() => {
  const s = biz.value?.recentBookings
  return Array.isArray(s) ? s : []
})

const showSuspend = ref(false)
const suspendReason = ref('')
const showDelete = ref(false)

function statusLabel(s: unknown) {
  const m: Record<string, string> = {
    pending: 'بانتظار الموافقة',
    active: 'نشط',
    suspended: 'موقوف',
  }
  return m[String(s)] ?? String(s ?? '—')
}

function statusClass(s: unknown) {
  const v = String(s)
  if (v === 'active') return 'bg-emerald-50 text-success ring-1 ring-emerald-200'
  if (v === 'pending') return 'bg-amber-50 text-warning ring-1 ring-amber-200'
  if (v === 'suspended') return 'bg-red-50 text-danger ring-1 ring-red-200'
  return 'bg-gray-100 text-gray-700'
}

function ratingFmt(v: unknown) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : n.toFixed(1)
}

function imgUrl(im: unknown) {
  if (typeof im === 'string') return im
  const o = im as { url?: string; imageUrl?: string }
  return o.url ?? o.imageUrl ?? ''
}

async function load() {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getBusinessDetail(id)
    biz.value = res.data as Record<string, unknown>
  } catch (e) {
    biz.value = null
    toast.error(apiMessage(e))
  } finally {
    loading.value = false
  }
}

async function doApprove() {
  try {
    await approveBusiness(String(route.params.id))
    toast.success('تمت الموافقة')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function confirmSuspend() {
  try {
    await suspendBusiness(String(route.params.id), suspendReason.value || '—')
    toast.success('تم الإيقاف')
    showSuspend.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function doActivate() {
  try {
    await activateBusiness(String(route.params.id))
    toast.success('تم التفعيل')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function confirmDelete() {
  try {
    await deleteBusiness(String(route.params.id))
    toast.success('تم الحذف')
    router.push('/businesses')
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
