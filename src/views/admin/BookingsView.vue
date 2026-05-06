<template>
  <div dir="rtl" class="space-y-5">
    <!-- Filter Bar -->
    <div class="rounded-2xl p-4 flex flex-wrap gap-3"
      style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
      <div class="flex gap-2 flex-wrap">
        <button v-for="s in statuses" :key="s.id" @click="statusFilter=s.id; load()"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
          :style="statusFilter===s.id
            ? 'background: linear-gradient(135deg, #257d75, #1d6560); color: white; box-shadow: 0 2px 8px rgba(37,125,117,0.3)'
            : 'background: #f0f4f3; color: #6b7f7e'">
          {{ s.label }}
        </button>
      </div>
      <input v-model="dateFilter" type="date" @change="load"
        class="mr-auto px-3 py-1.5 rounded-xl text-sm outline-none transition-all"
        style="border: 1.5px solid #e2eded; background: #f8fbfb; color: #1a3c3a"
        onfocus="this.style.borderColor='#257d75'"
        onblur="this.style.borderColor='#e2eded'" />
    </div>

    <!-- Summary Cards -->
    <div v-if="summary" class="grid grid-cols-3 lg:grid-cols-6 gap-3">
      <div v-for="(val, key) in summaryCards" :key="key"
        class="rounded-xl p-3.5 text-center transition-all hover:-translate-y-0.5"
        style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 3px rgba(37,125,117,0.06)">
        <p class="text-2xl font-black" style="color: #0a2c2a">{{ val.count }}</p>
        <p class="text-xs mt-1" style="color: #9aadac">{{ val.label }}</p>
      </div>
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
            <th class="text-right px-4 py-3.5 text-xs font-black" style="color: #6b7f7e">الزبون</th>
            <th class="text-right px-4 py-3.5 text-xs font-black" style="color: #6b7f7e">المحل</th>
            <th class="text-right px-4 py-3.5 text-xs font-black" style="color: #6b7f7e">الموظف</th>
            <th class="text-right px-4 py-3.5 text-xs font-black" style="color: #6b7f7e">الموعد</th>
            <th class="text-right px-4 py-3.5 text-xs font-black" style="color: #6b7f7e">المبلغ</th>
            <th class="text-right px-4 py-3.5 text-xs font-black" style="color: #6b7f7e">الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in items" :key="b.id"
            class="border-t transition-all"
            style="border-color: #f0f4f3"
            onmouseover="this.style.background='#f8fbfb'"
            onmouseout="this.style.background='transparent'">
            <td class="px-4 py-3.5">
              <p class="font-bold" style="color: #0a2c2a">{{ b.customerName }}</p>
              <p class="text-xs" style="color: #9aadac">{{ b.customerPhone }}</p>
            </td>
            <td class="px-4 py-3.5 text-xs" style="color: #6b7f7e">{{ b.businessName }}</td>
            <td class="px-4 py-3.5 text-xs" style="color: #6b7f7e">{{ b.staffName }}</td>
            <td class="px-4 py-3.5 text-xs" style="color: #6b7f7e">{{ formatDateTime(b.bookedAt) }}</td>
            <td class="px-4 py-3.5 font-black text-sm" style="color: #f2b415">
              {{ b.totalPrice?.toLocaleString() }} د.ع
            </td>
            <td class="px-4 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="statusStyle(b.status)">
                {{ statusLabel(b.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-5 py-3 border-t flex justify-between" style="background:#f8fbfb; border-color:#f0f4f3">
        <p class="text-xs" style="color: #9aadac">إجمالي <span class="font-black" style="color: #0a2c2a">{{ total }}</span> حجز</p>
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
    Pending:   'background:#fef9e7;color:#b45309;border:1px solid #fde68a',
    Accepted:  'background:#e8f5f4;color:#1d6560;border:1px solid #d1ece9',
    Completed: 'background:#e8f5f4;color:#145550;border:1px solid #d1ece9',
    Cancelled: 'background:#fef2f2;color:#b91c1c;border:1px solid #fecaca',
    Rejected:  'background:#fef2f2;color:#b91c1c;border:1px solid #fecaca',
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
