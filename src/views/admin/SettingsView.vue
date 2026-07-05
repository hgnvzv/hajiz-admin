<template>
  <div class="space-y-6" dir="rtl">
    <div
      v-if="launchMode"
      class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900"
    >
      وضع الإطلاق: محفظة الزبون معطّلة — الدفع كاش فقط
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white py-16"><LoadingSpinner /></div>
    <form v-else class="space-y-6" @submit.prevent="save">
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">🚀</div>
          <div>
            <h2 class="text-lg font-black text-slate-900">Credits &amp; Wallet — إعدادات المحفظة</h2>
            <p class="text-xs text-slate-500">إعدادات المحفظة والرصيد الترحيبي وحدود التنبيه والحد الأدنى للرصيد</p>
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <span class="block text-sm font-bold text-slate-800">تفعيل محفظة الزبون</span>
              <span class="mt-0.5 block text-xs text-slate-500">معطّل للإطلاق على Google Play</span>
            </div>
            <input v-model="walletForm.customerWalletEnabled" type="checkbox" class="h-5 w-5 accent-blue-600" />
          </label>
          <label class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <span class="block text-sm font-bold text-slate-800">دفع الزبون من المحفظة</span>
              <span class="mt-0.5 block text-xs text-slate-500">كاش فقط عند التعطيل</span>
            </div>
            <input v-model="walletForm.customerWalletPayEnabled" type="checkbox" class="h-5 w-5 accent-blue-600" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">رصيد ترحيبي عند القبول</span>
            <input v-model.number="walletForm.welcomeCreditsAmount" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <span class="mt-1 block text-xs text-slate-500">يُمنح مرة واحدة لمحل/حرفي</span>
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">حد التنبيه (برتقالي)</span>
            <input v-model.number="walletForm.creditsWarningThreshold" type="number" min="1" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <span class="mt-1 block text-xs text-slate-500">Push + تنبيه داخل التطبيق</span>
          </label>
          <label class="block md:col-span-2">
            <span class="mb-1 block text-sm font-bold text-slate-700">حد التنبيه الحرج</span>
            <input v-model.number="walletForm.creditsCriticalThreshold" type="number" min="1" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <span class="mt-1 block text-xs text-slate-500">قبل توقف الاستقبال — يجب أن يكون ≤ حد التنبيه</span>
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">حد رصيد تفعيل استقبال الحرفي</span>
            <input v-model.number="walletForm.craftsmanAvailabilityMinBalance" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <span class="mt-1 block text-xs text-slate-500">لا يمكن تفعيل "متاح الآن" تحته</span>
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">حد رصيد فتح المحل</span>
            <input v-model.number="walletForm.businessOpenMinBalance" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <span class="mt-1 block text-xs text-slate-500">لا يمكن فتح المحل يدوياً تحته</span>
          </label>
        </div>
      </section>

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

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">💰</div>
          <div>
            <h2 class="text-lg font-black text-slate-900">إعدادات شحن Credits</h2>
            <p class="text-xs text-slate-500">حسابات التحويل وتعليمات شحن المحفظة للمزوّدين (محلات / حرفيون)</p>
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">رقم حساب زين كاش</span>
            <input v-model="creditsForm.zainCashAccountNumber" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="07XXXXXXXXX" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">رقم حساب سوبر كي</span>
            <input v-model="creditsForm.superKeyAccountNumber" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="رقم الحساب" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">واتساب الدعم / التواصل</span>
            <input v-model="creditsForm.walletWhatsAppNumber" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="07XXXXXXXXX" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">مهلة المراجعة (دقائق)</span>
            <input v-model.number="creditsForm.topUpReviewDeadlineMinutes" type="number" min="1" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" />
            <span class="mt-1 block text-xs text-slate-500">الافتراضي: 60 دقيقة</span>
          </label>
          <label class="block md:col-span-2">
            <span class="mb-1 block text-sm font-bold text-slate-700">نص التعليمات القانونية والفنية</span>
            <textarea
              v-model="creditsForm.topUpInstructionsAr"
              rows="8"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 leading-relaxed"
              placeholder="اكتب تعليمات التحويل والشروط التي يراها المستخدم عند طلب الشحن..."
            />
          </label>
        </div>
      </section>

      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-500">آخر تحديث: <span class="font-bold text-slate-700">{{ updatedAt ? formatDate(updatedAt) : '—' }}</span></p>
        <button type="submit" class="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-50" :disabled="saving">
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
import { clearWelcomeCreditsCache } from '@/utils/settings'

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

