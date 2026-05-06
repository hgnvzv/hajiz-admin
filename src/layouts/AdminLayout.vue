<template>
  <div class="min-h-screen flex" dir="rtl" style="background: #f0f4f3">

    <!-- Sidebar -->
    <aside class="w-64 flex flex-col shadow-xl flex-shrink-0" style="background: linear-gradient(180deg, #0a2c2a 0%, #071e1d 100%); min-height: 100vh">

      <!-- Logo Area -->
      <div class="p-5 border-b" style="border-color: rgba(242,180,21,0.15)">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 p-1.5"
            style="background: linear-gradient(135deg, rgba(242,180,21,0.15), rgba(37,125,117,0.15)); border: 1.5px solid rgba(242,180,21,0.25)">
            <img src="@/assets/logo.svg" alt="حاجز" class="w-full h-full object-contain" />
          </div>
          <div>
            <p class="font-bold text-base" style="color: #f2b415; letter-spacing: 0.5px">حاجز</p>
            <p class="text-xs font-medium" style="color: rgba(255,255,255,0.4)">لوحة الإدارة</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group relative"
          :class="isActive(item.to) ? 'active-nav' : 'inactive-nav'"
        >
          <!-- Active indicator -->
          <span v-if="isActive(item.to)"
            class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full"
            style="background: #f2b415"></span>

          <span class="text-lg w-6 text-center flex-shrink-0">{{ item.icon }}</span>
          <span class="flex-1 font-medium">{{ item.label }}</span>
          <span v-if="item.badge"
            class="text-xs px-2 py-0.5 rounded-full font-bold"
            style="background: #f2b415; color: #0a2c2a">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <!-- Divider -->
      <div class="mx-4 h-px" style="background: rgba(242,180,21,0.1)"></div>

      <!-- User -->
      <div class="p-4">
        <div class="flex items-center gap-3 p-3 rounded-xl mb-2"
          style="background: rgba(255,255,255,0.05)">
          <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style="background: linear-gradient(135deg, #f2b415, #d4990f); color: #0a2c2a">
            {{ auth.user?.fullName?.[0] || 'م' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold truncate" style="color: white">{{ auth.user?.fullName }}</p>
            <p class="text-xs" style="color: rgba(255,255,255,0.4)">مدير النظام</p>
          </div>
        </div>
        <button @click="logout"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style="color: #f87171; background: rgba(248,113,113,0.08)"
          onmouseover="this.style.background='rgba(248,113,113,0.15)'"
          onmouseout="this.style.background='rgba(248,113,113,0.08)'">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto flex flex-col min-w-0">
      <!-- Topbar -->
      <header class="sticky top-0 z-10 px-6 py-3.5 flex items-center justify-between border-b"
        style="background: white; border-color: #e2eded; box-shadow: 0 1px 10px rgba(37,125,117,0.06)">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 rounded-full" style="background: linear-gradient(180deg, #f2b415, #257d75)"></div>
          <h1 class="font-bold text-slate-800" style="font-size: 16px">{{ currentTitle }}</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style="background: #e8f5f4; color: #257d75">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            {{ currentDate }}
          </div>
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style="background: linear-gradient(135deg, #f2b415, #d4990f); color: #0a2c2a">
            {{ auth.user?.fullName?.[0] || 'م' }}
          </div>
        </div>
      </header>

      <div class="p-6 flex-1">
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

<style scoped>
.active-nav {
  background: linear-gradient(135deg, rgba(242,180,21,0.12), rgba(37,125,117,0.12));
  color: #f2b415;
}
.inactive-nav {
  color: rgba(255,255,255,0.45);
}
.inactive-nav:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.8);
}
</style>
