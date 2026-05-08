<template>
  <div dir="rtl" class="space-y-5">
    <!-- Summary Cards -->
    <div v-if="summaryData" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card p-6 transform hover:scale-105 transition-all">
        <p class="text-xs text-gray-500 mb-2 font-medium">💰 إجمالي العمولات</p>
        <p class="text-3xl font-bold text-teal-700">{{ summaryData.totalAmount?.toLocaleString() }} <span class="text-sm font-normal text-gray-400">د.ع</span></p>
      </div>
      <div class="rounded-2xl border-2 p-6 transform hover:scale-105 transition-all" style="background: linear-gradient(135deg, #fff5e1, #fffaf0); border-color: #fde68a;">
        <p class="text-xs mb-2 font-medium" style="color: #b8860b;">⏳ عمولات معلقة</p>
        <p class="text-3xl font-bold" style="color: #92400E;">{{ summaryData.pendingAmount?.toLocaleString() }} <span class="text-sm font-normal opacity-60">د.ع</span></p>
      </div>
      <div class="rounded-2xl border-2 p-6 transform hover:scale-105 transition-all" style="background: linear-gradient(135deg, #d1f5ea, #f0faf8); border-color: #a8e6d8;">
        <p class="text-xs mb-2 font-medium" style="color: #0d5f54;">✅ عمولات مدفوعة</p>
        <p class="text-3xl font-bold" style="color: #0d5f54;">{{ summaryData.paidAmount?.toLocaleString() }} <span class="text-sm font-normal opacity-60">د.ع</span></p>
      </div>
    </div>

    <!-- Filter -->
    <div class="card p-6 flex gap-3 flex-wrap">
      <button v-for="s in ['', 'Pending', 'Paid']" :key="s" @click="statusFilter=s; load()"
        class="px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105"
        :class="statusFilter===s ? 'text-white shadow-lg' : 'bg-gray-100 text-teal-700 hover:bg-gray-200'"
        :style="statusFilter===s ? 'background: linear-gradient(135deg, #257d75, #1d6560);' : ''">
        {{ s === '' ? '📋 الكل' : s === 'Pending' ? '⏳ معلقة' : '✅ مدفوعة' }}
      </button>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block w-8 h-8 border-4 rounded-full animate-spin" style="border-color: #d1ece9; border-top-color: #257d75;"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background: linear-gradient(135deg, #257d75, #1d6560);">
          <tr>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المحل</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الزبون</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">مبلغ الحجز</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">النسبة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">العمولة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الحالة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">إجراء</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="c in items" :key="c.id" class="hover:bg-gray-50 transition-all group">
            <td class="px-6 py-4">
              <p class="font-semibold text-teal-700">{{ c.businessName }}</p>
              <p class="text-xs text-gray-500">{{ c.businessPhone }}</p>
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ c.customerName }}</td>
            <td class="px-6 py-4 font-semibold text-teal-700">{{ c.bookingAmount?.toLocaleString() }} د.ع</td>
            <td class="px-6 py-4 text-gray-600 font-bold">{{ (c.commissionRate * 100).toFixed(0) }}%</td>
            <td class="px-6 py-4 font-bold text-gold-600 text-sm">{{ c.commissionAmount?.toLocaleString() }} د.ع</td>
            <td class="px-6 py-4">
              <span class="text-xs font-bold px-3 py-1 rounded-full"
                :style="c.paymentStatus === 'Paid' ? 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54; border: 1px solid #a8e6d8;' : 'background: linear-gradient(135deg, #fff5e1, #fffaf0); color: #b8860b; border: 1px solid #fde68a;'">
                {{ c.paymentStatus === 'Paid' ? '✅ مدفوع' : '⏳ معلق' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button v-if="c.paymentStatus === 'Pending'"
                @click="markPaid(c.id)"
                class="text-xs px-3 py-2 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-all"
                style="background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54;">
                تحديد كمدفوع
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
        <p class="text-xs text-gray-600 font-medium">إجمالي <span class="font-bold text-teal-700">{{ total }}</span> عمولة</p>
        <div class="flex gap-1">
          <button v-for="p in Math.min(totalPages, 5)" :key="p" @click="page=p; load()"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all transform hover:scale-110"
            :style="page===p ? 'background: linear-gradient(135deg, #257d75, #1d6560); color: white;' : 'background: white; color: #1d6560; border: 2px solid #d1ece9;'">
            {{ p }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const items = ref<any[]>([])
const summaryData = ref<any>(null)
const loading = ref(true)
const statusFilter = ref('')
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

async function load() {
  loading.value = true
  try {
    const res = await api.get('/admin/commissions', { params: {
      status: statusFilter.value || undefined,
      page: page.value, pageSize: 20
    }})
    items.value = res.data.items || []
    summaryData.value = res.data.summary
    total.value = res.data.total || 0
    totalPages.value = res.data.totalPages || 1
  } finally { loading.value = false }
}

async function markPaid(id: string) {
  await api.put(`/admin/commissions/${id}/mark-paid`)
  load()
}

onMounted(load)
</script>
