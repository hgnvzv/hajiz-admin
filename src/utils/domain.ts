import { BusinessDomainType } from '@/types/domain'

const NAME_TO_ID: Record<string, number> = {
  Legacy: BusinessDomainType.Legacy,
  Clinic: BusinessDomainType.Clinic,
  IndependentDoctor: BusinessDomainType.IndependentDoctor,
  Restaurant: BusinessDomainType.Restaurant,
  RealEstateOffice: BusinessDomainType.RealEstateOffice,
  PropertyOwner: BusinessDomainType.PropertyOwner,
}

export function parseDomainType(value: unknown): number | null {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const s = String(value)
  if (s in NAME_TO_ID) return NAME_TO_ID[s] ?? null
  const n = Number(s)
  return Number.isNaN(n) ? null : n
}

export function readDomainType(row: Record<string, unknown> | null | undefined): number | null {
  if (!row) return null
  return parseDomainType(row.domainType ?? row.businessDomainType ?? row.domain)
}

export function domainLabel(domain: number | null, locale: 'ar' | 'en' = 'ar'): string {
  const ar: Record<number, string> = {
    1: 'عيادة طبية',
    2: 'طبيب مستقل',
    3: 'مطعم',
    0: 'نشاط عام',
  }
  const en: Record<number, string> = {
    1: 'Clinic',
    2: 'Independent doctor',
    3: 'Restaurant',
    0: 'General',
  }
  const map = locale === 'en' ? en : ar
  if (domain != null && domain in map) return map[domain] as string
  return domain == null ? (locale === 'en' ? 'Unspecified' : 'غير محدد') : `${locale === 'en' ? 'Domain' : 'مجال'} ${domain}`
}

export function domainLabelAr(domain: number | null): string {
  switch (domain) {
    case BusinessDomainType.Clinic:
      return 'عيادة طبية'
    case BusinessDomainType.IndependentDoctor:
      return 'طبيب مستقل'
    case BusinessDomainType.Restaurant:
      return 'مطعم'
    case BusinessDomainType.Legacy:
      return 'نشاط عام'
    default:
      return domain == null ? 'غير محدد' : `مجال ${domain}`
  }
}

export function isMedicalDomain(domain: number | null): boolean {
  return domain === BusinessDomainType.Clinic || domain === BusinessDomainType.IndependentDoctor
}

export function isRestaurantDomain(domain: number | null): boolean {
  return domain === BusinessDomainType.Restaurant
}

export function domainBadgeClass(domain: number | null): string {
  if (domain === BusinessDomainType.Clinic) return 'bg-teal-50 text-teal-800 ring-1 ring-teal-200'
  if (domain === BusinessDomainType.IndependentDoctor) return 'bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200'
  if (domain === BusinessDomainType.Restaurant) return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

export const LAUNCH_DOMAIN_FILTERS = [
  { value: '', label: 'الكل' },
  { value: String(BusinessDomainType.Clinic), label: 'عيادات طبية' },
  { value: String(BusinessDomainType.IndependentDoctor), label: 'أطباء مستقلون' },
  { value: String(BusinessDomainType.Restaurant), label: 'مطاعم' },
]
