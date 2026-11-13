<template>
  <div class="space-y-6">
    <PageHeader title="التخصصات الطبية" description="CRUD التخصصات حسب عقد الأدمن الطبي.">
      <template #actions>
        <button type="button" class="btn-primary" @click="openCreate">+ تخصص</button>
      </template>
    </PageHeader>
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="rows.length" :page="1" :page-size="Math.max(rows.length, 1)" empty-text="لا توجد تخصصات" show-index>
      <template #cell-isActive="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">
          {{ row.isActive !== false ? 'مفعّل' : 'معطّل' }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-1.5">
          <button type="button" class="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700" @click="openEdit(row)">تعديل</button>
          <button type="button" class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700" @click="toggle(row)">
            {{ row.isActive !== false ? 'تعطيل' : 'تفعيل' }}
          </button>
        </div>
      </template>
    </DataTable>

    <div v-if="modalOpen" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" @click.self="modalOpen = false">
      <form class="w-full max-w-md space-y-3 rounded-2xl bg-white p-6" dir="rtl" @submit.prevent="save">
        <h3 class="text-lg font-black">{{ editingId ? 'تعديل تخصص' : 'تخصص جديد' }}</h3>
        <input v-model="form.nameAr" required class="w-full rounded-xl border px-3 py-2.5" placeholder="الاسم بالعربية" />
        <input v-model="form.name" required class="w-full rounded-xl border px-3 py-2.5" placeholder="الاسم بالإنجليزية" />
        <textarea v-model="form.description" rows="3" class="w-full rounded-xl border px-3 py-2.5" placeholder="الوصف (اختياري)" />
        <input v-model.number="form.displayOrder" type="number" class="w-full rounded-xl border px-3 py-2.5" placeholder="الترتيب" />
        <label class="flex items-center gap-2 text-sm font-bold"><input v-model="form.isActive" type="checkbox" /> مفعّل</label>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl border px-4 py-2 font-bold" @click="modalOpen = false">إلغاء</button>
          <button type="submit" class="rounded-xl bg-teal-700 px-4 py-2 font-bold text-white">حفظ</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import {
  createAdminMedicalSpecialty,
  getAdminMedicalSpecialties,
  toggleAdminMedicalSpecialty,
  updateAdminMedicalSpecialty,
} from '@/api/domains'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { apiMessage } from '@/utils/error'
import { normalizePaged } from '@/utils/admin'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'nameAr', label: 'العربية' },
  { key: 'name', label: 'English' },
  { key: 'description', label: 'الوصف' },
  { key: 'displayOrder', label: 'الترتيب' },
  { key: 'isActive', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ nameAr: '', name: '', description: '', displayOrder: 0, isActive: true })

async function load() {
  loading.value = true
  try {
    const res = await getAdminMedicalSpecialties()
    rows.value = normalizePaged(res.data).items.length ? normalizePaged(res.data).items : (Array.isArray(res.data) ? res.data as Record<string, unknown>[] : [])
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل التخصصات'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { nameAr: '', name: '', description: '', displayOrder: rows.value.length + 1, isActive: true }
  modalOpen.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingId.value = String(row.id)
  form.value = {
    nameAr: String(row.nameAr ?? ''),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    displayOrder: Number(row.displayOrder ?? 0),
    isActive: row.isActive !== false,
  }
  modalOpen.value = true
}

async function save() {
  try {
    if (editingId.value) await updateAdminMedicalSpecialty(editingId.value, form.value)
    else await createAdminMedicalSpecialty(form.value)
    toast.success('تم حفظ التخصص')
    modalOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function toggle(row: Record<string, unknown>) {
  try {
    await toggleAdminMedicalSpecialty(String(row.id))
    toast.success('تم تحديث الحالة')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
