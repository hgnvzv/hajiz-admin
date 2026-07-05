<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-bold text-slate-600">الحالة:</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="f in filters"
            :key="f.value"
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-bold transition"
            :class="status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="setStatus(f.value)"
          >
            {{ f.label }}
          </button>
        </div>
        <button
          type="button"
          class="mr-auto rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
          :disabled="loading"
          @click="load"
        >
          تحديث
        </button>
      </div>
    </div>

    <AdvertisementTable
      :rows="rows"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @page-change="onPage"
      @view="openDetail"
      @edit="openEdit"
      @approve="approve"
      @reject="openReject"
      @delete="openDelete"
      @change-image="openImage"
      @change-order="openOrder"
    />

    <!-- Detail modal -->
    <Teleport to="body">
      <div
        v-if="detailOpen"
        class="fixed inset-0 z-[90] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="detailOpen = false" />
        <div class="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
          <div v-if="detailLoading" class="py-16"><LoadingSpinner /></div>
          <template v-else-if="detailAd">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-xl font-black text-slate-900">{{ detailAd.title }}</h3>
                <p class="mt-1 text-sm text-slate-500">{{ detailAd.businessName }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-sm font-bold" :class="advertisementStatusClass(detailAd.status)">
                {{ advertisementStatusLabel(detailAd.status) }}
              </span>
            </div>

            <div v-if="detailAd.imageUrl" class="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <img :src="detailAd.imageUrl" alt="" class="max-h-72 w-full object-contain bg-slate-50" />
            </div>

            <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="الوصف" :value="detailAd.description || '—'" class="sm:col-span-2" />
              <Info label="المدة" :value="`${detailAd.durationDays} يوم`" />
              <Info label="التكلفة" :value="`${formatMoney(detailAd.totalCost)} د.ع`" />
              <Info label="ترتيب العرض" :value="String(detailAd.displayOrder ?? 0)" />
              <Info label="تاريخ البداية" :value="formatDateShort(detailAd.startDate)" />
              <Info label="تاريخ النهاية" :value="formatDateShort(detailAd.endDate)" />
              <Info v-if="detailAd.videoUrl" label="رابط الفيديو" :value="detailAd.videoUrl" class="sm:col-span-2" />
            </dl>

            <div v-if="detailAd.videoUrl" class="mt-4">
              <a
                :href="detailAd.videoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
              >
                فتح الفيديو
              </a>
            </div>

            <div v-if="detailAd.adminNotes" class="mt-4 rounded-xl bg-red-50 p-4">
              <p class="text-xs font-bold text-red-700">ملاحظات الإدارة / سبب الرفض</p>
              <p class="mt-1 text-sm text-red-900">{{ detailAd.adminNotes }}</p>
            </div>

            <div class="mt-6 flex flex-wrap gap-2">
              <button
                v-if="detailAd.status === 'Pending'"
                type="button"
                class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
                @click="approve(detailAd); detailOpen = false"
              >
                قبول
              </button>
              <button
                v-if="['Pending', 'Active', 'Rejected', 'Approved'].includes(detailAd.status)"
                type="button"
                class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"
                @click="openEdit(detailAd); detailOpen = false"
              >
                تعديل
              </button>
              <button type="button" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold" @click="detailOpen = false">
                إغلاق
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <AdvertisementEditModal v-model="editOpen" :advertisement="editAd" @saved="onSaved" />

    <AdvertisementRejectModal v-model="rejectOpen" :loading="actionLoading" @confirm="confirmReject" />

    <ConfirmModal
      v-model="deleteOpen"
      title="حذف الإعلان"
      message="هل أنت متأكد من حذف هذا الإعلان؟"
      confirm-text="حذف"
      confirm-color="danger"
      @confirm="confirmDelete"
    />

    <!-- Image upload modal -->
    <Teleport to="body">
      <div
        v-if="imageOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="imageOpen = false" />
        <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
          <h3 class="text-lg font-black text-slate-900">تغيير صورة الإعلان</h3>
          <p class="mt-1 text-sm text-slate-500">{{ imageAd?.title }}</p>
          <input
            ref="imageInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="mt-4 w-full text-sm"
            @change="onImageSelected"
          />
          <img
            v-if="imagePreview"
            :src="imagePreview"
            alt="معاينة"
            class="mt-4 max-h-48 w-full rounded-xl border border-slate-200 object-contain"
          />
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold" @click="imageOpen = false">
              إلغاء
            </button>
            <button
              type="button"
              class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              :disabled="!imageFile || actionLoading"
              @click="confirmImage"
            >
              {{ actionLoading ? 'جاري الرفع…' : 'رفع الصورة' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Display order modal -->
    <Teleport to="body">
      <div
        v-if="orderOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="orderOpen = false" />
        <div class="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
          <h3 class="text-lg font-black text-slate-900">ترتيب العرض</h3>
          <p class="mt-1 text-sm text-slate-500">{{ orderAd?.title }}</p>
          <label class="mt-4 block">
            <span class="mb-1 block text-sm font-bold text-slate-700">الترتيب</span>
            <input v-model.number="orderValue" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold" @click="orderOpen = false">
              إلغاء
            </button>
            <button
              type="button"
              class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              :disabled="actionLoading"
              @click="confirmOrder"
            >
              {{ actionLoading ? 'جاري الحفظ…' : 'حفظ' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { adminAdvertisementsApi } from '@/api/adminAdvertisements'
import AdvertisementEditModal from '@/components/admin/AdvertisementEditModal.vue'
import AdvertisementRejectModal from '@/components/admin/AdvertisementRejectModal.vue'
import AdvertisementTable from '@/components/admin/AdvertisementTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort, formatMoney } from '@/utils/format'
import { advertisementStatusClass, advertisementStatusLabel, normalizePaged } from '@/utils/admin'
import type { AdvertisementDto } from '@/types/advertisement'

const Info = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    class: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h('div', { class: `rounded-xl bg-slate-50 p-3 ${props.class}` }, [
        h('dt', { class: 'text-xs font-bold text-slate-500' }, props.label),
        h('dd', { class: 'mt-1 font-bold text-slate-900 break-all' }, props.value),
      ])
  },
})

const toast = useToast()
const filters = [
  { value: '', label: 'الكل' },
  { value: 'Pending', label: 'معلق' },
  { value: 'Active', label: 'نشط' },
  { value: 'Rejected', label: 'مرفوض' },
  { value: 'Expired', label: 'منتهي' },
]

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const status = ref('')

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailAd = ref<AdvertisementDto | null>(null)

const editOpen = ref(false)
const editAd = ref<AdvertisementDto | null>(null)

const rejectOpen = ref(false)
const rejectAd = ref<AdvertisementDto | null>(null)

const deleteOpen = ref(false)
const deleteAd = ref<AdvertisementDto | null>(null)

const imageOpen = ref(false)
const imageAd = ref<AdvertisementDto | null>(null)
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const imageInput = ref<HTMLInputElement | null>(null)

const orderOpen = ref(false)
const orderAd = ref<AdvertisementDto | null>(null)
const orderValue = ref(0)

const actionLoading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await adminAdvertisementsApi.list({
      status: status.value || undefined,
      page: page.value,
      pageSize,
    })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الإعلانات'))
  } finally {
    loading.value = false
  }
}

