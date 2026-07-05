import { onMounted, onUnmounted } from 'vue'

const DEFAULT_TITLE = 'حاجز — لوحة الإدارة'
const DEFAULT_DESCRIPTION = 'منصة حاجز لإدارة الحجوزات والخدمات'

function setMetaTag(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta(title: string, description?: string) {
  const pageTitle = title.includes('حاجز') ? title : `${title} | حاجز`
  const pageDescription = description ?? DEFAULT_DESCRIPTION

  onMounted(() => {
    document.title = pageTitle
    setMetaTag('description', pageDescription)
  })

  onUnmounted(() => {
    document.title = DEFAULT_TITLE
    setMetaTag('description', DEFAULT_DESCRIPTION)
  })
}
