<template>
  <div class="space-y-6" dir="rtl">
    <RouterLink to="/customers" class="text-sm font-bold text-primary hover:underline">← الزبائن</RouterLink>

    <LoadingSpinner v-if="loading" />
    <template v-else-if="cust">
      <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-black">{{ cust.fullName ?? cust.name }}</h1>
            <p class="text-[#6B7280]">{{ cust.phone }}</p>
            <p class="mt-2 text-xs text-[#6B7280]">انضم في {{ formatDateShort(cust.createdAt as string) }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="custBlocked ? 'blocked' : 'active'" />
            <button
              v-if="!custBlocked"
              type="button"
              class="rounded-xl bg-danger px-4 py-2 font-bold text-white"
              @click="showBlock = true"
            >
              حظر
            </button>
            <button
              v-else
              type="button"
              class="rounded-xl bg-success px-4 py-2 font-bold text-white"
              @click="doUnblock"
            >
              إلغاء الحظر
            </button>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-xl bg-primary-light/50 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ st?.totalBookings ?? 0 }}</p>
            <p class="text-xs text-[#6B7280]">إجمالي الحجوزات</p>
          </div>
          <div class="rounded-xl bg-primary-light/50 p-4 text-center">
            <p class="text-2xl font-black text-primary-dark">{{ formatMoney(st?.totalSpent as number) }}</p>
            <p class="text-xs text-[#6B7280]">إجمالي الإنفاق</p>
          </div>
          <div class="rounded-xl bg-primary-light/50 p-4 text-center">
            <p class="text-2xl font-black text-danger">{{ st?.cancelledBookings ?? 0 }}</p>
            <p class="text-xs text-[#6B7280]">الملغاة</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-border bg-surface shadow-sm">
        <div class="border-b border-border px-5 py-4 font-black">سجل الحجوزات</div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-primary text-white">
              <tr>
                <th class="px-4 py-3">المحل</th>
                <th class="px-4 py-3">الخدمة</th>
                <th class="px-4 py-3">التاريخ</th>
                <th class="px-4 py-3">المبلغ</th>
                <th class="px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="!bookings.length">
                <td colspan="5" class="px-4 py-10 text-center text-[#6B7280]">لا توجد حجوزات</td>
              </tr>
              <tr v-for="b in bookings" :key="b.id">
                <td class="px-4 py-3">{{ b.businessName ?? '—' }}</td>
                <td class="px-4 py-3">{{ b.serviceName ?? '—' }}</td>
                <td class="px-4 py-3">{{ formatDateShort(b.appointmentDate as string) }}</td>
                <td class="px-4 py-3">{{ formatMoney(b.totalPrice as number) }}</td>
                <td class="px-4 py-3"><StatusBadge :status="String(b.status ?? 'pending')" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <ConfirmModal v-model="showBlock" title="حظر الزبون" confirm-text="حظر" confirm-color="danger" @confirm="confirmBlock">
      <textarea v-model="blockReason" rows="3" class="mt-2 w-full rounded-xl border border-border p-3" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getCustomerDetail, blockCustomer, unblockCustomer } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatDateShort, formatMoney } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const cust = ref<Record<string, unknown> | null>(null)
const showBlock = ref(false)
const blockReason = ref('')

const custBlocked = computed(() => !!(cust.value?.isBlocked ?? cust.value?.blocked))

const st = computed(() => cust.value?.stats as Record<string, unknown> | undefined)
const bookings = computed(() => {
  const b = cust.value?.bookings
  return Array.isArray(b) ? b : []
})

async function load() {
  loading.value = true
  try {
    const res = await getCustomerDetail(route.params.id as string)
    cust.value = res.data as Record<string, unknown>
  } catch (e) {
    cust.value = null
    toast.error(apiMessage(e))
  } finally {
    loading.value = false
  }
}

async function confirmBlock() {
  try {
    await blockCustomer(route.params.id as string, blockReason.value || '—')
    toast.success('تم الحظر')
    showBlock.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function doUnblock() {
  try {
    await unblockCustomer(route.params.id as string)
    toast.success('تم إلغاء الحظر')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
