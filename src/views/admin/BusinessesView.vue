<template>
  <div dir="rtl" class="space-y-5">
    <!-- Filter Bar -->
    <div class="rounded-2xl p-4 flex flex-wrap gap-3"
      style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
      <div class="relative flex-1 min-w-48">
        <svg class="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" style="color: #9aadac"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input v-model="search" @input="load" placeholder="بحث بالاسم أو الهاتف..."
          class="w-full pr-9 pl-4 py-2 rounded-xl text-sm outline-none transition-all"
          style="border: 1.5px solid #e2eded; background: #f8fbfb"
          onfocus="this.style.borderColor='#257d75'"
          onblur="this.style.borderColor='#e2eded'" />
      </div>
      <select v-model="cityFilter" @change="load"
        class="px-3 py-2 rounded-xl text-sm outline-none transition-all"
        style="border: 1.5px solid #e2eded; background: #f8fbfb; color: #1a3c3a">
        <option value="">كل المحافظات</option>
        <option v-for="c in cities" :key="c.id" :value="c.id">{{ c.nameAr }}</option>
      </select>
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
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">التصنيف</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">المحافظة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">التقييم</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">الحالة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in items" :key="b.id"
            class="border-t transition-all group"
            style="border-color: #f0f4f3"
            onmouseover="this.style.background='#f8fbfb'"
            onmouseout="this.style.background='transparent'">
            <td class="px-5 py-3.5">
              <p class="font-bold" style="color: #0a2c2a">{{ b.name }}</p>
              <p class="text-xs" style="color: #9aadac">{{ b.ownerName }} · {{ b.phone }}</p>
            </td>
            <td class="px-5 py-3.5" style="color: #6b7f7e">{{ b.category }}</td>
            <td class="px-5 py-3.5" style="color: #6b7f7e">{{ b.city }}</td>
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-1">
                <span style="color: #f2b415">⭐</span>
                <span class="font-bold" style="color: #0a2c2a">{{ b.avgRating?.toFixed(1) || '0.0' }}</span>
                <span class="text-xs" style="color: #9aadac">({{ b.totalReviews }})</span>
              </div>
            </td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                :style="b.isActive
                  ? 'background:#e8f5f4; color:#1d6560; border:1px solid #d1ece9'
                  : 'background:#f0f4f3; color:#9aadac; border:1px solid #e2eded'">
                {{ b.isActive ? '● نشط' : '● موقوف' }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <RouterLink :to="`/businesses/${b.id}`"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-bold"
                  style="background: #e8f5f4; color: #257d75">تفاصيل</RouterLink>
                <button @click="toggleStatus(b)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-bold"
                  :style="b.isActive
                    ? 'background:#fef2f2;color:#b91c1c'
                    : 'background:#e8f5f4;color:#1d6560'">
                  {{ b.isActive ? 'إيقاف' : 'تفعيل' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-5 py-3 border-t flex justify-between items-center"
        style="background: #f8fbfb; border-color: #f0f4f3">
        <p class="text-xs" style="color: #9aadac">إجمالي <span class="font-black" style="color: #0a2c2a">{{ total }}</span> محل</p>
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
