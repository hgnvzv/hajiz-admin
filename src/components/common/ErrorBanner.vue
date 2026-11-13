<template>
  <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
    <p class="font-bold">{{ message }}</p>
    <button v-if="retry" type="button" class="btn-secondary" @click="retry">{{ retryLabel }}</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  retry?: () => void
  retryLabel?: string
}>()
</script>
