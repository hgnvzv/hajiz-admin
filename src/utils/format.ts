import { API_ORIGIN } from '@/api'
import dayjs from 'dayjs'
import 'dayjs/locale/ar'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.locale('ar')

export function formatDate(d: string | Date | undefined | null) {
  if (d == null) return '—'
  return dayjs(d).format('D MMMM YYYY، HH:mm')
}

export function formatDateShort(d: string | Date | undefined | null) {
  if (d == null) return '—'
  return dayjs(d).format('YYYY/MM/D')
}

export function formatMoney(n: unknown) {
  if (n == null || n === '') return '—'
  const x = typeof n === 'number' ? n : Number(n)
  if (Number.isNaN(x)) return '—'
  return new Intl.NumberFormat('ar-IQ', { maximumFractionDigits: 0 }).format(x)
}

export function formatMoneyIQD(n: unknown) {
  const formatted = formatMoney(n)
  return formatted === '—' ? '—' : `${formatted} د.ع`
}

export function formatNumber(n: number | undefined | null) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('ar-IQ').format(Number(n))
}

export function formatCredits(n: unknown) {
  const formatted = formatMoney(n)
  return formatted === '—' ? '—' : `${formatted} Credit`
}

export function resolveMediaUrl(url: unknown): string {
  if (url == null || url === '') return ''
  const s = String(url).trim()
  if (!s) return ''
  if (/^(https?:|data:)/i.test(s)) return s
  if (s.startsWith('/')) return `${API_ORIGIN}${s}`
  return `${API_ORIGIN}/${s}`
}
