<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950" :dir="dir">
    <div class="absolute inset-0 bg-brand/20" />
    <div class="relative flex min-h-screen items-center justify-center px-4 py-10">
      <section class="w-full max-w-md">
        <div class="mb-8 text-center">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-float">
            <img :src="officialLogo" alt="HAJIZ" class="h-full w-full object-contain" />
          </div>
          <p class="mt-5 text-xs font-black tracking-[0.3em] text-brand-muted">HAJIZ</p>
          <h1 class="mt-2 text-3xl font-black text-white">{{ t('login.title') }}</h1>
          <p class="mt-2 text-sm text-white/70">{{ t('login.subtitle') }}</p>
        </div>

        <form class="rounded-2xl bg-white p-8 shadow-float" @submit.prevent="submit">
          <FormField :label="t('login.phone')" required>
            <div class="relative">
              <PhoneIcon class="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-app-muted" :class="isRtl ? 'right-3' : 'left-3'" />
              <input v-model="phone" type="tel" autocomplete="username" class="input-field" :class="isRtl ? 'pr-11' : 'pl-11'" placeholder="07XXXXXXXXX" />
            </div>
          </FormField>
          <div class="mt-4">
            <FormField :label="t('login.password')" required>
              <div class="relative">
                <LockClosedIcon class="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-app-muted" :class="isRtl ? 'right-3' : 'left-3'" />
                <input
                  v-model="password"
                  :type="showPass ? 'text' : 'password'"
                  autocomplete="current-password"
                  class="input-field"
                  :class="isRtl ? 'pr-11 pl-16' : 'pl-11 pr-16'"
                />
                <button type="button" class="absolute top-1/2 -translate-y-1/2 text-xs font-black text-brand" :class="isRtl ? 'left-3' : 'right-3'" @click="showPass = !showPass">
                  {{ showPass ? t('login.hide') : t('login.show') }}
                </button>
              </div>
            </FormField>
          </div>
          <p v-if="errorMsg" class="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{{ errorMsg }}</p>
          <button type="submit" :disabled="loading || !phone || !password" class="btn-primary mt-6 w-full py-3">
            {{ loading ? t('login.submitting') : t('login.submit') }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { LockClosedIcon, PhoneIcon } from '@heroicons/vue/24/outline'
import FormField from '@/components/common/FormField.vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'
import { apiMessage } from '@/utils/error'
import officialLogo from '@/assets/images/logo .svg'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const { t, dir, isRtl } = useI18n()

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
    await router.push('/dashboard')
  } catch (e) {
    errorMsg.value = apiMessage(e, t('login.subtitle'))
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}
</script>
