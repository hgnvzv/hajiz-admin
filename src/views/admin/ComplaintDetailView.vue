<template>
  <div class="space-y-6" dir="rtl">
    <RouterLink to="/complaints" class="inline-flex text-sm font-bold text-blue-600">← رجوع إلى الشكاوى</RouterLink>
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white py-16"><LoadingSpinner /></div>
    <template v-else-if="item">
      <div class="grid gap-6 lg:grid-cols-3">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 class="text-lg font-black text-slate-900">تفاصيل الشكوى</h3>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <Info label="المستخدم" :value="String(item.userName ?? '—')" />
            <Info label="الهاتف" :value="String(item.userPhone ?? '—')" />
            <Info label="نوع المستخدم" :value="userTypeLabel(item.userType)" />
            <Info label="نوع الشكوى" :value="complaintTypeLabel(item.type)" />
            <Info label="الموضوع" :value="String(item.subject ?? '—')" />
            <Info label="تاريخ الإنشاء" :value="formatDate(item.createdAt as string)" />
            <Info label="المستخدم المستهدف" :value="String(item.targetUserName ?? '—')" />
            <Info label="رقم الحجز المرتبط" :value="String(item.bookingId ?? '—')" />
          </div>
          <p class="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{{ item.description ?? 'لا يوجد وصف' }}</p>
        </section>
        <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">إدارة الحالة</h3>
          <a :href="`https://wa.me/${item.userPhone ?? ''}`" target="_blank" class="mt-4 block rounded-xl bg-emerald-50 p-3 text-center font-bold text-emerald-700">
            تواصل واتساب: {{ item.userPhone ?? '—' }}
          </a>
          <label class="mt-5 block text-xs font-bold text-slate-500">الحالة</label>
          <select v-model.number="form.status" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5">
            <option :value="1">مفتوحة</option>
            <option :value="2">قيد المعالجة</option>
            <option :value="3">تم الحل</option>
            <option :value="4">مغلقة</option>
          </select>
          <label class="mt-4 block text-xs font-bold text-slate-500">ملاحظات الإدارة</label>
          <textarea v-model="form.adminNotes" rows="5" class="mt-1 w-full rounded-xl border border-slate-200 p-3" />
          <button type="button" class="mt-4 w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white" @click="save">تحديث الحالة</button>
          <p v-if="item.resolvedAt" class="mt-3 text-xs text-slate-500">تم الحل: {{ formatDate(item.resolvedAt as string) }}</p>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getComplaintDetail, updateComplaintStatus } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { apiMessage } from '@/utils/error'
import { formatDate } from '@/utils/format'
import { complaintTypeLabel, userTypeLabel } from '@/utils/admin'

const Info = defineComponent({
  props: { label: { type: String, required: true }, value: { type: String, required: true } },
  setup(props) {
    return () => h('div', { class: 'rounded-xl bg-slate-50 p-4' }, [
      h('p', { class: 'text-xs font-bold text-slate-500' }, props.label),
      h('p', { class: 'mt-1 font-bold text-slate-900' }, props.value),
    ])
  },
})

const route = useRoute()
const toast = useToast()
const loading = ref(true)
const item = ref<Record<string, unknown> | null>(null)
const form = ref({ status: 1, adminNotes: '' })
const statusMap: Record<string, number> = { Open: 1, InProgress: 2, Resolved: 3, Closed: 4, '1': 1, '2': 2, '3': 3, '4': 4 }

async function load() {
  loading.value = true
  try {
    const res = await getComplaintDetail(String(route.params.id))
    item.value = res.data as Record<string, unknown>
    form.value = {
      status: statusMap[String(item.value.status ?? 'Open')] ?? 1,
      adminNotes: String(item.value.adminNotes ?? ''),
    }
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل تفاصيل الشكوى'))
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    await updateComplaintStatus(String(route.params.id), form.value)
    toast.success('تم تحديث حالة الشكوى')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
