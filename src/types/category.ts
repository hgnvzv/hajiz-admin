export type BookingFlow = 'service' | 'reservation' | 'reservation_with_services'

export interface SubCategoryDto {
  id: string
  name: string
  nameAr: string
  displayOrder: number
  isActive?: boolean
}

export interface CategoryDto {
  id: string
  name: string
  nameAr: string
  icon: string
  displayOrder: number
  isActive: boolean
  businessCount: number
  bookingType: 1 | 2
  bookingFlow: BookingFlow
  requiresServices: boolean
  requiresStaffSelection: boolean
  requiresGuestCount: boolean
  supportsOccasionSelection: boolean
  requiresOccasionSelection: boolean
  subCategories: SubCategoryDto[]
}

export interface CreateCategoryDto {
  name: string
  nameAr: string
  icon: string
  displayOrder: number
  bookingType: number
  bookingFlow: BookingFlow
  requiresServices: boolean
  requiresStaffSelection: boolean
  requiresGuestCount: boolean
  supportsOccasionSelection: boolean
  requiresOccasionSelection: boolean
}

export interface UpdateBusinessAdminDto {
  supportsOccasionSelection?: boolean | null
}

export interface CategoryBookingFormState {
  bookingType: number
  bookingFlow: BookingFlow
  requiresServices: boolean
  requiresStaffSelection: boolean
  requiresGuestCount: boolean
  supportsOccasionSelection: boolean
  requiresOccasionSelection: boolean
}
