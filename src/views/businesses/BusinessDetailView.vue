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
            <p v-if="biz.ownerName" class="mt-1 text-sm text-[#6B7280]">المالك: {{ biz.ownerName }}</p>
            <p class="mt-2 text-sm">{{ biz.address }}</p>
            <p class="mt-1 text-xs text-[#6B7280]">تاريخ التسجيل: {{ formatDateShort(biz.createdAt as string) }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-3 py-1 text-sm font-bold"
              :class="statusClass(businessStatus)"
            >
              {{ statusLabel(businessStatus) }}
            </span>
            <button
              v-if="businessStatus === 'pending'"
              type="button"
              class="rounded-xl bg-success px-4 py-2 font-bold text-white"
              @click="doApprove"
            >
              موافقة
            </button>
            <button
              v-if="businessStatus === 'active'"
              type="button"
              class="rounded-xl bg-warning px-4 py-2 font-bold text-white"
              @click="showSuspend = true"
            </button>
            <button
              v-if="businessStatus === 'suspended'"
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
            <p class="text-2xl font-black text-primary-dark">{{ statNum('totalBookings') }}</p>
            <p class="text-xs text-[#6B7280]">إجمالي الحجوزات</p>
          </div>
          <div class="rounded-xl bg-primary-light/60 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ formatMoney(statNum('totalCommissions')) }}</p>
            <p class="text-xs text-[#6B7280]">إجمالي العمولات</p>
          </div>
          <div class="rounded-xl bg-primary-light/60 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ formatMoney(statNum('totalRevenue')) }}</p>
            <p class="text-xs text-[#6B7280]">الإيرادات</p>
          </div>
          <div class="rounded-xl bg-primary-light/60 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ ratingFmt(biz.avgRating ?? stats?.avgRating) }}</p>
            <p class="text-xs text-[#6B7280]">التقييم ({{ reviewCount }})</p>
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
          <div><dt class="text-[#6B7280]">المعرّف</dt><dd class="font-mono text-xs font-bold break-all">{{ biz.id }}</dd></div>
          <div><dt class="text-[#6B7280]">الرابط (slug)</dt><dd class="font-bold">{{ biz.slug ?? '—' }}</dd></div>
          <div><dt class="text-[#6B7280]">اسم المالك</dt><dd class="font-bold">{{ biz.ownerName ?? '—' }}</dd></div>
          <div><dt class="text-[#6B7280]">البريد</dt><dd class="font-bold">{{ biz.email ?? '—' }}</dd></div>
          <div><dt class="text-[#6B7280]">الهاتف</dt><dd class="font-bold">{{ biz.phone ?? '—' }}</dd></div>
          <div><dt class="text-[#6B7280]">المدينة</dt><dd class="font-bold">{{ biz.city ?? '—' }}</dd></div>
          <div class="md:col-span-2">
            <dt class="text-[#6B7280]">الوصف</dt>
            <dd class="mt-1 font-bold">{{ biz.description ?? '—' }}</dd>
          </div>
          <div><dt class="text-[#6B7280]">خط العرض / الطول</dt><dd class="font-mono text-xs font-bold">{{ coordText }}</dd></div>
          <div><dt class="text-[#6B7280]">معتمد</dt><dd class="font-bold">{{ boolAr(biz.isApproved) }}</dd></div>
          <div><dt class="text-[#6B7280]">نشط</dt><dd class="font-bold">{{ boolAr(biz.isActive) }}</dd></div>
          <div><dt class="text-[#6B7280]">التصنيف</dt><dd class="font-bold">{{ biz.categoryName ?? biz.category ?? '—' }}</dd></div>
          <div v-if="biz.isOpen !== undefined && biz.isOpen !== null">
            <dt class="text-[#6B7280]">مفتوح الآن</dt>
            <dd class="font-bold">{{ biz.isOpen ? 'نعم' : 'لا' }}</dd>
          </div>
        </dl>

        <section class="mt-6 rounded-xl border border-border bg-[#F8F8FC] p-5">
          <h4 class="mb-4 font-black text-[#1A1A2E]">إعدادات الحجز — اختيار المناسبة</h4>
          <dl class="mb-4 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt class="text-[#6B7280]">الافتراضي من التصنيف</dt>
              <dd class="font-bold">{{ boolAr(categoryOccasionDefault) }}</dd>
            </div>
            <div>
              <dt class="text-[#6B7280]">القيمة الفعلية</dt>
              <dd class="font-bold text-primary-dark">
                {{ boolAr(effectiveOccasion) }}
                <span class="mr-1 text-xs font-normal text-[#6B7280]">({{ effectiveOccasionLabel }})</span>
              </dd>
            </div>
          </dl>
          <label class="mb-2 block text-xs font-bold text-[#6B7280]">تجاوز إعداد المحل</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in occasionOverrideOptions"
              :key="opt.value"
              type="button"
              class="rounded-xl px-4 py-2 text-sm font-bold transition"
              :class="occasionOverride === opt.value ? 'bg-primary text-white' : 'bg-white text-[#6B7280] ring-1 ring-border'"
              @click="occasionOverride = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <button
            type="button"
            class="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            :disabled="savingOccasion"
            @click="saveOccasionOverride"
          >
            {{ savingOccasion ? 'جاري الحفظ…' : 'حفظ إعداد المناسبة' }}
          </button>
        </section>

        <div v-if="hours.length" class="mt-6 overflow-x-auto">
          <h4 class="mb-2 font-bold">أوقات الدوام</h4>
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-3 py-2">اليوم</th>
                <th class="px-3 py-2">الحالة</th>
                <th class="px-3 py-2">من</th>
                <th class="px-3 py-2">إلى</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(h, i) in hours" :key="i">
                <td class="px-3 py-2">{{ hourDayLabel(h, i) }}</td>
                <td class="px-3 py-2">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-bold"
                    :class="hourOpenClass(h)"
                  >
                    {{ hourOpenLabel(h) }}
                  </span>
                </td>
                <td class="px-3 py-2">{{ hourStart(h) }}</td>
                <td class="px-3 py-2">{{ hourEnd(h) }}</td>
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
              <tr v-if="!staffOrUsers.length">
                <td colspan="3" class="px-4 py-10 text-center text-[#6B7280]">لا يوجد موظفون أو مستخدمون مرتبطون</td>
              </tr>
              <tr v-for="(s, si) in staffOrUsers" :key="(s as { id?: string }).id ?? si">
                <td class="px-4 py-3 font-semibold">{{ (s as { name?: string; fullName?: string }).name ?? (s as { fullName?: string }).fullName ?? '—' }}</td>
                <td class="px-4 py-3">{{ (s as { phone?: string }).phone ?? '—' }}</td>
                <td class="px-4 py-3">{{ (s as { role?: string }).role ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="tab === 'images'" class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div v-if="!images.length" class="py-10 text-center text-[#6B7280]">لا توجد صور</div>
        <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div v-for="(im, i) in images" :key="i" class="relative">
            <span
              v-if="imageIsPrimary(im)"
              class="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white shadow"
            >
              رئيسية
            </span>
            <a :href="imgUrl(im)" target="_blank" rel="noopener noreferrer" class="block">
              <img :src="imgUrl(im)" alt="" class="h-36 w-full rounded-xl object-cover ring-1 ring-border" />
            </a>
          </div>
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
  updateBusiness,
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

/** يدعم الاستجابة القديمة (status) والجديدة (isApproved / isActive) */
const businessStatus = computed(() => {
  const b = biz.value
  if (!b) return ''
  const ex = b.status
  if (ex != null && String(ex).trim() !== '') return String(ex).toLowerCase()
  if (b.isApproved === false) return 'pending'
  if (b.isApproved === true && b.isActive === false) return 'suspended'
  if (b.isApproved === true && b.isActive === true) return 'active'
  return 'active'
})

const tabs = [
  { id: 'info' as const, label: 'معلومات' },
  { id: 'services' as const, label: 'الخدمات' },
  { id: 'staff' as const, label: 'الموظفون والحسابات' },
  { id: 'images' as const, label: 'الصور' },
  { id: 'bookings' as const, label: 'آخر الحجوزات' },
]

const stats = computed(() => biz.value?.stats as Record<string, unknown> | undefined)

function statNum(key: string) {
  const st = stats.value
  if (!st || st[key] === undefined || st[key] === null) return 0
  const n = Number(st[key])
  return Number.isNaN(n) ? 0 : n
}

const reviewCount = computed(() => {
  const b = biz.value
  if (!b) return 0
  const fromRoot = Number(b.totalReviews)
  if (!Number.isNaN(fromRoot)) return fromRoot
  const st = b.stats as Record<string, unknown> | undefined
  if (st?.totalReviews != null) {
    const n = Number(st.totalReviews)
    if (!Number.isNaN(n)) return n
  }
  return 0
})

const coordText = computed(() => {
  const b = biz.value
  if (!b) return '—'
  const lat = b.latitude
  const lng = b.longitude
  if (lat == null || lng == null) return '—'
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
})

const services = computed(() => {
  const s = biz.value?.services
  return Array.isArray(s) ? s : []
})
/** موظفو الخدمة + مستخدمو المحل (مثل Owner) دون تكرار */
const staffOrUsers = computed(() => {
  const b = biz.value
  if (!b) return [] as Record<string, unknown>[]
  const st = Array.isArray(b.staff) ? (b.staff as Record<string, unknown>[]) : []
  const us = Array.isArray(b.users) ? (b.users as Record<string, unknown>[]) : []
  const seen = new Set<string>()
  const out: Record<string, unknown>[] = []
  for (const row of [...st, ...us]) {
    const id = row.id != null ? String(row.id) : `phone:${row.phone ?? ''}:name:${row.fullName ?? row.name ?? ''}`
    if (seen.has(id)) continue
    seen.add(id)
    out.push(row)
  }
  return out
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
const savingOccasion = ref(false)
const occasionOverride = ref<'inherit' | 'enabled' | 'disabled'>('inherit')

const occasionOverrideOptions = [
  { value: 'inherit' as const, label: 'وراثة من التصنيف' },
  { value: 'enabled' as const, label: 'مفعّل' },
  { value: 'disabled' as const, label: 'معطّل' },
]

const categoryOccasionDefault = computed(() => {
  const b = biz.value
  if (!b) return false
  if (b.categorySupportsOccasionSelection != null) return Boolean(b.categorySupportsOccasionSelection)
  const cat = b.category
  if (cat && typeof cat === 'object' && (cat as Record<string, unknown>).supportsOccasionSelection != null) {
    return Boolean((cat as Record<string, unknown>).supportsOccasionSelection)
  }
  return false
})

const effectiveOccasion = computed(() => {
  if (occasionOverride.value === 'enabled') return true
  if (occasionOverride.value === 'disabled') return false
  return categoryOccasionDefault.value
})

const effectiveOccasionLabel = computed(() => {
  if (occasionOverride.value === 'inherit') return 'موروث من التصنيف'
  return 'مُعدّل يدوياً'
})

function syncOccasionOverrideFromBusiness() {
  if (!biz.value) return
  const b = biz.value
  const explicit =
    b.businessSupportsOccasionSelection ??
    b.supportsOccasionSelectionOverride
  if (explicit === true) occasionOverride.value = 'enabled'
  else if (explicit === false) occasionOverride.value = 'disabled'
  else occasionOverride.value = 'inherit'
}

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

function boolAr(v: unknown) {
  if (v === true) return 'نعم'
  if (v === false) return 'لا'
  return '—'
}

function hourDayLabel(h: Record<string, unknown>, i: number) {
  if (h.day != null && h.day !== '') return String(h.day)
  if (h.dayOfWeek != null && h.dayOfWeek !== '') return String(h.dayOfWeek)
  return String(i + 1)
}

function hourStart(h: Record<string, unknown>) {
  if (h.isOpen === false) return '—'
  const v = h.open ?? h.from ?? h.startTime
  return v != null && v !== '' ? String(v) : '—'
}

function hourEnd(h: Record<string, unknown>) {
  if (h.isOpen === false) return '—'
  const v = h.close ?? h.to ?? h.endTime
  return v != null && v !== '' ? String(v) : '—'
}

function hourOpenLabel(h: Record<string, unknown>) {
  return h.isOpen === false ? 'مغلق' : 'مفتوح'
}

function hourOpenClass(h: Record<string, unknown>) {
  return h.isOpen === false
    ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
    : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
}

function imgUrl(im: unknown) {
  if (typeof im === 'string') return im
  const o = im as { url?: string; imageUrl?: string }
  return o.url ?? o.imageUrl ?? ''
}

function imageIsPrimary(im: unknown) {
  if (typeof im !== 'object' || !im) return false
  return (im as { isPrimary?: boolean }).isPrimary === true
}

async function load() {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getBusinessDetail(id)
    biz.value = res.data as Record<string, unknown>
    syncOccasionOverrideFromBusiness()
  } catch (e) {
    biz.value = null
    toast.error(apiMessage(e))
  } finally {
    loading.value = false
  }
}

async function saveOccasionOverride() {
  savingOccasion.value = true
  try {
    const payload: Record<string, unknown> = {
      supportsOccasionSelection:
        occasionOverride.value === 'inherit'
          ? null
          : occasionOverride.value === 'enabled',
    }
    await updateBusiness(String(route.params.id), payload)
    toast.success('تم حفظ إعداد المناسبة')
    load()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر حفظ الإعداد'))
  } finally {
    savingOccasion.value = false
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
