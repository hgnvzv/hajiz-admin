<template>
  <div class="space-y-6" :dir="dir">
    <PageHeader
      :title="title"
      :crumbs="[
        { label: t('nav.dashboard'), to: '/dashboard' },
        { label: t('apps.title'), to: '/applications' },
        { label: title },
      ]"
    >
      <template #actions>
        <RouterLink to="/applications" class="btn-secondary">{{ t('common.back') }}</RouterLink>
      </template>
    </PageHeader>

    <div v-if="loading"><SkeletonRows /></div>
    <ErrorBanner v-else-if="error" :message="error" :retry="load" :retry-label="t('common.retry')" />
    <template v-else-if="item">
      <div class="page-card p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm text-app-muted">{{ t('apps.identity') }}</p>
            <h2 class="mt-1 text-2xl font-black">{{ title }}</h2>
            <div class="mt-2"><DomainBadge :domain-type="item.domainType ?? item.businessDomainType" /></div>
          </div>
          <span class="rounded-full px-3 py-1 text-sm font-bold" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
        </div>
        <dl class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt class="text-xs text-app-muted">{{ t('common.owner') }}</dt><dd class="font-bold">{{ item.ownerName ?? '—' }}</dd></div>
          <div><dt class="text-xs text-app-muted">{{ t('common.phone') }}</dt><dd class="font-bold" dir="ltr">{{ item.phone ?? '—' }}</dd></div>
          <div><dt class="text-xs text-app-muted">{{ t('common.address') }}</dt><dd class="font-bold">{{ item.address ?? '—' }}</dd></div>
          <div><dt class="text-xs text-app-muted">{{ locale === 'ar' ? 'المحافظة' : 'City' }}</dt><dd class="font-bold">{{ item.city ?? item.cityName ?? '—' }}</dd></div>
          <div><dt class="text-xs text-app-muted">{{ locale === 'ar' ? 'التصنيف' : 'Category' }}</dt><dd class="font-bold">{{ item.categoryName ?? '—' }}</dd></div>
          <div><dt class="text-xs text-app-muted">{{ locale === 'ar' ? 'التاريخ' : 'Date' }}</dt><dd class="font-bold">{{ formatDate(item.createdAt as string) }}</dd></div>
          <div class="sm:col-span-2"><dt class="text-xs text-app-muted">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</dt><dd class="font-bold">{{ item.description ?? '—' }}</dd></div>
        </dl>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <div class="page-card p-6">
          <h3 class="font-black">{{ locale === 'ar' ? 'ساعات العمل' : 'Working hours' }}</h3>
          <div class="mt-4 space-y-2 text-sm">
            <div v-for="h in workingHours" :key="String(h.dayName)" class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span class="font-bold">{{ h.dayName }} {{ h.startTime }} – {{ h.endTime }}</span>
              <span :class="h.isOpen ? 'text-brand' : 'text-danger'">{{ h.isOpen ? t('common.yes') : t('common.no') }}</span>
            </div>
            <p v-if="!workingHours.length" class="text-app-muted">{{ t('common.empty') }}</p>
          </div>
        </div>
        <div class="page-card p-6">
          <h3 class="font-black">{{ locale === 'ar' ? 'الصور' : 'Images' }}</h3>
          <div class="mt-4 grid grid-cols-3 gap-3">
            <button v-for="(url, idx) in imageUrls" :key="url" type="button" class="overflow-hidden rounded-xl border" @click="openLightbox(url)">
              <img :src="url" :alt="String(idx)" class="h-28 w-full object-cover" />
            </button>
            <p v-if="!imageUrls.length" class="col-span-3 text-sm text-app-muted">{{ t('common.empty') }}</p>
          </div>
        </div>
      </div>

      <div class="page-card p-6">
        <h3 class="font-black">{{ t('apps.review') }}</h3>
        <dl class="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div><dt class="text-app-muted">{{ locale === 'ar' ? 'سبب الرفض' : 'Rejection reason' }}</dt><dd class="font-bold">{{ item.rejectionReason ?? '—' }}</dd></div>
          <div><dt class="text-app-muted">{{ locale === 'ar' ? 'المراجع' : 'Reviewed by' }}</dt><dd class="font-bold">{{ item.reviewedBy ?? '—' }}</dd></div>
          <div><dt class="text-app-muted">{{ locale === 'ar' ? 'تاريخ المراجعة' : 'Reviewed at' }}</dt><dd class="font-bold">{{ item.reviewedAt ? formatDate(item.reviewedAt as string) : '—' }}</dd></div>
        </dl>
      </div>

      <div v-if="showRestaurantPanel" class="page-card border-brand/20 p-6">
        <h3 class="font-black">{{ t('apps.draftTitle') }}</h3>
        <div v-if="draftLoading" class="py-8"><LoadingSpinner /></div>
        <div v-else-if="!restaurantDraft" class="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p class="font-bold">{{ t('apps.noDraft') }}</p>
          <p class="mt-1">{{ t('apps.noDraftEn') }}</p>
        </div>
        <template v-else>
          <dl class="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
            <div><dt class="text-app-muted">{{ locale === 'ar' ? 'عدد الطوابق المعلن' : 'Declared floors' }}</dt><dd class="font-bold">{{ restaurantDraft.declaredFloorCount ?? '—' }}</dd></div>
            <div><dt class="text-app-muted">{{ locale === 'ar' ? 'معلومات الخدمة' : 'Service info' }}</dt><dd class="font-bold">{{ restaurantDraft.serviceInfo ?? '—' }}</dd></div>
            <div><dt class="text-app-muted">{{ locale === 'ar' ? 'سياسة الإلغاء' : 'Cancellation' }}</dt><dd class="font-bold">{{ restaurantDraft.cancellationPolicyNotes ?? '—' }}</dd></div>
          </dl>
          <div class="mt-4 flex flex-wrap gap-2">
            <span v-for="c in cuisineLabels" :key="c" class="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand-dark">{{ c }}</span>
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-app-muted">
                <tr>
                  <th class="px-3 py-2">{{ t('table.code') }}</th>
                  <th class="px-3 py-2">{{ t('table.capacity') }}</th>
                  <th class="px-3 py-2">{{ t('table.minGuests') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!proposedTables.length"><td colspan="3" class="px-3 py-6 text-center text-app-muted">{{ t('common.empty') }}</td></tr>
                <tr v-for="(tb, i) in proposedTables" :key="i" class="border-t">
                  <td class="px-3 py-2 font-bold">{{ tb.code ?? '—' }}</td>
                  <td class="px-3 py-2">{{ tb.capacity ?? '—' }}</td>
                  <td class="px-3 py-2">{{ tb.minGuests ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <div v-if="isMedical" class="page-card p-6">
        <p class="text-sm text-app-muted">{{ t('med.noRecords') }}</p>
      </div>

      <div v-if="item.status === 'Pending'" class="flex flex-wrap gap-3 page-card p-4">
        <button type="button" class="btn-primary" :disabled="busy" @click="approveOpen = true">{{ t('apps.approve') }}</button>
        <button type="button" class="btn-danger" :disabled="busy" @click="rejectOpen = true">{{ t('apps.reject') }}</button>
      </div>
    </template>
    <EmptyState v-else :title="t('common.empty')" />

    <ConfirmModal v-model="approveOpen" :title="t('apps.approve')" :message="t('apps.approveConfirm')" :busy="busy" @confirm="approve" />
    <ConfirmModal v-model="rejectOpen" :title="t('apps.rejectTitle')" confirm-color="danger" :busy="busy" @confirm="reject">
      <textarea v-model="rejectReason" rows="3" class="input-field" :placeholder="t('apps.rejectReason')" />
    </ConfirmModal>
    <ImageLightbox v-model="lightboxOpen" :src="lightboxSrc" alt="" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { approveApplication, getApplicationDetail, rejectApplication } from '@/api'
import { getAdminRestaurantApplicationDraft, getAdminRestaurantCuisines } from '@/api/domains'
import PageHeader from '@/components/common/PageHeader.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import DomainBadge from '@/components/common/DomainBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SkeletonRows from '@/components/common/SkeletonRows.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { isMedicalDomain, isRestaurantDomain, readDomainType } from '@/utils/domain'
import { apiMessage } from '@/utils/error'
import { formatDate, resolveMediaUrl } from '@/utils/format'
import { statusClass, statusLabel } from '@/utils/admin'
import { welcomeCreditsApproveMessage } from '@/utils/settings'
import { useI18n } from '@/composables/useI18n'

const { t, dir, locale } = useI18n()
const route = useRoute()
const toast = useToast()
const loading = ref(true)
const error = ref('')
const item = ref<Record<string, unknown> | null>(null)
const approveOpen = ref(false)
const rejectOpen = ref(false)
const rejectReason = ref('')
const busy = ref(false)
const lightboxOpen = ref(false)
const lightboxSrc = ref('')
const draftLoading = ref(false)
const restaurantDraft = ref<Record<string, unknown> | null>(null)
const draftChecked = ref(false)
const cuisineNameById = ref<Record<string, string>>({})

const title = computed(() => String(item.value?.businessName ?? item.value?.name ?? t('apps.title')))
const domainType = computed(() => readDomainType(item.value))
const isRestaurant = computed(() => isRestaurantDomain(domainType.value))
const isMedical = computed(() => isMedicalDomain(domainType.value))
const showRestaurantPanel = computed(() => isRestaurant.value)

const proposedTables = computed(() => {
  const raw = restaurantDraft.value?.proposedTables
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
})
const cuisineLabels = computed(() => {
  const src = restaurantDraft.value
  if (!src) return [] as string[]
  const nested = src.cuisines
  if (Array.isArray(nested)) {
    return nested.map((c) => {
      if (typeof c === 'string') return cuisineNameById.value[c] ?? c
      const row = c as Record<string, unknown>
      return String(row.nameAr ?? row.name ?? cuisineNameById.value[String(row.id)] ?? '')
    }).filter(Boolean)
  }
  const ids = src.cuisineTypeIds
  if (!Array.isArray(ids)) return []
  return ids.map((id) => cuisineNameById.value[String(id)] ?? String(id))
})
const workingHours = computed(() => (Array.isArray(item.value?.workingHours) ? (item.value!.workingHours as Record<string, unknown>[]) : []))
const imageUrls = computed(() => {
  const raw = item.value?.imageUrls ?? item.value?.images
  if (!Array.isArray(raw)) return []
  return raw
    .map((x) => (typeof x === 'string' ? resolveMediaUrl(x) : resolveMediaUrl((x as Record<string, unknown>).url)))
    .filter(Boolean)
    .slice(0, 3)
})

function isDraftPayload(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return d.applicationId != null || d.declaredFloorCount != null || Array.isArray(d.proposedTables) || Array.isArray(d.cuisines)
}

async function loadRestaurantDraft(applicationId: string) {
  draftLoading.value = true
  try {
    const [draftRes, cuisinesRes] = await Promise.all([
      getAdminRestaurantApplicationDraft(applicationId),
      getAdminRestaurantCuisines(),
    ])
    const draft = draftRes.data
    restaurantDraft.value = isDraftPayload(draft) ? draft : null
    draftChecked.value = isRestaurant.value
    const list = Array.isArray(cuisinesRes.data)
      ? (cuisinesRes.data as Record<string, unknown>[])
      : []
    const map: Record<string, string> = {}
    for (const c of list) map[String(c.id)] = String(c.nameAr ?? c.name ?? c.id)
    cuisineNameById.value = map
  } catch {
    restaurantDraft.value = null
    draftChecked.value = false
  } finally {
    draftLoading.value = false
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await getApplicationDetail(String(route.params.id))
    item.value = res.data as Record<string, unknown>
    const nested = item.value.restaurantDraft
    if (isDraftPayload(nested)) restaurantDraft.value = nested
    if (isRestaurantDomain(readDomainType(item.value))) {
      await loadRestaurantDraft(String(route.params.id))
    } else {
      restaurantDraft.value = isDraftPayload(nested) ? (nested as Record<string, unknown>) : null
      draftChecked.value = false
    }
  } catch (e) {
    error.value = apiMessage(e, t('common.error'))
  } finally {
    loading.value = false
  }
}

function openLightbox(url: string) {
  lightboxSrc.value = url
  lightboxOpen.value = true
}

async function approve() {
  busy.value = true
  try {
    await approveApplication(String(route.params.id))
    toast.success(await welcomeCreditsApproveMessage(locale.value === 'ar' ? 'صاحب العمل' : 'business'))
    approveOpen.value = false
    await load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    busy.value = false
  }
}

async function reject() {
  if (!rejectReason.value.trim()) {
    toast.warning(t('apps.rejectReason'))
    return
  }
  busy.value = true
  try {
    await rejectApplication(String(route.params.id), rejectReason.value.trim())
    toast.success(t('apps.rejected'))
    rejectOpen.value = false
    await load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
