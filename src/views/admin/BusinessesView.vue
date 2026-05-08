<template>
  <div dir="rtl" class="space-y-6">
    <!-- Filters -->
    <div class="card">
      <div class="p-6 flex flex-wrap gap-3">
        <input v-model="search" @input="load" placeholder="🔍 البحث بالاسم أو الهاتف..."
          class="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600 flex-1 min-w-48"
          style="color: #1d6560;" />
        <select v-model="cityFilter" @change="load"
          class="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600"
          style="color: #1d6560;">
          <option value="">كل المحافظات</option>
          <option v-for="c in cities" :key="c.id" :value="c.id">{{ c.nameAr }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block w-8 h-8 border-4" style="border-color: #d1ece9; border-top-color: #257d75; animation: spin 1s linear infinite"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background: linear-gradient(135deg, #257d75, #1d6560);">
          <tr>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المحل</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">التصنيف</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المحافظة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">التقييم</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الحالة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="b in items" :key="b.id" class="hover:bg-gray-50 transition-all group">
            <td class="px-6 py-4">
              <p class="font-semibold text-teal-700">{{ b.name }}</p>
              <p class="text-xs text-gray-500">{{ b.ownerName }} • {{ b.phone }}</p>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ b.category }}</td>
            <td class="px-6 py-4 text-gray-600">{{ b.city }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-1">
                <span class="text-yellow-500">⭐</span>
                <span class="font-bold text-teal-700">{{ b.avgRating?.toFixed(1) || '0.0' }}</span>
                <span class="text-xs text-gray-400">({{ b.totalReviews }})</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs font-bold px-3 py-1 rounded-full"
                :style="b.isActive ? 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54; border: 1px solid #a8e6d8;' : 'background: linear-gradient(135deg, #f0f4f3, #e8f5f4); color: #999; border: 1px solid #d1ece9;'">
                {{ b.isActive ? '🟢 نشط' : '⚫ موقوف' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <RouterLink :to="`/businesses/${b.id}`"
                  class="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                  style="background: linear-gradient(135deg, #e8f5f4, #d1ece9); color: #1d6560;">تفاصيل</RouterLink>
                <button @click="toggleStatus(b)"
                  class="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                  :style="b.isActive ? 'background: #fee; color: #a00;' : 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54;'">
                  {{ b.isActive ? '⏸️ إيقاف' : '▶️ تفعيل' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
        <p class="text-xs text-gray-600 font-medium">إجمالي <span class="font-bold text-teal-700">{{ total }}</span> محل</p>
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
