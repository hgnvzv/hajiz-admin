<template>
  <div class="min-h-screen flex" dir="rtl" style="background: #F8FAFC">

    <!-- Sidebar -->
    <aside class="w-60 flex flex-col shadow-sm" style="background: #0F172A; min-height: 100vh">
      <!-- Logo -->
      <div class="p-5 border-b" style="border-color: rgba(255,255,255,0.08)">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white"
            style="background: linear-gradient(135deg, #2563EB, #1D4ED8)">ح</div>
          <div>
            <p class="text-white font-bold text-sm">حاجز</p>
            <p class="text-xs" style="color: #64748B">لوحة الإدارة</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-1">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
          :class="isActive(item.to)
            ? 'text-white font-medium'
            : 'hover:text-white'"
          :style="isActive(item.to)
            ? 'background: rgba(37,99,235,0.9)'
            : 'color: #64748B'">
          <span class="text-base">{{ item.icon }}</span>
          {{ item.label }}
          <span v-if="item.badge" class="mr-auto text-xs px-1.5 py-0.5 rounded-full font-bold"
            style="background: #DC2626; color: white">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="p-4 border-t" style="border-color: rgba(255,255,255,0.08)">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style="background: #2563EB">
            {{ auth.user?.fullName?.[0] || 'A' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-xs font-medium truncate">{{ auth.user?.fullName }}</p>
            <p class="text-xs" style="color: #64748B">مدير النظام</p>
          </div>
        </div>
        <button @click="logout"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-red-900/30"
          style="color: #EF4444">
          <span>🚪</span> تسجيل الخروج
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-auto">
      <!-- Topbar -->
      <header class="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b"
        style="background: white; border-color: #E2E8F0">
        <h1 class="font-bold text-slate-800" style="font-size: 17px">{{ currentTitle }}</h1>
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400">{{ currentDate }}</span>
        </div>
      </header>

      <div class="p-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'الرئيسية' },
  { to: '/applications', icon: '📋', label: 'طلبات الانضمام' },
  { to: '/businesses', icon: '🏪', label: 'المحلات' },
  { to: '/users', icon: '👥', label: 'المستخدمين' },
  { to: '/categories', icon: '🗂️', label: 'التصنيفات' },
  { to: '/bookings', icon: '📅', label: 'الحجوزات' },
  { to: '/commissions', icon: '💰', label: 'العمولات' },
]

const titles: Record<string, string> = {
  '/dashboard': 'لوحة التحكم',
  '/applications': 'طلبات الانضمام',
  '/businesses': 'المحلات',
  '/users': 'المستخدمين',
  '/categories': 'التصنيفات',
  '/bookings': 'الحجوزات',
  '/commissions': 'العمولات',
}

const currentTitle = computed(() => titles[route.path] || 'حاجز')
const currentDate = new Date().toLocaleDateString('ar-IQ', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>
