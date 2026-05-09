<template>
  <div class="space-y-6" dir="rtl">
    <div class="flex justify-end">
      <button type="button" class="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white" @click="openCreate">+ حرفة جديدة</button>
    </div>
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="rows.length" :page="1" :page-size="Math.max(rows.length, 1)" empty-text="لا توجد حرف" show-index>
      <template #cell-icon="{ row }"><span class="text-2xl">{{ row.icon || '🛠️' }}</span></template>
      <template #cell-isActive="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">{{ row.isActive !== false ? 'مفعّلة' : 'معطّلة' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1.5">
          <button type="button" class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700" @click="toggle(row)">{{ row.isActive !== false ? 'إيقاف' : 'تفعيل' }}</button>
          <button type="button" class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700" @click="remove(row)">حذف</button>
        </div>
      </template>
    </DataTable>

    <div v-if="modalOpen" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" @click.self="modalOpen = false">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" dir="rtl">
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-900">حرفة جديدة</h3>
          <button type="button" class="text-xl text-slate-400" @click="modalOpen = false">×</button>
        </div>
        <form class="space-y-4" @submit.prevent="save">
          <input v-model="form.nameAr" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="الاسم بالعربي" />
          <input v-model="form.name" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="الاسم بالإنجليزي" />
          <input v-model="form.icon" class="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="الأيقونة مثل 🔧" />
          <input v-model.number="form.displayOrder" type="number" class="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="الترتيب" />
          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold" @click="modalOpen = false">إلغاء</button>
            <button type="submit" class="flex-1 rounded-xl bg-blue-600 py-2.5 font-bold text-white">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { createProfession, deleteProfession, getProfessions, toggleProfession } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'nameAr', label: 'الاسم بالعربي' },
  { key: 'name', label: 'الاسم بالإنجليزي' },
  { key: 'icon', label: 'الأيقونة' },
  { key: 'displayOrder', label: 'الترتيب' },
  { key: 'isActive', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(true)
const modalOpen = ref(false)
const form = ref({ nameAr: '', name: '', icon: '', displayOrder: 0 })

async function load() {
  loading.value = true
  try {
    const res = await getProfessions()
    rows.value = Array.isArray(res.data) ? res.data as Record<string, unknown>[] : []
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل الحرف'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { nameAr: '', name: '', icon: '', displayOrder: rows.value.length + 1 }
  modalOpen.value = true
}

async function save() {
  try {
    await createProfession(form.value)
    toast.success('تم إنشاء الحرفة')
    modalOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function toggle(row: Record<string, unknown>) {
  try {
    await toggleProfession(String(row.id))
    toast.success('تم تحديث الحرفة')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function remove(row: Record<string, unknown>) {
  if (!confirm('هل تريد حذف الحرفة؟')) return
  try {
    await deleteProfession(String(row.id))
    toast.success('تم حذف الحرفة')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
