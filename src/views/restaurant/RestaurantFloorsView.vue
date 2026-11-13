<template>
  <div class="space-y-4" :dir="dir">
    <PageHeader :title="t('rest.floors')" :crumbs="crumbs">
      <template #actions>
        <RouterLink v-if="businessId" :to="`/restaurants/${businessId}`" class="btn-secondary">{{ t('common.back') }}</RouterLink>
      </template>
    </PageHeader>

    <div v-if="!businessId" class="page-card p-4">
      <p class="text-sm text-app-muted">{{ t('rest.guidHint') }}</p>
      <div class="mt-3 flex gap-2">
        <select v-model="manualId" class="input-field">
          <option value="">{{ t('rest.pickRestaurant') }}</option>
          <option v-for="r in restaurants" :key="String(r.businessId)" :value="String(r.businessId)">{{ r.nameAr ?? r.name }}</option>
        </select>
        <button type="button" class="btn-primary" @click="go">{{ t('common.search') }}</button>
      </div>
    </div>

    <template v-else>
      <ErrorBanner v-if="listWarning" :message="listWarning" />
      <div v-if="loading" class="page-card p-10"><LoadingSpinner /></div>
      <div v-else class="grid gap-4 xl:grid-cols-[240px_1fr_280px]">
        <aside class="page-card p-3">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-black text-app-muted">{{ t('nav.floors') }}</p>
            <button type="button" class="btn-primary py-1 text-xs" @click="openFloor()">{{ t('floor.add') }}</button>
          </div>
          <button
            v-for="f in floors"
            :key="f.id"
            type="button"
            class="mb-1 w-full rounded-xl px-3 py-2 text-start text-sm font-bold"
            :class="f.id === activeFloorId ? 'bg-brand-light text-brand-dark' : 'hover:bg-slate-50'"
            @click="selectFloor(f.id)"
          >
            {{ f.nameAr || f.name }}
            <span class="block text-[11px] font-medium text-app-muted">{{ f.tables.length }} {{ t('floor.tables') }}</span>
          </button>
          <EmptyState v-if="!floors.length" :title="t('common.empty')" />
        </aside>

        <section class="page-card min-h-[480px] p-3">
          <FloorPlanCanvas
            v-if="activeFloor"
            :floor="activeFloor"
            :selected-id="selectedId"
            :fit-label="locale === 'ar' ? 'ملاءمة' : 'Fit'"
            @select="selectedId = $event"
            @move="onMove"
          />
          <EmptyState v-else :title="t('common.empty')" />
        </section>

        <aside class="page-card p-4">
          <div v-if="selected" class="space-y-3">
            <h3 class="font-black">{{ selected.code }}</h3>
            <FormField :label="t('table.code')" required>
              <input v-model="selected.code" class="input-field" @input="dirty = true" />
            </FormField>
            <FormField :label="t('table.capacity')">
              <input v-model.number="selected.capacity" type="number" min="1" class="input-field" @input="dirty = true" />
            </FormField>
            <FormField :label="t('table.minGuests')">
              <input v-model.number="selected.minGuests" type="number" min="1" class="input-field" @input="dirty = true" />
            </FormField>
            <FormField :label="t('table.shape')">
              <select v-model.number="selected.shape" class="input-field" @change="dirty = true">
                <option v-for="s in TABLE_SHAPES" :key="s.id" :value="s.id">{{ t(s.key) }}</option>
              </select>
            </FormField>
            <FormField :label="t('table.size')">
              <div class="grid grid-cols-2 gap-2">
                <input v-model.number="selected.width" type="number" class="input-field" @input="dirty = true" />
                <input v-model.number="selected.height" type="number" class="input-field" @input="dirty = true" />
              </div>
            </FormField>
            <FormField :label="t('table.rotation')">
              <input v-model.number="selected.rotationDeg" type="number" class="input-field" @input="dirty = true" />
            </FormField>
            <label class="flex items-center gap-2 text-sm font-bold">
              <input v-model="selected.isActive" type="checkbox" @change="dirty = true" /> {{ t('table.active') }}
            </label>
            <p class="text-xs text-app-muted">{{ t('table.pos') }}: {{ Math.round(selected.posX) }}, {{ Math.round(selected.posY) }}</p>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn-primary" :disabled="saving" @click="saveSelected">{{ t('table.saveGeom') }}</button>
              <button type="button" class="btn-secondary" @click="reload">{{ t('table.discard') }}</button>
            </div>
          </div>
          <div v-else-if="activeFloor" class="space-y-3">
            <p class="text-sm text-app-muted">{{ t('table.add') }}</p>
            <button type="button" class="btn-primary w-full" @click="addTable">{{ t('table.add') }}</button>
            <button type="button" class="btn-secondary w-full" @click="openFloor(activeFloor)">{{ t('floor.edit') }}</button>
            <p class="text-xs text-app-muted">{{ t('rest.noDeleteFloor') }}</p>
          </div>
        </aside>
      </div>
    </template>

    <div v-if="floorOpen" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" @click.self="floorOpen = false">
      <form class="w-full max-w-md space-y-3 rounded-2xl bg-white p-6" @submit.prevent="saveFloor">
        <h3 class="font-black">{{ editingFloorId ? t('floor.edit') : t('floor.add') }}</h3>
        <FormField :label="t('floor.nameAr')" required>
          <input v-model="floorForm.nameAr" required class="input-field" />
        </FormField>
        <FormField :label="t('floor.name')">
          <input v-model="floorForm.name" class="input-field" />
        </FormField>
        <FormField :label="t('floor.level')">
          <input v-model.number="floorForm.levelIndex" type="number" class="input-field" />
        </FormField>
        <label class="flex items-center gap-2 text-sm font-bold"><input v-model="floorForm.isActive" type="checkbox" /> {{ t('floor.active') }}</label>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary" @click="floorOpen = false">{{ t('common.cancel') }}</button>
          <button type="submit" class="btn-primary" :disabled="saving">{{ t('common.save') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  createAdminRestaurantFloor,
  createAdminRestaurantTable,
  getAdminRestaurantFloors,
  getPublicRestaurants,
  updateAdminRestaurantFloor,
  updateAdminRestaurantTable,
} from '@/api/domains'
import FloorPlanCanvas from '@/components/floorplan/FloorPlanCanvas.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import FormField from '@/components/common/FormField.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { isGuid, restaurantBusinessId, normalizePaged } from '@/utils/admin'
import { apiMessage } from '@/utils/error'
import { parseFloor, parseTable, TABLE_SHAPES, tablePayload, type FloorGeom } from '@/types/floorPlan'
import { useI18n } from '@/composables/useI18n'

const { t, dir, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const dirty = ref(false)
const floors = ref<FloorGeom[]>([])
const restaurants = ref<Record<string, unknown>[]>([])
const manualId = ref('')
const activeFloorId = ref('')
const selectedId = ref<string | null>(null)
const listWarning = ref('')
const floorOpen = ref(false)
const editingFloorId = ref<string | null>(null)
const floorForm = ref({ nameAr: '', name: '', levelIndex: 0, canvasWidth: 1000, canvasHeight: 1000, isActive: true })

const businessId = computed(() => {
  const id = String(route.params.id ?? '').trim()
  return isGuid(id) ? id : ''
})
const crumbs = computed(() => [
  { label: t('rest.title'), to: '/restaurants' },
  { label: t('rest.floors') },
])
const activeFloor = computed(() => floors.value.find((f) => f.id === activeFloorId.value) ?? null)
const selected = computed(() => activeFloor.value?.tables.find((tb) => tb.id === selectedId.value) ?? null)

function go() {
  if (!isGuid(manualId.value)) {
    toast.error(t('rest.guidHint'))
    return
  }
  router.push(`/restaurants/${manualId.value}/floors`)
}

function selectFloor(id: string) {
  if (dirty.value && !confirm(t('common.unsaved'))) return
  activeFloorId.value = id
  selectedId.value = null
  dirty.value = false
}

function onMove(id: string, posX: number, posY: number) {
  const floor = activeFloor.value
  const table = floor?.tables.find((tb) => tb.id === id)
  if (!table) return
  table.posX = posX
  table.posY = posY
  dirty.value = true
}

async function reload() {
  if (!businessId.value) return
  loading.value = true
  listWarning.value = ''
  try {
    const res = await getAdminRestaurantFloors(businessId.value)
    const raw = Array.isArray(res.data) ? res.data : ((res.data as { items?: unknown[] }).items ?? [])
    floors.value = (raw as Record<string, unknown>[]).map(parseFloor)
    if (!activeFloorId.value && floors.value[0]) activeFloorId.value = floors.value[0].id
    dirty.value = false
  } catch (e) {
    listWarning.value = apiMessage(e, t('rest.notPublicFloors'))
  } finally {
    loading.value = false
  }
}

function openFloor(floor?: FloorGeom) {
  editingFloorId.value = floor?.id ?? null
  floorForm.value = floor
    ? { nameAr: floor.nameAr, name: floor.name, levelIndex: floor.levelIndex, canvasWidth: floor.canvasWidth, canvasHeight: floor.canvasHeight, isActive: floor.isActive }
    : { nameAr: '', name: '', levelIndex: floors.value.length, canvasWidth: 1000, canvasHeight: 1000, isActive: true }
  floorOpen.value = true
}

async function saveFloor() {
  saving.value = true
  try {
    if (editingFloorId.value) {
      const res = await updateAdminRestaurantFloor(editingFloorId.value, floorForm.value, businessId.value)
      const parsed = parseFloor(res.data as Record<string, unknown>)
      floors.value = floors.value.map((f) => (f.id === parsed.id ? { ...parsed, tables: f.tables } : f))
    } else {
      const res = await createAdminRestaurantFloor(businessId.value, floorForm.value)
      const parsed = parseFloor(res.data as Record<string, unknown>)
      floors.value.push(parsed)
      activeFloorId.value = parsed.id
    }
    toast.success(t('common.save'))
    floorOpen.value = false
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    saving.value = false
  }
}

async function addTable() {
  if (!activeFloor.value) return
  saving.value = true
  try {
    const payload = {
      code: `T${activeFloor.value.tables.length + 1}`,
      capacity: 4,
      minGuests: 1,
      shape: 1,
      posX: 40,
      posY: 40,
      width: 80,
      height: 80,
      rotationDeg: 0,
      isActive: true,
    }
    const res = await createAdminRestaurantTable(activeFloor.value.id, payload)
    const table = parseTable({ ...payload, ...(res.data as Record<string, unknown>) })
    activeFloor.value.tables.push(table)
    selectedId.value = table.id
    toast.success(t('common.save'))
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    saving.value = false
  }
}

async function saveSelected() {
  if (!selected.value || !activeFloor.value) return
  saving.value = true
  try {
    await updateAdminRestaurantTable(selected.value.id, tablePayload(selected.value), activeFloor.value.id)
    dirty.value = false
    toast.success(t('common.save'))
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    saving.value = false
  }
}

watch(businessId, () => reload())
onMounted(async () => {
  if (!businessId.value) {
    const res = await getPublicRestaurants({ page: 1, pageSize: 50 })
    restaurants.value = normalizePaged(res.data).items.filter((row) => restaurantBusinessId(row))
  } else reload()
})

function onLeave(e: BeforeUnloadEvent) {
  if (!dirty.value) return
  e.preventDefault()
  e.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', onLeave))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onLeave))
</script>
