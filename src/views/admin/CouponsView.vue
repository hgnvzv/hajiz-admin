<template>
  <div class="space-y-6" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-2xl shadow-md"
        >
          🎟️
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-900 md:text-2xl">الكوبونات</h1>
          <p class="text-xs text-slate-500">إنشاء وإدارة أكواد الخصم</p>
        </div>
      </div>
      <button
        type="button"
        class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        @click="openModal"
      >
        + كوبون جديد
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-bold text-slate-500">إجمالي الكوبونات</p>
        <p class="mt-2 text-3xl font-black text-slate-900">{{ coupons.length }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-bold text-slate-500">نشطة</p>
        <p class="mt-2 text-3xl font-black text-emerald-600">{{ activeCount }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-bold text-slate-500">إجمالي الاستخدامات</p>
        <p class="mt-2 text-3xl font-black text-blue-600">{{ totalUses }}</p>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="py-16"><LoadingSpinner /></div>
      <div v-else-if="coupons.length === 0" class="px-6 py-16 text-center">
        <p class="mb-2 text-4xl">🎟️</p>
        <p class="font-bold text-slate-700">لا توجد كوبونات بعد</p>
        <p class="mt-1 text-sm text-slate-500">أنشئ كوبوناً من الزر أعلاه</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-right text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-5 py-3 text-xs font-bold text-slate-600">الرمز</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-600">الخصم</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-600">الحد الأقصى</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-600">الاستخدام</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-600">من</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-600">إلى</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-600">الحالة</th>
              <th class="px-5 py-3 text-xs font-bold text-slate-600">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in coupons" :key="String(c.id)" class="group transition hover:bg-slate-50/80">
              <td class="px-5 py-3.5">
                <span
                  class="rounded-lg bg-blue-50 px-2 py-1 font-mono text-sm font-bold text-blue-700 ring-1 ring-blue-100"
                >
                  {{ String(c.code ?? '') }}
                </span>
              </td>
              <td class="px-5 py-3.5 font-bold text-slate-900">{{ discountPercent(c) }}%</td>
              <td class="px-5 py-3.5 text-slate-700">{{ maxDiscountLabel(c) }}</td>
              <td class="px-5 py-3.5">
                <span class="font-bold text-slate-900">{{ currentUses(c) }}</span>
                <span class="text-slate-400"> / {{ maxUses(c) }}</span>
              </td>
              <td class="px-5 py-3.5 text-slate-600">{{ formatDateShort(startDate(c)) }}</td>
              <td class="px-5 py-3.5 text-slate-600">{{ formatDateShort(endDate(c)) }}</td>
              <td class="px-5 py-3.5">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="isActive(c) ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200' : 'bg-red-50 text-red-800 ring-1 ring-red-200'"
                >
                  {{ isActive(c) ? 'نشط' : 'متوقف' }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex flex-wrap gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    class="rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    :class="isActive(c) ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200' : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'"
                    @click="toggleCoupon(c)"
                  >
                    {{ isActive(c) ? 'إيقاف' : 'تفعيل' }}
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-800 ring-1 ring-red-200 transition hover:bg-red-100"
                    @click="removeCoupon(c)"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        dir="rtl"
        @click.self="showModal = false"
      >
        <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-lg font-black text-slate-900">كوبون جديد</h3>
            <button
              type="button"
              class="text-2xl leading-none text-slate-400 transition hover:text-slate-700"
              aria-label="إغلاق"
              @click="showModal = false"
            >
              ✕
            </button>
          </div>

          <div class="space-y-3">
            <label class="block">
              <span class="mb-1 block text-xs font-bold text-slate-600">رمز الكوبون *</span>
              <input
                v-model="form.code"
                type="text"
                placeholder="مثال: WELCOME20"
                class="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm uppercase tracking-widest"
                autocomplete="off"
              />
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="mb-1 block text-xs font-bold text-slate-600">نسبة الخصم % *</span>
                <input
                  v-model.number="form.discountPercent"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-bold text-slate-600">الحد الأقصى (د.ع)</span>
                <input
                  v-model.number="form.maxDiscountAmount"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="اختياري"
                  class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
            </div>
            <label class="block">
              <span class="mb-1 block text-xs font-bold text-slate-600">عدد الاستخدامات الأقصى</span>
              <input
                v-model.number="form.maxUses"
                type="number"
                min="1"
                class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="mb-1 block text-xs font-bold text-slate-600">تاريخ البداية *</span>
                <input v-model="form.startDate" type="date" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-bold text-slate-600">تاريخ النهاية *</span>
                <input v-model="form.endDate" type="date" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              @click="showModal = false"
            >
              إلغاء
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              :disabled="creating"
              @click="create"
            >
              {{ creating ? 'جاري الإنشاء...' : 'إنشاء الكوبون' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { createAdminCoupon, deleteAdminCoupon, getAdminCoupons, toggleAdminCoupon } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort, formatMoney } from '@/utils/format'

const toast = useToast()
const coupons = ref<Record<string, unknown>[]>([])
const loading = ref(true)
const showModal = ref(false)
const creating = ref(false)

const form = ref({
  code: '',
  discountPercent: 10,
  maxDiscountAmount: null as number | null,
  maxUses: 100,
  startDate: '',
  endDate: '',
  businessId: null as string | null,
  categoryId: null as string | null,
})

const activeCount = computed(() => coupons.value.filter((c) => isActive(c)).length)
const totalUses = computed(() =>
  coupons.value.reduce((s, c) => s + currentUses(c), 0),
)

function normalizeCouponsList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  const d = (data ?? {}) as { items?: unknown[] }
  if (Array.isArray(d.items)) return d.items as Record<string, unknown>[]
  return []
}

function isActive(c: Record<string, unknown>) {
  return Boolean(c.isActive ?? c.active)
}

function discountPercent(c: Record<string, unknown>) {
  const n = Number(c.discountPercent ?? c.percent)
  return Number.isNaN(n) ? 0 : n
}

function currentUses(c: Record<string, unknown>) {
  const n = Number(c.currentUses ?? c.usedCount ?? 0)
  return Number.isNaN(n) ? 0 : n
}

function maxUses(c: Record<string, unknown>) {
  const n = Number(c.maxUses ?? c.maxUseCount ?? 0)
  return Number.isNaN(n) ? 0 : n
}

function maxDiscountLabel(c: Record<string, unknown>) {
  const v = c.maxDiscountAmount ?? c.maxDiscount
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return `${formatMoney(n)} د.ع`
}

function startDate(c: Record<string, unknown>) {
  return (c.startDate ?? c.validFrom) as string | undefined
}

function endDate(c: Record<string, unknown>) {
  return (c.endDate ?? c.validTo) as string | undefined
}

async function load() {
  loading.value = true
  try {
    const res = await getAdminCoupons()
    coupons.value = normalizeCouponsList(res.data)
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الكوبونات'))
    coupons.value = []
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    code: '',
    discountPercent: 10,
    maxDiscountAmount: null,
    maxUses: 100,
    startDate: '',
    endDate: '',
    businessId: null,
    categoryId: null,
  }
}

function openModal() {
  resetForm()
  showModal.value = true
}

function buildCreateBody(): Record<string, unknown> {
  const code = form.value.code.trim().toUpperCase()
  const body: Record<string, unknown> = {
    code,
    discountPercent: form.value.discountPercent,
    maxUses: form.value.maxUses,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
  }
  const maxAmt = form.value.maxDiscountAmount
  if (maxAmt != null && !Number.isNaN(Number(maxAmt)) && Number(maxAmt) > 0) {
    body.maxDiscountAmount = Number(maxAmt)
  }
  if (form.value.businessId) body.businessId = form.value.businessId
  if (form.value.categoryId) body.categoryId = form.value.categoryId
  return body
}

async function create() {
  if (!form.value.code.trim()) {
    toast.error('أدخل رمز الكوبون')
    return
  }
  if (!form.value.startDate || !form.value.endDate) {
    toast.error('حدد تاريخ البداية والنهاية')
    return
  }
  const p = Number(form.value.discountPercent)
  if (Number.isNaN(p) || p < 1 || p > 100) {
    toast.error('نسبة الخصم يجب أن تكون بين 1 و 100')
    return
  }
  creating.value = true
  try {
    await createAdminCoupon(buildCreateBody())
    toast.success('تم إنشاء الكوبون')
    showModal.value = false
    resetForm()
    await load()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر إنشاء الكوبون'))
  } finally {
    creating.value = false
  }
}

async function toggleCoupon(c: Record<string, unknown>) {
  try {
    await toggleAdminCoupon(String(c.id))
    toast.success('تم تحديث حالة الكوبون')
    await load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function removeCoupon(c: Record<string, unknown>) {
  if (!confirm('هل أنت متأكد من حذف الكوبون؟')) return
  try {
    await deleteAdminCoupon(String(c.id))
    toast.success('تم حذف الكوبون')
    await load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
