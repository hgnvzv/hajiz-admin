import { computed, ref, watch } from 'vue'
import type { PublicLocale } from '@/content/public/constants'

const STORAGE_KEY = 'hajiz_public_locale'

const locale = ref<PublicLocale>(
  (typeof localStorage !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as PublicLocale)) || 'ar',
)

function applyDocumentLocale(l: PublicLocale) {
  document.documentElement.lang = l
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
}

export function usePublicLocale() {
  const isRtl = computed(() => locale.value === 'ar')

  function setLocale(l: PublicLocale) {
    locale.value = l
    localStorage.setItem(STORAGE_KEY, l)
    applyDocumentLocale(l)
  }

  function toggleLocale() {
    setLocale(locale.value === 'ar' ? 'en' : 'ar')
  }

  function t<T>(content: Record<PublicLocale, T>): T {
    return content[locale.value]
  }

  watch(
    locale,
    (l) => applyDocumentLocale(l),
    { immediate: true },
  )

  return { locale, isRtl, setLocale, toggleLocale, t }
}

export function pickLocale<T>(content: Record<PublicLocale, T>, l: PublicLocale): T {
  return content[l]
}
