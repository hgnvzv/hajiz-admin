import type { BookingFlow, CategoryBookingFormState, CategoryDto } from '@/types/category'

export const BOOKING_FLOW_OPTIONS: { value: BookingFlow; label: string }[] = [
  { value: 'service', label: 'حجز خدمة (Service)' },
  { value: 'reservation', label: 'حجز مسبق — عدد الضيوف (Reservation)' },
  { value: 'reservation_with_services', label: 'حجز مسبق + باقات خدمات' },
]

export const BOOKING_TYPE_OPTIONS = [
  { value: 1, label: '1 — خدمة (Service)' },
  { value: 2, label: '2 — حجز مسبق (Reservation)' },
]

export const DEFAULT_CATEGORY_BOOKING: CategoryBookingFormState = {
  bookingType: 1,
  bookingFlow: 'service',
  requiresServices: true,
  requiresStaffSelection: false,
  requiresGuestCount: false,
  supportsOccasionSelection: false,
  requiresOccasionSelection: false,
}

export const CATEGORY_PRESETS: Record<string, { label: string; state: CategoryBookingFormState }> = {
  salon: {
    label: 'حلاقة وتجميل',
    state: {
      bookingType: 1,
      bookingFlow: 'service',
      requiresServices: true,
      requiresStaffSelection: true,
      requiresGuestCount: false,
      supportsOccasionSelection: false,
      requiresOccasionSelection: false,
    },
  },
  restaurant: {
    label: 'مطاعم',
    state: {
      bookingType: 2,
      bookingFlow: 'reservation',
      requiresServices: false,
      requiresStaffSelection: false,
      requiresGuestCount: true,
      supportsOccasionSelection: true,
      requiresOccasionSelection: false,
    },
  },
  eventHall: {
    label: 'قاعات ومناسبات',
    state: {
      bookingType: 2,
      bookingFlow: 'reservation_with_services',
      requiresServices: true,
      requiresStaffSelection: false,
      requiresGuestCount: true,
      supportsOccasionSelection: true,
      requiresOccasionSelection: true,
    },
  },
  medical: {
    label: 'عيادات طبية',
    state: {
      bookingType: 1,
      bookingFlow: 'service',
      requiresServices: true,
      requiresStaffSelection: false,
      requiresGuestCount: false,
      supportsOccasionSelection: false,
      requiresOccasionSelection: false,
    },
  },
  hotel: {
    label: 'فنادق',
    state: {
      bookingType: 1,
      bookingFlow: 'service',
      requiresServices: true,
      requiresStaffSelection: false,
      requiresGuestCount: false,
      supportsOccasionSelection: false,
      requiresOccasionSelection: false,
    },
  },
}

const FLOW_LABELS: Record<string, string> = {
  service: 'خدمة',
  reservation: 'حجز مسبق',
  reservation_with_services: 'حجز + باقات',
}

export function bookingFlowLabel(flow: unknown): string {
  return FLOW_LABELS[String(flow ?? '')] ?? String(flow ?? '—')
}

export function bookingTypeLabel(type: unknown): string {
  const n = Number(type)
  if (n === 1) return 'خدمة (1)'
  if (n === 2) return 'حجز (2)'
  return String(type ?? '—')
}

export function bookingConfigSummary(c: Partial<CategoryDto> | CategoryBookingFormState): string {
  const parts: string[] = []
  if (c.requiresServices) parts.push('خدمات')
  if (c.requiresStaffSelection) parts.push('موظف')
  if (c.requiresGuestCount) parts.push('ضيوف')
  if (c.supportsOccasionSelection) parts.push('مناسبة')
  if (c.requiresOccasionSelection) parts.push('مناسبة إلزامية')
  return parts.length ? parts.join(' · ') : '—'
}

export function normalizeBookingFlow(flow: unknown): BookingFlow {
  const v = String(flow ?? '')
  if (v === 'reservation' || v === 'reservation_with_services') return v
  return 'service'
}

export function readCategoryBooking(c: Record<string, unknown>): CategoryBookingFormState {
  return {
    bookingType: Number(c.bookingType ?? 1) === 2 ? 2 : 1,
    bookingFlow: normalizeBookingFlow(c.bookingFlow),
    requiresServices: Boolean(c.requiresServices ?? false),
    requiresStaffSelection: Boolean(c.requiresStaffSelection ?? false),
    requiresGuestCount: Boolean(c.requiresGuestCount ?? false),
    supportsOccasionSelection: Boolean(c.supportsOccasionSelection ?? false),
    requiresOccasionSelection: Boolean(c.requiresOccasionSelection ?? false),
  }
}

export function getBookingHints(form: CategoryBookingFormState): string[] {
  const hints: string[] = []
  if (form.bookingFlow === 'service' && !form.requiresServices) {
    hints.push('عادةً: حجز الخدمة يتطلب تفعيل «يتطلب خدمات».')
  }
  if (form.bookingFlow === 'reservation' && !form.requiresGuestCount) {
    hints.push('عادةً: الحجز المسبق يتطلب تفعيل «يتطلب عدد الضيوف».')
  }
  if (form.bookingFlow === 'reservation_with_services') {
    if (!form.requiresServices || !form.requiresGuestCount) {
      hints.push('عادةً: الحجز + الباقات يتطلب «خدمات» و«عدد الضيوف» معاً.')
    }
  }
  if (form.requiresOccasionSelection && !form.supportsOccasionSelection) {
    hints.push('تنبيه: «مناسبة إلزامية» تتطلب تفعيل «يدعم اختيار المناسبة».')
  }
  return hints
}

export function isValidBookingFlow(flow: unknown): flow is BookingFlow {
  return flow === 'service' || flow === 'reservation' || flow === 'reservation_with_services'
}
