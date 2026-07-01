import { getPlatformSettings } from '@/api'
import { formatMoneyIQD } from '@/utils/format'

let welcomeCreditsCache: number | null = null

export async function fetchWelcomeCreditsAmount(): Promise<number> {
  if (welcomeCreditsCache != null) return welcomeCreditsCache
  try {
    const res = await getPlatformSettings()
    const amount = Number((res.data as Record<string, unknown>).welcomeCreditsAmount ?? 5000)
    welcomeCreditsCache = Number.isNaN(amount) ? 5000 : amount
    return welcomeCreditsCache
  } catch {
    return 5000
  }
}

export function clearWelcomeCreditsCache() {
  welcomeCreditsCache = null
}

export async function welcomeCreditsApproveMessage(entityLabel: string): Promise<string> {
  const amount = await fetchWelcomeCreditsAmount()
  return `تم القبول — سيُمنح ${entityLabel} ${formatMoneyIQD(amount)} Credit ترحيبي تلقائياً`
}
