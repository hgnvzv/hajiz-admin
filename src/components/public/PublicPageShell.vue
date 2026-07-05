<template>
  <div class="public-page flex min-h-screen flex-col" :dir="isRtl ? 'rtl' : 'ltr'">
    <header class="border-b border-slate-100 bg-white">
      <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div class="mb-6 flex justify-center">
          <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm font-bold">
            <button
              type="button"
              class="rounded-lg px-4 py-2 transition"
              :class="locale === 'ar' ? 'bg-[#2E8B57] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
              @click="setLocale('ar')"
            >
              {{ publicLangLabels.ar }}
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-2 transition"
              :class="locale === 'en' ? 'bg-[#2E8B57] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
              @click="setLocale('en')"
            >
              {{ publicLangLabels.en }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="animate-pulse space-y-4">
          <div class="mx-auto h-16 w-16 rounded-2xl bg-slate-100" />
          <div class="mx-auto h-8 w-48 rounded-lg bg-slate-100" />
          <div class="mx-auto h-4 w-32 rounded bg-slate-100" />
        </div>
        <div v-else class="public-header text-center">
          <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#217a4a] text-2xl font-black text-white shadow-lg shadow-[#2E8B57]/25 ring-4 ring-[#2E8B57]/10 sm:h-20 sm:w-20 sm:text-3xl"
          >
            ح
          </div>
          <p class="mt-4 text-sm font-bold tracking-wide text-[#2E8B57]">HAJIZ · حاجز</p>
          <h1 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{{ title }}</h1>
          <p v-if="subtitle" class="mt-2 text-sm text-slate-500 sm:text-base">{{ subtitle }}</p>
          <div class="public-divider mx-auto mt-8 h-1 w-24 rounded-full" />
        </div>
      </div>
    </header>

    <main class="flex-1 bg-gradient-to-b from-slate-50/80 to-white">
      <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 4" :key="i" class="h-32 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div v-else class="space-y-5 sm:space-y-6">
          <slot />
        </div>
      </div>
    </main>

    <footer class="border-t border-slate-100 bg-white py-8">
      <div class="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <nav v-if="!loading" class="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold">
          <RouterLink to="/privacy" class="text-slate-600 transition hover:text-[#2E8B57]">{{ footer.privacy }}</RouterLink>
          <span class="hidden text-slate-300 sm:inline">|</span>
          <RouterLink to="/terms" class="text-slate-600 transition hover:text-[#2E8B57]">{{ footer.terms }}</RouterLink>
          <span class="hidden text-slate-300 sm:inline">|</span>
          <RouterLink to="/delete-account" class="text-slate-600 transition hover:text-[#2E8B57]">{{ footer.deleteAccount }}</RouterLink>
        </nav>
        <p class="text-sm font-bold text-slate-800">© HAJIZ</p>
        <p class="mt-1 text-xs text-slate-500">{{ footer.rights }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { publicFooter, publicLangLabels } from '@/content/public/constants'
import { usePublicLocale } from '@/composables/usePublicLocale'

defineProps<{
  title: string
  subtitle?: string
}>()

const { locale, isRtl, setLocale, t } = usePublicLocale()
const footer = computed(() => t(publicFooter))
const loading = ref(true)

onMounted(() => {
  requestAnimationFrame(() => {
    loading.value = false
  })
})
</script>

<style scoped>
.public-header {
  animation: fadeIn 0.6s ease both;
}

.public-divider {
  background: linear-gradient(90deg, transparent, #2E8B57, transparent);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
