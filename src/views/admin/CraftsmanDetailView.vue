<template>
  <div class="space-y-6" dir="rtl">
    <RouterLink to="/craftsmen" class="inline-flex text-sm font-bold text-blue-600">← رجوع إلى الحرفيين</RouterLink>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white py-16"><LoadingSpinner /></div>
    <template v-else-if="item">
      <div class="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full px-3 py-1 text-sm font-bold" :class="statusClass(item.status)">
            {{ statusLabel(item.status) }}
          </span>
          <span
            class="rounded-full px-3 py-1 text-xs font-bold"
            :class="item.isActive === false ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'"
          >
            {{ item.isActive === false ? 'حساب معطّل' : 'حساب نشط' }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="item.status === 'Pending'"
            type="button"
            class="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white"
            @click="approve"
          >
            قبول
          </button>
          <button
            v-if="item.status === 'Pending'"
            type="button"
            class="rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white"
            @click="rejectOpen = true"
          >
            رفض
          </button>
          <button
            v-if="item.status === 'Approved'"
            type="button"
            class="rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-white"
            @click="toggleConfirmOpen = true"
          >
            {{ item.isActive === false ? 'تفعيل الحساب' : 'تعطيل الحساب' }}
          </button>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">الملف الشخصي</h3>
          <div class="mt-5 flex flex-wrap items-start gap-5">
            <button
              type="button"
              class="overflow-hidden rounded-2xl border border-slate-200 ring-offset-2 hover:ring-2 hover:ring-blue-300"
              @click="openLightbox(profileUrl)"
            >
              <img :src="profileUrl || '/favicon.ico'" alt="صورة الحرفي" class="h-28 w-28 object-cover" />
            </button>
            <div class="min-w-0 flex-1">
              <h2 class="text-2xl font-black text-slate-900">{{ item.fullName ?? item.name ?? '—' }}</h2>
              <p class="mt-1 text-sm font-bold text-slate-600">{{ item.phone ?? '—' }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ item.city ?? item.cityName ?? '—' }}</p>
            </div>
          </div>
          <dl class="mt-6 space-y-3 text-sm">
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-xs font-bold text-slate-500">العنوان</dt>
              <dd class="mt-1 font-bold text-slate-900">{{ item.address ?? '—' }}</dd>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-xs font-bold text-slate-500">نبذة</dt>
              <dd class="mt-1 text-slate-800">{{ item.bio ?? 'لا توجد نبذة مسجلة' }}</dd>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl bg-slate-50 p-3">
                <dt class="text-xs font-bold text-slate-500">متاح الآن</dt>
                <dd class="mt-1 font-bold" :class="item.isAvailableNow ? 'text-emerald-700' : 'text-slate-600'">
                  {{ item.isAvailableNow ? 'نعم' : 'لا' }}
                  <span class="mr-1 text-xs font-normal text-slate-500">(للقراءة فقط)</span>
                </dd>
              </div>
              <div class="rounded-xl bg-slate-50 p-3">
                <dt class="text-xs font-bold text-slate-500">تاريخ التسجيل</dt>
                <dd class="mt-1 font-bold text-slate-900">{{ formatDate(item.createdAt as string) }}</dd>
              </div>
              <div v-if="item.approvedAt" class="rounded-xl bg-slate-50 p-3">
                <dt class="text-xs font-bold text-slate-500">تاريخ القبول</dt>
                <dd class="mt-1 font-bold text-slate-900">{{ formatDate(item.approvedAt as string) }}</dd>
              </div>
            </div>
            <div v-if="item.status === 'Rejected' && item.rejectionReason" class="rounded-xl bg-red-50 p-3">
              <dt class="text-xs font-bold text-red-700">سبب الرفض</dt>
              <dd class="mt-1 text-red-900">{{ item.rejectionReason }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">المحفظة</h3>
          <div class="mt-5 rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 p-5 ring-1 ring-violet-100">
            <p class="text-xs font-bold text-violet-700">رصيد Credits</p>
            <p class="mt-2 text-4xl font-black text-slate-900">{{ formatCredits(item.creditsBalance) }}</p>
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span
                class="rounded-full px-3 py-1 text-sm font-bold"
                :class="item.canReceiveOrders ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'"
              >
                {{ item.canReceiveOrders ? 'نشط — يستقبل طلبات' : 'موقوف — لا يستقبل طلبات' }}
              </span>
            </div>
          </div>
          <div class="mt-4 space-y-2 text-sm text-slate-600">
            <p class="rounded-xl bg-slate-50 px-3 py-2">
              يُمنح <strong class="text-slate-900">{{ formatCredits(walletSettings.welcomeCreditsAmount) }}</strong> عند القبول
            </p>
            <p class="rounded-xl bg-slate-50 px-3 py-2">
              حد التفعيل: <strong class="text-slate-900">{{ formatCredits(walletSettings.craftsmanAvailabilityMinBalance) }}</strong>
            </p>
          </div>
          <div class="mt-5 grid grid-cols-3 gap-3 text-center">
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-xs font-bold text-slate-500">أعمال مكتملة</p>
              <p class="mt-1 text-xl font-black text-slate-900">{{ item.completedJobs ?? 0 }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-xs font-bold text-slate-500">التقييم</p>
              <p class="mt-1 text-xl font-black text-slate-900">{{ Number(item.avgRating ?? 0).toFixed(1) }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-xs font-bold text-slate-500">مراجعات</p>
              <p class="mt-1 text-xl font-black text-slate-900">{{ item.totalReviews ?? 0 }}</p>
            </div>
          </div>
        </section>
      </div>

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-lg font-black text-slate-900">الحرف</h3>
          <span v-if="professionItems.length === 3" class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">3/3</span>
          <span v-if="professionItems.length > 3" class="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">تحذير: أكثر من 3</span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="p in professionItems"
            :key="p.id"
            class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-800"
          >
            <img v-if="p.iconUrl" :src="p.iconUrl" alt="" class="h-5 w-5 rounded object-cover" />
            <span v-else-if="p.icon" class="text-base">{{ p.icon }}</span>
            {{ p.name }}
          </span>
          <p v-if="!professionItems.length" class="text-sm text-slate-500">لا توجد حرف مسجلة</p>
        </div>
      </section>

      <section v-if="portfolioUrls.length" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-black text-slate-900">معرض الأعمال (حتى 3)</h3>
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            v-for="(url, idx) in portfolioUrls"
            :key="url"
            type="button"
            class="overflow-hidden rounded-xl border border-slate-200 ring-offset-2 hover:ring-2 hover:ring-blue-300"
            @click="openLightbox(url)"
          >
            <img :src="url" :alt="`صورة ${idx + 1}`" class="h-36 w-full object-cover" />
          </button>
        </div>
      </section>
      <section v-else class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        لا توجد صور في المعرض — تُعرض صورة الملف الشخصي فقط.
      </section>
    </template>
    <p v-else class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">لم يتم العثور على الحرفي</p>

    <ConfirmModal v-model="rejectOpen" title="رفض الحرفي" confirm-text="رفض" confirm-color="danger" @confirm="reject">
      <textarea v-model="rejectReason" rows="3" class="mt-2 w-full rounded-xl border p-3" placeholder="سبب الرفض (مطلوب)" />
    </ConfirmModal>

    <ConfirmModal
      v-model="toggleConfirmOpen"
      :title="item?.isActive === false ? 'تفعيل الحساب' : 'تعطيل الحساب'"
      :message="item?.isActive === false ? 'هل تريد تفعيل حساب هذا الحرفي؟' : 'هل تريد تعطيل حساب هذا الحرفي؟'"
      confirm-text="تأكيد"
      @confirm="toggle"
    />

    <ImageLightbox v-model="lightboxOpen" :src="lightboxSrc" alt="صورة الحرفي" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { approveCraftsman, getCraftsmanDetail, rejectCraftsman, toggleCraftsman } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import { apiMessage } from '@/utils/error'
import { formatCredits, formatDate, resolveMediaUrl } from '@/utils/format'
import { statusClass, statusLabel } from '@/utils/admin'
import { fetchPlatformWalletSettings, welcomeCreditsApproveMessage, type PlatformWalletSettings } from '@/utils/settings'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(true)
const item = ref<Record<string, unknown> | null>(null)
const rejectOpen = ref(false)
const rejectReason = ref('')
const toggleConfirmOpen = ref(false)
const lightboxOpen = ref(false)
const lightboxSrc = ref('')
const walletSettings = ref<PlatformWalletSettings>({
  welcomeCreditsAmount: 5000,
  craftsmanAvailabilityMinBalance: 1000,
  businessOpenMinBalance: 500,
})

const profileUrl = computed(() => resolveMediaUrl(item.value?.profileImageUrl ?? item.value?.imageUrl))

const professionItems = computed(() => {
  const raw = item.value?.professions
  if (!Array.isArray(raw)) return [] as { id: string; name: string; icon?: string; iconUrl?: string }[]
  return raw
    .map((p, i) => {
      if (typeof p === 'string') return { id: String(i), name: p }
      const row = p as Record<string, unknown>
      const icon = row.icon != null ? String(row.icon) : undefined
      const iconUrl = icon && /^(https?:|\/)/.test(icon) ? resolveMediaUrl(icon) : undefined
      return {
        id: String(row.id ?? i),
        name: String(row.nameAr ?? row.name ?? ''),
        icon: iconUrl ? undefined : icon,
        iconUrl,
      }
    })
    .filter((p) => p.name)
})

const portfolioUrls = computed(() => {
  const urls: string[] = []
  const fromStrings = item.value?.portfolioImageUrls
  if (Array.isArray(fromStrings)) {
    for (const u of fromStrings) {
      const resolved = resolveMediaUrl(u)
      if (resolved) urls.push(resolved)
    }
  }
  const fromObjects = item.value?.portfolioImages
  if (Array.isArray(fromObjects)) {
    const sorted = [...fromObjects].sort(
      (a, b) => Number((a as Record<string, unknown>).displayOrder ?? 0) - Number((b as Record<string, unknown>).displayOrder ?? 0),
    )
    for (const img of sorted) {
      const row = img as Record<string, unknown>
      const resolved = resolveMediaUrl(row.imageUrl ?? row.url)
      if (resolved) urls.push(resolved)
    }
  }
  return [...new Set(urls)].slice(0, 3)
})

function openLightbox(url: string) {
  if (!url) return
  lightboxSrc.value = url
  lightboxOpen.value = true
}

async function load() {
  loading.value = true
  try {
    const res = await getCraftsmanDetail(String(route.params.id))
    item.value = res.data as Record<string, unknown>
  } catch (e) {
    item.value = null
    toast.error(apiMessage(e, 'تعذر تحميل تفاصيل الحرفي'))
  } finally {
    loading.value = false
  }
}

async function approve() {
  try {
    await approveCraftsman(String(route.params.id))
    toast.success(await welcomeCreditsApproveMessage('الحرفي'))
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function reject() {
  if (!rejectReason.value.trim()) {
    toast.warning('يرجى كتابة سبب الرفض')
    rejectOpen.value = true
    return
  }
  try {
    await rejectCraftsman(String(route.params.id), rejectReason.value.trim())
    toast.success('تم رفض الحرفي')
    router.push('/craftsmen')
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function toggle() {
  try {
    await toggleCraftsman(String(route.params.id))
    toast.success('تم تحديث حالة الحساب')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(async () => {
  walletSettings.value = await fetchPlatformWalletSettings()
  load()
})
</script>
