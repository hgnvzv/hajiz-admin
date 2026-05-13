<template>
  <div class="space-y-6" dir="rtl">
    <RouterLink to="/applications" class="inline-flex items-center text-sm font-bold text-blue-600">← رجوع إلى طلبات الانضمام</RouterLink>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white py-16"><LoadingSpinner /></div>
    <template v-else-if="item">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500">طلب انضمام</p>
            <h2 class="mt-1 text-2xl font-black text-slate-900">{{ item.businessName ?? item.name ?? '—' }}</h2>
            <p class="mt-2 text-sm text-slate-500">{{ item.description ?? item.address ?? '—' }}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-sm font-bold" :class="statusClass(item.status)">
            {{ statusLabel(item.status) }}
          </span>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <Info label="صاحب المحل" :value="String(item.ownerName ?? item.userName ?? '—')" />
          <Info label="الهاتف" :value="String(item.phone ?? item.ownerPhone ?? '—')" />
          <Info label="المحافظة" :value="String(item.cityName ?? item.city ?? '—')" />
          <Info label="التصنيف" :value="String(item.categoryName ?? '—')" />
          <Info label="تاريخ الطلب" :value="formatDate(item.createdAt as string)" />
          <Info label="العنوان" :value="String(item.address ?? '—')" />
          <Info label="خط العرض" :value="coord(item.latitude)" />
          <Info label="خط الطول" :value="coord(item.longitude)" />
          <Info label="الوصف" :value="String(item.description ?? 'لا يوجد وصف')" />
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">التصنيفات الفرعية وساعات العمل</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span v-for="s in subCategories" :key="s" class="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
              {{ s }}
            </span>
            <p v-if="!subCategories.length" class="text-sm text-slate-500">لا توجد تصنيفات فرعية</p>
          </div>
          <div class="mt-5 space-y-2 text-sm">
            <div v-for="h in workingHours" :key="String(h.dayName ?? h.day ?? h.dayOfWeek)" class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <div>
                <span class="font-bold text-slate-900">{{ h.dayName ?? h.day ?? h.dayOfWeek ?? '—' }}</span>
                <span class="mr-2 text-slate-500">{{ h.startTime ?? h.openTime ?? h.from ?? '—' }} - {{ h.endTime ?? h.closeTime ?? h.to ?? '—' }}</span>
              </div>
              <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="h.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
                {{ h.isOpen ? 'مفتوح' : 'مغلق' }}
              </span>
            </div>
            <p v-if="!workingHours.length" class="text-slate-500">لا توجد ساعات عمل مسجلة</p>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">الصور والمستندات</h3>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <a v-for="url in imageUrls" :key="url" :href="url" target="_blank" class="overflow-hidden rounded-xl border border-slate-200">
              <img :src="url" alt="صورة الطلب" class="h-32 w-full object-cover" />
            </a>
            <p v-if="!imageUrls.length" class="col-span-2 text-sm text-slate-500">لا توجد صور مرفوعة</p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">الموقع</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <Info label="العنوان" :value="String(item.address ?? '—')" />
            <Info label="المحافظة" :value="String(item.city ?? item.cityName ?? '—')" />
            <Info label="Latitude" :value="coord(item.latitude)" />
            <Info label="Longitude" :value="coord(item.longitude)" />
          </div>
          <a
            v-if="hasCoords"
            :href="mapUrl"
            target="_blank"
            class="mt-4 inline-flex rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
          >
            فتح الموقع على الخريطة
          </a>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">المراجعة والرفض</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <Info label="سبب الرفض" :value="String(item.rejectionReason ?? 'لا يوجد')" />
            <Info label="تمت المراجعة بواسطة" :value="String(item.reviewedBy ?? 'لم تتم المراجعة')" />
            <Info label="تاريخ المراجعة" :value="item.reviewedAt ? formatDate(item.reviewedAt as string) : '—'" />
            <Info label="الحالة الحالية" :value="statusLabel(item.status)" />
          </div>
        </div>
      </div>

      <div v-if="item.status === 'Pending'" class="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button type="button" class="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white" @click="approve">قبول الطلب</button>
        <button type="button" class="rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white" @click="rejectOpen = true">رفض الطلب</button>
      </div>
    </template>

    <p v-else class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">لم يتم العثور على الطلب</p>

    <ConfirmModal v-model="rejectOpen" title="رفض طلب الانضمام" confirm-text="رفض" confirm-color="danger" @confirm="reject">
      <textarea v-model="rejectReason" rows="3" class="mt-2 w-full rounded-xl border p-3" placeholder="سبب الرفض" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { approveApplication, getApplicationDetail, rejectApplication } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { apiMessage } from '@/utils/error'
import { formatDate } from '@/utils/format'
import { statusClass, statusLabel } from '@/utils/admin'

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

const subCategories = computed(() => {
  const raw = item.value?.subCategories
  if (!Array.isArray(raw)) return [] as string[]
  return raw
    .map((s) => {
      if (typeof s === 'string') return s
      const row = s as Record<string, unknown>
      return String(row.nameAr ?? row.name ?? '')
    })
    .filter(Boolean)
})
const workingHours = computed(() => (Array.isArray(item.value?.workingHours) ? item.value.workingHours as Record<string, unknown>[] : []))
const imageUrls = computed(() => {
  const raw = item.value?.images ?? item.value?.imageUrls ?? item.value?.documents
  if (!Array.isArray(raw)) return []
  return raw.map((x) => typeof x === 'string' ? x : String((x as Record<string, unknown>).url ?? '')).filter(Boolean)
})
const hasCoords = computed(() => item.value?.latitude != null && item.value?.longitude != null)
const mapUrl = computed(() => `https://www.google.com/maps?q=${item.value?.latitude},${item.value?.longitude}`)

function coord(v: unknown) {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return n.toFixed(6)
}

async function load() {
  loading.value = true
  try {
    const res = await getApplicationDetail(String(route.params.id))
    item.value = res.data as Record<string, unknown>
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل تفاصيل الطلب'))
  } finally {
    loading.value = false
  }
}

async function approve() {
  if (!confirm('هل تريد قبول طلب الانضمام؟')) return
  try {
    await approveApplication(String(route.params.id))
    toast.success('تم قبول الطلب')
    router.push('/applications')
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function reject() {
  try {
    await rejectApplication(String(route.params.id), rejectReason.value || 'لم يتم تحديد سبب')
    toast.success('تم رفض الطلب')
    router.push('/applications')
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
