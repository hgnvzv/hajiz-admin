export interface PagedResult<T = Record<string, unknown>> {
  items: T[]
  total: number
  totalPages?: number
  summary?: Record<string, unknown>
}

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** ASP.NET `{id:guid}` routes 404 unless the path value is a UUID. */
export function isGuid(value: unknown): boolean {
  return typeof value === 'string' && GUID_RE.test(value.trim())
}

export function restaurantBusinessId(row: Record<string, unknown>): string | null {
  const raw = row.businessId ?? row.BusinessId
  const id = raw == null ? '' : String(raw).trim()
  return isGuid(id) ? id : null
}

export function normalizePaged<T = Record<string, unknown>>(data: unknown): PagedResult<T> {
  if (Array.isArray(data)) return { items: data as T[], total: data.length }
  const d = (data ?? {}) as { items?: T[]; total?: number; totalCount?: number; totalPages?: number; summary?: Record<string, unknown> }
  return {
    items: Array.isArray(d.items) ? d.items : [],
    total: Number(d.total ?? d.totalCount ?? (Array.isArray(d.items) ? d.items.length : 0)),
    totalPages: d.totalPages,
    summary: d.summary,
  }
}

export function valueOf(row: Record<string, unknown>, keys: string[], fallback = '—') {
  for (const key of keys) {
    const value = row[key]
    if (value !== null && value !== undefined && value !== '') return String(value)
  }
  return fallback
}

export function numberOf(row: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key]
    if (value !== null && value !== undefined && value !== '') {
      const n = Number(value)
      return Number.isNaN(n) ? fallback : n
    }
  }
  return fallback
}

export function statusLabel(status: unknown) {
  const key = String(status ?? '')
  const map: Record<string, string> = {
    Pending: 'معلق',
    Approved: 'مقبول',
    Rejected: 'مرفوض',
    Suspended: 'موقوف',
    Open: 'مفتوحة',
    InProgress: 'قيد المعالجة',
    Resolved: 'تم الحل',
    Closed: 'مغلقة',
    Accepted: 'مقبولة',
    Completed: 'مكتملة',
    Cancelled: 'ملغاة',
    Redeemed: 'مُستبدَل',
    Paid: 'مدفوعة',
    pending: 'قيد الانتظار',
    active: 'نشط',
    suspended: 'موقوف',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  }
  return map[key] ?? (key || '—')
}

