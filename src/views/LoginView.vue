<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
    <!-- Animated background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full"
        style="background: linear-gradient(135deg, #257d75, #1d6560); opacity: 0.1; animation: float 6s ease-in-out infinite"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
        style="background: linear-gradient(135deg, #f2b415, #d4990f); opacity: 0.1; animation: float 8s ease-in-out infinite reverse"></div>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md relative z-10">
      <!-- Logo Section -->
      <div class="text-center mb-10">
        <div class="flex justify-center mb-6">
          <div class="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
            style="background: linear-gradient(135deg, #257d75, #1d6560); position: relative; overflow: hidden;">
            <img src="@/assets/logo.svg" alt="حاجز" class="w-20 h-20">
            <div class="absolute inset-0" style="background: linear-gradient(45deg, rgba(242, 180, 21, 0.1), transparent); pointer-events: none;"></div>
          </div>
        </div>
        <h1 class="text-4xl font-bold text-teal-700 mb-2">حاجز</h1>
        <p class="text-lg text-gold-600 font-medium">نظام إدارة الحجوزات والمحلات</p>
      </div>

      <!-- Form Card -->
      <div class="rounded-2xl p-8 backdrop-blur-xl border-2"
        style="background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,249,0.95)); border-color: rgba(37, 125, 117, 0.2)">
        <h2 class="text-2xl font-bold text-teal-700 mb-8 text-center">تسجيل الدخول</h2>

        <div class="space-y-5">
          <!-- Phone Input -->
          <div class="group">
            <label class="block text-sm font-medium text-teal-700 mb-2">رقم الهاتف</label>
            <div class="relative">
              <input v-model="phone" type="tel" placeholder="07X XXXX XXXX"
                @keyup.enter="handleLogin"
                class="w-full px-4 py-3 rounded-lg text-teal-700 placeholder-gray-400 outline-none transition-all font-medium border-2"
                style="border-color: #d1ece9; background: white;"
                @focus="focusPhone=true; $event.target.style.borderColor='#257d75'; $event.target.style.background='linear-gradient(135deg, #f5fdfc, #eef9f8)'"
                @blur="focusPhone=false; $event.target.style.borderColor='#d1ece9'; $event.target.style.background='white'" />
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">📞</span>
            </div>
          </div>

          <!-- Password Input -->
          <div class="group">
            <label class="block text-sm font-medium text-teal-700 mb-2">كلمة المرور</label>
            <div class="relative">
              <input v-model="password" type="password" placeholder="••••••••"
                @keyup.enter="handleLogin"
                class="w-full px-4 py-3 rounded-lg text-teal-700 placeholder-gray-400 outline-none transition-all font-medium border-2"
                style="border-color: #d1ece9; background: white;"
                @focus="focusPass=true; $event.target.style.borderColor='#257d75'; $event.target.style.background='linear-gradient(135deg, #f5fdfc, #eef9f8)'"
                @blur="focusPass=false; $event.target.style.borderColor='#d1ece9'; $event.target.style.background='white'" />
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">🔐</span>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-4 rounded-lg flex items-center gap-3 border-l-4"
          style="background: linear-gradient(135deg, #fee, #fff5f5); border-left-color: #dc2626; border: 1px solid rgba(220,38,38,0.2)">
          <span class="text-2xl">⚠️</span>
          <p style="color: #991b1b; font-weight: 500; font-size: 14px">{{ error }}</p>
        </div>

        <!-- Remember Me -->
        <div class="flex items-center gap-2 mt-5">
          <input id="remember" type="checkbox" class="w-4 h-4 rounded"
            style="border-color: #257d75; accent-color: #f2b415">
          <label for="remember" class="text-sm text-teal-700 font-medium">تذكرني</label>
        </div>

        <!-- Login Button -->
        <button @click="handleLogin" :disabled="loading || !phone || !password"
          class="w-full mt-6 py-3.5 rounded-lg font-bold text-white text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          style="background: linear-gradient(135deg, #257d75, #1d6560)"
          :style="loading ? 'opacity: 0.7; cursor: not-allowed;' : 'opacity: 1; cursor: pointer;'">
          {{ loading ? '⏳ جاري الدخول...' : '🚪 دخول' }}
        </button>

        <!-- Support Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            هل تواجه مشاكل؟
            <a href="#" class="text-gold-600 font-bold hover:text-gold-700 transition-colors">تواصل معنا</a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-500">© 2024 حاجز - جميع الحقوق محفوظة</p>
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

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(20px);
  }
}
</style>