type WalletKey =
  | 'customerWalletEnabled'
  | 'customerWalletPayEnabled'
  | 'welcomeCreditsAmount'
  | 'creditsWarningThreshold'
  | 'creditsCriticalThreshold'
  | 'craftsmanAvailabilityMinBalance'
  | 'businessOpenMinBalance'

type SectionField = {
  key: SettingsKey
  label: string
  percent?: boolean
  kind?: 'int'
  hint?: string
}

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const updatedAt = ref('')
const original = ref<Record<string, unknown>>({})

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

const walletForm = ref<Record<WalletKey, number | boolean>>({
  customerWalletEnabled: false,
  customerWalletPayEnabled: false,
  welcomeCreditsAmount: 5000,
  creditsWarningThreshold: 500,
  creditsCriticalThreshold: 200,
  craftsmanAvailabilityMinBalance: 1000,
  businessOpenMinBalance: 500,
})

const creditsForm = ref({
  zainCashAccountNumber: '',
  superKeyAccountNumber: '',
  walletWhatsAppNumber: '',
  topUpInstructionsAr: '',
  topUpReviewDeadlineMinutes: 60,
})

const launchMode = computed(
  () => !walletForm.value.customerWalletEnabled && !walletForm.value.customerWalletPayEnabled,
)

const sections = computed((): { icon: string; title: string; description: string; fields: SectionField[] }[] => [
  {
    icon: '💳',
    title: 'رسوم وعمولات',
    description: 'عمولات المحلات والمطاعم والحرفيين',
    fields: [
      { key: 'serviceCommissionRate' as SettingsKey, label: 'عمولة المحلات الخدمية', percent: true },
      { key: 'restaurantPerPersonFee' as SettingsKey, label: 'رسوم المطاعم والقاعات لكل شخص ($)' },
      { key: 'craftsmanCustomerFeeRate' as SettingsKey, label: 'نسبة على الزبون (حرفي)', percent: true },
      { key: 'craftsmanProviderFeeRate' as SettingsKey, label: 'نسبة على الحرفي', percent: true },
    ],
  },
  {
    icon: '⏱️',
    title: 'إعدادات الإلغاء وعدم الحضور',
    description: 'غرامات الإلغاء وعدم حضور الزبون',
    fields: [
      { key: 'cancellationPenaltyRate' as SettingsKey, label: 'نسبة غرامة الإلغاء', percent: true },
      { key: 'cancellationDeadlineHours' as SettingsKey, label: 'مهلة الإلغاء (ساعات)', kind: 'int' as const },
      { key: 'noShowPenaltyRate' as SettingsKey, label: 'نسبة غرامة عدم الحضور', percent: true, hint: '0.10 = 10%' },
      { key: 'noShowGracePeriodMinutes' as SettingsKey, label: 'مهلة عدم الحضور (دقائق)', kind: 'int' as const },
    ],
  },
  {
    icon: '🔔',
    title: 'التذكيرات',
    description: 'إشعارات التذكير قبل موعد الحجز',
    fields: [
      { key: 'reminderHoursBeforeBooking' as SettingsKey, label: 'تذكير قبل الموعد (ساعات)', kind: 'int' as const },
      { key: 'finalReminderHoursBeforeBooking' as SettingsKey, label: 'تذكير نهائي (ساعات)', kind: 'int' as const },
    ],
  },
  {
    icon: '📺',
    title: 'الإعلانات',
    description: 'تسعير الإعلانات في التطبيق',
    fields: [{ key: 'adPricePerDay' as SettingsKey, label: 'سعر الإعلان اليومي (د.ع)', kind: 'int' as const }],
  },
])

