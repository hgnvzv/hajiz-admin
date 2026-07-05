import { onUnmounted, watch, type Ref } from 'vue'

const DEFAULT_TITLE = 'حاجز — HAJIZ'
const DEFAULT_DESCRIPTION = 'HAJIZ — booking and services platform'

function setMetaTag(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useReactivePageMeta(title: Ref<string>, description: Ref<string>) {
  watch(
    [title, description],
    ([t, d]) => {
      document.title = t.includes('HAJIZ') ? t : `${t} | HAJIZ`
      setMetaTag('description', d)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    document.title = DEFAULT_TITLE
    setMetaTag('description', DEFAULT_DESCRIPTION)
  })
}
