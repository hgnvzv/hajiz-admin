import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'

export function useI18n() {
  const store = useLocaleStore()
  const { locale, dir, isRtl } = storeToRefs(store)
  return {
    locale,
    dir,
    isRtl,
    t: store.t,
    setLocale: store.setLocale,
    toggleLocale: store.toggle,
  }
}
