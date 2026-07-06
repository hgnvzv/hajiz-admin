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
            <th class="px-4 py-3">الترتيب</th>
            <th class="px-4 py-3">المحلات</th>
            <th class="px-4 py-3">مسار الحجز</th>
            <th class="px-4 py-3">النوع (قديم)</th>
            <th class="px-4 py-3">إعداد الحجز</th>
            <th class="px-4 py-3">الحالة</th>
            <th class="px-4 py-3">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-if="!items.length">
            <td colspan="10" class="px-4 py-14 text-center text-[#6B7280]">لا توجد تصنيفات</td>
          </tr>
          <template v-for="c in items" :key="c.id">
          <tr class="hover:bg-primary-light/40">
            <td class="px-4 py-3">
              <i
                v-if="isTablerIcon(c.icon)"
                :class="['ti', c.icon]"
                style="color:#10B981; font-size:20px"
              ></i>
              <span v-else class="text-2xl">{{ c.icon || '📁' }}</span>
            </td>
            <td class="px-4 py-3 font-bold">{{ c.nameAr }}</td>
            <td class="px-4 py-3 text-[#6B7280]">{{ c.name ?? '—' }}</td>
            <td class="px-4 py-3">{{ c.displayOrder ?? 0 }}</td>
            <td class="px-4 py-3">{{ c.businessCount ?? 0 }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">
                {{ bookingFlowLabel(c.bookingFlow) }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs font-bold text-slate-600">{{ bookingTypeLabel(c.bookingType) }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700" :title="bookingConfigSummary(c)">
                {{ bookingConfigSummary(c) }}
              </span>
            </td>
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
              <button type="button" class="mr-2 text-xs font-bold text-amber-700" @click="toggleCategoryRow(c)">
                {{ c.isActive ? 'تعطيل' : 'تفعيل' }}
              </button>
              <button type="button" class="mr-2 text-xs font-bold text-emerald-700" @click="openSubCreate(c)">
                + فرعي
              </button>
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
          <tr v-if="c.subCategories?.length" class="bg-slate-50/80">
            <td colspan="10" class="px-6 py-4">
              <div class="mb-2 text-xs font-black text-slate-500">التصنيفات الفرعية</div>
              <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="sub in c.subCategories"
                  :key="sub.id"
                  class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  <div>
                    <p class="text-sm font-bold text-slate-900">{{ sub.nameAr }}</p>
                    <p class="text-xs text-slate-500">{{ sub.name }} • ترتيب {{ sub.displayOrder ?? 0 }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button type="button" class="text-xs font-bold text-primary" @click="openSubEdit(c, sub)">تعديل</button>
                    <button type="button" class="text-xs font-bold text-amber-700" @click="toggleSub(sub)">
                      {{ sub.isActive ? 'تعطيل' : 'تفعيل' }}
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      @click.self="modalOpen = false"
    >
      <div class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl" dir="rtl" @click.stop>
        <h3 class="text-lg font-black">{{ editingId ? 'تعديل تصنيف' : 'تصنيف جديد' }}</h3>
        <form class="mt-4 space-y-4" @submit.prevent="save">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-bold">الاسم بالعربية *</label>
              <input v-model="form.nameAr" required class="w-full rounded-xl border border-border px-3 py-2.5" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold">الاسم بالإنجليزية</label>
              <input v-model="form.name" class="w-full rounded-xl border border-border px-3 py-2.5" />
            </div>
          </div>
          <IconPickerInput v-model="form.icon" label="الأيقونة" />
          <div>
            <label class="mb-1 block text-xs font-bold">الترتيب</label>
            <input v-model.number="form.displayOrder" type="number" min="0" class="w-full rounded-xl border border-border px-3 py-2.5" />
          </div>
          <CategoryBookingFields v-model="bookingForm" />
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

    <div
      v-if="subModalOpen"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      @click.self="subModalOpen = false"
    >
      <div class="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl" dir="rtl" @click.stop>
        <h3 class="text-lg font-black">{{ editingSubId ? 'تعديل تصنيف فرعي' : 'تصنيف فرعي جديد' }}</h3>
        <form class="mt-4 space-y-4" @submit.prevent="saveSub">
          <div>
            <label class="mb-1 block text-xs font-bold">الاسم بالعربية *</label>
            <input v-model="subForm.nameAr" required class="w-full rounded-xl border border-border px-3 py-2.5" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold">الاسم بالإنجليزية *</label>
            <input v-model="subForm.name" required class="w-full rounded-xl border border-border px-3 py-2.5" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold">الترتيب</label>
            <input v-model.number="subForm.displayOrder" type="number" min="0" class="w-full rounded-xl border border-border px-3 py-2.5" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="rounded-xl border px-4 py-2 font-bold" @click="subModalOpen = false">إلغاء</button>
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
import {
  createCategory,
  createSubCategory,
  deleteCategory,
  getCategories,
  toggleCategory,
  toggleSubCategory,
  updateCategory,
  updateSubCategory,
} from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import IconPickerInput from '@/components/common/IconPickerInput.vue'
import CategoryBookingFields from '@/components/admin/CategoryBookingFields.vue'
import type { CategoryBookingFormState, CategoryDto } from '@/types/category'
import {
  bookingConfigSummary,
  bookingFlowLabel,
  bookingTypeLabel,
  DEFAULT_CATEGORY_BOOKING,
  isValidBookingFlow,
  readCategoryBooking,
} from '@/utils/categoryBooking'
import { apiMessage } from '@/utils/error'

const toast = useToast()

const loading = ref(true)
const items = ref<CategoryDto[]>([])

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  nameAr: '',
  name: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
})
const bookingForm = ref<CategoryBookingFormState>({ ...DEFAULT_CATEGORY_BOOKING })
const subModalOpen = ref(false)
const editingSubId = ref<string | null>(null)
const currentCategoryId = ref<string | null>(null)
const subForm = ref({ categoryId: '', nameAr: '', name: '', displayOrder: 0 })

const confirmDel = ref(false)
const deleteId = ref<string | null>(null)

function isTablerIcon(icon: unknown) {
  return typeof icon === 'string' && icon.startsWith('ti-')
}

async function load() {
  loading.value = true
  try {
    const res = await getCategories()
    const raw = res.data
    items.value = (Array.isArray(raw) ? raw : []) as CategoryDto[]
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    loading.value = false
  }
}

function resetBookingForm() {
  bookingForm.value = { ...DEFAULT_CATEGORY_BOOKING }
}

function openCreate() {
  editingId.value = null
  form.value = { nameAr: '', name: '', icon: '', displayOrder: items.value.length + 1, isActive: true }
  resetBookingForm()
  modalOpen.value = true
}

function openEdit(c: CategoryDto) {
  editingId.value = c.id
  form.value = {
    nameAr: c.nameAr ?? '',
    name: c.name ?? '',
    icon: c.icon ?? '',
    displayOrder: c.displayOrder ?? 0,
    isActive: c.isActive !== false,
  }
  bookingForm.value = readCategoryBooking(c as unknown as Record<string, unknown>)
  modalOpen.value = true
}

function buildCategoryPayload(): Record<string, unknown> {
  if (!isValidBookingFlow(bookingForm.value.bookingFlow)) {
    throw new Error('مسار الحجز غير صالح')
  }
  return {
    nameAr: form.value.nameAr,
    name: form.value.name || undefined,
    icon: form.value.icon || undefined,
    displayOrder: form.value.displayOrder,
    bookingType: bookingForm.value.bookingType,
    bookingFlow: bookingForm.value.bookingFlow,
    requiresServices: bookingForm.value.requiresServices,
    requiresStaffSelection: bookingForm.value.requiresStaffSelection,
    requiresGuestCount: bookingForm.value.requiresGuestCount,
    supportsOccasionSelection: bookingForm.value.supportsOccasionSelection,
    requiresOccasionSelection: bookingForm.value.requiresOccasionSelection,
  }
}

async function save() {
  try {
    const payload = buildCategoryPayload()
    if (editingId.value) {
      if (form.value.isActive !== undefined) payload.isActive = form.value.isActive
      await updateCategory(editingId.value, payload)
      toast.success('تم تحديث التصنيف')
    } else {
      await createCategory(payload)
      toast.success('تم إنشاء التصنيف')
    }
    modalOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e, e instanceof Error ? e.message : 'تعذر حفظ التصنيف'))
  }
}

