import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getApplications } from '@/api'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const pendingBusinessCount = ref(0)
  const unreadNotificationCount = ref(0)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebar(open: boolean) {
    sidebarOpen.value = open
  }

  async function refreshHeaderStats() {
    try {
      const dashRes = await getApplications({ status: 'Pending', page: 1, pageSize: 1 })
      const dash = dashRes.data as { total?: number; totalCount?: number }
      pendingBusinessCount.value = Number(dash.total ?? dash.totalCount ?? 0)
      unreadNotificationCount.value = 0
    } catch {
      /* offline / 401 handled globally */
    }
  }

  return {
    sidebarOpen,
    pendingBusinessCount,
    unreadNotificationCount,
    toggleSidebar,
    setSidebar,
    refreshHeaderStats,
  }
})
