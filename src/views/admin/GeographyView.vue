<template>
  <div class="space-y-6" dir="rtl">
    <div class="flex flex-wrap gap-2">
      <button v-for="t in tabs" :key="t.id" type="button" class="rounded-xl px-4 py-2 text-sm font-bold" :class="tab === t.id ? 'bg-[#2E8B57] text-white' : 'bg-slate-100'" @click="tab = t.id">
        {{ t.label }}
      </button>
    </div>

    <section v-show="tab === 'gov'" class="space-y-4">
      <div class="flex justify-end">
        <button type="button" class="rounded-xl bg-[#2E8B57] px-4 py-2 font-bold text-white" @click="openGov()">+ محافظة</button>
      </div>
      <DataTable :columns="govCols" :rows="governorates" :loading="loading" :total="governorates.length" :page="1" :page-size="Math.max(governorates.length, 1)" empty-text="لا توجد محافظات" show-index>
        <template #cell-isActive="{ row }">{{ row.isActive !== false ? 'مفعّلة' : 'معطّلة' }}</template>
        <template #cell-actions="{ row }">
          <button type="button" class="text-xs font-bold text-blue-700" @click="openGov(row)">تعديل</button>
          <button type="button" class="mr-2 text-xs font-bold text-amber-700" @click="toggleGov(row)">تبديل</button>
        </template>
      </DataTable>
    </section>

    <section v-show="tab === 'area'" class="space-y-4">
      <div class="flex flex-wrap items-end gap-3">
        <select v-model="areaGovId" class="rounded-xl border px-3 py-2.5" @change="loadAreas">
          <option value="">كل المحافظات</option>
          <option v-for="g in governorates" :key="String(g.id)" :value="String(g.id)">{{ g.nameAr ?? g.name }}</option>
        </select>
        <button type="button" class="rounded-xl bg-[#2E8B57] px-4 py-2 font-bold text-white" @click="openArea()">+ منطقة</button>
      </div>
      <DataTable :columns="areaCols" :rows="areas" :loading="loading" :total="areas.length" :page="1" :page-size="Math.max(areas.length, 1)" empty-text="لا توجد مناطق" show-index>
        <template #cell-actions="{ row }">
          <button type="button" class="text-xs font-bold text-blue-700" @click="openArea(row)">تعديل</button>
          <button type="button" class="mr-2 text-xs font-bold text-amber-700" @click="toggleArea(row)">تبديل</button>
        </template>
      </DataTable>
    </section>

    <section v-show="tab === 'hood'" class="space-y-4">
      <div class="flex flex-wrap items-end gap-3">
        <select v-model="hoodAreaId" class="rounded-xl border px-3 py-2.5" @change="loadHoods">
          <option value="">اختر منطقة</option>
          <option v-for="a in areas" :key="String(a.id)" :value="String(a.id)">{{ a.nameAr ?? a.name }}</option>
        </select>
        <button type="button" class="rounded-xl bg-[#2E8B57] px-4 py-2 font-bold text-white" @click="openHood()">+ حي</button>
      </div>
      <DataTable :columns="hoodCols" :rows="hoods" :loading="loading" :total="hoods.length" :page="1" :page-size="Math.max(hoods.length, 1)" empty-text="لا توجد أحياء" show-index>
        <template #cell-actions="{ row }">
          <button type="button" class="text-xs font-bold text-blue-700" @click="openHood(row)">تعديل</button>
          <button type="button" class="mr-2 text-xs font-bold text-amber-700" @click="toggleHood(row)">تبديل</button>
        </template>
      </DataTable>
    </section>

    <div v-if="modalOpen" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" @click.self="modalOpen = false">
      <form class="w-full max-w-md space-y-3 rounded-2xl bg-white p-6" @submit.prevent="saveModal">
        <h3 class="font-black">{{ modalTitle }}</h3>
        <input v-model="form.nameAr" required class="w-full rounded-xl border px-3 py-2.5" placeholder="الاسم بالعربية" />
        <input v-model="form.name" class="w-full rounded-xl border px-3 py-2.5" placeholder="English name" />
        <input v-model.number="form.displayOrder" type="number" class="w-full rounded-xl border px-3 py-2.5" placeholder="الترتيب" />
        <input v-if="modalKind === 'gov'" v-model.number="form.legacyCityCode" type="number" class="w-full rounded-xl border px-3 py-2.5" placeholder="رمز المدينة القديم" />
        <select v-if="modalKind === 'area'" v-model="form.governorateId" required class="w-full rounded-xl border px-3 py-2.5">
          <option v-for="g in governorates" :key="String(g.id)" :value="String(g.id)">{{ g.nameAr ?? g.name }}</option>
        </select>
        <select v-if="modalKind === 'hood'" v-model="form.areaId" required class="w-full rounded-xl border px-3 py-2.5">
          <option v-for="a in areas" :key="String(a.id)" :value="String(a.id)">{{ a.nameAr ?? a.name }}</option>
        </select>
        <label class="flex items-center gap-2 text-sm font-bold"><input v-model="form.isActive" type="checkbox" /> مفعّل</label>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl border px-4 py-2" @click="modalOpen = false">إلغاء</button>
          <button type="submit" class="rounded-xl bg-[#2E8B57] px-4 py-2 font-bold text-white">حفظ</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import {
  createAdminArea,
  createAdminGovernorate,
  createAdminNeighborhood,
  getAdminAreas,
  getAdminGovernorates,
  getAdminNeighborhoods,
  toggleAdminArea,
  toggleAdminGovernorate,
  toggleAdminNeighborhood,
  updateAdminArea,
  updateAdminGovernorate,
  updateAdminNeighborhood,
} from '@/api/domains'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'
import { normalizePaged } from '@/utils/admin'