function percent(v: unknown) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : `${(n * 100).toFixed(0)}%`
}

function snapshotCurrent(): Record<string, unknown> {
  return { ...form.value, ...walletForm.value, ...creditsForm.value }
}

function applyData(data: Record<string, unknown>) {
  for (const key of Object.keys(form.value) as SettingsKey[]) {
    if (data[key] !== undefined && data[key] !== null) form.value[key] = Number(data[key])
  }
  walletForm.value.customerWalletEnabled = Boolean(data.customerWalletEnabled ?? false)
  walletForm.value.customerWalletPayEnabled = Boolean(data.customerWalletPayEnabled ?? false)
  walletForm.value.welcomeCreditsAmount = Number(data.welcomeCreditsAmount ?? 5000)
  walletForm.value.creditsWarningThreshold = Number(data.creditsWarningThreshold ?? 500)
  walletForm.value.creditsCriticalThreshold = Number(data.creditsCriticalThreshold ?? 200)
  walletForm.value.craftsmanAvailabilityMinBalance = Number(data.craftsmanAvailabilityMinBalance ?? 1000)
  walletForm.value.businessOpenMinBalance = Number(data.businessOpenMinBalance ?? 500)
  creditsForm.value.zainCashAccountNumber = String(data.zainCashAccountNumber ?? '')
  creditsForm.value.superKeyAccountNumber = String(data.superKeyAccountNumber ?? '')
  creditsForm.value.walletWhatsAppNumber = String(data.walletWhatsAppNumber ?? '')
  creditsForm.value.topUpInstructionsAr = String(data.topUpInstructionsAr ?? '')
  creditsForm.value.topUpReviewDeadlineMinutes = Number(data.topUpReviewDeadlineMinutes ?? 60)
  updatedAt.value = String(data.updatedAt ?? '')
  original.value = snapshotCurrent()
}

async function load() {
  loading.value = true
  try {
    const res = await getPlatformSettings()
    applyData(res.data as Record<string, unknown>)
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الإعدادات'))
  } finally {
    loading.value = false
  }
}

function validateWallet(): { error: string | null; warning: string | null } {
  const w = Number(walletForm.value.welcomeCreditsAmount)
  const warn = Number(walletForm.value.creditsWarningThreshold)
  const crit = Number(walletForm.value.creditsCriticalThreshold)
  const craftsmanMin = Number(walletForm.value.craftsmanAvailabilityMinBalance)
  const businessMin = Number(walletForm.value.businessOpenMinBalance)
  if (w < 0) return { error: 'رصيد الترحيب يجب أن يكون ≥ 0', warning: null }
  if (warn < 0 || crit < 0 || craftsmanMin < 0 || businessMin < 0) {
    return { error: 'جميع المبالغ يجب أن تكون ≥ 0', warning: null }
  }
  if (warn > 0 && crit > 0 && crit > warn) {
    return { error: 'الحد الحرج يجب أن يكون ≤ حد التنبيه البرتقالي', warning: null }
  }
  const warning =
    businessMin > craftsmanMin
      ? 'تنبيه: حد فتح المحل أعلى من حد تفعيل الحرفي — قد يكون هذا غير متوقع'
      : null
  return { error: null, warning }
}

function buildPatch(): Record<string, unknown> {
  const current = snapshotCurrent()
  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(current)) {
    if (JSON.stringify(original.value[key]) !== JSON.stringify(value)) {
      patch[key] = value
    }
  }
  return patch
}

async function save() {
  const { error: validationError, warning: validationWarning } = validateWallet()
  if (validationError) {
    toast.warning(validationError)
    return
  }
  if (validationWarning) toast.info(validationWarning)
  const patch = buildPatch()
  if (!Object.keys(patch).length) {
    toast.info('لا توجد تغييرات للحفظ')
    return
  }
  saving.value = true
  try {
    await updatePlatformSettings(patch)
    clearWelcomeCreditsCache()
    toast.success('تم حفظ الإعدادات')
    await load()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر حفظ الإعدادات'))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
