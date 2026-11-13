import api from '@/api/index'
import { isGuid } from '@/utils/admin'

export const getPublicBusinessDomains = () => api.get('/public/business-domains')

export const getPublicMedicalClinics = (params?: Record<string, unknown>) =>
  api.get('/public/medical/clinics', { params })

export const getPublicMedicalClinic = (businessId: string) =>
  api.get(`/public/medical/clinics/${businessId}`)

export const getPublicMedicalDoctors = (params?: Record<string, unknown>) =>
  api.get('/public/medical/doctors', { params })

export const getPublicMedicalDoctor = (doctorProfileId: string) =>
  api.get(`/public/medical/doctors/${doctorProfileId}`)

export const getAdminMedicalSpecialties = () => api.get('/admin/medical/specialties')

export const createAdminMedicalSpecialty = (data: Record<string, unknown>) =>
  api.post('/admin/medical/specialties', data)

export const updateAdminMedicalSpecialty = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/medical/specialties/${id}`, data)

export const toggleAdminMedicalSpecialty = (id: string) =>
  api.put(`/admin/medical/specialties/${id}/toggle`)

export const getAdminRestaurantCuisines = () => api.get('/admin/restaurant/cuisines')

export const createAdminRestaurantCuisine = (data: Record<string, unknown>) =>
  api.post('/admin/restaurant/cuisines', data)

export const toggleAdminRestaurantCuisine = (id: string) =>
  api.put(`/admin/restaurant/cuisines/${id}/toggle`)

export const getAdminRestaurantApplicationDraft = (applicationId: string) =>
  api.get(`/admin/restaurant/applications/${applicationId}/draft`)

export const getPublicRestaurants = (params?: Record<string, unknown>) =>
  api.get('/public/restaurant/restaurants', { params })

export const getPublicRestaurant = (businessId: string) =>
  api.get(`/public/restaurant/restaurants/${businessId}`)

export const getPublicRestaurantMenu = (businessId: string) =>
  api.get(`/public/restaurant/restaurants/${businessId}/menu`)

export const getPublicRestaurantFloors = (businessId: string) =>
  api.get(`/public/restaurant/restaurants/${businessId}/floors`)

/** Admin floor plan read — includes inactive tables; no publicly-bookable gate. */
export const getAdminRestaurantFloors = (businessId: string) => {
  const id = businessId.trim()
  if (!isGuid(id)) {
    return Promise.reject(new Error('معرّف المطعم يجب أن يكون UUID'))
  }
  return api.get(`/admin/restaurant/businesses/${id}/floors`)
}

export const createAdminRestaurantFloor = (businessId: string, data: Record<string, unknown>) => {
  const id = businessId.trim()
  if (!isGuid(id)) {
    return Promise.reject(new Error('معرّف المطعم يجب أن يكون UUID للعمل (businessId) وليس رقماً تسلسلياً'))
  }
  return api.post(`/admin/restaurant/businesses/${id}/floors`, data)
}

export const updateAdminRestaurantFloor = (
  floorId: string,
  data: Record<string, unknown>,
  businessId?: string,
) => api.put(`/admin/restaurant/floors/${floorId}`, data, { params: { businessId } })

export const createAdminRestaurantTable = (floorId: string, data: Record<string, unknown>) =>
  api.post(`/admin/restaurant/floors/${floorId}/tables`, data)

export const updateAdminRestaurantTable = (
  tableId: string,
  data: Record<string, unknown>,
  floorId?: string,
) => api.put(`/admin/restaurant/tables/${tableId}`, data, { params: { floorId } })

export const setRestaurantPubliclyBookable = (businessId: string, isPubliclyBookable: boolean) =>
  api.put(`/admin/restaurant/businesses/${businessId}/publicly-bookable`, { isPubliclyBookable })

export const getAdminRestaurantSetupReadiness = (businessId: string) =>
  api.get(`/admin/restaurant/businesses/${businessId}/setup-readiness`)

export const verifyAdminRestaurantLocation = (
  businessId: string,
  data: { latitude: number; longitude: number; address?: string },
) => api.put(`/admin/restaurant/businesses/${businessId}/location`, data)

export const getAdminGovernorates = (params?: Record<string, unknown>) =>
  api.get('/admin/geography/governorates', { params })

export const createAdminGovernorate = (data: Record<string, unknown>) =>
  api.post('/admin/geography/governorates', data)

export const updateAdminGovernorate = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/geography/governorates/${id}`, data)

export const toggleAdminGovernorate = (id: string) =>
  api.put(`/admin/geography/governorates/${id}/toggle`)

export const getAdminAreas = (params?: Record<string, unknown>) =>
  api.get('/admin/geography/areas', { params })

export const createAdminArea = (data: Record<string, unknown>) =>
  api.post('/admin/geography/areas', data)

export const updateAdminArea = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/geography/areas/${id}`, data)

export const toggleAdminArea = (id: string) => api.put(`/admin/geography/areas/${id}/toggle`)

export const getAdminNeighborhoods = (params?: Record<string, unknown>) =>
  api.get('/admin/geography/neighborhoods', { params })

export const createAdminNeighborhood = (data: Record<string, unknown>) =>
  api.post('/admin/geography/neighborhoods', data)

export const updateAdminNeighborhood = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/geography/neighborhoods/${id}`, data)

export const toggleAdminNeighborhood = (id: string) =>
  api.put(`/admin/geography/neighborhoods/${id}/toggle`)
