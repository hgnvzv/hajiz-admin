<template>
  <div class="space-y-6" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-black text-slate-900">
          {{ locale === 'ar' ? 'مساعد حاجز الذكي' : 'HAJIZ AI Assistant' }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          {{
            locale === 'ar'
              ? 'إعدادات التفعيل، مفتاح الإيقاف، الاستخدام، ودليل المنتج — بدون أسرار المزود'
              : 'Enablement, kill-switch, usage, and product knowledge — no provider secrets'
          }}
        </p>
      </div>
      <button
        type="button"
        class="rounded-xl px-4 py-2 text-sm font-bold text-white"
        :class="form.killSwitchEnabled ? 'bg-emerald-600' : 'bg-rose-600'"
        :disabled="saving"
        @click="toggleKill"
      >
        {{
          form.killSwitchEnabled
            ? locale === 'ar'
              ? 'إعادة التشغيل'
              : 'Resume AI'
            : locale === 'ar'
              ? 'إيقاف فوري'
              : 'Kill switch'
        }}
      </button>
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white py-16">
      <LoadingSpinner />
    </div>

    <template v-else>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-lg font-black text-slate-900">
            {{ locale === 'ar' ? 'الحالة' : 'Status' }}
          </h2>
          <span
            class="rounded-full px-3 py-1 text-xs font-bold"
            :class="form.providerConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'"
          >
            {{ form.providerName }} ·
            {{
              form.providerConfigured
                ? locale === 'ar'
                  ? 'مزود مُعد'
                  : 'Provider ready'
                : locale === 'ar'
                  ? 'بدون مزود خارجي'
                  : 'No external provider'
            }}
          </span>
        </div>
        <p class="text-xs text-slate-500">
          {{
            locale === 'ar'
              ? 'الصوت معطّل (VoiceEnabled=false). لا تُعرض نصوص طبية هنا.'
              : 'Voice remains off. Medical transcripts are never listed here.'
          }}
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-black text-slate-900">
          {{ locale === 'ar' ? 'أوضاع المساعد' : 'Assistant modes' }}
        </h2>
        <div class="grid gap-3 md:grid-cols-2">
          <label
            v-for="mode in modeFields"
            :key="mode.key"
            class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <span class="text-sm font-bold text-slate-800">{{ mode.label }}</span>
            <input v-model="form[mode.key]" type="checkbox" class="h-5 w-5 accent-teal-600" />
          </label>
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">
              {{ locale === 'ar' ? 'حد الطلبات اليومي' : 'Daily request cap' }}
            </span>
            <input
              v-model.number="form.dailyRequestLimitPerUser"
              type="number"
              min="1"
              class="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">
              {{ locale === 'ar' ? 'حد الطلبات الشهري' : 'Monthly request cap' }}
            </span>
            <input
              v-model.number="form.monthlyRequestLimitPerUser"
              type="number"
              min="1"
              class="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </label>
        </div>
        <div class="mt-5 flex justify-end">
          <button
            type="button"
            class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            :disabled="saving"
            @click="save"
          >
            {{ locale === 'ar' ? 'حفظ الإعدادات' : 'Save settings' }}
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-black text-slate-900">
          {{ locale === 'ar' ? 'الاستخدام' : 'Usage' }}
          <span class="ms-2 text-sm font-medium text-slate-500">
            ({{ usage.totalRequests }} {{ locale === 'ar' ? 'طلب' : 'reqs' }} /
            {{ usage.distinctUsers }} {{ locale === 'ar' ? 'مستخدم' : 'users' }})
          </span>
        </h2>
        <div v-if="!usage.daysBreakdown?.length" class="text-sm text-slate-500">
          {{ locale === 'ar' ? 'لا بيانات استخدام بعد.' : 'No usage yet.' }}
        </div>
        <ul v-else class="divide-y divide-slate-100 text-sm">
          <li
            v-for="d in usage.daysBreakdown"
            :key="d.dayUtc"
            class="flex items-center justify-between py-2"
          >
            <span class="font-medium text-slate-700">{{ d.dayUtc }}</span>
            <span class="text-slate-500">{{ d.requestCount }}</span>
          </li>
        </ul>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-black text-slate-900">
          {{ locale === 'ar' ? 'دليل المنتج' : 'Product knowledge' }}
        </h2>
        <ul class="space-y-3">
          <li
            v-for="a in knowledge"
            :key="a.id"
            class="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div class="min-w-0 flex-1">
              <div class="font-bold text-slate-900">{{ a.title }}</div>
              <div class="mt-0.5 text-xs text-slate-500">
                {{ a.slug }} · {{ a.audience }} · {{ a.domain || 'general' }}
              </div>
            </div>
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-xs font-bold"
              :class="a.isActive ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'"
              @click="toggleArticle(a)"
            >
              {{
                a.isActive
                  ? locale === 'ar'
                    ? 'تعطيل'
                    : 'Disable'
                  : locale === 'ar'
                    ? 'تفعيل'
                    : 'Enable'
              }}
            </button>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  getAiKnowledge,
  getAiSettings,
  getAiUsage,
  setAiKillSwitch,
  setAiKnowledgeActive,
  updateAiSettings,
} from '@/api'

