<template>
  <div class="relative min-h-screen overflow-hidden bg-[#145550]" dir="rtl">
    <div class="absolute inset-0 opacity-20">
      <div class="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#f2b415] blur-3xl" />
      <div class="absolute -bottom-28 left-10 h-96 w-96 rounded-full bg-white blur-3xl" />
      <div class="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-[#f2b415] blur-3xl" />
    </div>

    <div class="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
      <section class="w-full max-w-xl">
        <div class="mb-8 text-center">
          <div class="mx-auto inline-flex rounded-[2.5rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
            <div class="flex h-40 w-40 items-center justify-center rounded-[2rem] bg-white p-5 shadow-2xl sm:h-48 sm:w-48">
              <img :src="officialLogo" alt="شعار حاجز الرسمي" class="h-full w-full object-contain" />
            </div>
          </div>
          <p class="mt-6 text-sm font-black tracking-[0.35em] text-[#f2b415]">HAJIZ</p>
          <h1 class="mt-2 text-4xl font-black text-white">تسجيل دخول الإدارة</h1>
          <p class="mt-3 text-base text-white/70">أدخل بيانات حساب المدير للوصول إلى لوحة التحكم</p>
        </div>

        <div class="rounded-[2.25rem] border border-white/15 bg-white p-8 shadow-2xl sm:p-10">
          <div class="mb-7 flex items-center justify-between gap-4 rounded-3xl bg-[#145550]/5 p-4">
            <div>
              <p class="text-sm font-black text-[#145550]">مرحباً بك</p>
              <p class="mt-1 text-xs font-bold text-slate-500">لوحة تحكم حاجز الرسمية</p>
            </div>
            <div class="h-12 w-1 rounded-full bg-[#f2b415]" />
          </div>

          <form class="space-y-6" @submit.prevent="submit">
            <div>
              <label class="mb-2 block text-sm font-black text-[#145550]">رقم الهاتف</label>
              <div class="relative">
                <PhoneIcon class="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#145550]/55" />
                <input
                  v-model="phone"
                  type="tel"
                  autocomplete="username"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-12 text-[#145550] outline-none transition focus:border-[#145550] focus:bg-white focus:ring-4 focus:ring-[#145550]/10"
                  placeholder="07XXXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-black text-[#145550]">كلمة المرور</label>
              <div class="relative">
                <LockClosedIcon class="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#145550]/55" />
                <input
                  v-model="password"
                  :type="showPass ? 'text' : 'password'"
                  autocomplete="current-password"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pl-14 pr-12 text-[#145550] outline-none transition focus:border-[#145550] focus:bg-white focus:ring-4 focus:ring-[#145550]/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#145550] transition hover:text-[#f2b415]"
                  @click="showPass = !showPass"
                >
                  {{ showPass ? 'إخفاء' : 'إظهار' }}
                </button>
              </div>
            </div>

            <p v-if="errorMsg" class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {{ errorMsg }}
            </p>

            <button
              type="submit"
              :disabled="loading || !phone || !password"
              class="group relative w-full overflow-hidden rounded-2xl bg-[#145550] py-[1.125rem] text-lg font-black text-white shadow-xl shadow-[#145550]/20 transition hover:-translate-y-0.5 hover:bg-[#0f433f] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span class="absolute inset-y-0 right-0 w-1/3 bg-[#f2b415]/25 blur-xl transition group-hover:w-full" />
              <span class="relative">{{ loading ? 'جاري الدخول...' : 'تسجيل الدخول' }}</span>
            </button>
          </form>

          <div class="mt-7 flex items-center justify-between rounded-2xl bg-[#f2b415]/10 px-4 py-3 text-xs font-bold text-[#145550]">
            <span>منصة حاجز</span>
            <span>لوحة الإدارة الآمنة</span>
          </div>
        </div>

        <div class="mt-8 flex items-center justify-center gap-3 text-center text-xs font-bold text-white/60">
          <span class="h-px w-10 bg-white/20" />
          <span>© حاجز</span>
          <span class="h-px w-10 bg-white/20" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { LockClosedIcon, PhoneIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { apiMessage } from '@/utils/error'
import officialLogo from '@/assets/images/logo .svg'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const phone = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.login(phone.value.trim(), password.value)
    toast.success('تم تسجيل الدخول بنجاح')
    await router.push('/dashboard')
  } catch (e) {
    errorMsg.value = apiMessage(e, 'بيانات الدخول غير صحيحة')
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}
</script>
