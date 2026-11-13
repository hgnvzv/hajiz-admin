<template>
  <div class="space-y-6" :dir="dir">
    <PageHeader
      :title="t('rest.detail')"
      :crumbs="[
        { label: t('rest.title'), to: '/restaurants' },
        { label: t('rest.detail') },
      ]"
    >
      <template #actions>
        <RouterLink v-if="id" :to="`/restaurants/${id}/floors`" class="btn-primary">{{ t('nav.floors') }}</RouterLink>
        <RouterLink v-if="id" :to="`/restaurants/${id}/menu`" class="btn-secondary">{{ t('nav.menus') }}</RouterLink>
      </template>
    </PageHeader>

    <ErrorBanner v-if="!id" :message="t('rest.guidHint')" />
    <div v-else-if="loading"><SkeletonRows /></div>
    <ErrorBanner v-else-if="error" :message="error" :retry="load" :retry-label="t('common.retry')" />
    <template v-else-if="item">
      <div class="page-card p-6">
        <div class="flex flex-wrap justify-between gap-3">
          <div>
            <h2 class="text-2xl font-black">{{ item.nameAr ?? item.name ?? '—' }}</h2>
            <p class="mt-1 text-sm text-app-muted">{{ item.address ?? '—' }}</p>
          </div>
          <DomainBadge :domain-type="item.domainType ?? 3" />
        </div>
        <dl class="mt-6 grid gap-3 text-sm md:grid-cols-3">
          <div><dt class="text-app-muted">{{ t('common.phone') }}</dt><dd class="font-bold" dir="ltr">{{ item.phone ?? '—' }}</dd></div>
          <div><dt class="text-app-muted">{{ t('ready.public') }}</dt><dd class="font-bold">{{ item.isPubliclyBookable ? t('common.yes') : t('common.no') }}</dd></div>
          <div><dt class="text-app-muted">{{ locale === 'ar' ? 'التقييم' : 'Rating' }}</dt><dd class="font-bold">{{ item.avgRating ?? '—' }}</dd></div>
        </dl>
        <RouterLink :to="`/businesses/${id}`" class="btn-ghost mt-4">{{ locale === 'ar' ? 'ملف العمل الكامل' : 'Full business file' }}</RouterLink>
      </div>

      <div class="page-card p-6">
        <h3 class="font-black">{{ t('rest.readiness') }}</h3>
        <div v-if="readyLoading" class="py-8"><LoadingSpinner /></div>
        <ErrorBanner v-else-if="readyError" :message="readyError" :retry="loadReady" :retry-label="t('common.retry')" />
        <template v-else-if="ready">
          <p class="mt-2 text-sm font-bold text-brand">{{ readinessLabel }}</p>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full bg-brand" :style="{ width: `${ready.setupProgressPercent ?? 0}%` }" />
          </div>
          <p class="mt-1 text-xs text-app-muted">{{ t('ready.progress') }}: {{ ready.setupProgressPercent ?? 0 }}%</p>
          <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt class="text-app-muted">{{ t('ready.approved') }}</dt><dd class="font-bold">{{ ready.isApproved ? t('common.yes') : t('common.no') }}</dd></div>
            <div><dt class="text-app-muted">SetupRequired</dt><dd class="font-bold">{{ ready.setupRequired ? t('common.yes') : t('common.no') }}</dd></div>
            <div><dt class="text-app-muted">{{ t('ready.public') }}</dt><dd class="font-bold">{{ ready.isPubliclyBookable ? t('common.yes') : t('common.no') }}</dd></div>
            <div><dt class="text-app-muted">Prerequisites</dt><dd class="font-bold">{{ ready.meetsPublicBookablePrerequisites ? t('common.yes') : t('common.no') }}</dd></div>
            <div><dt class="text-app-muted">{{ t('floor.tables') }}</dt><dd class="font-bold">{{ ready.activeFloorCount }} / {{ ready.activeTableCount }}</dd></div>
            <div><dt class="text-app-muted">{{ t('rest.menu') }}</dt><dd class="font-bold">{{ ready.menuCategoryCount }} / {{ ready.menuItemCount }}</dd></div>
            <div><dt class="text-app-muted">{{ t('rest.location') }}</dt><dd class="font-bold">{{ ready.locationVerifiedByAdmin ? t('common.yes') : t('common.no') }}</dd></div>
          </dl>
          <ul v-if="missing.length" class="mt-4 list-disc pe-5 text-sm text-amber-800">
            <li v-for="m in missing" :key="m">{{ m }}</li>
          </ul>
          <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" class="btn-primary" :disabled="busy || ready.isPubliclyBookable === true" @click="publish(true)">{{ t('rest.publish') }}</button>
            <button type="button" class="btn-secondary" :disabled="busy || ready.isPubliclyBookable !== true" @click="publish(false)">{{ t('rest.unpublish') }}</button>
          </div>
        </template>
      </div>

      <div class="page-card p-6">
        <h3 class="font-black">{{ t('rest.location') }}</h3>
        <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt class="text-app-muted">{{ t('common.address') }}</dt><dd class="font-bold">{{ item.address ?? locAddress }}</dd></div>
          <div><dt class="text-app-muted">Lat / Lng</dt><dd class="font-bold tabular-nums" dir="ltr">{{ lat ?? '—' }} , {{ lng ?? '—' }}</dd></div>
        </dl>
        <a v-if="lat != null && lng != null" :href="`https://www.google.com/maps?q=${lat},${lng}`" target="_blank" rel="noreferrer" class="mt-3 inline-block text-sm font-bold text-brand">Google Maps</a>
        <form class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="verify">
          <FormField :label="'Latitude'" required>
            <input v-model.number="latForm" type="number" step="any" class="input-field" required />
          </FormField>
          <FormField :label="'Longitude'" required>
            <input v-model.number="lngForm" type="number" step="any" class="input-field" required />
          </FormField>
          <FormField :label="t('common.address')" class="sm:col-span-2">
            <input v-model="locAddress" class="input-field" />
          </FormField>
          <button type="submit" class="btn-primary sm:col-span-2" :disabled="busy">{{ t('rest.verifyLocation') }}</button>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  getAdminRestaurantSetupReadiness,
  getPublicRestaurant,
  setRestaurantPubliclyBookable,
  verifyAdminRestaurantLocation,
} from '@/api/domains'
import { getBusinessDetail } from '@/api'
import DomainBadge from '@/components/common/DomainBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import SkeletonRows from '@/components/common/SkeletonRows.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import FormField from '@/components/common/FormField.vue'
import { isGuid } from '@/utils/admin'
import { apiMessage } from '@/utils/error'
import { useI18n } from '@/composables/useI18n'

