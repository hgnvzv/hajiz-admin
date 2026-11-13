import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { messages, type AdminLocale } from '@/i18n/messages'

const STORAGE_KEY = 'hajiz_admin_locale'

export const useLocaleStore = defineStore('locale', () => {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  const locale = ref<AdminLocale>(stored === 'en' ? 'en' : 'ar')

  const dir = computed(() => (locale.value === 'ar' ? 'rtl' : 'ltr'))
  const isRtl = computed(() => locale.value === 'ar')

  function apply() {
    document.documentElement.lang = locale.value
    document.documentElement.dir = dir.value
  }

  function setLocale(next: AdminLocale) {
    locale.value = next
    localStorage.setItem(STORAGE_KEY, next)
    apply()
  }

  function toggle() {
    setLocale(locale.value === 'ar' ? 'en' : 'ar')
  }

  function t(key: string): string {
    return messages[locale.value][key] ?? messages.ar[key] ?? key
  }

  watch(locale, apply, { immediate: true })

  return { locale, dir, isRtl, setLocale, toggle, t }
})
