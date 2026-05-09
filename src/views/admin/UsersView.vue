<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-[220px] flex-1">
          <label class="mb-1 block text-xs font-bold text-slate-500">بحث</label>
          <input v-model="search" type="search" class="w-full rounded-xl border border-slate-200 px-4 py-2.5" placeholder="الاسم أو الهاتف" @keyup.enter="apply" />
        </div>
        <div class="w-full sm:w-44">
          <label class="mb-1 block text-xs font-bold text-slate-500">نوع المستخدم</label>
          <select v-model="userType" class="w-full rounded-xl border border-slate-200 px-3 py-2.5" @change="apply">
            <option value="customer">الزبائن</option>
            <option value="business">أصحاب المحلات</option>
            <option value="admin">المدراء</option>
          </select>
        </div>
        <button type="button" class="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white" @click="apply">بحث</button>
        <button type="button" class="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 font-bold text-blue-700" @click="openAdmin">+ مدير جديد</button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      empty-text="لا يوجد مستخدمون"
      show-index
      @page-change="onPage"
    >
      <template #cell-fullName="{ row }">
        <div>
          <p class="font-bold text-slate-900">{{ row.fullName ?? row.name ?? row.ownerName ?? '—' }}</p>
          <p class="text-xs text-slate-500">{{ userTypeLabel(userType) }}</p>
        </div>
      </template>
      <template #cell-isActive="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="row.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
          {{ row.isActive !== false ? 'نشط' : 'موقوف' }}
        </span>
      </template>
      <template #cell-createdAt="{ row }">{{ formatDateShort(row.createdAt as string) }}</template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1.5">
          <button type="button" class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700" @click="toggle(row)">
            {{ row.isActive !== false ? 'إيقاف' : 'تفعيل' }}
          </button>
          <button type="button" class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700" @click="remove(row)">
            حذف
          </button>
        </div>
      </template>
    </DataTable>

    <div v-if="adminOpen" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" @click.self="adminOpen = false">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" dir="rtl">
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-lg font-black text-slate-900">إنشاء مدير جديد</h3>
          <button type="button" class="text-xl text-slate-400" @click="adminOpen = false">×</button>
        </div>
        <form class="space-y-4" @submit.prevent="createAdmin">
          <input v-model="adminForm.fullName" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="الاسم الكامل" />
          <input v-model="adminForm.phone" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="رقم الهاتف" />
          <input v-model="adminForm.password" required minlength="6" type="password" class="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="كلمة المرور" />
          <div class="flex gap-3 pt-2">
            <button type="button" class="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold" @click="adminOpen = false">إلغاء</button>
            <button type="submit" class="flex-1 rounded-xl bg-blue-600 py-2.5 font-bold text-white">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { createAdminUser, deleteUser, getUsers, updateUserStatus } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort } from '@/utils/format'
import { normalizePaged, userTypeLabel } from '@/utils/admin'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'fullName', label: 'المستخدم' },
  { key: 'phone', label: 'الهاتف' },
  { key: 'cityName', label: 'المحافظة' },
  { key: 'isActive', label: 'الحالة' },
  { key: 'createdAt', label: 'تاريخ التسجيل' },
  { key: 'actions', label: 'إجراءات' },
]
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 30
const userType = ref('customer')
const search = ref('')
const adminOpen = ref(false)
const adminForm = ref({ fullName: '', phone: '', password: '' })

async function load() {
  loading.value = true
  try {
    const res = await getUsers({ userType: userType.value, search: search.value || undefined, page: page.value, pageSize })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل المستخدمين'))
  } finally {
    loading.value = false
  }
}

function apply() {
  page.value = 1
  load()
}

function onPage(p: number) {
  page.value = p
  load()
}

async function toggle(row: Record<string, unknown>) {
  try {
    await updateUserStatus(String(row.id), userType.value, row.isActive === false)
    toast.success('تم تحديث حالة المستخدم')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function remove(row: Record<string, unknown>) {
  if (!confirm('هل تريد حذف المستخدم؟')) return
  try {
    await deleteUser(String(row.id), userType.value)
    toast.success('تم حذف المستخدم')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

function openAdmin() {
  adminForm.value = { fullName: '', phone: '', password: '' }
  adminOpen.value = true
}

async function createAdmin() {
  try {
    await createAdminUser(adminForm.value)
    toast.success('تم إنشاء حساب المدير')
    adminOpen.value = false
    userType.value = 'admin'
    apply()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
