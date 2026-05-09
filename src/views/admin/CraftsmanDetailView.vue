<template>
  <div class="space-y-6" dir="rtl">
    <RouterLink to="/craftsmen" class="inline-flex text-sm font-bold text-blue-600">← رجوع إلى الحرفيين</RouterLink>
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white py-16"><LoadingSpinner /></div>
    <template v-else-if="item">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start gap-5">
          <img :src="String(item.profileImageUrl ?? item.imageUrl ?? '/favicon.ico')" alt="صورة الحرفي" class="h-24 w-24 rounded-2xl border border-slate-200 object-cover" />
          <div class="min-w-[240px] flex-1">
            <h2 class="text-2xl font-black text-slate-900">{{ item.fullName ?? item.name ?? '—' }}</h2>
            <p class="mt-1 text-sm text-slate-500">{{ item.bio ?? 'لا توجد نبذة مسجلة' }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="p in professions" :key="p" class="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">{{ p }}</span>
            </div>
          </div>
          <span class="rounded-full px-3 py-1 text-sm font-bold" :class="statusClass(item.status)">
            {{ statusLabel(item.status) }}
          </span>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-4">
          <Info label="الهاتف" :value="String(item.phone ?? '—')" />
          <Info label="المحافظة" :value="String(item.city ?? item.cityName ?? '—')" />
          <Info label="تاريخ التسجيل" :value="formatDate(item.createdAt as string)" />
          <Info label="متاح الآن" :value="item.isAvailableNow ? 'نعم' : 'لا'" />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-bold text-slate-500">أعمال مكتملة</p>
          <p class="mt-2 text-3xl font-black text-slate-900">{{ item.completedJobs ?? 0 }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-bold text-slate-500">متوسط التقييم</p>
          <p class="mt-2 text-3xl font-black text-slate-900">{{ Number(item.avgRating ?? 0).toFixed(1) }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-bold text-slate-500">عدد التقييمات</p>
          <p class="mt-2 text-3xl font-black text-slate-900">{{ item.totalReviews ?? 0 }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button v-if="item.status === 'Pending'" type="button" class="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white" @click="approve">قبول</button>
        <button v-if="item.status === 'Pending'" type="button" class="rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white" @click="rejectOpen = true">رفض</button>
        <button type="button" class="rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-white" @click="toggle">
          {{ item.isActive === false ? 'تفعيل الحساب' : 'إيقاف الحساب' }}
        </button>
      </div>
    </template>
    <p v-else class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">لم يتم العثور على الحرفي</p>

    <ConfirmModal v-model="rejectOpen" title="رفض الحرفي" confirm-text="رفض" confirm-color="danger" @confirm="reject">
      <textarea v-model="rejectReason" rows="3" class="mt-2 w-full rounded-xl border p-3" placeholder="سبب الرفض" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { approveCraftsman, getCraftsmen, rejectCraftsman, toggleCraftsman } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { apiMessage } from '@/utils/error'
import { formatDate } from '@/utils/format'
import { normalizePaged, statusClass, statusLabel } from '@/utils/admin'

const Info = defineComponent({
  props: { label: { type: String, required: true }, value: { type: String, required: true } },
  setup(props) {
    return () => h('div', { class: 'rounded-xl bg-slate-50 p-4' }, [
      h('p', { class: 'text-xs font-bold text-slate-500' }, props.label),
      h('p', { class: 'mt-1 font-bold text-slate-900' }, props.value),
    ])
  },
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(true)
const item = ref<Record<string, unknown> | null>(null)
const rejectOpen = ref(false)
const rejectReason = ref('')
const professions = computed(() => {
  const raw = item.value?.professions
  if (!Array.isArray(raw)) return []
  return raw.map((p) => typeof p === 'string' ? p : String((p as Record<string, unknown>).nameAr ?? (p as Record<string, unknown>).name ?? '')).filter(Boolean)
})

async function load() {
  loading.value = true
  try {
    const res = await getCraftsmen({ page: 1, pageSize: 500 })
    const data = normalizePaged(res.data)
    item.value = data.items.find((x) => String(x.id) === String(route.params.id)) ?? null
    if (!item.value) toast.warning('لم يتم العثور على الحرفي ضمن القائمة الحالية')
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل تفاصيل الحرفي'))
  } finally {
    loading.value = false
  }
}

async function approve() {
  try {
    await approveCraftsman(String(route.params.id))
    toast.success('تم قبول الحرفي')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function reject() {
  try {
    await rejectCraftsman(String(route.params.id), rejectReason.value || 'لم يتم تحديد سبب')
    toast.success('تم رفض الحرفي')
    router.push('/craftsmen')
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function toggle() {
  try {
    await toggleCraftsman(String(route.params.id))
    toast.success('تم تحديث حالة الحرفي')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
