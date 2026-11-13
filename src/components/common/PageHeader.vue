<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <nav v-if="crumbs.length" class="mb-2 flex flex-wrap items-center gap-1 text-xs font-bold text-app-muted">
        <template v-for="(c, i) in crumbs" :key="`${c.label}-${i}`">
          <RouterLink v-if="c.to && i < crumbs.length - 1" :to="c.to" class="hover:text-brand">{{ c.label }}</RouterLink>
          <span v-else class="text-app-text">{{ c.label }}</span>
          <span v-if="i < crumbs.length - 1" class="text-slate-300">/</span>
        </template>
      </nav>
      <h1 class="truncate text-2xl font-black tracking-tight text-app-text">{{ title }}</h1>
      <p v-if="description" class="mt-1 max-w-3xl text-sm text-app-muted">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

withDefaults(
  defineProps<{
    title: string
    description?: string
    crumbs?: { label: string; to?: string }[]
  }>(),
  { crumbs: () => [] },
)
</script>
