<template>
  <div class="space-y-6" dir="rtl">
    <div class="flex justify-end">
      <button
        type="button"
        class="rounded-xl bg-primary px-5 py-2.5 font-bold text-white shadow hover:bg-primary-dark"
        @click="openCreate"
      >
        + تصنيف جديد
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div v-if="loading" class="py-16"><LoadingSpinner /></div>
      <table v-else class="w-full text-right text-sm">
        <thead class="bg-gradient-to-l from-primary to-primary-dark text-white">
          <tr>
            <th class="px-4 py-3">الأيقونة</th>
            <th class="px-4 py-3">الاسم عربي</th>
            <th class="px-4 py-3">الاسم إنجليزي</th>
            <th class="px-4 py-3">نوع الحجز</th>
            <th class="px-4 py-3">المحلات</th>
            <th class="px-4 py-3">الحالة</th>
            <th class="px-4 py-3">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-if="!items.length">
            <td colspan="7" class="px-4 py-14 text-center text-[#6B7280]">لا توجد تصنيفات</td>
          </tr>
          <tr v-for="c in items" :key="c.id" class="hover:bg-primary-light/40">
            <td class="px-4 py-3 text-2xl">{{ c.icon || '📁' }}</td>
            <td class="px-4 py-3 font-bold">{{ c.nameAr }}</td>
            <td class="px-4 py-3 text-[#6B7280]">{{ c.name ?? c.nameEn ?? '—' }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="bookingTypeClass(c.bookingType)">
                {{ bookingTypeLabel(c.bookingType) }}
              </span>
            </td>
            <td class="px-4 py-3">{{ c.businessCount ?? 0 }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-bold"
                :class="c.isActive ? 'bg-emerald-50 text-success' : 'bg-gray-100 text-gray-600'"
              >
                {{ c.isActive ? 'مفعّل' : 'معطّل' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <button type="button" class="text-xs font-bold text-primary" @click="openEdit(c)">تعديل</button>
              <button
                type="button"
                class="mr-2 text-xs font-bold text-danger disabled:opacity-40"
                :disabled="(c.businessCount ?? 0) > 0"
                @click="tryDelete(c)"
              >
                حذف
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      @click.self="modalOpen = false"
    >
      <div class="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl" dir="rtl" @click.stop>
        <h3 class="text-lg font-black">{{ editingId ? 'تعديل تصنيف' : 'تصنيف جديد' }}</h3>
        <form class="mt-4 space-y-4" @submit.prevent="save">
          <div>
            <label class="mb-1 block text-xs font-bold">الاسم بالعربية *</label>
            <input v-model="form.nameAr" required class="w-full rounded-xl border border-border px-3 py-2.5" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold">الاسم بالإنجليزية</label>
            <input v-model="form.name" class="w-full rounded-xl border border-border px-3 py-2.5" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold">نوع الحجز</label>
            <select v-model="form.bookingType" class="w-full rounded-xl border border-border px-3 py-2.5">
              <option value="Service">خدمية</option>
              <option value="Reservation">حجز مناسبات</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold">الأيقونة (رمز)</label>
            <input v-model="form.icon" class="w-full rounded-xl border border-border px-3 py-2.5" placeholder="✂️" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold">الوصف</label>
            <textarea v-model="form.description" rows="3" class="w-full rounded-xl border border-border px-3 py-2.5" />
          </div>
          <div v-if="editingId" class="flex items-center gap-2">
            <input id="active" v-model="form.isActive" type="checkbox" class="size-4 accent-primary" />
            <label for="active" class="text-sm font-bold">التصنيف مفعّل</label>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="rounded-xl border px-4 py-2 font-bold" @click="modalOpen = false">إلغاء</button>
            <button type="submit" class="rounded-xl bg-primary px-4 py-2 font-bold text-white">حفظ</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      v-model="confirmDel"
      title="حذف التصنيف"
      message="تأكيد الحذف النهائي؟"
      confirm-text="حذف"
      confirm-color="danger"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { apiMessage } from '@/utils/error'

const toast = useToast()

const loading = ref(true)
const items = ref<
  {
    id: string
    nameAr?: string
    name?: string
    nameEn?: string
    icon?: string
    isActive?: boolean
    bookingType?: string
    businessCount?: number
    description?: string
  }[]
>([])

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  nameAr: '',
  name: '',
  icon: '',
  description: '',
  bookingType: 'Service',
  isActive: true,
})

const confirmDel = ref(false)
const deleteId = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await getCategories()
    const raw = res.data
    items.value = Array.isArray(raw) ? raw : []
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { nameAr: '', name: '', icon: '', description: '', bookingType: 'Service', isActive: true }
  modalOpen.value = true
}

function openEdit(c: (typeof items.value)[0]) {
  editingId.value = c.id
  form.value = {
    nameAr: c.nameAr ?? '',
    name: c.name ?? c.nameEn ?? '',
    icon: c.icon ?? '',
    description: c.description ?? '',
    bookingType: c.bookingType ?? 'Service',
    isActive: c.isActive !== false,
  }
  modalOpen.value = true
}

function bookingTypeLabel(v: unknown) {
  const value = String(v ?? 'Service')
  if (value === 'Reservation' || value === 'Event' || value === 'Restaurant') return 'حجز مناسبات'
  return 'خدمية'
}

function bookingTypeClass(v: unknown) {
  const value = String(v ?? 'Service')
  return value === 'Reservation' || value === 'Event' || value === 'Restaurant'
    ? 'bg-purple-50 text-purple-700'
    : 'bg-blue-50 text-blue-700'
}

async function save() {
  try {
    const payload: Record<string, unknown> = {
      nameAr: form.value.nameAr,
      name: form.value.name || undefined,
      icon: form.value.icon || undefined,
      displayOrder: 0,
      bookingType: form.value.bookingType,
      description: form.value.description || undefined,
    }
    if (editingId.value) {
      payload.isActive = form.value.isActive
      await updateCategory(editingId.value, payload)
      toast.success('تم تحديث التصنيف')
    } else {
      await createCategory(payload)
      toast.success('تم إنشاء التصنيف')
    }
    modalOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

function tryDelete(c: (typeof items.value)[0]) {
  if ((c.businessCount ?? 0) > 0) {
    toast.warning(`لا يمكن حذف التصنيف لأنه مرتبط بـ ${c.businessCount} محل.`)
    return
  }
  deleteId.value = c.id
  confirmDel.value = true
}

async function doDelete() {
  if (!deleteId.value) return
  try {
    await deleteCategory(deleteId.value)
    toast.success('تم الحذف')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