async function toggleCategoryRow(c: CategoryDto) {
  try {
    await toggleCategory(c.id)
    toast.success('تم تحديث حالة التصنيف')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

function openSubCreate(c: CategoryDto) {
  editingSubId.value = null
  currentCategoryId.value = c.id
  subForm.value = {
    categoryId: c.id,
    nameAr: '',
    name: '',
    displayOrder: (c.subCategories?.length ?? 0) + 1,
  }
  subModalOpen.value = true
}

function openSubEdit(c: CategoryDto, sub: NonNullable<CategoryDto['subCategories']>[0]) {
  editingSubId.value = sub.id
  currentCategoryId.value = c.id
  subForm.value = {
    categoryId: c.id,
    nameAr: sub.nameAr ?? '',
    name: sub.name ?? '',
    displayOrder: sub.displayOrder ?? 0,
  }
  subModalOpen.value = true
}

async function saveSub() {
  try {
    const payload = {
      categoryId: currentCategoryId.value ?? subForm.value.categoryId,
      name: subForm.value.name,
      nameAr: subForm.value.nameAr,
      displayOrder: subForm.value.displayOrder,
    }
    if (editingSubId.value) {
      await updateSubCategory(editingSubId.value, payload)
      toast.success('تم تحديث التصنيف الفرعي')
    } else {
      await createSubCategory(payload)
      toast.success('تم إنشاء التصنيف الفرعي')
    }
    subModalOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function toggleSub(sub: NonNullable<CategoryDto['subCategories']>[0]) {
  try {
    await toggleSubCategory(sub.id)
    toast.success('تم تحديث التصنيف الفرعي')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

function tryDelete(c: CategoryDto) {
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
