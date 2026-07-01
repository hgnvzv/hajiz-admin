<template>
  <div
    v-if="modelValue && src"
    class="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4"
    @click.self="close"
  >
    <button
      type="button"
      class="absolute left-4 top-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white"
      @click="close"
    >
      إغلاق
    </button>
    <img :src="src" :alt="alt" class="max-h-full max-w-full object-contain" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  src: string
  alt?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

function close() {
  emit('update:modelValue', false)
}
</script>
