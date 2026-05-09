<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur"
    dir="rtl"
  >
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="inline-flex rounded-xl border border-border p-2 lg:hidden"
        aria-label="القائمة"
        @click="ui.toggleSidebar()"
      >
        <Bars3Icon class="h-6 w-6 text-[#1A1A2E]" />
      </button>
      <div>
        <h1 class="truncate text-lg font-black text-slate-900 lg:text-xl">{{ title }}</h1>
        <p class="hidden text-xs text-slate-500 sm:block">{{ todayLabel }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-3">
      <RouterLink
        to="/applications?status=Pending"
        class="hidden items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 sm:inline-flex"
        v-if="ui.pendingBusinessCount > 0"
      >
        ⏳
        <span>{{ ui.pendingBusinessCount }} بانتظار</span>
      </RouterLink>

      <button
        type="button"
        class="relative rounded-xl border border-border p-2 transition hover:bg-primary-light"
        aria-label="الإشعارات"
        @click="$router.push('/broadcast')"
      >
        <BellIcon class="h-6 w-6 text-[#1A1A2E]" />
        <span
          v-if="ui.unreadNotificationCount > 0"
          class="absolute -left-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black text-white"
        >
          {{ ui.unreadNotificationCount > 99 ? '99+' : ui.unreadNotificationCount }}
        </span>
      </button>

      <div class="hidden items-center gap-2 sm:flex">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-black text-white"
        >
          {{ initial }}
        </div>
        <div class="min-w-0 text-right">
          <p class="truncate text-sm font-bold text-slate-900">{{ auth.admin?.name ?? 'مدير' }}</p>
          <p class="text-xs text-slate-500">{{ auth.admin?.role ?? 'مسؤول' }}</p>
        </div>
      </div>

      <button
        type="button"
        class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-danger hover:bg-red-100 sm:text-sm"
        @click="logout"
      >
        خروج
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Bars3Icon, BellIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

defineProps<{
  title: string
}>()

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const initial = computed(() => (auth.admin?.name?.[0] ?? 'ح').toUpperCase())
const todayLabel = computed(() =>
  new Intl.DateTimeFormat('ar-IQ', { dateStyle: 'full' }).format(new Date()),
)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>