const { t, dir, locale } = useI18n()
const route = useRoute()
const toast = useToast()
const id = computed(() => {
  const raw = String(route.params.id ?? '').trim()
  return isGuid(raw) ? raw : ''
})
const loading = ref(true)
const error = ref('')
const item = ref<Record<string, unknown> | null>(null)
const ready = ref<Record<string, unknown> | null>(null)
const readyLoading = ref(false)
const readyError = ref('')
const busy = ref(false)
const latForm = ref<number | null>(null)
const lngForm = ref<number | null>(null)
const locAddress = ref('')

const lat = computed(() => {
  const n = Number(item.value?.latitude ?? latForm.value)
  return Number.isFinite(n) ? n : null
})
const lng = computed(() => {
  const n = Number(item.value?.longitude ?? lngForm.value)
  return Number.isFinite(n) ? n : null
})
const missing = computed(() => (Array.isArray(ready.value?.missingRequirements) ? (ready.value!.missingRequirements as string[]) : []))
const readinessLabel = computed(() => {
  const r = ready.value
  if (!r) return '—'
  if (!r.isApproved) return t('ready.pending')
  if (r.isPubliclyBookable) return t('ready.public')
  if (r.meetsPublicBookablePrerequisites) return t('ready.readyUnpublished')
  if (r.setupRequired) return t('ready.setup')
  return t('ready.approved')
})

async function loadReady() {
  if (!id.value) return
  readyLoading.value = true
  readyError.value = ''
  try {
    const res = await getAdminRestaurantSetupReadiness(id.value)
    ready.value = res.data as Record<string, unknown>
  } catch (e) {
    readyError.value = apiMessage(e, t('common.error'))
    ready.value = null
  } finally {
    readyLoading.value = false
  }
}

async function load() {
  if (!id.value) {
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  try {
    try {
      const res = await getPublicRestaurant(id.value)
      item.value = res.data as Record<string, unknown>
    } catch {
      const res = await getBusinessDetail(id.value)
      item.value = res.data as Record<string, unknown>
    }
    latForm.value = item.value?.latitude != null ? Number(item.value.latitude) : null
    lngForm.value = item.value?.longitude != null ? Number(item.value.longitude) : null
    locAddress.value = String(item.value?.address ?? '')
    await loadReady()
  } catch (e) {
    error.value = apiMessage(e, t('common.error'))
  } finally {
    loading.value = false
  }
}

async function publish(on: boolean) {
  if (on && !confirm(t('rest.publishConfirm'))) return
  busy.value = true
  try {
    await setRestaurantPubliclyBookable(id.value, on)
    toast.success(t('common.save'))
    await loadReady()
    await load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    busy.value = false
  }
}

async function verify() {
  if (latForm.value == null || lngForm.value == null) return
  busy.value = true
  try {
    await verifyAdminRestaurantLocation(id.value, {
      latitude: Number(latForm.value),
      longitude: Number(lngForm.value),
      address: locAddress.value || undefined,
    })
    toast.success(t('rest.verifyLocation'))
    await loadReady()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
