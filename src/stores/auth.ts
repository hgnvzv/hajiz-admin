import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const isLoggedIn = computed(() => !!token.value)

  async function login(phone: string, password: string) {
    const res = await api.post('/auth/admin/login', { phone, password })
    token.value = res.data.accessToken
    user.value = res.data.user
    localStorage.setItem('admin_token', token.value)
    localStorage.setItem('admin_user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return { token, user, isLoggedIn, login, logout }
})
