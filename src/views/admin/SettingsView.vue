<template>
  <div class="space-y-6" dir="rtl">
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white py-16"><LoadingSpinner /></div>
    <form v-else class="space-y-6" @submit.prevent="save">
      <section v-for="section in sections" :key="section.title" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">{{ section.icon }}</div>
          <div>
            <h2 class="text-lg font-black text-slate-900">{{ section.title }}</h2>
            <p class="text-xs text-slate-500">{{ section.description }}</p>
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <label v-for="field in section.fields" :key="field.key" class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">{{ field.label }}</span>
            <input
              v-model.number="form[field.key]"
              type="number"
              :step="field.kind === 'int' ? 1 : 0.01"
              min="0"
              class="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
            <span v-if="field.percent" class="mt-1 block text-xs text-slate-500">النسبة الحالية: {{ percent(form[field.key]) }}</span>
            <span v-if="field.hint" class="mt-1 block text-xs text-slate-500">{{ field.hint }}</span>
          </label>
        </div>
      </section>
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-500">آخر تحديث: <span class="font-bold text-slate-700">{{ updatedAt ? formatDate(updatedAt) : '—' }}</span></p>
        <button type="submit" class="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white" :disabled="saving">
          {{ saving ? 'جار الحفظ...' : 'حفظ التعديلات' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getPlatformSettings, updatePlatformSettings } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { apiMessage } from '@/utils/error'
import { formatDate } from '@/utils/format'

type SettingsKey =
  | 'serviceCommissionRate'
  | 'restaurantPerPersonFee'
  | 'craftsmanCustomerFeeRate'
  | 'craftsmanProviderFeeRate'
  | 'cancellationPenaltyRate'
  | 'cancellationDeadlineHours'
  | 'reminderHoursBeforeBooking'
  | 'finalReminderHoursBeforeBooking'
  | 'adPricePerDay'
  | 'noShowPenaltyRate'
  | 'noShowGracePeriodMinutes'

type SettingsField = {
  key: SettingsKey
  label: string
  percent?: boolean
  hint?: string
  /** Whole numbers (matches API int32 fields) */
  kind?: 'decimal' | 'int'
}

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const updatedAt = ref('')
const form = ref<Record<SettingsKey, number>>({
  serviceCommissionRate: 0.05,
  restaurantPerPersonFee: 5,
  craftsmanCustomerFeeRate: 0.1,
  craftsmanProviderFeeRate: 0.15,
  cancellationPenaltyRate: 0.05,
  cancellationDeadlineHours: 3,
  reminderHoursBeforeBooking: 6,
  finalReminderHoursBeforeBooking: 1,
  adPricePerDay: 0,
  noShowPenaltyRate: 0.1,
  noShowGracePeriodMinutes: 30,
})
const sections = computed((): { icon: string; title: string; description: string; fields: SettingsField[] }[] => [
  {
    icon: '🏪',
    title: 'حجوزات الخدمات',
    description: 'نسب عمولة المحلات الخدمية',
    fields: [{ key: 'serviceCommissionRate', label: 'عمولة المحلات الخدمية', percent: true }],
  },
  {
    icon: '🍽️',
    title: 'المطاعم والقاعات',
    description: 'رسوم الحجوزات حسب عدد الأشخاص',
    fields: [{ key: 'restaurantPerPersonFee', label: 'رسوم لكل شخص بالدولار' }],
  },
  {
    icon: '🔧',
    title: 'خدمات الحرفيين',
    description: 'نسب الخدمة على الزبون والحرفي',
    fields: [
      { key: 'craftsmanCustomerFeeRate', label: 'نسبة على الزبون', percent: true },
      { key: 'craftsmanProviderFeeRate', label: 'نسبة على الحرفي', percent: true },
    ],
  },
  {
    icon: '⏱️',
    title: 'الإلغاء',
    description: 'سياسة غرامات ومهلة الإلغاء',
    fields: [
      { key: 'cancellationPenaltyRate', label: 'نسبة غرامة الإلغاء', percent: true },
      { key: 'cancellationDeadlineHours', label: 'مهلة الإلغاء بالساعات', kind: 'int' },
    ],
  },
  {
    icon: '🔔',
    title: 'التذكيرات',
    description: 'مواعيد إشعارات التذكير قبل الحجز',
    fields: [
      { key: 'reminderHoursBeforeBooking', label: 'تذكير قبل الموعد بالساعات', kind: 'int' },
      { key: 'finalReminderHoursBeforeBooking', label: 'تذكير نهائي بالساعات', kind: 'int' },
    ],
  },
  {
    icon: '📺',
    title: 'الإعلانات',
    description: 'تسعير الإعلانات في التطبيق',
    fields: [{ key: 'adPricePerDay', label: 'سعر الإعلان اليومي (د.ع)' }],
  },
  {
    icon: '🚫',
    title: 'عدم الحضور',
    description: 'غرامة الزبائن عند عدم الحضور',
    fields: [
      {
        key: 'noShowPenaltyRate',
        label: 'نسبة غرامة عدم الحضور',
        percent: true,
        hint: 'مثال: 0.10 يعني 10%',
      },
      { key: 'noShowGracePeriodMinutes', label: 'مهلة عدم الحضور (دقيقة)', kind: 'int' },
    ],
  },
])

function percent(v: unknown) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : `${(n * 100).toFixed(0)}%`
}

async function load() {
  loading.value = true
  try {
    const res = await getPlatformSettings()
    const data = res.data as Record<string, unknown>
    for (const key of Object.keys(form.value) as SettingsKey[]) {
      if (data[key] !== undefined && data[key] !== null) form.value[key] = Number(data[key])
    }
    updatedAt.value = String(data.updatedAt ?? '')
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الإعدادات'))
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await updatePlatformSettings(form.value)
    toast.success('تم حفظ الإعدادات المالية')
    load()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر حفظ الإعدادات'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
