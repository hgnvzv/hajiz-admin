import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminLogin } from '@/api'

export interface AdminUser {
  id: string | number
  name: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || localStorage.getItem('hajiz_admin_token') || '')
  const admin = ref<AdminUser | null>(
    JSON.parse(localStorage.getItem('admin_user') || localStorage.getItem('hajiz_admin_user') || 'null'),
  )
  const isLoggedIn = computed(() => !!token.value)

  async function login(phone: string, password: string) {
    const res = await adminLogin({ phone, password })
    const d = res.data as {
      token?: string
      accessToken?: string
      admin?: AdminUser
      user?: AdminUser
    }
    const t = d.token ?? d.accessToken ?? ''
    const a = d.admin ?? d.user
    if (!t || !a) throw new Error('استجابة غير صالحة من الخادم')
    token.value = t
    admin.value = a
    localStorage.setItem('admin_token', token.value)
    localStorage.setItem('admin_user', JSON.stringify(admin.value))
    localStorage.setItem('hajiz_admin_token', token.value)
    localStorage.setItem('hajiz_admin_user', JSON.stringify(admin.value))
  }

  function logout() {
    token.value = ''
    admin.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('hajiz_admin_token')
    localStorage.removeItem('hajiz_admin_user')
    void import('@/stores/notifications').then(({ useNotificationsStore }) => {
      useNotificationsStore().disconnect()
    })
    void import('@/router').then((m) => m.default.push('/login'))
  }

  return { token, admin, isLoggedIn, login, logout }
})
