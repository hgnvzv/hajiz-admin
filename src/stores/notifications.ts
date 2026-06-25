import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api'
import { connectNotificationsHub, disconnectNotificationsHub } from '@/services/notificationsHub'
import type { AdminNotification } from '@/utils/notificationNavigation'

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)
  const recentItems = ref<AdminNotification[]>([])
  const loading = ref(false)
  const dropdownOpen = ref(false)

  async function fetchNotifications() {
    loading.value = true
    try {
      const res = await getNotifications({ unreadOnly: true, page: 1, pageSize: 30 })
      const d = res.data as {
        items?: AdminNotification[]
        unreadCount?: number
        total?: number
      }
      recentItems.value = d.items ?? []
      unreadCount.value = Number(d.unreadCount ?? recentItems.value.filter((n) => !n.isRead).length)
    } catch {
      /* handled globally on 401 */
    } finally {
      loading.value = false
    }
  }

  function handleRealtimeNotification(payload: AdminNotification) {
    const existingIdx = recentItems.value.findIndex((n) => n.id === payload.id)
    const shouldIncrement = existingIdx < 0 || recentItems.value[existingIdx]?.isRead
    const notification = { ...payload, isRead: false }
    if (existingIdx >= 0) {
      recentItems.value[existingIdx] = notification
    } else {
      recentItems.value.unshift(notification)
      recentItems.value = recentItems.value.slice(0, 30)
    }
    if (shouldIncrement) unreadCount.value += 1
    return notification
  }

  async function connect(onRealtime?: (payload: AdminNotification) => void) {
    await fetchNotifications()
    await connectNotificationsHub((payload) => {
      const item = handleRealtimeNotification(payload)
      onRealtime?.(item)
    })
  }

  async function disconnect() {
    await disconnectNotificationsHub()
    recentItems.value = []
    unreadCount.value = 0
    dropdownOpen.value = false
  }

  async function markRead(id: string) {
    await markNotificationRead(id)
    const item = recentItems.value.find((n) => n.id === id)
    if (item && !item.isRead) {
      item.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllRead() {
    await markAllNotificationsRead()
    for (const item of recentItems.value) item.isRead = true
    unreadCount.value = 0
  }

  function toggleDropdown(open?: boolean) {
    dropdownOpen.value = open ?? !dropdownOpen.value
    if (dropdownOpen.value) void fetchNotifications()
  }

  return {
    unreadCount,
    recentItems,
    loading,
    dropdownOpen,
    fetchNotifications,
    handleRealtimeNotification,
    connect,
    disconnect,
    markRead,
    markAllRead,
    toggleDropdown,
  }
})
