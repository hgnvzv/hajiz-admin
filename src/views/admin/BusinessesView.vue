<template>
  <div dir="rtl" class="space-y-5">
    <div class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3">
      <input v-model="search" @input="load" placeholder="بحث بالاسم أو الهاتف..."
        class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 flex-1 min-w-48" />
      <select v-model="cityFilter" @change="load"
        class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
        <option value="">كل المحافظات</option>
        <option v-for="c in cities" :key="c.id" :value="c.id">{{ c.nameAr }}</option>
      </select>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background: #F8FAFC">
          <tr>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">المحل</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">التصنيف</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">المحافظة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">التقييم</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الحالة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="b in items" :key="b.id" class="hover:bg-slate-50 transition-all group">
            <td class="px-5 py-3.5">
              <p class="font-semibold text-slate-900">{{ b.name }}</p>
              <p class="text-xs text-slate-500">{{ b.ownerName }} · {{ b.phone }}</p>
            </td>
            <td class="px-5 py-3.5 text-slate-600">{{ b.category }}</td>
            <td class="px-5 py-3.5 text-slate-600">{{ b.city }}</td>
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-1">
                <span class="text-yellow-400">⭐</span>
                <span class="font-bold text-slate-800">{{ b.avgRating?.toFixed(1) || '0.0' }}</span>
                <span class="text-xs text-slate-400">({{ b.totalReviews }})</span>
              </div>
            </td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                :style="b.isActive ? 'background:#F0FDF4;color:#047857' : 'background:#F8FAFC;color:#94A3B8'">
                {{ b.isActive ? '● نشط' : '● موقوف' }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <RouterLink :to="`/businesses/${b.id}`"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style="background: #EFF6FF; color: #2563EB">تفاصيل</RouterLink>
                <button @click="toggleStatus(b)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  :style="b.isActive ? 'background:#FEF2F2;color:#B91C1C' : 'background:#F0FDF4;color:#047857'">
                  {{ b.isActive ? 'إيقاف' : 'تفعيل' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-5 py-3 border-t border-slate-100 flex justify-between items-center" style="background:#F8FAFC">
        <p class="text-xs text-slate-500">إجمالي <span class="font-bold">{{ total }}</span> محل</p>
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
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const items = ref<any[]>([])
const cities = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const cityFilter = ref('')
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

async function load() {
  loading.value = true
  try {
    const res = await api.get('/admin/businesses', { params: {
      search: search.value || undefined,
      city: cityFilter.value || undefined,
      page: page.value, pageSize: 15
    }})
    items.value = res.data.items || []
    total.value = res.data.total || 0
    totalPages.value = res.data.totalPages || 1
  } finally { loading.value = false }
}

async function toggleStatus(b: any) {
  await api.put(`/admin/businesses/${b.id}/toggle`)
  load()
}

onMounted(async () => {
  const c = await api.get('/public/cities')
  cities.value = c.data
  load()
})
</script>
