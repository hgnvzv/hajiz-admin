import { getPlatformSettings } from '@/api'
import { formatCredits } from '@/utils/format'

export interface PlatformWalletSettings {
  welcomeCreditsAmount: number
  craftsmanAvailabilityMinBalance: number
  businessOpenMinBalance: number
}

let welcomeCreditsCache: number | null = null
let platformWalletCache: PlatformWalletSettings | null = null

const DEFAULT_WALLET_SETTINGS: PlatformWalletSettings = {
  welcomeCreditsAmount: 5000,
  craftsmanAvailabilityMinBalance: 1000,
  businessOpenMinBalance: 500,
}

export async function fetchPlatformWalletSettings(): Promise<PlatformWalletSettings> {
  if (platformWalletCache) return platformWalletCache
  try {
    const res = await getPlatformSettings()
    const data = res.data as Record<string, unknown>
    platformWalletCache = {
      welcomeCreditsAmount: Number(data.welcomeCreditsAmount ?? DEFAULT_WALLET_SETTINGS.welcomeCreditsAmount),
      craftsmanAvailabilityMinBalance: Number(
        data.craftsmanAvailabilityMinBalance ?? DEFAULT_WALLET_SETTINGS.craftsmanAvailabilityMinBalance,
      ),
      businessOpenMinBalance: Number(data.businessOpenMinBalance ?? DEFAULT_WALLET_SETTINGS.businessOpenMinBalance),
    }
    welcomeCreditsCache = platformWalletCache.welcomeCreditsAmount
    return platformWalletCache
  } catch {
    return DEFAULT_WALLET_SETTINGS
  }
}

export async function fetchWelcomeCreditsAmount(): Promise<number> {
  if (welcomeCreditsCache != null) return welcomeCreditsCache
  const settings = await fetchPlatformWalletSettings()
  return settings.welcomeCreditsAmount
}

export function clearWelcomeCreditsCache() {
  welcomeCreditsCache = null
  platformWalletCache = null
}

export async function welcomeCreditsApproveMessage(entityLabel: string): Promise<string> {
  const amount = await fetchWelcomeCreditsAmount()
  return `تم القبول — سيُمنح ${entityLabel} ${formatCredits(amount)} ترحيبي تلقائياً`
}
