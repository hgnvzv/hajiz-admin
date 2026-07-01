<template>
  <aside
    class="fixed right-0 top-0 z-40 flex h-full w-64 flex-col border-l border-[#1a5a55] bg-[#21726b] shadow-lg transition-transform duration-200 lg:translate-x-0"
    :class="ui.sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'"
    dir="rtl"
  >
    <div class="border-b border-white/10 p-5">
      <div class="flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-[#21726b] shadow ring-1 ring-white/30"
        >
          ح
        </div>
        <div>
          <p class="text-lg font-black text-white">حاجز</p>
          <p class="text-xs text-white/70">لوحة الإدارة</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto p-3">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition"
        :class="
          isActive(item.to)
            ? 'bg-white/15 text-white shadow ring-1 ring-white/10'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        "
        @click="ui.setSidebar(false)"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span class="flex-1">{{ item.label }}</span>
        <span
          v-if="item.badge != null && item.badge > 0"
          class="rounded-full bg-warning px-2 py-0.5 text-xs font-black text-white"
        >
          {{ item.badge }}
        </span>
      </RouterLink>
    </nav>

    <div class="border-t border-white/10 p-3">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
        @click="logout"
      >
        <ArrowRightOnRectangleIcon class="h-5 w-5" />
        تسجيل الخروج
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  BanknotesIcon,
  BellAlertIcon,
  BriefcaseIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  MegaphoneIcon,
  PhotoIcon,
  Squares2X2Icon,
  TagIcon,
  TicketIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const items = computed(() => [
  { to: '/dashboard', icon: ChartBarIcon, label: 'الرئيسية', badge: null as number | null },
  {
    to: '/applications',
    icon: ClipboardDocumentListIcon,
    label: 'طلبات الانضمام',
    badge: ui.pendingBusinessCount > 0 ? ui.pendingBusinessCount : null,
  },
  { to: '/businesses', icon: BuildingStorefrontIcon, label: 'المحلات', badge: null },
  { to: '/craftsmen', icon: WrenchScrewdriverIcon, label: 'الحرفيون', badge: null },
  { to: '/users', icon: UserGroupIcon, label: 'المستخدمين', badge: null },
  { to: '/categories', icon: Squares2X2Icon, label: 'التصنيفات', badge: null },
  { to: '/professions', icon: BriefcaseIcon, label: 'الحرف', badge: null },
  { to: '/occasions', icon: BellAlertIcon, label: 'المناسبات', badge: null },
  { to: '/bookings', icon: CalendarDaysIcon, label: 'الحجوزات', badge: null },
  {
    to: '/credits/top-up-requests',
    icon: CreditCardIcon,
    label: 'طلبات شحن Credits',
    badge: ui.pendingCreditsTopUpCount > 0 ? ui.pendingCreditsTopUpCount : null,
  },
  { to: '/service-requests', icon: MapPinIcon, label: 'الخدمات الموقعية', badge: null },
  { to: '/commissions', icon: BanknotesIcon, label: 'العمولات', badge: null },
  { to: '/coupons', icon: TicketIcon, label: 'الكوبونات', badge: null },
  { to: '/discounts', icon: TagIcon, label: 'العروض والخصومات', badge: null },
  { to: '/advertisements', icon: PhotoIcon, label: 'الإعلانات', badge: null },
  { to: '/complaints', icon: ExclamationTriangleIcon, label: 'الشكاوى', badge: null },
  { to: '/broadcast', icon: MegaphoneIcon, label: 'الإشعارات الإعلانية', badge: null },
  { to: '/settings', icon: Cog6ToothIcon, label: 'الإعدادات', badge: null },
])

function isActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>
