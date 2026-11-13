<template>
  <header class="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-white/95 px-4 py-3 backdrop-blur" :dir="dir">
    <div class="flex min-w-0 items-center gap-2">
      <button type="button" class="inline-flex rounded-xl border border-border p-2 lg:hidden" :aria-label="t('nav.overview')" @click="ui.toggleSidebar()">
        <Bars3Icon class="h-6 w-6" />
      </button>
      <div class="min-w-0">
        <h1 class="truncate text-lg font-black text-app-text lg:text-xl">{{ title }}</h1>
        <p class="hidden text-xs text-app-muted sm:block">{{ todayLabel }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <RouterLink
        v-if="ui.pendingBusinessCount > 0"
        to="/applications?status=Pending"
        class="hidden items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 sm:inline-flex"
      >
        {{ ui.pendingBusinessCount }} {{ t('header.pending') }}
      </RouterLink>

      <button type="button" class="rounded-xl border border-border px-2.5 py-1.5 text-xs font-black" @click="toggleLocale">
        {{ locale === 'ar' ? 'EN' : 'AR' }}
      </button>

      <NotificationBell />

      <div class="hidden items-center gap-2 sm:flex">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-black text-white">
          {{ initial }}
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold">{{ auth.admin?.name ?? t('app.admin') }}</p>
          <p class="text-xs text-app-muted">{{ auth.admin?.role ?? 'Admin' }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import NotificationBell from '@/components/common/NotificationBell.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/composables/useI18n'

defineProps<{ title: string }>()

const auth = useAuthStore()
const ui = useUiStore()
const { t, dir, locale, toggleLocale } = useI18n()

const initial = computed(() => (auth.admin?.name?.[0] ?? 'ح').toUpperCase())
const todayLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-IQ' : 'en-GB', { dateStyle: 'full' }).format(new Date()),
)
</script>
