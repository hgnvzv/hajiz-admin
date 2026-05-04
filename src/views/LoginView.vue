<template>
  <div class="min-h-screen flex items-center justify-center p-4" dir="rtl"
    style="background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
          style="background: linear-gradient(135deg, #2563EB, #1D4ED8)">
          <span class="text-white font-bold text-3xl">ح</span>
        </div>
        <h1 class="text-3xl font-bold text-white">حاجز</h1>
        <p class="text-slate-400 mt-1">لوحة تحكم الإدارة</p>
      </div>

      <div class="rounded-2xl p-8 border" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1)">
        <h2 class="text-white font-bold text-lg mb-6">تسجيل الدخول</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">رقم الهاتف</label>
            <input v-model="phone" type="tel" placeholder="07X XXXX XXXX"
              @keyup.enter="handleLogin"
              class="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
              style="background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.12)"
              :style="focusPhone ? 'border-color: #2563EB' : ''"
              @focus="focusPhone=true" @blur="focusPhone=false" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">كلمة المرور</label>
            <input v-model="password" type="password" placeholder="••••••••"
              @keyup.enter="handleLogin"
              class="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
              style="background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.12)"
              :style="focusPass ? 'border-color: #2563EB' : ''"
              @focus="focusPass=true" @blur="focusPass=false" />
          </div>
        </div>

        <div v-if="error" class="mt-3 p-3 rounded-xl flex items-center gap-2"
          style="background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.3)">
          <span>⚠️</span>
          <p style="color: #FCA5A5; font-size: 14px">{{ error }}</p>
        </div>

        <button @click="handleLogin" :disabled="loading || !phone || !password"
          class="w-full mt-5 py-3 rounded-xl font-bold text-white transition-all"
          style="background: linear-gradient(135deg, #2563EB, #1D4ED8); font-size: 15px"
          :style="loading ? 'opacity: 0.6' : ''">
          {{ loading ? 'جاري الدخول...' : 'دخول ←' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const phone = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const focusPhone = ref(false)
const focusPass = ref(false)

async function handleLogin() {
  if (!phone.value || !password.value) return
  loading.value = true
  error.value = ''
  try {
    await auth.login(phone.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'البيانات غير صحيحة'
  } finally {
    loading.value = false
  }
}
</script>
