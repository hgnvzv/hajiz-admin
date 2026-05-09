export interface PagedResult<T = Record<string, unknown>> {
  items: T[]
  total: number
  totalPages?: number
  summary?: Record<string, unknown>
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
  if (['Approved', 'Resolved', 'active', 'completed', 'Accepted', 'Completed'].includes(key)) {
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
    business: 'صاحب محل',
    admin: 'مدير',
    Customer: 'زبون',
    Business: 'صاحب محل',
    Admin: 'مدير',
    Craftsman: 'حرفي',
  }
  return map[String(type ?? '')] ?? String(type ?? '—')
}
