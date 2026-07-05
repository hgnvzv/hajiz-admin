import api from '@/api/index'
import type {
  AdvertisementDto,
  AdvertisementListParams,
  PagedResult,
  UpdateAdvertisementDto,
} from '@/types/advertisement'

export const adminAdvertisementsApi = {
  list(params?: AdvertisementListParams) {
    return api.get<PagedResult<AdvertisementDto>>('/admin/advertisements', { params })
  },

  getById(id: string) {
    return api.get<AdvertisementDto>(`/admin/advertisements/${id}`)
  },

  update(id: string, body: UpdateAdvertisementDto) {
    return api.put<AdvertisementDto>(`/admin/advertisements/${id}`, body)
  },

  updateImage(id: string, file: File) {
    const fd = new FormData()
    fd.append('image', file)
    return api.put<AdvertisementDto>(`/admin/advertisements/${id}/image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  setDisplayOrder(id: string, displayOrder: number) {
    return api.put<AdvertisementDto>(`/admin/advertisements/${id}/display-order`, { displayOrder })
  },

  delete(id: string) {
    return api.delete(`/admin/advertisements/${id}`)
  },

  approve(id: string) {
    return api.put<AdvertisementDto>(`/admin/advertisements/${id}/approve`)
  },

  reject(id: string, reason: string) {
    return api.put<AdvertisementDto>(`/admin/advertisements/${id}/reject`, { reason })
  },
}