const { locale } = useI18n()

const loading = ref(true)
const saving = ref(false)
const form = reactive<Record<string, any>>({
  killSwitchEnabled: false,
  restaurantCustomerEnabled: true,
  medicalCustomerEnabled: true,
  restaurantOwnerEnabled: true,
  clinicOwnerEnabled: true,
  productHelpEnabled: true,
  voiceEnabled: false,
  dailyRequestLimitPerUser: 50,
  monthlyRequestLimitPerUser: 1000,
  providerName: 'null',
  providerConfigured: false,
})
const usage = reactive<{
  totalRequests: number
  distinctUsers: number
  daysBreakdown: { dayUtc: string; requestCount: number }[]
}>({
  totalRequests: 0,
  distinctUsers: 0,
  daysBreakdown: [],
})
const knowledge = ref<any[]>([])

const modeFields = computed(() => [
  {
    key: 'restaurantCustomerEnabled',
    label: locale.value === 'ar' ? 'زبون مطاعم' : 'Restaurant customer',
  },
  {
    key: 'medicalCustomerEnabled',
    label: locale.value === 'ar' ? 'زبون طبي' : 'Medical customer',
  },
  {
    key: 'restaurantOwnerEnabled',
    label: locale.value === 'ar' ? 'مالك مطعم' : 'Restaurant owner',
  },
  {
    key: 'clinicOwnerEnabled',
    label: locale.value === 'ar' ? 'مالك عيادة' : 'Clinic owner',
  },
  {
    key: 'productHelpEnabled',
    label: locale.value === 'ar' ? 'دليل المنتج' : 'Product help',
  },
])

async function load() {
  loading.value = true
  try {
    const [s, u, k] = await Promise.all([getAiSettings(), getAiUsage(14), getAiKnowledge()])
    Object.assign(form, s.data || {})
    Object.assign(usage, u.data || {})
    knowledge.value = Array.isArray(k.data) ? k.data : []
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const { data } = await updateAiSettings({
      killSwitchEnabled: form.killSwitchEnabled,
      restaurantCustomerEnabled: form.restaurantCustomerEnabled,
      medicalCustomerEnabled: form.medicalCustomerEnabled,
      restaurantOwnerEnabled: form.restaurantOwnerEnabled,
      clinicOwnerEnabled: form.clinicOwnerEnabled,
      productHelpEnabled: form.productHelpEnabled,
      dailyRequestLimitPerUser: form.dailyRequestLimitPerUser,
      monthlyRequestLimitPerUser: form.monthlyRequestLimitPerUser,
    })
    Object.assign(form, data || {})
  } finally {
    saving.value = false
  }
}

async function toggleKill() {
  saving.value = true
  try {
    const next = !form.killSwitchEnabled
    const { data } = await setAiKillSwitch(next)
    Object.assign(form, data || {})
  } finally {
    saving.value = false
  }
}

async function toggleArticle(a: { id: string; isActive: boolean }) {
  const { data } = await setAiKnowledgeActive(a.id, !a.isActive)
  const idx = knowledge.value.findIndex((x) => x.id === a.id)
  if (idx >= 0 && data) knowledge.value[idx] = data
}

onMounted(load)
</script>
