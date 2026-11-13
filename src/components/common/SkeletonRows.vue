<template>
  <div class="page-card divide-y divide-border">
    <div v-for="n in rows" :key="n" class="flex animate-pulse gap-3 px-4 py-4">
      <div class="h-4 w-8 rounded bg-slate-100" />
      <div class="h-4 flex-1 rounded bg-slate-100" />
      <div class="h-4 w-24 rounded bg-slate-100" />
      <div class="hidden h-4 w-20 rounded bg-slate-100 sm:block" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 6 })
</script>
