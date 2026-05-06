<template>
  <div dir="rtl" class="space-y-5">
    <!-- Summary Cards -->
    <div v-if="summaryData" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
        style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-2 h-2 rounded-full" style="background: #257d75"></div>
          <p class="text-xs font-semibold" style="color: #9aadac">إجمالي العمولات</p>
        </div>
        <p class="text-2xl font-black" style="color: #0a2c2a">
          {{ summaryData.totalAmount?.toLocaleString() }}
          <span class="text-sm font-normal" style="color: #9aadac">د.ع</span>
        </p>
      </div>
      <div class="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
        style="background: #fef9e7; border: 1px solid #fde68a; box-shadow: 0 1px 4px rgba(242,180,21,0.1)">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-2 h-2 rounded-full" style="background: #f2b415"></div>
          <p class="text-xs font-semibold" style="color: #b45309">عمولات معلقة</p>
        </div>
        <p class="text-2xl font-black" style="color: #92400e">
          {{ summaryData.pendingAmount?.toLocaleString() }}
          <span class="text-sm font-normal opacity-60">د.ع</span>
        </p>
      </div>
      <div class="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
        style="background: #e8f5f4; border: 1px solid #d1ece9; box-shadow: 0 1px 4px rgba(37,125,117,0.1)">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-2 h-2 rounded-full" style="background: #257d75"></div>
          <p class="text-xs font-semibold" style="color: #1d6560">عمولات مدفوعة</p>
        </div>
        <p class="text-2xl font-black" style="color: #0a2c2a">
          {{ summaryData.paidAmount?.toLocaleString() }}
          <span class="text-sm font-normal opacity-60">د.ع</span>
        </p>
      </div>
    </div>

    <!-- Filter -->
    <div class="rounded-2xl p-4 flex gap-3"
      style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
      <button v-for="s in ['', 'Pending', 'Paid']" :key="s" @click="statusFilter=s; load()"
        class="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
        :style="statusFilter===s
          ? 'background: linear-gradient(135deg, #257d75, #1d6560); color: white; box-shadow: 0 2px 8px rgba(37,125,117,0.3)'
          : 'background: #f0f4f3; color: #6b7f7e'">
        {{ s === '' ? 'الكل' : s === 'Pending' ? 'معلقة' : 'مدفوعة' }}
      </button>
    </div>

    <!-- Table -->
    <div class="rounded-2xl overflow-hidden"
      style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
      <div v-if="loading" class="p-10 text-center">
        <div class="inline-block w-7 h-7 border-2 rounded-full animate-spin"
          style="border-color: rgba(37,125,117,0.2); border-top-color: #257d75"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr style="background: linear-gradient(135deg, #f8fbfb, #f0f4f3)">
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">المحل</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">الزبون</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">مبلغ الحجز</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">النسبة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">العمولة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">الحالة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">إجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in items" :key="c.id"
            class="border-t transition-all group"
            style="border-color: #f0f4f3"
            onmouseover="this.style.background='#f8fbfb'"
            onmouseout="this.style.background='transparent'">
            <td class="px-5 py-3.5">
              <p class="font-bold" style="color: #0a2c2a">{{ c.businessName }}</p>
              <p class="text-xs" style="color: #9aadac">{{ c.businessPhone }}</p>
            </td>
            <td class="px-5 py-3.5 text-sm" style="color: #6b7f7e">{{ c.customerName }}</td>
            <td class="px-5 py-3.5 font-semibold" style="color: #1a3c3a">{{ c.bookingAmount?.toLocaleString() }} د.ع</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background: #f0f4f3; color: #6b7f7e">
                {{ (c.commissionRate * 100).toFixed(0) }}%
              </span>
            </td>
            <td class="px-5 py-3.5 font-black text-sm" style="color: #f2b415">
              {{ c.commissionAmount?.toLocaleString() }} د.ع
            </td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                :style="c.paymentStatus === 'Paid'
                  ? 'background:#e8f5f4;color:#1d6560;border:1px solid #d1ece9'
                  : 'background:#fef9e7;color:#b45309;border:1px solid #fde68a'">
                {{ c.paymentStatus === 'Paid' ? 'مدفوع' : 'معلق' }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <button v-if="c.paymentStatus === 'Pending'"
                @click="markPaid(c.id)"
                class="text-xs px-3 py-1.5 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-all"
                style="background: linear-gradient(135deg, #257d75, #1d6560); color: white">
                تحديد كمدفوع
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-5 py-3 border-t flex justify-between" style="background:#f8fbfb; border-color:#f0f4f3">
        <p class="text-xs" style="color: #9aadac">إجمالي <span class="font-black" style="color: #0a2c2a">{{ total }}</span> عمولة</p>
        <div class="flex gap-1">
          <button v-for="p in Math.min(totalPages, 5)" :key="p" @click="page=p; load()"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
            :style="page===p
              ? 'background: linear-gradient(135deg, #257d75, #1d6560); color: white'
              : 'background: white; color: #6b7f7e; border: 1.5px solid #e2eded'">
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
