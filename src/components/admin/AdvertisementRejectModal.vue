<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />
      <div class="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" dir="rtl">
        <h3 class="text-lg font-black text-slate-900">رفض الإعلان</h3>
        <p class="mt-2 text-sm text-slate-500">اكتب سبب الرفض — سيظهر في ملاحظات الإدارة</p>
        <textarea
          v-model="reason"
          rows="4"
          class="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm"
          placeholder="سبب الرفض (مطلوب)"
          :disabled="loading"
        />
        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            :disabled="loading"
            @click="close"
          >
            إلغاء
          </button>
          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            :disabled="loading"
            @click="submit"
          >
            {{ loading ? 'جاري الرفض…' : 'رفض الإعلان' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  confirm: [reason: string]
}>()

const reason = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) reason.value = ''
  },
)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  emit('confirm', reason.value.trim())
}
</script>
