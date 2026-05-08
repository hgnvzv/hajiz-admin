<template>
  <div dir="rtl" class="space-y-6">
    <!-- Filters -->
    <div class="card">
      <div class="p-6 flex flex-wrap gap-3">
        <div class="flex gap-2 flex-wrap">
          <button v-for="t in types" :key="t.id" @click="typeFilter=t.id; load()"
            class="px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105"
            :class="typeFilter===t.id ? 'text-white shadow-lg' : 'bg-gray-100 text-teal-700 hover:bg-gray-200'"
            :style="typeFilter===t.id ? 'background: linear-gradient(135deg, #257d75, #1d6560);' : ''">
            {{ t.label }}
          </button>
        </div>
        <input v-model="search" @input="load" placeholder="🔍 البحث بالاسم أو الهاتف..."
          class="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-600 flex-1 min-w-48"
          style="color: #1d6560;" />
        <button @click="showCreate=true"
          class="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transform hover:scale-105 transition-all"
          style="background: linear-gradient(135deg, #f2b415, #d4990f);">➕ إضافة أدمن</button>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block w-8 h-8 border-4" style="border-color: #d1ece9; border-top-color: #257d75;"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background: linear-gradient(135deg, #257d75, #1d6560);">
          <tr>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المستخدم</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الهاتف</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">النوع</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">المحافظة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">الحالة</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">التاريخ</th>
            <th class="text-right px-6 py-4 text-xs font-bold text-white">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="u in items" :key="u.id" class="hover:bg-gray-50 transition-all group">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  :style="`background: linear-gradient(135deg, ${typeColor(u.userType)}, ${typeColorDark(u.userType)})`">{{ u.fullName?.[0] }}</div>
                <div>
                  <p class="font-semibold text-teal-700">{{ u.fullName }}</p>
                  <p v-if="u.extra" class="text-xs text-gray-500">{{ u.extra }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ u.phone }}</td>
            <td class="px-6 py-4">
              <span class="text-xs font-bold px-3 py-1 rounded-full"
                :style="typeStyle(u.userType)">{{ typeLabel(u.userType) }}</span>
            </td>
            <td class="px-6 py-4 text-gray-600 text-xs">{{ u.city || '—' }}</td>
            <td class="px-6 py-4">
              <span class="text-xs font-bold px-3 py-1 rounded-full"
                :style="u.isActive ? 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54; border: 1px solid #a8e6d8;' : 'background: linear-gradient(135deg, #f0f4f3, #e8f5f4); color: #999; border: 1px solid #d1ece9;'">
                {{ u.isActive ? '🟢 نشط' : '⚫ موقوف' }}
              </span>
            </td>
            <td class="px-6 py-4 text-xs text-gray-500">{{ formatDate(u.createdAt) }}</td>
            <td class="px-6 py-4">
              <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="toggleStatus(u)"
                  class="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                  :style="u.isActive ? 'background: #fee; color: #a00;' : 'background: linear-gradient(135deg, #d1f5ea, #f0faf8); color: #0d5f54;'">
                  {{ u.isActive ? '⏸️ إيقاف' : '▶️ تفعيل' }}
                </button>
                <button @click="deleteUser(u)"
                  class="text-xs px-3 py-2 rounded-lg font-bold"
                  style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4); color: #1d6560;">🗑️ حذف</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between" style="background: linear-gradient(135deg, #f0f4f3, #e8f5f4);">
        <p class="text-xs text-gray-600 font-medium">إجمالي <span class="font-bold text-teal-700">{{ total }}</span> مستخدم</p>
      </div>
    </div>

    <!-- Create Admin Modal -->
    <div v-if="showCreate" class="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      style="background: rgba(0,0,0,0.5);" @click.self="showCreate=false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" dir="rtl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-teal-700 text-xl">➕ إضافة مدير جديد</h3>
          <button @click="showCreate=false" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
        </div>
        <div class="space-y-4">
          <input v-model="newAdmin.fullName" placeholder="الاسم الكامل"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600"
            style="color: #1d6560;" />
          <input v-model="newAdmin.phone" placeholder="رقم الهاتف" type="tel"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600"
            style="color: #1d6560;" />
          <input v-model="newAdmin.password" placeholder="كلمة المرور" type="password"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-600"
            style="color: #1d6560;" />
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showCreate=false"
            class="flex-1 py-3 rounded-lg text-sm border-2 border-gray-200 text-teal-700 font-bold hover:bg-gray-50 transition-all">إلغاء</button>
          <button @click="createAdmin"
            class="flex-1 py-3 rounded-lg text-sm text-white font-bold transform hover:scale-105 transition-all"
            style="background: linear-gradient(135deg, #f2b415, #d4990f);">إضافة</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const items = ref<any[]>([])
const loading = ref(true)
const typeFilter = ref('')
const search = ref('')
const total = ref(0)
const showCreate = ref(false)
const newAdmin = ref({ fullName: '', phone: '', password: '' })

const types = [
  { id: '', label: 'الكل' },
  { id: 'customer', label: 'زبائن' },
  { id: 'business', label: 'أصحاب محلات' },
  { id: 'admin', label: 'أدمن' },
]

async function load() {
  loading.value = true
  try {
    const res = await api.get('/admin/users', { params: {
      userType: typeFilter.value || undefined,
      search: search.value || undefined,
      page: 1, pageSize: 30
    }})
    items.value = res.data.items || []
    total.value = res.data.total || 0
  } finally { loading.value = false }
}

async function toggleStatus(u: any) {
  await api.put(`/admin/users/${u.id}/status?userType=${u.userType}`, { isActive: !u.isActive })
  load()
}

async function deleteUser(u: any) {
  if (!confirm(`حذف ${u.fullName}؟`)) return
  await api.delete(`/admin/users/${u.id}?userType=${u.userType}`)
  load()
}

async function createAdmin() {
  await api.post('/admin/users/admin', newAdmin.value)
  showCreate.value = false
  newAdmin.value = { fullName: '', phone: '', password: '' }
  load()
}

function typeColor(t: string) {
  return { customer: '#257d75', business: '#f2b415', admin: '#dc2626' }[t] || '#999'
}
function typeColorDark(t: string) {
  return { customer: '#1d6560', business: '#d4990f', admin: '#991b1b' }[t] || '#666'
}
function typeStyle(t: string) {
  return { 
    customer: 'background: linear-gradient(135deg, #e8f5f4, #d1ece9); color: #1d6560; border: 1px solid #d1ece9;',
    business: 'background: linear-gradient(135deg, #fef9e7, #fde68a); color: #b8860b; border: 1px solid #fde68a;',
    admin: 'background: linear-gradient(135deg, #fee, #fff5f5); color: #a00; border: 1px solid #fcc;'
  }[t] || ''
}
function typeLabel(t: string) {
  return { customer: '👤 زبون', business: '🏪 صاحب محل', admin: '🔑 أدمن' }[t] || t
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' })
}

onMounted(load)
</script>
