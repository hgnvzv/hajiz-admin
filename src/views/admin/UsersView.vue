<template>
  <div dir="rtl" class="space-y-5">
    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3">
      <div class="flex gap-2">
        <button v-for="t in types" :key="t.id" @click="typeFilter=t.id; load()"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          :style="typeFilter===t.id ? 'background:linear-gradient(135deg,#2563EB,#1D4ED8);color:white' : 'background:#F1F5F9;color:#475569'">
          {{ t.label }}
        </button>
      </div>
      <input v-model="search" @input="load" placeholder="بحث بالاسم أو الهاتف..."
        class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 flex-1 min-w-48" />
      <button @click="showCreate=true"
        class="px-4 py-2 rounded-xl text-sm font-bold text-white"
        style="background:linear-gradient(135deg,#2563EB,#1D4ED8)">+ إضافة أدمن</button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background:#F8FAFC">
          <tr>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">المستخدم</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الهاتف</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">النوع</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">المحافظة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الحالة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">التاريخ</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="u in items" :key="u.id" class="hover:bg-slate-50 transition-all group">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  :style="`background: ${typeColor(u.userType)}`">{{ u.fullName?.[0] }}</div>
                <div>
                  <p class="font-semibold text-slate-800">{{ u.fullName }}</p>
                  <p v-if="u.extra" class="text-xs text-slate-400">{{ u.extra }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5 text-slate-600">{{ u.phone }}</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                :style="typeStyle(u.userType)">{{ typeLabel(u.userType) }}</span>
            </td>
            <td class="px-5 py-3.5 text-slate-500 text-xs">{{ u.city || '—' }}</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                :style="u.isActive ? 'background:#F0FDF4;color:#047857' : 'background:#F8FAFC;color:#94A3B8'">
                {{ u.isActive ? 'نشط' : 'موقوف' }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-xs text-slate-500">{{ formatDate(u.createdAt) }}</td>
            <td class="px-5 py-3.5">
              <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="toggleStatus(u)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  :style="u.isActive ? 'background:#FEF2F2;color:#B91C1C' : 'background:#F0FDF4;color:#047857'">
                  {{ u.isActive ? 'إيقاف' : 'تفعيل' }}
                </button>
                <button @click="deleteUser(u)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style="background:#F8FAFC;color:#64748B">حذف</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-5 py-3 border-t border-slate-100 flex justify-between" style="background:#F8FAFC">
        <p class="text-xs text-slate-500">إجمالي <span class="font-bold">{{ total }}</span> مستخدم</p>
      </div>
    </div>

    <!-- Create Admin Modal -->
    <div v-if="showCreate" class="fixed inset-0 flex items-center justify-center z-50 p-4"
      style="background:rgba(0,0,0,0.5)" @click.self="showCreate=false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl">
        <div class="flex justify-between mb-5">
          <h3 class="font-bold text-slate-900 text-lg">إضافة مدير جديد</h3>
          <button @click="showCreate=false" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div class="space-y-3">
          <input v-model="newAdmin.fullName" placeholder="الاسم الكامل"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          <input v-model="newAdmin.phone" placeholder="رقم الهاتف" type="tel"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          <input v-model="newAdmin.password" placeholder="كلمة المرور" type="password"
            class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div class="flex gap-3 mt-5">
          <button @click="showCreate=false"
            class="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 text-slate-700">إلغاء</button>
          <button @click="createAdmin"
            class="flex-1 py-2.5 rounded-xl text-sm text-white font-bold"
            style="background:linear-gradient(135deg,#2563EB,#1D4ED8)">إضافة</button>
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
  return { customer: '#2563EB', business: '#059669', admin: '#DC2626' }[t] || '#64748B'
}
function typeStyle(t: string) {
  return { customer: 'background:#EFF6FF;color:#1D4ED8', business: 'background:#F0FDF4;color:#047857', admin: 'background:#FEF2F2;color:#B91C1C' }[t] || ''
}
function typeLabel(t: string) {
  return { customer: 'زبون', business: 'صاحب محل', admin: 'أدمن' }[t] || t
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' })
}

onMounted(load)
</script>
