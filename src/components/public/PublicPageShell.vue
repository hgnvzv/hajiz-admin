<template>
  <div class="public-page flex min-h-screen flex-col">
    <!-- Header -->
    <header class="border-b border-slate-100 bg-white">
      <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
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

    <!-- Content -->
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

    <!-- Footer -->
    <footer class="border-t border-slate-100 bg-white py-8">
      <div class="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <nav v-if="!loading" class="mb-4 flex flex-wrap items-center justify-center gap-4 text-sm font-bold">
          <RouterLink to="/privacy" class="text-slate-600 transition hover:text-[#2E8B57]">سياسة الخصوصية</RouterLink>
          <span class="text-slate-300">|</span>
          <RouterLink to="/terms" class="text-slate-600 transition hover:text-[#2E8B57]">الشروط والأحكام</RouterLink>
        </nav>
        <p class="text-sm font-bold text-slate-800">© HAJIZ</p>
        <p class="mt-1 text-xs text-slate-500">All Rights Reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
}>()

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
