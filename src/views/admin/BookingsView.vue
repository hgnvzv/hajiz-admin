<template>
  <div dir="rtl" class="space-y-5">
    <div class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3">
      <div class="flex gap-2 flex-wrap">
        <button v-for="s in statuses" :key="s.id" @click="statusFilter=s.id; load()"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          :style="statusFilter===s.id ? 'background:linear-gradient(135deg,#2563EB,#1D4ED8);color:white' : 'background:#F1F5F9;color:#475569'">
          {{ s.label }}
        </button>
      </div>
      <input v-model="dateFilter" type="date" @change="load"
        class="border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 mr-auto" />
    </div>

    <!-- Summary -->
    <div v-if="summary" class="grid grid-cols-3 lg:grid-cols-6 gap-3">
      <div v-for="(val, key) in summaryCards" :key="key"
        class="bg-white rounded-xl border border-slate-200 p-3 text-center">
        <p class="text-xl font-bold text-slate-900">{{ val.count }}</p>
        <p class="text-xs text-slate-500">{{ val.label }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background:#F8FAFC">
          <tr>
            <th class="text-right px-4 py-3 text-xs font-bold text-slate-500">الزبون</th>
            <th class="text-right px-4 py-3 text-xs font-bold text-slate-500">المحل</th>
            <th class="text-right px-4 py-3 text-xs font-bold text-slate-500">الموظف</th>
            <th class="text-right px-4 py-3 text-xs font-bold text-slate-500">الموعد</th>
            <th class="text-right px-4 py-3 text-xs font-bold text-slate-500">المبلغ</th>
            <th class="text-right px-4 py-3 text-xs font-bold text-slate-500">الحالة</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="b in items" :key="b.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <p class="font-semibold text-slate-800">{{ b.customerName }}</p>
              <p class="text-xs text-slate-500">{{ b.customerPhone }}</p>
            </td>
            <td class="px-4 py-3 text-slate-600 text-xs">{{ b.businessName }}</td>
            <td class="px-4 py-3 text-slate-600 text-xs">{{ b.staffName }}</td>
            <td class="px-4 py-3 text-xs text-slate-600">{{ formatDateTime(b.bookedAt) }}</td>
            <td class="px-4 py-3 font-bold text-sm" style="color:#2563EB">{{ b.totalPrice?.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="statusStyle(b.status)">
                {{ statusLabel(b.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-5 py-3 border-t border-slate-100 flex justify-between" style="background:#F8FAFC">
        <p class="text-xs text-slate-500">إجمالي <span class="font-bold">{{ total }}</span> حجز</p>
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
    Pending: 'background:#FFFBEB;color:#B45309',
    Accepted: 'background:#EFF6FF;color:#1D4ED8',
    Completed: 'background:#F0FDF4;color:#047857',
    Cancelled: 'background:#FEF2F2;color:#B91C1C',
    Rejected: 'background:#FEF2F2;color:#B91C1C',
  }
  return map[s] || ''
}
function statusLabel(s: string) {
  return { Pending:'معلق', Accepted:'مقبول', Completed:'مكتمل', Cancelled:'ملغي', Rejected:'مرفوض' }[s] || s
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString('ar-IQ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(load)
</script>