const toast = useToast()
const tabs = [
  { id: 'gov', label: 'المحافظات' },
  { id: 'area', label: 'المناطق' },
  { id: 'hood', label: 'الأحياء' },
]
const tab = ref('gov')
const loading = ref(false)
const governorates = ref<Record<string, unknown>[]>([])
const areas = ref<Record<string, unknown>[]>([])
const hoods = ref<Record<string, unknown>[]>([])
const areaGovId = ref('')
const hoodAreaId = ref('')
const govCols: ColumnDef[] = [
  { key: 'nameAr', label: 'العربية' },
  { key: 'name', label: 'English' },
  { key: 'displayOrder', label: 'ترتيب' },
  { key: 'isActive', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]
const areaCols: ColumnDef[] = [
  { key: 'nameAr', label: 'العربية' },
  { key: 'name', label: 'English' },
  { key: 'actions', label: 'إجراءات' },
]
const hoodCols = areaCols

const modalOpen = ref(false)
const modalKind = ref<'gov' | 'area' | 'hood'>('gov')
const modalTitle = ref('')
const editingId = ref<string | null>(null)
const form = ref({
  nameAr: '',
  name: '',
  displayOrder: 0,
  isActive: true,
  legacyCityCode: 0,
  governorateId: '',
  areaId: '',
})

function listOf(data: unknown) {
  const d = normalizePaged(data)
  return d.items.length ? d.items : Array.isArray(data) ? (data as Record<string, unknown>[]) : []
}

async function loadGov() {
  loading.value = true
  try {
    const res = await getAdminGovernorates()
    governorates.value = listOf(res.data)
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل المحافظات'))
  } finally {
    loading.value = false
  }
}

async function loadAreas() {
  loading.value = true
  try {
    const res = await getAdminAreas({ governorateId: areaGovId.value || undefined })
    areas.value = listOf(res.data)
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل المناطق'))
  } finally {
    loading.value = false
  }
}

async function loadHoods() {
  if (!hoodAreaId.value) {
    hoods.value = []
    return
  }
  loading.value = true
  try {
    const res = await getAdminNeighborhoods({ areaId: hoodAreaId.value })
    hoods.value = listOf(res.data)
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الأحياء'))
  } finally {
    loading.value = false
  }
}

function openGov(row?: Record<string, unknown>) {
  modalKind.value = 'gov'
  modalTitle.value = row ? 'تعديل محافظة' : 'محافظة جديدة'
  editingId.value = row ? String(row.id) : null
  form.value = {
    nameAr: String(row?.nameAr ?? ''),
    name: String(row?.name ?? ''),
    displayOrder: Number(row?.displayOrder ?? 0),
    isActive: row?.isActive !== false,
    legacyCityCode: Number(row?.legacyCityCode ?? 0),
    governorateId: '',
    areaId: '',
  }
  modalOpen.value = true
}

function openArea(row?: Record<string, unknown>) {
  modalKind.value = 'area'
  modalTitle.value = row ? 'تعديل منطقة' : 'منطقة جديدة'
  editingId.value = row ? String(row.id) : null
  form.value = {
    nameAr: String(row?.nameAr ?? ''),
    name: String(row?.name ?? ''),
    displayOrder: Number(row?.displayOrder ?? 0),
    isActive: row?.isActive !== false,
    legacyCityCode: 0,
    governorateId: String(row?.governorateId ?? areaGovId.value ?? governorates.value[0]?.id ?? ''),
    areaId: '',
  }
  modalOpen.value = true
}

function openHood(row?: Record<string, unknown>) {
  modalKind.value = 'hood'
  modalTitle.value = row ? 'تعديل حي' : 'حي جديد'
  editingId.value = row ? String(row.id) : null
  form.value = {
    nameAr: String(row?.nameAr ?? ''),
    name: String(row?.name ?? ''),
    displayOrder: Number(row?.displayOrder ?? 0),
    isActive: row?.isActive !== false,
    legacyCityCode: 0,
    governorateId: '',
    areaId: String(row?.areaId ?? hoodAreaId.value),
  }
  modalOpen.value = true
}

async function saveModal() {
  try {
    if (modalKind.value === 'gov') {
      const payload = {
        nameAr: form.value.nameAr,
        name: form.value.name,
        displayOrder: form.value.displayOrder,
        isActive: form.value.isActive,
        legacyCityCode: form.value.legacyCityCode,
      }
      if (editingId.value) await updateAdminGovernorate(editingId.value, payload)
      else await createAdminGovernorate(payload)
      loadGov()
    } else if (modalKind.value === 'area') {
      const payload = {
        nameAr: form.value.nameAr,
        name: form.value.name,
        displayOrder: form.value.displayOrder,
        isActive: form.value.isActive,
        governorateId: form.value.governorateId,
      }
      if (editingId.value) await updateAdminArea(editingId.value, payload)
      else await createAdminArea(payload)
      loadAreas()
    } else {
      const payload = {
        nameAr: form.value.nameAr,
        name: form.value.name,
        displayOrder: form.value.displayOrder,
        isActive: form.value.isActive,
        areaId: form.value.areaId,
      }
      if (editingId.value) await updateAdminNeighborhood(editingId.value, payload)
      else await createAdminNeighborhood(payload)
      loadHoods()
    }
    toast.success('تم الحفظ')
    modalOpen.value = false
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function toggleGov(row: Record<string, unknown>) {
  try {
    await toggleAdminGovernorate(String(row.id))
    loadGov()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}
async function toggleArea(row: Record<string, unknown>) {
  try {
    await toggleAdminArea(String(row.id))
    loadAreas()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}
async function toggleHood(row: Record<string, unknown>) {
  try {
    await toggleAdminNeighborhood(String(row.id))
    loadHoods()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(async () => {
  await loadGov()
  await loadAreas()
})
</script>
