<template>
  <div class="space-y-6" dir="rtl">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-black text-slate-900">إرسال إشعار إعلاني</h2>
      <form class="mt-5 grid gap-4" @submit.prevent="send">
        <input v-model="form.title" required class="rounded-xl border border-slate-200 px-4 py-3" placeholder="عنوان الإشعار" />
        <textarea v-model="form.body" required rows="4" class="rounded-xl border border-slate-200 p-4" placeholder="محتوى الإشعار" />
        <select v-model="form.targetAudience" class="rounded-xl border border-slate-200 px-4 py-3">
          <option :value="null">الكل</option>
          <option :value="1">الزبائن فقط</option>
          <option :value="2">أصحاب المحلات فقط</option>
        </select>
        <button type="submit" class="w-fit rounded-xl bg-blue-600 px-6 py-3 font-bold text-white" :disabled="sending">
          {{ sending ? 'جار الإرسال...' : 'إرسال الإشعار' }}
        </button>
        <p v-if="lastRecipientCount !== null" class="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          تم إرسال الإشعار إلى {{ lastRecipientCount }} مستلم
        </p>
      </form>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-black text-slate-900">سجل الإشعارات</h2>
      <DataTable :columns="columns" :rows="rows" :loading="loading" :total="total" :page="page" :page-size="pageSize" empty-text="لا توجد إشعارات مرسلة" @page-change="onPage">
        <template #cell-targetAudience="{ row }">{{ audienceLabel(row.targetAudience) }}</template>
        <template #cell-sentAt="{ row }">{{ formatDate(row.sentAt as string) }}</template>
      </DataTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getBroadcasts, sendBroadcast } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { apiMessage } from '@/utils/error'
import { formatDate } from '@/utils/format'
import { normalizePaged } from '@/utils/admin'

const toast = useToast()
const columns: ColumnDef[] = [
  { key: 'title', label: 'العنوان' },
  { key: 'body', label: 'المحتوى' },
  { key: 'targetAudience', label: 'الفئة المستهدفة' },
  { key: 'recipientCount', label: 'عدد المستلمين' },
  { key: 'sentAt', label: 'تاريخ الإرسال' },
]
const form = ref<{ title: string; body: string; targetAudience: number | null }>({ title: '', body: '', targetAudience: null })
const sending = ref(false)
const lastRecipientCount = ref<number | null>(null)
const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20

function audienceLabel(v: unknown) {
  const key = v == null ? 'null' : String(v)
  return { null: 'الكل', '1': 'الزبائن فقط', '2': 'أصحاب المحلات فقط', Customer: 'الزبائن فقط', Business: 'أصحاب المحلات فقط' }[key] ?? String(v)
}

async function load() {
  loading.value = true
  try {
    const res = await getBroadcasts({ page: page.value, pageSize })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل سجل الإشعارات'))
  } finally {
    loading.value = false
  }
}

async function send() {
  if (!confirm('هل تريد إرسال الإشعار الآن؟')) return
  sending.value = true
  try {
    const res = await sendBroadcast(form.value)
    const data = res.data as { recipientCount?: number }
    lastRecipientCount.value = Number(data.recipientCount ?? 0)
    toast.success('تم إرسال الإشعار')
    form.value = { title: '', body: '', targetAudience: null }
    load()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر إرسال الإشعار'))
  } finally {
    sending.value = false
  }
}

function onPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>
