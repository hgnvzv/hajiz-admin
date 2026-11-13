<template>
  <div class="space-y-6" :dir="dir">
    <PageHeader :title="t('rest.menu')" :description="t('rest.menuHint')" :crumbs="crumbs">
      <template #actions>
        <RouterLink v-if="businessId" :to="`/restaurants/${businessId}`" class="btn-secondary">{{ t('common.back') }}</RouterLink>
      </template>
    </PageHeader>

    <div v-if="!businessId" class="page-card p-4">
      <label class="label-field">{{ t('rest.pickRestaurant') }}</label>
      <div class="flex gap-2">
        <select v-model="manualId" class="input-field">
          <option value="">{{ t('rest.pickRestaurant') }}</option>
          <option v-for="r in restaurants" :key="String(r.businessId)" :value="String(r.businessId)">{{ r.nameAr ?? r.name }}</option>
        </select>
        <button type="button" class="btn-primary" @click="go">{{ t('common.search') }}</button>
      </div>
    </div>

    <div v-else-if="loading"><SkeletonRows /></div>
    <ErrorBanner v-else-if="error" :message="error" :retry="() => load(businessId)" :retry-label="t('common.retry')" />
    <div v-else class="space-y-4">
      <section v-for="cat in categories" :key="String(cat.id ?? cat.name)" class="page-card p-5">
        <h3 class="font-black">{{ cat.nameAr ?? cat.name }}</h3>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <article v-for="it in itemsOf(cat)" :key="String(it.id)" class="flex gap-3 rounded-xl bg-slate-50 p-3">
            <img v-if="it.imageUrl" :src="String(it.imageUrl)" alt="" class="h-16 w-16 rounded-lg object-cover" />
            <div class="min-w-0 flex-1">
              <p class="font-bold">{{ it.nameAr ?? it.name }}</p>
              <p class="text-xs text-app-muted">{{ it.descriptionAr ?? it.description ?? '' }}</p>
              <p class="mt-1 text-sm font-black text-brand">{{ it.price ?? '—' }}</p>
              <p class="text-[11px] font-bold" :class="it.isAvailable === false ? 'text-danger' : 'text-brand'">
                {{ it.isAvailable === false ? (locale === 'ar' ? 'غير متاح' : 'Unavailable') : (locale === 'ar' ? 'متاح' : 'Available') }}
              </p>
            </div>
          </article>
        </div>
      </section>
      <EmptyState v-if="!categories.length" :title="t('rest.menuEmpty')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { getPublicRestaurantMenu, getPublicRestaurants } from '@/api/domains'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import SkeletonRows from '@/components/common/SkeletonRows.vue'
import { isGuid, normalizePaged, restaurantBusinessId } from '@/utils/admin'
import { apiMessage } from '@/utils/error'
import { useI18n } from '@/composables/useI18n'

const { t, dir, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const categories = ref<Record<string, unknown>[]>([])
const restaurants = ref<Record<string, unknown>[]>([])
const manualId = ref('')
const businessId = computed(() => {
  const id = String(route.params.id ?? '').trim()
  return isGuid(id) ? id : ''
})
const crumbs = computed(() => [
  { label: t('rest.title'), to: '/restaurants' },
  { label: t('rest.menu') },
])

function itemsOf(cat: Record<string, unknown>) {
  const raw = cat.items ?? cat.menuItems
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
}

async function load(id: string) {
  if (!id) return
  loading.value = true
  error.value = ''
  try {
    const res = await getPublicRestaurantMenu(id)
    const data = res.data as Record<string, unknown> | Record<string, unknown>[]
    if (Array.isArray(data)) categories.value = data
    else if (Array.isArray((data as Record<string, unknown>).categories)) {
      categories.value = (data as { categories: Record<string, unknown>[] }).categories
    } else categories.value = []
  } catch (e) {
    error.value = apiMessage(e, t('common.error'))
  } finally {
    loading.value = false
  }
}

function go() {
  if (!isGuid(manualId.value)) return
  router.push(`/restaurants/${manualId.value}/menu`)
}

onMounted(async () => {
  if (businessId.value) load(businessId.value)
  else {
    const res = await getPublicRestaurants({ page: 1, pageSize: 50 })
    restaurants.value = normalizePaged(res.data).items.filter((row) => restaurantBusinessId(row))
  }
})
</script>
