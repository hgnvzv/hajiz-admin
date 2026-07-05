<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />
      <div class="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" dir="rtl">
        <h3 class="text-lg font-black text-slate-900">تعديل الإعلان</h3>
        <p v-if="advertisement?.title" class="mt-1 text-sm text-slate-500">{{ advertisement.title }}</p>

        <form class="mt-5 space-y-4" @submit.prevent="submit">
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">العنوان</span>
            <input v-model="form.title" type="text" class="w-full rounded-xl border border-slate-200 px-4 py-3" :disabled="saving" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">الوصف</span>
            <textarea v-model="form.description" rows="4" class="w-full rounded-xl border border-slate-200 px-4 py-3" :disabled="saving" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-bold text-slate-700">رابط الفيديو</span>
            <input v-model="form.videoUrl" type="url" dir="ltr" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-left" placeholder="https://..." :disabled="saving" />
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1 block text-sm font-bold text-slate-700">المدة (أيام)</span>
              <input v-model.number="form.durationDays" type="number" min="1" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" :disabled="saving" />
            </label>
            <label class="block">
              <span class="mb-1 block text-sm font-bold text-slate-700">ترتيب العرض</span>
              <input v-model.number="form.displayOrder" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-4 py-3" :disabled="saving" />
            </label>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold" :disabled="saving" @click="close">
              إلغاء
            </button>
            <button type="submit" class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50" :disabled="saving">
              {{ saving ? 'جاري الحفظ…' : 'حفظ التعديلات' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { adminAdvertisementsApi } from '@/api/adminAdvertisements'
import { apiMessage } from '@/utils/error'
import type { AdvertisementDto, UpdateAdvertisementDto } from '@/types/advertisement'

const props = defineProps<{
  modelValue: boolean
  advertisement: AdvertisementDto | null
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  saved: []
}>()

const toast = useToast()
const saving = ref(false)
const original = ref<UpdateAdvertisementDto>({})
const form = reactive({
  title: '',
  description: '',
  videoUrl: '',
  durationDays: 1,
  displayOrder: 0,
})

watch(
  () => [props.modelValue, props.advertisement] as const,
  ([open, ad]) => {
    if (!open || !ad) return
    form.title = ad.title ?? ''
    form.description = ad.description ?? ''
    form.videoUrl = ad.videoUrl ?? ''
    form.durationDays = ad.durationDays ?? 1
    form.displayOrder = ad.displayOrder ?? 0
    original.value = {
      title: form.title,
      description: form.description,
      videoUrl: form.videoUrl || null,
      durationDays: form.durationDays,
      displayOrder: form.displayOrder,
    }
  },
  { immediate: true },
)

function buildPatch(): UpdateAdvertisementDto {
  const patch: UpdateAdvertisementDto = {}
  const video = form.videoUrl.trim() || null
  if (form.title !== original.value.title) patch.title = form.title
  if (form.description !== original.value.description) patch.description = form.description
  if (video !== (original.value.videoUrl ?? null)) patch.videoUrl = video
  if (form.durationDays !== original.value.durationDays) patch.durationDays = form.durationDays
  if (form.displayOrder !== original.value.displayOrder) patch.displayOrder = form.displayOrder
  return patch
}

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  if (!props.advertisement?.id) return
  if (form.durationDays < 1) {
    toast.warning('المدة يجب أن تكون يوماً واحداً على الأقل')
    return
  }
  const patch = buildPatch()
  if (!Object.keys(patch).length) {
    toast.info('لا توجد تغييرات للحفظ')
    return
  }
  saving.value = true
  try {
    await adminAdvertisementsApi.update(props.advertisement.id, patch)
    toast.success('تم التحديث')
    emit('saved')
    close()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحديث الإعلان'))
  } finally {
    saving.value = false
  }
}
</script>
