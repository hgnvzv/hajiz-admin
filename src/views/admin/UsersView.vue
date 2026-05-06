<template>
  <div dir="rtl" class="space-y-5">
    <!-- Filters -->
    <div class="rounded-2xl p-4 flex flex-wrap gap-3"
      style="background: white; border: 1px solid #e2eded; box-shadow: 0 1px 4px rgba(37,125,117,0.06)">
      <div class="flex gap-2 flex-wrap">
        <button v-for="t in types" :key="t.id" @click="typeFilter=t.id; load()"
          class="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
          :style="typeFilter===t.id
            ? 'background: linear-gradient(135deg, #257d75, #1d6560); color: white; box-shadow: 0 2px 8px rgba(37,125,117,0.3)'
            : 'background: #f0f4f3; color: #6b7f7e'">
          {{ t.label }}
        </button>
      </div>
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
      <button @click="showCreate=true"
        class="px-4 py-2 rounded-xl text-sm font-black text-white transition-all"
        style="background: linear-gradient(135deg, #f2b415, #d4990f); box-shadow: 0 2px 8px rgba(242,180,21,0.3)">
        + إضافة أدمن
      </button>
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
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">المستخدم</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">الهاتف</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">النوع</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">المحافظة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">الحالة</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">التاريخ</th>
            <th class="text-right px-5 py-3.5 text-xs font-black" style="color: #6b7f7e">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in items" :key="u.id"
            class="border-t transition-all group"
            style="border-color: #f0f4f3"
            onmouseover="this.style.background='#f8fbfb'"
            onmouseout="this.style.background='transparent'">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                  :style="`background: ${typeColor(u.userType)}20; color: ${typeColor(u.userType)}`">
                  {{ u.fullName?.[0] }}
                </div>
                <div>
                  <p class="font-bold" style="color: #0a2c2a">{{ u.fullName }}</p>
                  <p v-if="u.extra" class="text-xs" style="color: #9aadac">{{ u.extra }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5" style="color: #6b7f7e">{{ u.phone }}</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full" :style="typeStyle(u.userType)">
                {{ typeLabel(u.userType) }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-xs" style="color: #9aadac">{{ u.city || '—' }}</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                :style="u.isActive
                  ? 'background:#e8f5f4;color:#1d6560;border:1px solid #d1ece9'
                  : 'background:#f0f4f3;color:#9aadac;border:1px solid #e2eded'">
                {{ u.isActive ? 'نشط' : 'موقوف' }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-xs" style="color: #9aadac">{{ formatDate(u.createdAt) }}</td>
            <td class="px-5 py-3.5">
              <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="toggleStatus(u)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-bold"
                  :style="u.isActive ? 'background:#fef2f2;color:#b91c1c' : 'background:#e8f5f4;color:#1d6560'">
                  {{ u.isActive ? 'إيقاف' : 'تفعيل' }}
                </button>
                <button @click="deleteUser(u)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-bold"
                  style="background:#f0f4f3;color:#9aadac">حذف</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-5 py-3 border-t flex justify-between" style="background:#f8fbfb; border-color:#f0f4f3">
        <p class="text-xs" style="color: #9aadac">إجمالي <span class="font-black" style="color: #0a2c2a">{{ total }}</span> مستخدم</p>
      </div>
    </div>

    <!-- Create Admin Modal -->
    <div v-if="showCreate" class="fixed inset-0 flex items-center justify-center z-50 p-4"
      style="background: rgba(10,44,42,0.6); backdrop-filter: blur(4px)"
      @click.self="showCreate=false">
      <div class="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" dir="rtl"
        style="background: white">
        <div class="px-6 py-5 border-b" style="background: linear-gradient(135deg, #0a2c2a, #145550); border-color: rgba(255,255,255,0.08)">
          <div class="flex justify-between items-center">
            <h3 class="font-black text-white">إضافة مدير جديد</h3>
            <button @click="showCreate=false"
              class="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
              style="color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.08)"
              onmouseover="this.style.background='rgba(255,255,255,0.15)'"
              onmouseout="this.style.background='rgba(255,255,255,0.08)'">✕</button>
          </div>
        </div>
        <div class="p-6 space-y-3">
          <input v-model="newAdmin.fullName" placeholder="الاسم الكامل"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'"
            onblur="this.style.borderColor='#e2eded'" />
          <input v-model="newAdmin.phone" placeholder="رقم الهاتف" type="tel"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'"
            onblur="this.style.borderColor='#e2eded'" />
          <input v-model="newAdmin.password" placeholder="كلمة المرور" type="password"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2eded; background: #f8fbfb"
            onfocus="this.style.borderColor='#257d75'"
            onblur="this.style.borderColor='#e2eded'" />
        </div>
        <div class="flex gap-3 px-6 pb-6">
          <button @click="showCreate=false"
            class="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style="border: 1.5px solid #e2eded; color: #6b7f7e">إلغاء</button>
          <button @click="createAdmin"
            class="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all"
            style="background: linear-gradient(135deg, #257d75, #1d6560); box-shadow: 0 3px 12px rgba(37,125,117,0.25)">إضافة</button>
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
  return { customer: '#257d75', business: '#f2b415', admin: '#dc2626' }[t] || '#9aadac'
}
function typeStyle(t: string) {
  return {
    customer: 'background:#e8f5f4;color:#1d6560;border:1px solid #d1ece9',
    business: 'background:#fef9e7;color:#b45309;border:1px solid #fde68a',
    admin: 'background:#fef2f2;color:#b91c1c;border:1px solid #fecaca'
  }[t] || ''
}
function typeLabel(t: string) {
  return { customer: 'زبون', business: 'صاحب محل', admin: 'أدمن' }[t] || t
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' })
}

onMounted(load)
</script>
