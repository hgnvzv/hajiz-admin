import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getApplications, getCreditTopUpRequests } from '@/api'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const pendingBusinessCount = ref(0)
  const pendingCreditsTopUpCount = ref(0)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebar(open: boolean) {
    sidebarOpen.value = open
  }

  async function refreshHeaderStats() {
    try {
      const [appsRes, creditsRes] = await Promise.all([
        getApplications({ status: 'Pending', page: 1, pageSize: 1 }),
        getCreditTopUpRequests({ status: 'Pending', page: 1, pageSize: 1 }),
      ])
      const apps = appsRes.data as { total?: number; totalCount?: number }
      const credits = creditsRes.data as { total?: number; totalCount?: number }
      pendingBusinessCount.value = Number(apps.total ?? apps.totalCount ?? 0)
      pendingCreditsTopUpCount.value = Number(credits.total ?? credits.totalCount ?? 0)
    } catch {
      /* offline / 401 handled globally */
    }
  }

  return {
    sidebarOpen,
    pendingBusinessCount,
    pendingCreditsTopUpCount,
    toggleSidebar,
    setSidebar,
    refreshHeaderStats,
  }
})
