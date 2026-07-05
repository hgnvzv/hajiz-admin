import axios from 'axios'

const api = axios.create({
  baseURL: 'https://hajez-backend-new-production.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' },
})

export const API_ORIGIN = (api.defaults.baseURL ?? '').replace(/\/api\/?$/, '')
export const NOTIFICATIONS_HUB_URL = `${API_ORIGIN}/hubs/notifications`

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('hajiz_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('hajiz_admin_token')
      localStorage.removeItem('hajiz_admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// ── Auth ──
export const adminLogin = (data: { phone: string; password: string }) =>
  api.post('/auth/admin/login', data)

// ── Dashboard ──
export const getDashboard = () => api.get('/admin/stats')

// ── Applications ──
export const getApplications = (params?: Record<string, unknown>) =>
  api.get('/admin/applications', { params })

export const getApplicationDetail = (id: string) => api.get(`/admin/applications/${id}`)

export const approveApplication = (id: string) => api.put(`/admin/applications/${id}/approve`)

export const rejectApplication = (id: string, reason: string) =>
  api.put(`/admin/applications/${id}/reject`, { reason })

// ── Businesses ──
export const getBusinesses = (params?: Record<string, unknown>) =>
  api.get('/admin/businesses', { params })

export const getBusinessDetail = (id: string) => api.get(`/admin/businesses/${id}`)

export const approveBusiness = (id: string) => api.put(`/admin/businesses/${id}/approve`)

export const toggleBusiness = (id: string) => api.put(`/admin/businesses/${id}/toggle`)

export const suspendBusiness = (id: string, reason: string) =>
  api.put(`/admin/businesses/${id}/suspend`, { reason })

export const activateBusiness = (id: string) => api.put(`/admin/businesses/${id}/activate`)

export const deleteBusiness = (id: string) => api.delete(`/admin/businesses/${id}`)

// ── Users / Customers ──
export const getUsers = (params?: Record<string, unknown>) =>
  api.get('/admin/users', { params })

export const updateUserStatus = (id: string, userType: string, isActive: boolean) =>
  api.put(`/admin/users/${id}/status`, { isActive }, { params: { userType } })

export const deleteUser = (id: string, userType: string) =>
  api.delete(`/admin/users/${id}`, { params: { userType } })

export const createAdminUser = (data: { fullName: string; phone: string; password: string }) =>
  api.post('/admin/users/admin', data)

export const getCustomers = (params?: Record<string, unknown>) =>
  api.get('/admin/customers', { params })

export const getCustomerDetail = (id: string) => api.get(`/admin/customers/${id}`)

export const blockCustomer = (id: string, reason: string) =>
  api.put(`/admin/customers/${id}/block`, { reason })

export const unblockCustomer = (id: string) => api.put(`/admin/customers/${id}/unblock`)

// ── Bookings ──
export const getBookings = (params?: Record<string, unknown>) =>
  api.get('/admin/bookings', { params })

export const getBookingDetail = (id: string) => api.get(`/admin/bookings/${id}`)

export const cancelBooking = (id: string, reason?: string) =>
  api.put(`/admin/bookings/${id}/cancel`, reason?.trim() ? { reason: reason.trim() } : {})

// ── Categories ──
export const getCategories = () => api.get('/admin/categories')

export const createCategory = (data: Record<string, unknown>) => api.post('/admin/categories', data)

export const updateCategory = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/categories/${id}`, data)

export const deleteCategory = (id: string) => api.delete(`/admin/categories/${id}`)

export const toggleCategory = (id: string) => api.put(`/admin/categories/${id}/toggle`)

export const createSubCategory = (data: Record<string, unknown>) =>
  api.post('/admin/categories/sub', data)

export const updateSubCategory = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/categories/sub/${id}`, data)

export const toggleSubCategory = (id: string) => api.put(`/admin/categories/sub/${id}/toggle`)

// ── Commissions ──
export const getCommissions = (params?: Record<string, unknown>) =>
  api.get('/admin/commissions', { params })

export const markCommissionPaid = (id: string) => api.put(`/admin/commissions/${id}/mark-paid`)

// ── Coupons ──
export const getAdminCoupons = () => api.get('/admin/coupons')

export const createAdminCoupon = (data: Record<string, unknown>) => api.post('/admin/coupons', data)

export const toggleAdminCoupon = (id: string) => api.put(`/admin/coupons/${id}/toggle`)

export const deleteAdminCoupon = (id: string) => api.delete(`/admin/coupons/${id}`)

// ── Discounts ──
export const getAdminDiscounts = (params?: Record<string, unknown>) =>
  api.get('/admin/discounts', { params })

export const approveDiscount = (id: string) => api.put(`/admin/discounts/${id}/approve`)

export const rejectDiscount = (id: string, data?: { reason?: string | null }) =>
  api.put(`/admin/discounts/${id}/reject`, data ?? {})

export const updateDiscountOrder = (id: string, displayOrder: number) =>
  api.put(`/admin/discounts/${id}/order`, { displayOrder })

// ── Advertisements ──
export { adminAdvertisementsApi } from './adminAdvertisements'

export const getAdminAdvertisements = (params?: Record<string, unknown>) =>
  api.get('/admin/advertisements', { params })

export const getAdminAdvertisementDetail = (id: string) => api.get(`/admin/advertisements/${id}`)

export const updateAdminAdvertisement = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/advertisements/${id}`, data)

export const updateAdminAdvertisementImage = (id: string, file: File) => {
  const fd = new FormData()
  fd.append('image', file)
  return api.put(`/admin/advertisements/${id}/image`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const updateAdminAdvertisementDisplayOrder = (id: string, displayOrder: number) =>
  api.put(`/admin/advertisements/${id}/display-order`, { displayOrder })

export const deleteAdminAdvertisement = (id: string) => api.delete(`/admin/advertisements/${id}`)

export const approveAdvertisement = (id: string) => api.put(`/admin/advertisements/${id}/approve`)

export const rejectAdvertisement = (id: string, data?: { reason?: string | null }) =>
  api.put(`/admin/advertisements/${id}/reject`, data ?? {})

// ── Craftsmen ──
export const getCraftsmen = (params?: Record<string, unknown>) =>
  api.get('/admin/craftsmen', { params })

export const getCraftsmanDetail = (id: string) => api.get(`/admin/craftsmen/${id}`)

export const approveCraftsman = (id: string) => api.put(`/admin/craftsmen/${id}/approve`)

export const rejectCraftsman = (id: string, reason: string) =>
  api.put(`/admin/craftsmen/${id}/reject`, { reason })

export const toggleCraftsman = (id: string) => api.put(`/admin/craftsmen/${id}/toggle`)

// ── Professions ──
export const getProfessions = () => api.get('/admin/professions')

export const createProfession = (data: Record<string, unknown>) =>
  api.post('/admin/professions', data)

export const toggleProfession = (id: string) => api.put(`/admin/professions/${id}/toggle`)

export const deleteProfession = (id: string) => api.delete(`/admin/professions/${id}`)

// ── Occasions ──
export const getOccasions = () => api.get('/admin/occasions')

export const createOccasion = (data: Record<string, unknown>) => api.post('/admin/occasions', data)

export const updateOccasion = (id: string, data: Record<string, unknown>) =>
  api.put(`/admin/occasions/${id}`, data)

export const toggleOccasion = (id: string) => api.put(`/admin/occasions/${id}/toggle`)

export const deleteOccasion = (id: string) => api.delete(`/admin/occasions/${id}`)

// ── Service Requests ──
export const getServiceRequests = (params?: Record<string, unknown>) =>
  api.get('/admin/service-requests', { params })

export const getServiceRequestDetail = (id: string) => api.get(`/admin/service-requests/${id}`)

// ── Complaints ──
export const getComplaints = (params?: Record<string, unknown>) =>
  api.get('/admin/complaints', { params })

export const getComplaintDetail = (id: string) => api.get(`/admin/complaints/${id}`)

export const updateComplaintStatus = (
  id: string,
  data: { status: number; adminNotes?: string },
) => api.put(`/admin/complaints/${id}/status`, data)

// ── Broadcast ──
export const sendBroadcast = (data: Record<string, unknown>) => api.post('/admin/broadcast', data)

export const getBroadcasts = (params?: Record<string, unknown>) =>
  api.get('/admin/broadcast', { params })

// ── Settings ──
export const getPlatformSettings = () => api.get('/admin/settings')

export const updatePlatformSettings = (data: Record<string, unknown>) =>
  api.put('/admin/settings', data)

// ── Public ──
export const getCities = () => api.get('/public/cities')

export const getPublicCategories = () => api.get('/public/categories')

export const getPublicOccasions = () => api.get('/public/occasions')

export const getPublicProfessions = () => api.get('/public/professions')

// ── Revenue ──
export const getRevenue = (params?: Record<string, unknown>) =>
  api.get('/admin/revenue', { params })

// ── Notifications ──
export const getNotifications = (params?: Record<string, unknown>) =>
  api.get('/admin/notifications', { params })

export const sendNotification = (data: Record<string, unknown>) =>
  api.post('/admin/notifications/send', data)

export const markNotificationRead = (id: string) => api.put(`/admin/notifications/${id}/read`)

export const markAllNotificationsRead = () => api.put('/admin/notifications/read-all')

// ── Credits Top-up ──
export const getCreditTopUpRequests = (params?: Record<string, unknown>) =>
  api.get('/admin/credits/top-up-requests', { params })

export const getCreditTopUpRequestDetail = (id: string) =>
  api.get(`/admin/credits/top-up-requests/${id}`)

export const approveCreditTopUpRequest = (
  id: string,
  data?: { actualCreditsAmount?: number },
) => api.put(`/admin/credits/top-up-requests/${id}/approve`, data ?? {})

export const rejectCreditTopUpRequest = (id: string, reason: string) =>
  api.put(`/admin/credits/top-up-requests/${id}/reject`, { reason })

// ── Reports ──
export const getBookingsReport = (params?: Record<string, unknown>) =>
  api.get('/admin/reports/bookings', { params })

export const getBusinessesReport = () => api.get('/admin/reports/businesses')

export const getCategoriesReport = () => api.get('/admin/reports/categories')

export default api
