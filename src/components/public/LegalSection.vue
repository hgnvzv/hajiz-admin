<template>
  <article
    class="legal-section rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <header class="mb-4 flex items-start gap-4">
      <span
        v-if="number != null"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2E8B57]/10 text-sm font-black text-[#2E8B57]"
      >
        {{ number }}
      </span>
      <h2 class="pt-1.5 text-xl font-black text-slate-900 sm:text-2xl">{{ title }}</h2>
    </header>
    <div class="legal-body text-base leading-relaxed text-slate-600">
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  number?: number
  delay?: number
}>()
</script>

<style scoped>
.legal-section {
  animation: fadeSlideUp 0.55s ease both;
}

.legal-body :deep(ul) {
  @apply mt-3 space-y-2 pr-1;
}

.legal-body :deep(li) {
  @apply flex items-start gap-2;
}

.legal-body :deep(li)::before {
  content: '';
  @apply mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2E8B57];
}

.legal-body :deep(p + p) {
  @apply mt-3;
}

.legal-body :deep(a) {
  @apply font-bold text-[#2E8B57] underline-offset-2 hover:underline;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
