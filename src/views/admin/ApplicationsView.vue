<template>
  <div dir="rtl" class="space-y-5">
    <!-- Filter -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
      <div class="flex gap-2">
        <button v-for="s in statuses" :key="s.id" @click="filterStatus = s.id; load()"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          :style="filterStatus === s.id
            ? 'background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white'
            : 'background: #F1F5F9; color: #475569'">
          {{ s.label }}
          <span v-if="s.id === 'Pending' && pendingCount > 0"
            class="mr-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
            style="background: #DC2626; color: white">{{ pendingCount }}</span>
        </button>
      </div>
      <input v-model="search" @input="load" placeholder="بحث..."
        class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mr-auto" />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <div v-else-if="items.length === 0" class="p-12 text-center text-slate-400">
        <div class="text-5xl mb-3">📋</div>
        <p>لا توجد طلبات</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background: #F8FAFC">
          <tr>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">صاحب المحل</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">المحل</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">التصنيف</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">المحافظة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الحالة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">التاريخ</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="app in items" :key="app.id" class="hover:bg-slate-50 transition-all group">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style="background: linear-gradient(135deg, #7C3AED, #6D28D9)">
                  {{ app.ownerName?.[0] }}
                </div>
                <span class="font-medium text-slate-800">{{ app.ownerName }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5 font-semibold text-slate-900">{{ app.businessName }}</td>
            <td class="px-5 py-3.5 text-slate-600">{{ app.categoryName }}</td>
            <td class="px-5 py-3.5 text-slate-600">{{ app.city }}</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="statusStyle(app.status)">
                {{ statusLabel(app.status) }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-xs text-slate-500">{{ formatDate(app.createdAt) }}</td>
            <td class="px-5 py-3.5">
              <RouterLink :to="`/applications/${app.id}`"
                class="text-xs px-3 py-1.5 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all"
                style="background: #EFF6FF; color: #2563EB">
                عرض التفاصيل
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-5 py-3 border-t border-slate-100 flex items-center justify-between"
        style="background: #F8FAFC">
        <p class="text-xs text-slate-500">إجمالي <span class="font-bold">{{ total }}</span> طلب</p>
        <div class="flex gap-1">
          <button v-for="p in totalPages" :key="p" @click="page = p; load()"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
            :style="page === p
              ? 'background: #2563EB; color: white'
              : 'background: white; color: #475569; border: 1px solid #E2E8F0'">
            {{ p }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const items = ref<any[]>([])
const loading = ref(true)
const filterStatus = ref('Pending')
const search = ref('')
const page = ref(1)
const total = ref(0)
const pendingCount = ref(0)
const pageSize = 15

const statuses = [
  { id: 'Pending', label: 'معلقة' },
  { id: 'Approved', label: 'مقبولة' },
  { id: 'Rejected', label: 'مرفوضة' },
  { id: '', label: 'الكل' },
]

const totalPages = ref(0)

async function load() {
  loading.value = true
  try {
    const [res, pendingRes] = await Promise.all([
      api.get('/admin/applications', { params: {
        status: filterStatus.value || undefined,
        page: page.value, pageSize
      }}),
      api.get('/admin/applications', { params: { status: 'Pending', pageSize: 1 }})
    ])
    items.value = res.data.items || []
    total.value = res.data.total || 0
    totalPages.value = res.data.totalPages || 1
    pendingCount.value = pendingRes.data.total || 0
  } finally {
    loading.value = false
  }
}

onMounted(load)

function statusStyle(s: string) {
  const map: any = {
    Pending: 'background: #FFFBEB; color: #B45309',
    Approved: 'background: #F0FDF4; color: #047857',
    Rejected: 'background: #FEF2F2; color: #B91C1C',
  }
  return map[s] || 'background: #F8FAFC; color: #475569'
}
function statusLabel(s: string) {
  return { Pending: 'معلق', Approved: 'مقبول', Rejected: 'مرفوض' }[s] || s
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
