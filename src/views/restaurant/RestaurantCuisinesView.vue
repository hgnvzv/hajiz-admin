<template>
  <div class="space-y-6">
    <PageHeader title="أنواع المطبخ" description="إدارة أنواع المطبخ من واجهات الأدمن.">
      <template #actions>
        <button type="button" class="btn-primary" @click="openCreate">+ نوع مطبخ</button>
      </template>
    </PageHeader>
    <DataTable :columns="columns" :rows="rows" :loading="loading" :total="rows.length" :page="1" :page-size="Math.max(rows.length, 1)" empty-text="لا توجد أنواع مطبخ" show-index>
      <template #cell-isActive="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">
          {{ row.isActive !== false ? 'مفعّل' : 'معطّل' }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <button type="button" class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800" @click="toggle(row)">
          {{ row.isActive !== false ? 'تعطيل' : 'تفعيل' }}
        </button>
      </template>
    </DataTable>
    <div v-if="modalOpen" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" @click.self="modalOpen = false">
      <form class="w-full max-w-md space-y-3 rounded-2xl bg-white p-6" @submit.prevent="save">
        <h3 class="text-lg font-black">نوع مطبخ جديد</h3>
        <input v-model="form.nameAr" required class="w-full rounded-xl border px-3 py-2.5" placeholder="الاسم بالعربية" />
        <input v-model="form.name" required class="w-full rounded-xl border px-3 py-2.5" placeholder="English name" />
        <input v-model.number="form.displayOrder" type="number" class="w-full rounded-xl border px-3 py-2.5" placeholder="الترتيب" />
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl border px-4 py-2 font-bold" @click="modalOpen = false">إلغاء</button>
          <button type="submit" class="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white">حفظ</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { createAdminRestaurantCuisine, getAdminRestaurantCuisines, toggleAdminRestaurantCuisine } from '@/api/domains'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { normalizePaged } from '@/utils/admin'
import { apiMessage } from '@/utils/error'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'nameAr', label: 'العربية' },
  { key: 'name', label: 'English' },
  { key: 'displayOrder', label: 'الترتيب' },
  { key: 'isActive', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const form = ref({ nameAr: '', name: '', displayOrder: 0 })

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
  form.value = { nameAr: '', name: '', displayOrder: rows.value.length + 1 }
  modalOpen.value = true
}

async function save() {
  try {
    await createAdminRestaurantCuisine(form.value)
    toast.success('تم إنشاء نوع المطبخ')
    modalOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
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
