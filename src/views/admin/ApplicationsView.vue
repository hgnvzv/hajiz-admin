<template>
  <div dir="rtl" class="space-y-6">
    <!-- Filter & Search -->
    <div class="card">
      <div class="p-6 flex flex-wrap gap-3 items-center">
        <div class="flex gap-2 flex-wrap">
          <button v-for="s in statuses" :key="s.id" @click="filterStatus = s.id; load()"
            class="px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105"
            :class="filterStatus === s.id
              ? 'text-white shadow-lg'
              : 'bg-gray-100 text-teal-700 hover:bg-gray-200'"
            :style="filterStatus === s.id ? 'background: linear-gradient(135deg, #257d75, #1d6560);' : ''">
            {{ s.label }}
            <span v-if="s.id === 'Pending' && pendingCount > 0"
              class="mr-2 text-xs px-2 py-0.5 rounded-full font-bold"
              style="background: rgba(255,255,255,0.3); color: white;">{{ pendingCount }}</span>
          </button>
        </div>
        <input v-model="search" @input="load" placeholder="🔍 البحث عن طلب..."
          class="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600 mr-auto"
          style="color: #1d6560;" />
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block w-8 h-8 border-4" style="border-color: #d1ece9; border-top-color: #257d75; animation: spin 1s linear infinite"></div>
      </div>
      <div v-else-if="items.length === 0" class="p-16 text-center">
        <div class="text-6xl mb-4">📋</div>
        <p class="text-gray-500 font-medium">لا توجد طلبات</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background: linear-gradient(135deg, #257d75, #1d6560);">
          <tr>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">صاحب المحل</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المحل</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">التصنيف</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المحافظة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الحالة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">التاريخ</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="app in items" :key="app.id" class="hover:bg-gray-50 transition-all group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style="background: linear-gradient(135deg, #f2b415, #d4990f)">
                  {{ app.ownerName?.[0] }}
                </div>
                <span class="font-semibold text-teal-700">{{ app.ownerName }}</span>
              </div>
            </td>
            <td class="px-6 py-4 font-semibold text-teal-700">{{ app.businessName }}</td>
            <td class="px-6 py-4 text-gray-600">{{ app.categoryName }}</td>
            <td class="px-6 py-4 text-gray-600">{{ app.city }}</td>
            <td class="px-6 py-4">
              <span class="text-xs font-bold px-3 py-1 rounded-full" :style="statusStyle(app.status)">
                {{ statusLabel(app.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-xs text-gray-500">{{ formatDate(app.createdAt) }}</td>
            <td class="px-6 py-4">
              <RouterLink :to="`/applications/${app.id}`"
                class="text-xs px-3 py-2 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105"
                style="background: linear-gradient(135deg, #e8f5f4, #d1ece9); color: #1d6560;">
                عرض التفاصيل
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between"
        style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
        <p class="text-xs text-gray-600 font-medium">إجمالي <span class="font-bold text-teal-700">{{ total }}</span> طلب</p>
        <div class="flex gap-1">
          <button v-for="p in totalPages" :key="p" @click="page = p; load()"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all transform hover:scale-110"
            :style="page === p
              ? 'background: linear-gradient(135deg, #257d75, #1d6560); color: white;'
              : 'background: white; color: #1d6560; border: 2px solid #d1ece9;'">
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
  { id: 'Pending', label: '⏳ معلقة' },
  { id: 'Approved', label: '✅ مقبولة' },
  { id: 'Rejected', label: '❌ مرفوضة' },
  { id: '', label: '📋 الكل' },
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
    Pending: 'background: linear-gradient(135deg, #fff5e1, #fffaf0); color: #b8860b; border: 1px solid #fde68a;',
    Approved: 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54; border: 1px solid #a8e6d8;',
    Rejected: 'background: linear-gradient(135deg, #fee, #fff5f5); color: #a00; border: 1px solid #fcc;',
  }
  return map[s] || 'background: linear-gradient(135deg, #f0f4f3, #e8f5f4); color: #1d6560; border: 1px solid #d1ece9;'
}

function statusLabel(s: string) {
  return { Pending: 'معلق ⏳', Approved: 'مقبول ✅', Rejected: 'مرفوض ❌' }[s] || s
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
