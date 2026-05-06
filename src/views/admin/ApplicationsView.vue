<template>
  <div dir="rtl" class="space-y-5">
    <!-- Filter Bar -->
    <div class="rounded-2xl p-4 flex flex-wrap gap-3 items-center"
      style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
      <div class="flex gap-2 flex-wrap">
        <button v-for="s in statuses" :key="s.id" @click="filterStatus = s.id; load()"
          class="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
          :style="filterStatus === s.id
            ? 'background: linear-gradient(135deg, #257d75, #1d6560); color: white; box-shadow: 0 2px 8px rgba(37,125,117,0.3)'
            : 'background: #f0f4f3; color: #6b7f7e'">
          {{ s.label }}
          <span v-if="s.id === 'Pending' && pendingCount > 0"
            class="mr-1.5 text-xs px-1.5 py-0.5 rounded-full font-black"
            style="background: #f2b415; color: #0a2c2a">{{ pendingCount }}</span>
        </button>
      </div>
      <div class="mr-auto relative">
        <svg class="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" style="color: #9aadac"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input v-model="search" @input="load" placeholder="بحث..."
          class="pr-9 pl-4 py-2 rounded-xl text-sm outline-none transition-all"
          style="border: 1.5px solid #e2eded; background: #f8fbfb; width: 200px"
          onfocus="this.style.borderColor='#257d75'; this.style.boxShadow='0 0 0 3px rgba(37,125,117,0.1)'"
          onblur="this.style.borderColor='#e2eded'; this.style.boxShadow='none'" />
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-2xl overflow-hidden"
      style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
      <div v-if="loading" class="p-10 text-center">
        <div class="inline-block w-7 h-7 border-2 rounded-full animate-spin"
          style="border-color: rgba(37,125,117,0.2); border-top-color: #257d75"></div>
      </div>
      <div v-else-if="items.length === 0" class="p-14 text-center" style="color: #9aadac">
        <div class="text-5xl mb-3">📋</div>
        <p class="font-semibold">لا توجد طلبات</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr style="background: linear-gradient(135deg, #f8fbfb, #f0f4f3)">
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">صاحب المحل</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">المحل</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">التصنيف</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">المحافظة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">الحالة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">التاريخ</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in items" :key="app.id"
            class="border-t transition-all group"
            style="border-color: #f0f4f3"
            onmouseover="this.style.background='#f8fbfb'"
            onmouseout="this.style.background='transparent'">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style="background: linear-gradient(135deg, #f2b415, #d4990f); color: #0a2c2a">
                  {{ app.ownerName?.[0] }}
                </div>
                <span class="font-semibold" style="color: #1a3c3a">{{ app.ownerName }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5 font-bold" style="color: #0a2c2a">{{ app.businessName }}</td>
            <td class="px-5 py-3.5" style="color: #6b7f7e">{{ app.categoryName }}</td>
            <td class="px-5 py-3.5" style="color: #6b7f7e">{{ app.city }}</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="statusStyle(app.status)">
                {{ statusLabel(app.status) }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-xs" style="color: #9aadac">{{ formatDate(app.createdAt) }}</td>
            <td class="px-5 py-3.5">
              <RouterLink :to="`/applications/${app.id}`"
                class="text-xs px-3 py-1.5 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-all"
                style="background: #e8f5f4; color: #257d75">
                عرض التفاصيل
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-5 py-3 border-t flex items-center justify-between"
        style="background: #f8fbfb; border-color: #f0f4f3">
        <p class="text-xs" style="color: #9aadac">إجمالي <span class="font-black" style="color: #0a2c2a">{{ total }}</span> طلب</p>
        <div class="flex gap-1">
          <button v-for="p in totalPages" :key="p" @click="page = p; load()"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
            :style="page === p
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
const totalPages = ref(0)

const statuses = [
  { id: 'Pending', label: 'معلقة' },
  { id: 'Approved', label: 'مقبولة' },
  { id: 'Rejected', label: 'مرفوضة' },
  { id: '', label: 'الكل' },
]

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
    Pending: 'background: #fef9e7; color: #b45309; border: 1px solid #fde68a',
    Approved: 'background: #e8f5f4; color: #1d6560; border: 1px solid #d1ece9',
    Rejected: 'background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca',
  }
  return map[s] || 'background: #f0f4f3; color: #6b7f7e'
}
function statusLabel(s: string) {
  return { Pending: 'معلق', Approved: 'مقبول', Rejected: 'مرفوض' }[s] || s
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
