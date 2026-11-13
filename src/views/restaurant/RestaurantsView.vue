<template>
  <div class="space-y-6" :dir="dir">
    <PageHeader :title="t('rest.title')" :description="t('rest.desc')" :crumbs="[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('rest.title') }]">
      <template #actions>
        <RouterLink to="/restaurant/floors" class="btn-secondary">{{ t('nav.floors') }}</RouterLink>
      </template>
    </PageHeader>

    <div class="page-card p-4">
      <div class="flex flex-wrap gap-3">
        <input v-model="search" type="search" class="input-field min-w-[200px] flex-1" :placeholder="t('common.search')" @keyup.enter="load" />
        <button type="button" class="btn-primary" @click="load">{{ t('common.search') }}</button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :error="error"
      :total="total"
      :page="page"
      :page-size="pageSize"
      show-index
      @page-change="onPage"
      @retry="load"
    >
      <template #cell-name="{ row }">
        <RouterLink v-if="restaurantBusinessId(row)" :to="`/restaurants/${restaurantBusinessId(row)}`" class="font-bold text-brand hover:underline">
          {{ row.nameAr ?? row.name ?? '—' }}
        </RouterLink>
        <span v-else class="font-bold">{{ row.nameAr ?? row.name ?? '—' }}</span>
      </template>
      <template #cell-domain>
        <DomainBadge :domain-type="3" />
      </template>
      <template #cell-bookable="{ row }">
        <span class="text-xs font-bold" :class="row.isPubliclyBookable ? 'text-brand' : 'text-amber-700'">
          {{ row.isPubliclyBookable ? t('ready.public') : t('ready.readyUnpublished') }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div v-if="restaurantBusinessId(row)" class="flex flex-wrap gap-1">
          <RouterLink :to="`/restaurants/${restaurantBusinessId(row)}`" class="rounded-lg bg-brand-light px-2 py-1 text-xs font-bold text-brand-dark">{{ t('common.details') }}</RouterLink>
          <RouterLink :to="`/restaurants/${restaurantBusinessId(row)}/floors`" class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold">{{ t('nav.floors') }}</RouterLink>
          <RouterLink :to="`/restaurants/${restaurantBusinessId(row)}/menu`" class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold">{{ t('nav.menus') }}</RouterLink>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getPublicRestaurants } from '@/api/domains'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import DomainBadge from '@/components/common/DomainBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { normalizePaged, restaurantBusinessId } from '@/utils/admin'
import { apiMessage } from '@/utils/error'
import { useI18n } from '@/composables/useI18n'

const { t, dir } = useI18n()
const columns = computed<ColumnDef[]>(() => [
  { key: 'name', label: t('rest.title') },
  { key: 'domain', label: t('common.domain') },
  { key: 'address', label: t('common.address') },
  { key: 'bookable', label: t('ready.public') },
  { key: 'actions', label: t('common.actions') },
])
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const search = ref('')

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await getPublicRestaurants({ page: page.value, pageSize, search: search.value || undefined })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    error.value = apiMessage(e, t('common.error'))
  } finally {
    loading.value = false
  }
}

function onPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>
