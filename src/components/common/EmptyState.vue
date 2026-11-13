<template>
  <div class="page-card px-6 py-14 text-center">
    <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
      <slot name="icon">∅</slot>
    </div>
    <p class="font-black text-app-text">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm text-app-muted">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
