<template>
  <div class="min-h-screen flex" dir="rtl">

    <!-- Left decorative panel -->
    <div class="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
      style="background: linear-gradient(145deg, #071e1d 0%, #0a2c2a 40%, #145550 100%)">

      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/2"
          style="background: #f2b415"></div>
        <div class="absolute bottom-0 left-0 w-72 h-72 rounded-full translate-y-1/2 -translate-x-1/2"
          style="background: #257d75"></div>
      </div>

      <!-- Floating cards decoration -->
      <div class="absolute top-16 right-12 opacity-20 rotate-12">
        <div class="w-24 h-16 rounded-2xl" style="background: rgba(242,180,21,0.3); backdrop-filter: blur(10px)"></div>
      </div>
      <div class="absolute bottom-24 left-10 opacity-20 -rotate-6">
        <div class="w-20 h-14 rounded-2xl" style="background: rgba(37,125,117,0.3)"></div>
      </div>

      <!-- Main content -->
      <div class="relative z-10 text-center px-12">
        <div class="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 p-4"
          style="background: linear-gradient(135deg, rgba(242,180,21,0.2), rgba(37,125,117,0.2)); border: 1.5px solid rgba(242,180,21,0.3)">
          <img src="@/assets/logo.svg" alt="حاجز" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-5xl font-black mb-3" style="color: #f2b415">حاجز</h1>
        <p class="text-lg font-medium mb-2" style="color: rgba(255,255,255,0.7)">منصة إدارة الحجوزات</p>
        <p class="text-sm" style="color: rgba(255,255,255,0.35)">لوحة التحكم الإدارية</p>

        <div class="mt-12 grid grid-cols-3 gap-4">
          <div v-for="stat in decorStats" :key="stat.label"
            class="p-4 rounded-2xl text-center"
            style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)">
            <p class="text-2xl font-black" style="color: #f2b415">{{ stat.value }}</p>
            <p class="text-xs mt-1" style="color: rgba(255,255,255,0.4)">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right login panel -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6" style="background: #f0f4f3">
      <div class="w-full max-w-md">

        <!-- Mobile logo -->
        <div class="flex lg:hidden items-center justify-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center p-2"
            style="background: linear-gradient(135deg, #0a2c2a, #257d75)">
            <img src="@/assets/logo.svg" alt="حاجز" class="w-full h-full object-contain" />
          </div>
          <span class="text-2xl font-black" style="color: #0a2c2a">حاجز</span>
        </div>

        <!-- Login Card -->
        <div class="rounded-3xl overflow-hidden shadow-2xl" style="background: white; border: 1px solid #e2eded">

          <!-- Card header -->
          <div class="px-8 py-6" style="background: linear-gradient(135deg, #0a2c2a, #145550)">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center p-2"
                style="background: rgba(242,180,21,0.15); border: 1px solid rgba(242,180,21,0.3)">
                <img src="@/assets/logo.svg" alt="حاجز" class="w-full h-full object-contain" />
              </div>
              <div>
                <h2 class="font-black text-white text-lg">تسجيل الدخول</h2>
                <p class="text-xs" style="color: rgba(255,255,255,0.45)">أدخل بياناتك للمتابعة</p>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="px-8 py-7">
            <div class="space-y-5">

              <!-- Phone -->
              <div>
                <label class="block text-sm font-bold mb-2" style="color: #145550">رقم الهاتف</label>
                <div class="relative">
                  <span class="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <input v-model="phone" type="tel" placeholder="07X XXXX XXXX"
                    @keyup.enter="handleLogin"
                    @focus="focusPhone=true" @blur="focusPhone=false"
                    class="w-full pr-10 pl-4 py-3 rounded-xl text-sm outline-none transition-all"
                    :style="focusPhone
                      ? 'border: 2px solid #257d75; background: #f0faf9; box-shadow: 0 0 0 3px rgba(37,125,117,0.1)'
                      : 'border: 1.5px solid #e2eded; background: #fafcfc'" />
                </div>
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-bold mb-2" style="color: #145550">كلمة المرور</label>
                <div class="relative">
                  <span class="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input v-model="password" type="password" placeholder="••••••••"
                    @keyup.enter="handleLogin"
                    @focus="focusPass=true" @blur="focusPass=false"
                    class="w-full pr-10 pl-4 py-3 rounded-xl text-sm outline-none transition-all"
                    :style="focusPass
                      ? 'border: 2px solid #257d75; background: #f0faf9; box-shadow: 0 0 0 3px rgba(37,125,117,0.1)'
                      : 'border: 1.5px solid #e2eded; background: #fafcfc'" />
                </div>
              </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="mt-4 p-3.5 rounded-xl flex items-center gap-2.5"
              style="background: #fef2f2; border: 1px solid #fecaca">
              <svg class="w-4 h-4 flex-shrink-0" style="color: #dc2626" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <p style="color: #b91c1c; font-size: 13px">{{ error }}</p>
            </div>

            <!-- Submit Button -->
            <button @click="handleLogin" :disabled="loading || !phone || !password"
              class="w-full mt-6 py-3.5 rounded-xl font-black text-white text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style="background: linear-gradient(135deg, #257d75, #1d6560)"
              :style="(loading || !phone || !password) ? 'opacity: 0.6; cursor: not-allowed' : 'box-shadow: 0 4px 15px rgba(37,125,117,0.35)'">
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>{{ loading ? 'جاري الدخول...' : 'دخول إلى لوحة التحكم' }}</span>
              <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs mt-5" style="color: rgba(10,44,42,0.35)">
          حاجز © {{ new Date().getFullYear() }} — جميع الحقوق محفوظة
        </p>
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

const decorStats = [
  { value: '500+', label: 'محل مسجل' },
  { value: '10k+', label: 'حجز شهري' },
  { value: '99%', label: 'رضا العملاء' },
]

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
