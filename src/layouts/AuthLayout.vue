<template>
  <div class="min-h-screen bg-slate-950" :dir="dir">
    <div class="absolute end-4 top-4 z-10">
      <button type="button" class="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-black text-white" @click="toggleLocale">
        {{ locale === 'ar' ? 'EN' : 'AR' }}
      </button>
    </div>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const { dir, locale, toggleLocale } = useI18n()
</script>
