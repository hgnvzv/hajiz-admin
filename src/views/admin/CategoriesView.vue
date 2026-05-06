<template>
  <div dir="rtl" class="space-y-5">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="w-1 h-6 rounded-full" style="background: linear-gradient(180deg, #f2b415, #257d75)"></div>
        <h2 class="font-black" style="color: #0a2c2a">التصنيفات والخدمات</h2>
      </div>
      <button @click="showAddCat=true"
        class="px-4 py-2 rounded-xl text-sm font-black text-white transition-all"
        style="background: linear-gradient(135deg, #257d75, #1d6560); box-shadow: 0 2px 8px rgba(37,125,117,0.3)">
        + تصنيف جديد
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="cat in categories" :key="cat.id"
        class="rounded-2xl overflow-hidden"
        style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
        <!-- Category Header -->
        <div class="px-5 py-4 flex items-center gap-3 border-b"
          style="background: linear-gradient(135deg, #f8fbfb, #f0f4f3); border-color: #e2eded">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style="background: linear-gradient(135deg, #e8f5f4, #d1ece9)">{{ cat.icon }}</div>
          <div class="flex-1">
            <p class="font-black" style="color: #0a2c2a">{{ cat.nameAr }}</p>
            <p class="text-xs" style="color: #9aadac">{{ cat.businessCount }} محل · {{ cat.subCategories?.length || 0 }} خدمة</p>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full"
            :style="cat.isActive
              ? 'background:#e8f5f4;color:#1d6560;border:1px solid #d1ece9'
              : 'background:#f0f4f3;color:#9aadac;border:1px solid #e2eded'">
            {{ cat.isActive ? 'نشط' : 'موقوف' }}
          </span>
          <button @click="toggleCat(cat)"
            class="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
            :style="cat.isActive
              ? 'background:#fef2f2;color:#b91c1c'
              : 'background:#e8f5f4;color:#1d6560'">
            {{ cat.isActive ? 'إيقاف' : 'تفعيل' }}
          </button>
          <button @click="openAddSub(cat)"
            class="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
            style="background: linear-gradient(135deg, #f2b415, #d4990f); color: #0a2c2a">
            + خدمة
          </button>
        </div>
        <!-- Sub Categories -->
        <div class="p-4 flex flex-wrap gap-2">
          <span v-for="sub in cat.subCategories" :key="sub.id"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all cursor-pointer"
            :style="sub.isActive
              ? 'background:#e8f5f4;border-color:#d1ece9;color:#1d6560'
              : 'background:#f8fbfb;border-color:#e2eded;color:#9aadac'">
            {{ sub.nameAr }}
            <button @click="toggleSub(sub)"
              class="hover:opacity-70 text-xs w-4 h-4 rounded-full flex items-center justify-center"
              :style="sub.isActive ? 'background:rgba(37,125,117,0.15)' : 'background:rgba(154,173,172,0.15)'">
              {{ sub.isActive ? '✓' : '✕' }}
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddCat" class="fixed inset-0 flex items-center justify-center z-50 p-4"
      style="background: rgba(10,44,42,0.6); backdrop-filter: blur(4px)"
      @click.self="showAddCat=false">
      <div class="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" dir="rtl">
        <div class="px-6 py-5 border-b"
          style="background: linear-gradient(135deg, #0a2c2a, #145550); border-color: rgba(255,255,255,0.08)">
          <div class="flex justify-between items-center">
            <h3 class="font-black text-white">تصنيف جديد</h3>
            <button @click="showAddCat=false"
              class="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style="color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.08)">✕</button>
          </div>
        </div>
        <div class="p-6 space-y-3" style="background: white">
          <input v-model="newCat.nameAr" placeholder="الاسم بالعربي"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'" onblur="this.style.borderColor='#e2eded'" />
          <input v-model="newCat.name" placeholder="Name in English"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'" onblur="this.style.borderColor='#e2eded'" />
          <input v-model="newCat.icon" placeholder="أيقونة (emoji)"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'" onblur="this.style.borderColor='#e2eded'" />
          <input v-model.number="newCat.displayOrder" type="number" placeholder="الترتيب"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'" onblur="this.style.borderColor='#e2eded'" />
        </div>
        <div class="flex gap-3 px-6 pb-6" style="background: white">
          <button @click="showAddCat=false"
            class="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style="border: 1.5px solid #e2eded; color: #6b7f7e">إلغاء</button>
          <button @click="createCat"
            class="flex-1 py-2.5 rounded-xl text-sm font-black text-white"
            style="background: linear-gradient(135deg, #257d75, #1d6560); box-shadow: 0 3px 12px rgba(37,125,117,0.25)">إضافة</button>
        </div>
      </div>
    </div>

    <!-- Add Sub Modal -->
    <div v-if="showAddSub" class="fixed inset-0 flex items-center justify-center z-50 p-4"
      style="background: rgba(10,44,42,0.6); backdrop-filter: blur(4px)"
      @click.self="showAddSub=false">
      <div class="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" dir="rtl">
        <div class="px-6 py-5 border-b"
          style="background: linear-gradient(135deg, #0a2c2a, #145550); border-color: rgba(255,255,255,0.08)">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-black text-white">إضافة خدمة</h3>
              <p class="text-xs mt-0.5" style="color: rgba(255,255,255,0.4)">لـ {{ selectedCat?.nameAr }}</p>
            </div>
            <button @click="showAddSub=false"
              class="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style="color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.08)">✕</button>
          </div>
        </div>
        <div class="p-6 space-y-3" style="background: white">
          <input v-model="newSub.nameAr" placeholder="اسم الخدمة بالعربي"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'" onblur="this.style.borderColor='#e2eded'" />
          <input v-model="newSub.name" placeholder="Service name in English"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'" onblur="this.style.borderColor='#e2eded'" />
          <input v-model.number="newSub.displayOrder" type="number" placeholder="الترتيب"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'" onblur="this.style.borderColor='#e2eded'" />
        </div>
        <div class="flex gap-3 px-6 pb-6" style="background: white">
          <button @click="showAddSub=false"
            class="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style="border: 1.5px solid #e2eded; color: #6b7f7e">إلغاء</button>
          <button @click="createSub"
            class="flex-1 py-2.5 rounded-xl text-sm font-black text-white"
            style="background: linear-gradient(135deg, #257d75, #1d6560); box-shadow: 0 3px 12px rgba(37,125,117,0.25)">إضافة</button>
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
