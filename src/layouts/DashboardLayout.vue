<template>
  <div class="min-h-screen bg-app-bg text-app-text" dir="rtl">
    <div
      v-if="ui.sidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      aria-hidden="true"
      @click="ui.setSidebar(false)"
    />
    <AppSidebar />
    <div class="flex min-h-screen flex-col lg:mr-64">
      <AppHeader :title="pageTitle" />
      <main class="flex-1 p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useUiStore } from '@/stores/ui'
import { useNotificationsStore } from '@/stores/notifications'
import { useToast } from 'vue-toastification'
import { notificationType } from '@/utils/notificationNavigation'

const route = useRoute()
const ui = useUiStore()
const notifications = useNotificationsStore()
const toast = useToast()

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? 'حاجز')

onMounted(async () => {
  ui.refreshHeaderStats()
  await notifications.connect((item) => {
    if (notificationType(item) === 'credits_topup_request') {
      toast.info(item.title, { timeout: 5000 })
      void ui.refreshHeaderStats()
    }
  })
})

onUnmounted(() => {
  void notifications.disconnect()
})

watch(
  () => route.fullPath,
  () => {
    ui.refreshHeaderStats()
  },
)
</script>
