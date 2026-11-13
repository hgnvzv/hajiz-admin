<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center text-center" :dir="dir">
    <p class="text-6xl font-black text-brand">404</p>
    <h1 class="mt-4 text-2xl font-black">{{ t('notFound.title') }}</h1>
    <p class="mt-2 text-app-muted">{{ t('notFound.body') }}</p>
    <RouterLink to="/dashboard" class="btn-primary mt-6">{{ t('notFound.home') }}</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const { t, dir } = useI18n()
</script>
