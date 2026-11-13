<template>
  <aside
    class="fixed top-0 z-40 flex h-full w-64 flex-col border-border bg-white shadow-card transition-transform duration-200 lg:translate-x-0"
    :class="asideClass"
    :dir="dir"
  >
    <div class="flex items-center gap-3 border-b border-border px-5 py-4">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg font-black text-white">ح</div>
      <div>
        <p class="text-base font-black text-app-text">{{ t('app.name') }}</p>
        <p class="text-[11px] font-bold text-app-muted">{{ t('app.admin') }}</p>
      </div>
    </div>

    <nav class="flex-1 space-y-4 overflow-y-auto p-3">
      <div v-for="group in groups" :key="group.id">
        <p class="mb-1 px-2 text-[11px] font-black uppercase tracking-wide text-app-muted">{{ group.label }}</p>
        <div class="space-y-0.5">
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition"
            :class="
              isActive(item.to)
                ? 'bg-brand-light text-brand-dark'
                : 'text-app-muted hover:bg-slate-50 hover:text-app-text'
            "
            @click="ui.setSidebar(false)"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span class="flex-1">{{ item.label }}</span>
            <span
              v-if="item.badge != null && item.badge > 0"
              class="rounded-full bg-warning px-2 py-0.5 text-[10px] font-black text-white"
            >
              {{ item.badge }}
            </span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="border-t border-border p-3">
      <button type="button" class="btn-secondary w-full" @click="logout">
        {{ t('nav.logout') }}
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
  Cog6ToothIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  MapPinIcon,
  MegaphoneIcon,
  PhotoIcon,
  Squares2X2Icon,
  TableCellsIcon,
  TagIcon,
  TicketIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useI18n } from '@/composables/useI18n'

const { t, dir, isRtl, locale } = useI18n()
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const asideClass = computed(() => {
  const open = ui.sidebarOpen
  if (isRtl.value) {
    return [
      'right-0 border-l',
      open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
    ]
  }
  return [
    'left-0 border-r',
    open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
  ]
})

const groups = computed(() => [
  {
    id: 'overview',
    label: t('nav.overview'),
    items: [{ to: '/dashboard', icon: ChartBarIcon, label: t('nav.dashboard'), badge: null as number | null }],
  },
  {
    id: 'business',
    label: t('nav.business'),
    items: [
      {
        to: '/applications',
        icon: ClipboardDocumentListIcon,
        label: t('nav.applications'),
        badge: ui.pendingBusinessCount > 0 ? ui.pendingBusinessCount : null,
      },
      { to: '/businesses', icon: BuildingStorefrontIcon, label: t('nav.businesses'), badge: null },
      { to: '/restaurants', icon: BuildingStorefrontIcon, label: t('nav.restaurants'), badge: null },
      { to: '/medical/clinics', icon: HeartIcon, label: t('nav.clinics'), badge: null },
      { to: '/medical/doctors', icon: HeartIcon, label: t('nav.doctors'), badge: null },
      { to: '/categories', icon: Squares2X2Icon, label: t('nav.categories'), badge: null },
      { to: '/restaurant/cuisines', icon: TagIcon, label: t('nav.cuisines'), badge: null },
    ],
  },
  {
    id: 'restaurant',
    label: t('nav.restaurantOps'),
    items: [
      { to: '/restaurant/floors', icon: TableCellsIcon, label: t('nav.floors'), badge: null },
      { to: '/restaurant/menus', icon: ClipboardDocumentListIcon, label: t('nav.menus'), badge: null },
    ],
  },
  {
    id: 'medical',
    label: t('nav.medical'),
    items: [
      { to: '/medical/specialties', icon: Squares2X2Icon, label: t('nav.specialties'), badge: null },
      { to: '/medical/appointments', icon: CalendarDaysIcon, label: t('nav.appointments'), badge: null },
    ],
  },
  {
    id: 'platform',
    label: t('nav.platform'),
    items: [
      { to: '/customers', icon: UserGroupIcon, label: t('nav.customers'), badge: null },
      { to: '/users?type=business', icon: UserGroupIcon, label: t('nav.businessUsers'), badge: null },
      { to: '/bookings', icon: CalendarDaysIcon, label: t('nav.bookings'), badge: null },
      { to: '/geography', icon: MapPinIcon, label: t('nav.geography'), badge: null },
      { to: '/notifications', icon: BellAlertIcon, label: t('nav.notifications'), badge: null },
      { to: '/reports', icon: ChartBarIcon, label: t('nav.reports'), badge: null },
      { to: '/settings', icon: Cog6ToothIcon, label: t('nav.settings'), badge: null },
    ],
  },
  {
    id: 'more',
    label: t('nav.more'),
    items: [
      { to: '/craftsmen', icon: WrenchScrewdriverIcon, label: locale.value === 'ar' ? 'الحرفيون' : 'Craftsmen', badge: null },
      { to: '/professions', icon: BriefcaseIcon, label: locale.value === 'ar' ? 'الحرف' : 'Professions', badge: null },
      { to: '/occasions', icon: BellAlertIcon, label: locale.value === 'ar' ? 'المناسبات' : 'Occasions', badge: null },
      {
        to: '/credits/top-up-requests',
        icon: CreditCardIcon,
        label: locale.value === 'ar' ? 'شحن الرصيد' : 'Credit top-ups',
        badge: ui.pendingCreditsTopUpCount > 0 ? ui.pendingCreditsTopUpCount : null,
      },
      { to: '/service-requests', icon: MapPinIcon, label: locale.value === 'ar' ? 'خدمات موقعية' : 'On-site services', badge: null },
      { to: '/commissions', icon: BanknotesIcon, label: locale.value === 'ar' ? 'العمولات' : 'Commissions', badge: null },
      { to: '/coupons', icon: TicketIcon, label: locale.value === 'ar' ? 'الكوبونات' : 'Coupons', badge: null },
      { to: '/discounts', icon: TagIcon, label: locale.value === 'ar' ? 'العروض' : 'Discounts', badge: null },
      { to: '/advertisements', icon: PhotoIcon, label: locale.value === 'ar' ? 'الإعلانات' : 'Ads', badge: null },
      { to: '/complaints', icon: ExclamationTriangleIcon, label: locale.value === 'ar' ? 'الشكاوى' : 'Complaints', badge: null },
      { to: '/broadcast', icon: MegaphoneIcon, label: locale.value === 'ar' ? 'بث إعلاني' : 'Broadcast', badge: null },
    ],
  },
])

function isActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path === '/'
  if (path.includes('?')) {
    const [p, q] = path.split('?')
    return route.path === p && typeof q === 'string' && route.fullPath.includes(q)
  }
  if (path === '/restaurants') return route.path === '/restaurants' || route.path.startsWith('/restaurants/')
  if (path === '/applications') return route.path.startsWith('/applications')
  if (path === '/businesses') return route.path === '/businesses' || route.path.startsWith('/businesses/')
  if (path === '/medical/clinics') return route.path.startsWith('/medical/clinics')
  if (path === '/medical/doctors') return route.path.startsWith('/medical/doctors')
  return route.path === path || route.path.startsWith(path + '/')
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>
