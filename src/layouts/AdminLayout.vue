<template>
  <div class="min-h-screen flex" dir="rtl">

    <!-- Sidebar -->
    <aside class="w-64 flex flex-col shadow-xl" style="background: linear-gradient(180deg, #1d6560 0%, #0d3a37 100%); min-height: 100vh">
      <!-- Logo Section -->
      <div class="p-6 border-b" style="border-color: rgba(255,255,255,0.1)">
        <div class="flex items-center gap-3 mb-2">
          <img src="@/assets/logo.svg" alt="حاجز" class="w-10 h-10">
          <div>
            <p class="text-white font-bold text-lg">حاجز</p>
            <p class="text-xs" style="color: #a8e6d8">نظام الحجوزات</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group"
          :class="isActive(item.to)
            ? 'bg-gold-500 text-white shadow-lg'
            : 'text-gray-200 hover:bg-white/10'"
          >
          <span class="text-lg group-hover:scale-110 transition-transform">{{ item.icon }}</span>
          <span class="flex-1">{{ item.label }}</span>
          <span v-if="item.badge" class="text-xs px-2 py-1 rounded-full font-bold"
            :style="isActive(item.to) ? 'background: rgba(0,0,0,0.3); color: white;' : 'background: #f2b415; color: white;'">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t" style="border-color: rgba(255,255,255,0.1)">
        <div class="flex items-center gap-3 mb-4 p-3 rounded-lg" style="background: rgba(242, 180, 21, 0.1); border: 1px solid rgba(242, 180, 21, 0.3);">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style="background: linear-gradient(135deg, #f2b415, #d4990f)">
            {{ auth.user?.fullName?.[0] || 'A' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-medium truncate">{{ auth.user?.fullName }}</p>
            <p class="text-xs text-gray-300">مدير النظام</p>
          </div>
        </div>
        <button @click="logout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style="background: rgba(220,38,38,0.2); color: #fca5a5; border: 1px solid rgba(220,38,38,0.3)"
          @mouseover="$event.target.style.background = 'rgba(220,38,38,0.3)'"
          @mouseout="$event.target.style.background = 'rgba(220,38,38,0.2)'">
          <span>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto" style="background: linear-gradient(135deg, #f0f4f3 0%, #e8f5f4 100%)">
      <!-- Topbar -->
      <header class="sticky top-0 z-10 px-8 py-4 flex items-center justify-between backdrop-blur-sm"
        style="background: rgba(255,255,255,0.9); border-bottom: 1px solid rgba(37, 125, 117, 0.1)">
        <h1 class="font-bold text-2xl text-teal-700">{{ currentTitle }}</h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-4 py-2 rounded-lg" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4)">
            <span style="color: #999">📅</span>
            <span class="text-sm text-teal-700 font-medium">{{ currentDate }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-8">
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
  { to: '/applications', icon: '📋', label: 'طلبات الانضمام', badge: '' },
  { to: '/businesses', icon: '🏪', label: 'المحلات' },
  { to: '/users', icon: '👥', label: 'المستخدمين' },
  { to: '/categories', icon: '🗂️', label: 'التصنيفات' },
  { to: '/bookings', icon: '📅', label: 'الحجوزات', badge: '' },
  { to: '/commissions', icon: '💰', label: 'العمولات' },
]

const titles: Record<string, string> = {
  '/dashboard': '📊 لوحة التحكم',
  '/applications': '📋 طلبات الانضمام',
  '/businesses': '🏪 المحلات',
  '/users': '👥 إدارة المستخدمين',
  '/categories': '🗂️ التصنيفات',
  '/bookings': '📅 الحجوزات',
  '/commissions': '💰 العمولات',
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
/* Custom scrollbar for sidebar */
aside::-webkit-scrollbar {
  width: 4px;
}

aside::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

aside::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
