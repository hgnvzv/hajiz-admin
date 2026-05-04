<template>
  <div dir="rtl" class="space-y-5">
    <div class="flex justify-between items-center">
      <h2 class="font-bold text-slate-800">التصنيفات والخدمات</h2>
      <button @click="showAddCat=true"
        class="px-4 py-2 rounded-xl text-sm font-bold text-white"
        style="background:linear-gradient(135deg,#2563EB,#1D4ED8)">+ تصنيف جديد</button>
    </div>

    <div class="space-y-4">
      <div v-for="cat in categories" :key="cat.id"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Category Header -->
        <div class="px-5 py-4 flex items-center gap-3 border-b border-slate-100" style="background:#F8FAFC">
          <span class="text-2xl">{{ cat.icon }}</span>
          <div class="flex-1">
            <p class="font-bold text-slate-900">{{ cat.nameAr }}</p>
            <p class="text-xs text-slate-500">{{ cat.businessCount }} محل · {{ cat.subCategories?.length || 0 }} خدمة</p>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full"
            :style="cat.isActive ? 'background:#F0FDF4;color:#047857' : 'background:#F8FAFC;color:#94A3B8'">
            {{ cat.isActive ? 'نشط' : 'موقوف' }}
          </span>
          <button @click="toggleCat(cat)"
            class="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            :style="cat.isActive ? 'background:#FEF2F2;color:#B91C1C' : 'background:#F0FDF4;color:#047857'">
            {{ cat.isActive ? 'إيقاف' : 'تفعيل' }}
          </button>
          <button @click="openAddSub(cat)"
            class="text-xs px-3 py-1.5 rounded-lg font-medium"
            style="background:#EFF6FF;color:#2563EB">+ خدمة</button>
        </div>
        <!-- Sub Categories -->
        <div class="p-4 flex flex-wrap gap-2">
          <span v-for="sub in cat.subCategories" :key="sub.id"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all"
            :style="sub.isActive ? 'background:#EFF6FF;border-color:#BFDBFE;color:#1D4ED8' : 'background:#F8FAFC;border-color:#E2E8F0;color:#94A3B8'">
            {{ sub.nameAr }}
            <button @click="toggleSub(sub)" class="hover:opacity-70 text-xs">
              {{ sub.isActive ? '✓' : '✕' }}
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddCat" class="fixed inset-0 flex items-center justify-center z-50 p-4"
      style="background:rgba(0,0,0,0.5)" @click.self="showAddCat=false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl">
        <h3 class="font-bold text-slate-900 text-lg mb-4">تصنيف جديد</h3>
        <div class="space-y-3">
          <input v-model="newCat.nameAr" placeholder="الاسم بالعربي" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          <input v-model="newCat.name" placeholder="Name in English" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          <input v-model="newCat.icon" placeholder="أيقونة (emoji)" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          <input v-model.number="newCat.displayOrder" type="number" placeholder="الترتيب" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div class="flex gap-3 mt-5">
          <button @click="showAddCat=false" class="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-700">إلغاء</button>
          <button @click="createCat" class="flex-1 py-2.5 rounded-xl text-sm text-white font-bold" style="background:linear-gradient(135deg,#2563EB,#1D4ED8)">إضافة</button>
        </div>
      </div>
    </div>

    <!-- Add Sub Modal -->
    <div v-if="showAddSub" class="fixed inset-0 flex items-center justify-center z-50 p-4"
      style="background:rgba(0,0,0,0.5)" @click.self="showAddSub=false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl">
        <h3 class="font-bold text-slate-900 text-lg mb-1">إضافة خدمة</h3>
        <p class="text-sm text-slate-500 mb-4">لـ {{ selectedCat?.nameAr }}</p>
        <div class="space-y-3">
          <input v-model="newSub.nameAr" placeholder="اسم الخدمة بالعربي" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          <input v-model="newSub.name" placeholder="Service name in English" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          <input v-model.number="newSub.displayOrder" type="number" placeholder="الترتيب" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div class="flex gap-3 mt-5">
          <button @click="showAddSub=false" class="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-700">إلغاء</button>
          <button @click="createSub" class="flex-1 py-2.5 rounded-xl text-sm text-white font-bold" style="background:linear-gradient(135deg,#2563EB,#1D4ED8)">إضافة</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const categories = ref<any[]>([])
const showAddCat = ref(false)
const showAddSub = ref(false)
const selectedCat = ref<any>(null)
const newCat = ref({ name: '', nameAr: '', icon: '🏪', displayOrder: 1 })
const newSub = ref({ name: '', nameAr: '', displayOrder: 1, categoryId: '' })

async function load() {
  const res = await api.get('/admin/categories')
  categories.value = res.data
}

async function toggleCat(cat: any) {
  await api.put(`/admin/categories/${cat.id}/toggle`)
  load()
}

async function toggleSub(sub: any) {
  await api.put(`/admin/categories/sub/${sub.id}/toggle`)
  load()
}

async function createCat() {
  await api.post('/admin/categories', newCat.value)
  showAddCat.value = false
  newCat.value = { name: '', nameAr: '', icon: '🏪', displayOrder: 1 }
  load()
}

function openAddSub(cat: any) {
  selectedCat.value = cat
  newSub.value.categoryId = cat.id
  showAddSub.value = true
}

async function createSub() {
  await api.post('/admin/categories/sub', newSub.value)
  showAddSub.value = false
  load()
}

onMounted(load)
</script>