function setStatus(v: string) {
  status.value = v
  page.value = 1
  load()
}

function onPage(p: number) {
  page.value = p
  load()
}

function onSaved() {
  load()
  if (detailOpen.value && editAd.value?.id) {
    refreshDetail(editAd.value.id)
  }
}

async function refreshDetail(id: string) {
  detailLoading.value = true
  try {
    const res = await adminAdvertisementsApi.getById(id)
    detailAd.value = res.data
  } catch {
    /* ignore */
  } finally {
    detailLoading.value = false
  }
}

async function openDetail(row: AdvertisementDto) {
  detailOpen.value = true
  detailLoading.value = true
  detailAd.value = row
  try {
    const res = await adminAdvertisementsApi.getById(row.id)
    detailAd.value = res.data
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل تفاصيل الإعلان'))
  } finally {
    detailLoading.value = false
  }
}

function openEdit(row: AdvertisementDto) {
  editAd.value = row
  editOpen.value = true
}

async function approve(row: AdvertisementDto) {
  if (!confirm('قبول هذا الإعلان؟ سيتم نشره وتفعيله.')) return
  actionLoading.value = true
  try {
    await adminAdvertisementsApi.approve(row.id)
    toast.success('تم قبول الإعلان')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    actionLoading.value = false
  }
}

function openReject(row: AdvertisementDto) {
  rejectAd.value = row
  rejectOpen.value = true
}

async function confirmReject(reason: string) {
  if (!rejectAd.value?.id) return
  if (!reason) {
    toast.warning('يرجى كتابة سبب الرفض')
    rejectOpen.value = true
    return
  }
  actionLoading.value = true
  try {
    await adminAdvertisementsApi.reject(rejectAd.value.id, reason)
    toast.success('تم رفض الإعلان')
    rejectOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
    rejectOpen.value = true
  } finally {
    actionLoading.value = false
  }
}

function openDelete(row: AdvertisementDto) {
  deleteAd.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteAd.value?.id) return
  actionLoading.value = true
  try {
    await adminAdvertisementsApi.delete(deleteAd.value.id)
    toast.success('تم الحذف')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    actionLoading.value = false
  }
}

function openImage(row: AdvertisementDto) {
  imageAd.value = row
  imageFile.value = null
  imagePreview.value = ''
  imageOpen.value = true
}

function onImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  imageFile.value = file ?? null
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = file ? URL.createObjectURL(file) : ''
}

async function confirmImage() {
  if (!imageAd.value?.id || !imageFile.value) return
  actionLoading.value = true
  try {
    await adminAdvertisementsApi.updateImage(imageAd.value.id, imageFile.value)
    toast.success('تم تحديث الصورة')
    imageOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    actionLoading.value = false
  }
}

function openOrder(row: AdvertisementDto) {
  orderAd.value = row
  orderValue.value = row.displayOrder ?? 0
  orderOpen.value = true
}

async function confirmOrder() {
  if (!orderAd.value?.id) return
  actionLoading.value = true
  try {
    await adminAdvertisementsApi.setDisplayOrder(orderAd.value.id, orderValue.value)
    toast.success('تم حفظ الترتيب')
    orderOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    actionLoading.value = false
  }
}

onMounted(load)
</script>
