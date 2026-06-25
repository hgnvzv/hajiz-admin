<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="relative rounded-xl border border-border p-2 transition hover:bg-primary-light"
      aria-label="الإشعارات"
      @click="notifications.toggleDropdown()"
    >
      <BellIcon class="h-6 w-6 text-[#1A1A2E]" />
      <span
        v-if="notifications.unreadCount > 0"
        class="absolute -left-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black text-white"
      >
        {{ notifications.unreadCount > 99 ? '99+' : notifications.unreadCount }}
      </span>
    </button>

    <div
      v-if="notifications.dropdownOpen"
      class="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      dir="rtl"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p class="text-sm font-black text-slate-900">الإشعارات</p>
        <button
          v-if="notifications.unreadCount > 0"
          type="button"
          class="text-xs font-bold text-primary hover:underline"
          @click="markAll"
        >
          تعيين الكل كمقروء
        </button>
      </div>

      <div v-if="notifications.loading" class="py-10 text-center text-sm text-slate-500">جاري التحميل…</div>
      <div v-else-if="!notifications.recentItems.length" class="py-10 text-center text-sm text-slate-500">
        لا توجد إشعارات جديدة
      </div>
      <ul v-else class="max-h-80 overflow-y-auto">
        <li
          v-for="item in notifications.recentItems"
          :key="item.id"
          class="border-b border-slate-50 last:border-0"
        >
          <button
            type="button"
            class="w-full px-4 py-3 text-right transition hover:bg-slate-50"
            :class="!item.isRead ? 'bg-amber-50/40' : ''"
            @click="openItem(item)"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-bold text-slate-900">{{ item.title }}</p>
              <span
                v-if="!item.isRead"
                class="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500"
              />
            </div>
            <p class="mt-1 line-clamp-2 text-xs text-slate-600">{{ item.body }}</p>
            <p class="mt-1 text-[10px] text-slate-400">{{ formatDateShort(item.sentAt ?? item.createdAt) }}</p>
          </button>
        </li>
      </ul>

      <div class="border-t border-slate-100 p-2">
        <RouterLink
          to="/notifications"
          class="block rounded-xl py-2.5 text-center text-sm font-bold text-primary hover:bg-primary-light"
          @click="notifications.toggleDropdown(false)"
        >
          عرض كل الإشعارات
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { BellIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDateShort } from '@/utils/format'
import { apiMessage } from '@/utils/error'
import {
  notificationTargetRoute,
  type AdminNotification,
} from '@/utils/notificationNavigation'

const notifications = useNotificationsStore()
const router = useRouter()
const toast = useToast()
const rootRef = ref<HTMLElement | null>(null)

function onDocumentClick(e: MouseEvent) {
  if (!notifications.dropdownOpen) return
  const el = rootRef.value
  if (el && !el.contains(e.target as Node)) notifications.toggleDropdown(false)
}

async function markAll() {
  try {
    await notifications.markAllRead()
    toast.success('تم تعيين الكل كمقروء')
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function openItem(item: AdminNotification) {
  try {
    if (!item.isRead) await notifications.markRead(item.id)
    notifications.toggleDropdown(false)

    const route = notificationTargetRoute(item)
    if (route) {
      router.push(route)
      return
    }
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>
