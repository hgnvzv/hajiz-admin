export type AdvertisementStatus = 'Pending' | 'Active' | 'Rejected' | 'Expired' | 'Approved'

export interface AdvertisementDto {
  id: string
  businessId: string
  businessName: string
  title: string
  description: string
  imageUrl: string
  videoUrl?: string | null
  durationDays: number
  totalCost: number
  startDate?: string | null
  endDate?: string | null
  status: AdvertisementStatus
  displayOrder: number
  adminNotes?: string | null
}

export interface UpdateAdvertisementDto {
  title?: string
  description?: string
  videoUrl?: string | null
  durationDays?: number
  displayOrder?: number
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

export interface AdvertisementListParams {
  status?: string
  page?: number
  pageSize?: number
}
