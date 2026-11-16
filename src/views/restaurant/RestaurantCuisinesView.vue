<template>
  <div class="space-y-6">
    <PageHeader title="أنواع المطبخ" description="إدارة أنواع المطبخ وأيقوناتها (SVG أو صورة) الظاهرة في تطبيق العملاء.">
      <template #actions>
        <button type="button" class="btn-primary" @click="openCreate">+ نوع مطبخ</button>
      </template>
    </PageHeader>
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="rows.length" :page="1" :page-size="Math.max(rows.length, 1)" empty-text="لا توجد أنواع مطبخ" show-index>
      <template #cell-icon="{ row }">
        <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-orange-50">
          <img
            v-if="iconSrc(row)"
            :src="iconSrc(row)"
            alt=""
            class="h-8 w-8 object-contain"
          />
          <span v-else class="text-xs text-slate-400">—</span>
        </div>
      </template>
      <template #cell-isActive="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">
          {{ row.isActive !== false ? 'مفعّل' : 'معطّل' }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-800" @click="openEdit(row)">
            تعديل
          </button>
          <button type="button" class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800" @click="toggle(row)">
            {{ row.isActive !== false ? 'تعطيل' : 'تفعيل' }}
          </button>
        </div>
      </template>
    </DataTable>

    <div v-if="modalOpen" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" @click.self="modalOpen = false">
      <form class="w-full max-w-md space-y-3 rounded-2xl bg-white p-6" @submit.prevent="save">
        <h3 class="text-lg font-black">{{ editingId ? 'تعديل نوع المطبخ' : 'نوع مطبخ جديد' }}</h3>
        <input v-model="form.nameAr" required class="w-full rounded-xl border px-3 py-2.5" placeholder="الاسم بالعربية" />
        <input v-model="form.name" required class="w-full rounded-xl border px-3 py-2.5" placeholder="English name" />
        <input v-model.number="form.displayOrder" type="number" class="w-full rounded-xl border px-3 py-2.5" placeholder="الترتيب" />

        <div class="space-y-2 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-3">
          <label class="block text-sm font-bold text-slate-700">أيقونة التصنيف (SVG / PNG)</label>
          <input
            type="file"
            accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            class="block w-full text-sm"
            @change="onIconPicked"
          />
          <div v-if="iconPreview" class="flex items-center gap-3">
            <img :src="iconPreview" alt="" class="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm" />
            <button type="button" class="text-xs font-bold text-rose-600" @click="clearIcon">إزالة الأيقونة</button>
          </div>
          <p class="text-xs text-slate-500">يفضّل SVG مربع بسيط ليظهر فوق اسم التصنيف في التطبيق.</p>
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <button type="button" class="rounded-xl border px-4 py-2 font-bold" @click="modalOpen = false">إلغاء</button>
          <button type="submit" class="rounded-xl bg-orange-500 px-4 py-2 font-bold text-white" :disabled="saving">
            {{ saving ? 'جاري الحفظ…' : 'حفظ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import {
  createAdminRestaurantCuisine,
  getAdminRestaurantCuisines,
  toggleAdminRestaurantCuisine,
  updateAdminRestaurantCuisine,
  updateAdminRestaurantCuisineIcon,
} from '@/api/domains'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { normalizePaged } from '@/utils/admin'
import { apiMessage } from '@/utils/error'
import { resolveMediaUrl } from '@/utils/format'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'icon', label: 'أيقونة' },
  { key: 'nameAr', label: 'العربية' },
  { key: 'name', label: 'English' },
  { key: 'displayOrder', label: 'الترتيب' },
  { key: 'isActive', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ nameAr: '', name: '', displayOrder: 0, iconUrl: '' as string | null })
const iconFile = ref<File | null>(null)
const iconPreview = ref<string | null>(null)

function iconSrc(row: Record<string, unknown>) {
  const raw = (row.iconUrl ?? row.IconUrl)?.toString()
  return raw ? resolveMediaUrl(raw) : ''
}

async function load() {
  loading.value = true
  try {
    const res = await getAdminRestaurantCuisines()
    const d = normalizePaged(res.data)
    rows.value = d.items.length ? d.items : (Array.isArray(res.data) ? res.data as Record<string, unknown>[] : [])
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل أنواع المطبخ'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { nameAr: '', name: '', displayOrder: rows.value.length + 1, iconUrl: null }
  iconFile.value = null
  iconPreview.value = null
  modalOpen.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingId.value = String(row.id)
  form.value = {
    nameAr: String(row.nameAr ?? ''),
    name: String(row.name ?? ''),
    displayOrder: Number(row.displayOrder ?? 0),
    iconUrl: (row.iconUrl ?? row.IconUrl)?.toString() || null,
  }
  iconFile.value = null
  iconPreview.value = form.value.iconUrl ? resolveMediaUrl(form.value.iconUrl) : null
  modalOpen.value = true
}

function onIconPicked(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  iconFile.value = file
  if (file) {
    iconPreview.value = URL.createObjectURL(file)
  }
}

function clearIcon() {
  iconFile.value = null
  iconPreview.value = null
  form.value.iconUrl = null
}

async function save() {
  saving.value = true
  try {
    if (editingId.value) {
      await updateAdminRestaurantCuisine(editingId.value, {
        nameAr: form.value.nameAr,
        name: form.value.name,
        displayOrder: form.value.displayOrder,
        iconUrl: form.value.iconUrl,
      })
      if (iconFile.value) {
        await updateAdminRestaurantCuisineIcon(editingId.value, iconFile.value)
      }
      toast.success('تم تحديث نوع المطبخ')
    } else {
      const created = await createAdminRestaurantCuisine({
        nameAr: form.value.nameAr,
        name: form.value.name,
        displayOrder: form.value.displayOrder,
        iconUrl: form.value.iconUrl,
      })
      const id = (created.data as { id?: string } | undefined)?.id
      if (id && iconFile.value) {
        await updateAdminRestaurantCuisineIcon(id, iconFile.value)
      }
      toast.success('تم إنشاء نوع المطبخ')
    }
    modalOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    saving.value = false
  }
}

async function toggle(row: Record<string, unknown>) {
  try {
    await toggleAdminRestaurantCuisine(String(row.id))
    toast.success('تم تحديث الحالة')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