export function statusClass(status: unknown) {
  const key = String(status ?? '')
  if (['Approved', 'Resolved', 'Paid', 'Redeemed', 'active', 'completed', 'Accepted', 'Completed'].includes(key)) {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  }
  if (['Pending', 'InProgress', 'pending'].includes(key)) {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  }
  if (['Rejected', 'Cancelled', 'cancelled'].includes(key)) {
    return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  }
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

export function complaintTypeLabel(type: unknown) {
  const map: Record<string, string> = {
    '1': 'مشكلة تقنية',
    '2': 'شكوى ضد مستخدم',
    '3': 'جودة الخدمة',
    '4': 'مشكلة مالية',
    '5': 'أخرى',
    Technical: 'مشكلة تقنية',
    User: 'شكوى ضد مستخدم',
    ServiceQuality: 'جودة الخدمة',
    Financial: 'مشكلة مالية',
    Other: 'أخرى',
  }
  return map[String(type ?? '')] ?? String(type ?? '—')
}

export function userTypeLabel(type: unknown) {
  const map: Record<string, string> = {
    customer: 'زبون',
    business: 'صاحب عمل',
    admin: 'مدير',
    Customer: 'زبون',
    Business: 'صاحب عمل',
    Admin: 'مدير',
    Craftsman: 'حرفي',
  }
  return map[String(type ?? '')] ?? String(type ?? '—')
}

export function paymentMethodLabel(method: unknown) {
  const map: Record<string, string> = {
    Cash: 'كاش',
    Wallet: 'محفظة',
    cash: 'كاش',
    wallet: 'محفظة',
  }
  const key = String(method ?? '')
  return map[key] ?? (key || '—')
}

export function bookingPaymentStatusLabel(status: unknown) {
  const map: Record<string, string> = {
    Unpaid: 'غير مدفوع',
    PaidWallet: 'مدفوع من المحفظة',
    PaidCash: 'مدفوع كاش',
  }
  const key = String(status ?? '')
  return map[key] ?? (key || '—')
}

export function bookingPaymentStatusClass(status: unknown) {
  const key = String(status ?? '')
  if (key === 'PaidWallet' || key === 'PaidCash') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  }
  if (key === 'Unpaid') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

export function displayStaffName(name: unknown) {
  const v = String(name ?? '').trim()
  return v || '—'
}

export function creditTransactionTypeLabel(type: unknown) {
  const map: Record<string, string> = {
    TopUp: 'شحن',
    Commission: 'عمولة',
    WelcomeBonus: 'رصيد ترحيبي',
    TransferIn: 'تحويل وارد',
    TransferOut: 'تحويل صادر',
  }
  const key = String(type ?? '')
  return map[key] ?? (key || '—')
}

export function republishGenerationLabel(gen: unknown) {
  const n = Number(gen ?? 0)
  if (n === 0) return 'الطلب الأصلي'
  if (n === 1) return 'إعادة نشر (1)'
  if (n === 2) return 'إعادة نشر (2)'
  return `إعادة نشر (${n})`
}

export function discountStatusLabel(status: unknown) {
  const map: Record<string, string> = {
    Pending: 'معلق',
    Approved: 'مقبول',
    Rejected: 'مرفوض',
    Expired: 'منتهي',
  }
  return map[String(status ?? '')] ?? String(status ?? '—')
}

export function discountStatusClass(status: unknown) {
  const k = String(status ?? '')
  if (k === 'Pending') return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
  if (k === 'Approved') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  if (k === 'Rejected') return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  if (k === 'Expired') return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

export function advertisementStatusLabel(status: unknown) {
  const map: Record<string, string> = {
    Pending: 'معلق',
    Approved: 'مقبول',
    Active: 'نشط',
    Rejected: 'مرفوض',
    Expired: 'منتهي',
  }
  return map[String(status ?? '')] ?? String(status ?? '—')
}

export function advertisementStatusClass(status: unknown) {
  const k = String(status ?? '')
  if (k === 'Pending') return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
  if (k === 'Approved') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
  if (k === 'Active') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  if (k === 'Rejected') return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  if (k === 'Expired') return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

const AD_DOMAIN_LABELS: Record<string, string> = {
  '1': 'عيادة / طبي',
  Clinic: 'عيادة / طبي',
  '3': 'مطعم',
  Restaurant: 'مطعم',
}

const AD_PLACEMENT_LABELS: Record<string, string> = {
  '0': 'الرئيسية (قديم)',
  LegacyHome: 'الرئيسية (قديم)',
  '1': 'مركز الاكتشاف',
  DiscoveryHub: 'مركز الاكتشاف',
  '2': 'رئيسية المطاعم',
  RestaurantHome: 'رئيسية المطاعم',
  '3': 'رئيسية الطبي',
  MedicalHome: 'رئيسية الطبي',
}

export function advertisementDomainLabel(row: Record<string, unknown>) {
  const name = row.targetDomainTypeName ?? row.TargetDomainTypeName
  if (name) return AD_DOMAIN_LABELS[String(name)] ?? String(name)
  const n = row.targetDomainType ?? row.TargetDomainType
  if (n !== null && n !== undefined && n !== '') return AD_DOMAIN_LABELS[String(n)] ?? String(n)
  return '—'
}

export function advertisementPlacementLabel(row: Record<string, unknown>) {
  const name = row.placementName ?? row.PlacementName
  if (name) return AD_PLACEMENT_LABELS[String(name)] ?? String(name)
  const n = row.placement ?? row.Placement
  if (n !== null && n !== undefined && n !== '') return AD_PLACEMENT_LABELS[String(n)] ?? String(n)
  return '—'
}
