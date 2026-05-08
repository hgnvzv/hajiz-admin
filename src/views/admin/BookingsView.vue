<template>
  <div dir="rtl" class="space-y-6">
    <!-- Filters -->
    <div class="card">
      <div class="p-6 flex flex-wrap gap-3">
        <div class="flex gap-2 flex-wrap">
          <button v-for="s in statuses" :key="s.id" @click="statusFilter=s.id; load()"
            class="px-3 py-2 rounded-lg text-xs font-bold transition-all transform hover:scale-105"
            :class="statusFilter===s.id ? 'text-white shadow-lg' : 'bg-gray-100 text-teal-700 hover:bg-gray-200'"
            :style="statusFilter===s.id ? 'background: linear-gradient(135deg, #257d75, #1d6560);' : ''">
            {{ s.label }}
          </button>
        </div>
        <input v-model="dateFilter" type="date" @change="load"
          class="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600 mr-auto"
          style="color: #1d6560;" />
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="summary" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div v-for="(val, key) in summaryCards" :key="key"
        class="card p-4 text-center cursor-pointer group transform hover:scale-105 transition-all">
        <p class="text-2xl font-bold text-teal-700 group-hover:text-gold-600 transition-colors">{{ val.count }}</p>
        <p class="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{{ val.label }}</p>
      </div>
    </div>

    <!-- Bookings Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block w-8 h-8 border-4 rounded-full animate-spin" style="border-color: #d1ece9; border-top-color: #257d75;"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background: linear-gradient(135deg, #257d75, #1d6560);">
          <tr>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الزبون</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المحل</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الموظف</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الموعد</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المبلغ</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الحالة</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="b in items" :key="b.id" class="hover:bg-gray-50 transition-all">
            <td class="px-6 py-4">
              <p class="font-semibold text-teal-700">{{ b.customerName }}</p>
              <p class="text-xs text-gray-500">{{ b.customerPhone }}</p>
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm font-medium">{{ b.businessName }}</td>
            <td class="px-6 py-4 text-gray-600 text-xs">{{ b.staffName }}</td>
            <td class="px-6 py-4 text-xs text-gray-600">{{ formatDateTime(b.bookedAt) }}</td>
            <td class="px-6 py-4 font-bold text-gold-600 text-sm">{{ b.totalPrice?.toLocaleString() }}</td>
            <td class="px-6 py-4">
              <span class="text-xs font-bold px-3 py-1 rounded-full" :style="statusStyle(b.status)">
                {{ statusLabel(b.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
        <p class="text-xs text-gray-600 font-medium">إجمالي <span class="font-bold text-teal-700">{{ total }}</span> حجز</p>
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
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const items = ref<any[]>([])
const summary = ref<any>(null)
const loading = ref(true)
const statusFilter = ref('')
const dateFilter = ref('')
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

const statuses = [
  { id: '', label: 'الكل' },
  { id: 'Pending', label: 'معلق' },
  { id: 'Accepted', label: 'مقبول' },
  { id: 'Completed', label: 'مكتمل' },
  { id: 'Cancelled', label: 'ملغي' },
  { id: 'Rejected', label: 'مرفوض' },
]

const summaryCards = computed(() => summary.value ? [
  { label: 'الكل', count: summary.value.total },
  { label: 'معلق', count: summary.value.pending },
  { label: 'مقبول', count: summary.value.accepted },
  { label: 'مكتمل', count: summary.value.completed },
  { label: 'ملغي', count: summary.value.cancelled },
  { label: 'مرفوض', count: summary.value.rejected },
] : [])

async function load() {
  loading.value = true
  try {
    const res = await api.get('/admin/bookings', { params: {
      status: statusFilter.value || undefined,
      date: dateFilter.value || undefined,
      page: page.value, pageSize: 20
    }})
    items.value = res.data.items || []
    summary.value = res.data.summary
    total.value = res.data.items?.length || 0
    totalPages.value = res.data.totalPages || 1
  } finally { loading.value = false }
}

function statusStyle(s: string) {
  const map: any = {
    Pending: 'background: linear-gradient(135deg, #fff5e1, #fffaf0); color: #b8860b; border: 1px solid #fde68a;',
    Accepted: 'background: linear-gradient(135deg, #e8f5f4, #d1ece9); color: #1d6560; border: 1px solid #d1ece9;',
    Completed: 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54; border: 1px solid #a8e6d8;',
    Cancelled: 'background: linear-gradient(135deg, #fee, #fff5f5); color: #a00; border: 1px solid #fcc;',
    Rejected: 'background: linear-gradient(135deg, #fee, #fff5f5); color: #a00; border: 1px solid #fcc;',
  }
  return map[s] || 'background: linear-gradient(135deg, #f0f4f3, #e8f5f4); color: #1d6560; border: 1px solid #d1ece9;'
}
function statusLabel(s: string) {
  return { Pending:'⏳ معلق', Accepted:'✅ مقبول', Completed:'🎉 مكتمل', Cancelled:'🚫 ملغي', Rejected:'❌ مرفوض' }[s] || s
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString('ar-IQ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(load)
</script>
