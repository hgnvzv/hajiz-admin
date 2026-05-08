<template>
  <div dir="rtl" class="space-y-5">
    <div class="flex justify-between items-center mb-6">
      <h2 class="font-bold text-2xl text-teal-700">🗂️ التصنيفات والخدمات</h2>
      <button @click="showAddCat=true"
        class="px-4 py-3 rounded-lg text-sm font-bold text-white transform hover:scale-105 transition-all shadow-lg"
        style="background: linear-gradient(135deg, #f2b415, #d4990f);">➕ تصنيف جديد</button>
    </div>

    <div class="space-y-4">
      <div v-for="cat in categories" :key="cat.id"
        class="card overflow-hidden hover:shadow-lg transition-all">
        <!-- Category Header -->
        <div class="px-6 py-4 flex items-center gap-4 border-b border-gray-100" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
          <span class="text-3xl">{{ cat.icon }}</span>
          <div class="flex-1">
            <p class="font-bold text-teal-700 text-lg">{{ cat.nameAr }}</p>
            <p class="text-xs text-gray-500">🏪 {{ cat.businessCount }} محل • 📋 {{ cat.subCategories?.length || 0 }} خدمة</p>
          </div>
          <span class="text-xs font-bold px-3 py-1 rounded-full"
            :style="cat.isActive ? 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54; border: 1px solid #a8e6d8;' : 'background: linear-gradient(135deg, #f0f4f3, #e8f5f4); color: #999; border: 1px solid #d1ece9;'">
            {{ cat.isActive ? '🟢 نشط' : '⚫ موقوف' }}
          </span>
          <button @click="toggleCat(cat)"
            class="text-xs px-3 py-2 rounded-lg font-bold transition-all"
            :style="cat.isActive ? 'background: #fee; color: #a00;' : 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54;'">
            {{ cat.isActive ? '⏸️ إيقاف' : '▶️ تفعيل' }}
          </button>
          <button @click="openAddSub(cat)"
            class="text-xs px-3 py-2 rounded-lg font-bold"
            style="background: linear-gradient(135deg, #e8f5f4, #d1ece9); color: #1d6560;">➕ خدمة</button>
        </div>
        <!-- Sub Categories -->
        <div class="p-6 flex flex-wrap gap-3">
          <span v-for="sub in cat.subCategories" :key="sub.id"
            class="flex items-center gap-2 px-4 py-2 rounded-full text-sm border font-medium transition-all transform hover:scale-105"
            :style="sub.isActive ? 'background: linear-gradient(135deg, #e8f5f4, #d1ece9); border-color: #257d75; color: #1d6560;' : 'background: linear-gradient(135deg, #f0f4f3, #e8f5f4); border-color: #d1ece9; color: #999;'">
            {{ sub.nameAr }}
            <button @click="toggleSub(sub)" class="hover:opacity-70 text-lg font-bold">
              {{ sub.isActive ? '✓' : '✕' }}
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddCat" class="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      style="background: rgba(0,0,0,0.5);" @click.self="showAddCat=false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" dir="rtl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-teal-700 text-xl">➕ تصنيف جديد</h3>
          <button @click="showAddCat=false" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
        </div>
        <div class="space-y-4">
          <input v-model="newCat.nameAr" placeholder="الاسم بالعربي" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600" style="color: #1d6560;" />
          <input v-model="newCat.name" placeholder="Name in English" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600" style="color: #1d6560;" />
          <input v-model="newCat.icon" placeholder="أيقونة (emoji)" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600" style="color: #1d6560;" />
          <input v-model.number="newCat.displayOrder" type="number" placeholder="الترتيب" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600" style="color: #1d6560;" />
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showAddCat=false" class="flex-1 py-3 rounded-lg text-sm border-2 border-gray-200 text-teal-700 font-bold hover:bg-gray-50 transition-all">إلغاء</button>
          <button @click="createCat" class="flex-1 py-3 rounded-lg text-sm text-white font-bold transform hover:scale-105 transition-all" style="background: linear-gradient(135deg, #f2b415, #d4990f);">إضافة</button>
        </div>
      </div>
    </div>

    <!-- Add Sub Modal -->
    <div v-if="showAddSub" class="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      style="background: rgba(0,0,0,0.5);" @click.self="showAddSub=false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" dir="rtl">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-teal-700 text-xl">➕ إضافة خدمة</h3>
          <button @click="showAddSub=false" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
        </div>
        <p class="text-sm text-gray-600 mb-6">لـ <span class="font-bold text-gold-600">{{ selectedCat?.nameAr }}</span></p>
        <div class="space-y-4">
          <input v-model="newSub.nameAr" placeholder="اسم الخدمة بالعربي" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600" style="color: #1d6560;" />
          <input v-model="newSub.name" placeholder="Service name in English" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600" style="color: #1d6560;" />
          <input v-model.number="newSub.displayOrder" type="number" placeholder="الترتيب" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600" style="color: #1d6560;" />
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showAddSub=false" class="flex-1 py-3 rounded-lg text-sm border-2 border-gray-200 text-teal-700 font-bold hover:bg-gray-50 transition-all">إلغاء</button>
          <button @click="createSub" class="flex-1 py-3 rounded-lg text-sm text-white font-bold transform hover:scale-105 transition-all" style="background: linear-gradient(135deg, #f2b415, #d4990f);">إضافة</button>
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
