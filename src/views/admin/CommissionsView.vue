<template>
  <div dir="rtl" class="space-y-5">
    <!-- Summary Cards -->
    <div v-if="summaryData" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl border border-slate-200 p-5">
        <p class="text-xs text-slate-500 mb-1">إجمالي العمولات</p>
        <p class="text-2xl font-bold text-slate-900">{{ summaryData.totalAmount?.toLocaleString() }} <span class="text-sm font-normal text-slate-400">د.ع</span></p>
      </div>
      <div class="rounded-2xl border p-5" style="background:#FFFBEB;border-color:#FDE68A">
        <p class="text-xs mb-1" style="color:#B45309">عمولات معلقة</p>
        <p class="text-2xl font-bold" style="color:#92400E">{{ summaryData.pendingAmount?.toLocaleString() }} <span class="text-sm font-normal opacity-60">د.ع</span></p>
      </div>
      <div class="rounded-2xl border p-5" style="background:#F0FDF4;border-color:#BBF7D0">
        <p class="text-xs mb-1" style="color:#047857">عمولات مدفوعة</p>
        <p class="text-2xl font-bold" style="color:#065F46">{{ summaryData.paidAmount?.toLocaleString() }} <span class="text-sm font-normal opacity-60">د.ع</span></p>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 flex gap-3">
      <button v-for="s in ['', 'Pending', 'Paid']" :key="s" @click="statusFilter=s; load()"
        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        :style="statusFilter===s ? 'background:linear-gradient(135deg,#2563EB,#1D4ED8);color:white' : 'background:#F1F5F9;color:#475569'">
        {{ s === '' ? 'الكل' : s === 'Pending' ? 'معلقة' : 'مدفوعة' }}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background:#F8FAFC">
          <tr>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">المحل</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الزبون</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">مبلغ الحجز</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">النسبة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">العمولة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الحالة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">إجراء</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="c in items" :key="c.id" class="hover:bg-slate-50 transition-all group">
            <td class="px-5 py-3.5">
              <p class="font-semibold text-slate-800">{{ c.businessName }}</p>
              <p class="text-xs text-slate-500">{{ c.businessPhone }}</p>
            </td>
            <td class="px-5 py-3.5 text-slate-600 text-sm">{{ c.customerName }}</td>
            <td class="px-5 py-3.5 font-semibold text-slate-800">{{ c.bookingAmount?.toLocaleString() }} د.ع</td>
            <td class="px-5 py-3.5 text-slate-600">{{ (c.commissionRate * 100).toFixed(0) }}%</td>
            <td class="px-5 py-3.5 font-bold text-sm" style="color:#2563EB">{{ c.commissionAmount?.toLocaleString() }} د.ع</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                :style="c.paymentStatus === 'Paid' ? 'background:#F0FDF4;color:#047857' : 'background:#FFFBEB;color:#B45309'">
                {{ c.paymentStatus === 'Paid' ? 'مدفوع' : 'معلق' }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <button v-if="c.paymentStatus === 'Pending'"
                @click="markPaid(c.id)"
                class="text-xs px-3 py-1.5 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all"
                style="background:#F0FDF4;color:#047857">
                تحديد كمدفوع
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-5 py-3 border-t border-slate-100 flex justify-between" style="background:#F8FAFC">
        <p class="text-xs text-slate-500">إجمالي <span class="font-bold">{{ total }}</span> عمولة</p>
        <div class="flex gap-1">
          <button v-for="p in Math.min(totalPages, 5)" :key="p" @click="page=p; load()"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
            :style="page===p ? 'background:#2563EB;color:white' : 'background:white;color:#475569;border:1px solid #E2E8F0'">
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
