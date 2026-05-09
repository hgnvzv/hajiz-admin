<template>
  <div class="space-y-10" dir="rtl">
    <section class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 class="text-xl font-black text-[#1A1A2E]">إرسال إشعار</h2>
      <form class="mt-4 max-w-xl space-y-4" @submit.prevent="send">
        <div>
          <label class="mb-2 block text-sm font-bold text-[#6B7280]">الجمهور</label>
          <div class="flex flex-wrap gap-4">
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="targetType" type="radio" value="all_customers" class="accent-primary" />
              كل الزبائن
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="targetType" type="radio" value="all_businesses" class="accent-primary" />
              كل أصحاب المحلات
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="targetType" type="radio" value="both" class="accent-primary" />
              الجميع (زبائن + محلات)
            </label>
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold">العنوان</label>
          <input v-model="title" required class="w-full rounded-xl border border-border px-4 py-3" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-bold">النص</label>
          <textarea v-model="body" required rows="4" class="w-full rounded-xl border border-border px-4 py-3" />
        </div>
        <button
          type="submit"
          :disabled="sending"
          class="rounded-xl bg-primary px-8 py-3 font-black text-white disabled:opacity-50"
        >
          {{ sending ? 'جاري الإرسال…' : 'إرسال الإشعار' }}
        </button>
      </form>
    </section>

    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-black text-[#1A1A2E]">سجل الإشعارات</h2>
        <button
          type="button"
          class="rounded-xl border border-primary px-4 py-2 text-sm font-bold text-primary"
          @click="markAllRead"
        >
          تعيين الكل كمقروء
        </button>
      </div>

      <DataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :total="total"
        :page="page"
        :page-size="pageSize"
        empty-text="لا توجد إشعارات"
        @page-change="onPage"
      >
        <template #cell-body="{ row }">
          <span class="line-clamp-2">{{ row.body }}</span>
        </template>
        <template #cell-target="{ row }">
          {{ targetLabel(row) }}
        </template>
        <template #cell-createdAt="{ row }">
          {{ formatDate(row.createdAt as string) }}
        </template>
        <template #cell-status="{ row }">
          <span
            class="rounded-full px-2 py-0.5 text-xs font-bold"
            :class="row.isRead ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-warning'"
          >
            {{ row.isRead ? 'مقروء' : 'جديد' }}
          </span>
        </template>
        <template #cell-actions="{ row }">
          <button
            v-if="!row.isRead"
            type="button"
            class="text-xs font-bold text-primary"
            @click="markOne(row)"
          >
            مقروء
          </button>
        </template>
      </DataTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import {
  getNotifications,
  sendNotification,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { formatDate } from '@/utils/format'
import { apiMessage } from '@/utils/error'

const toast = useToast()

const columns: ColumnDef[] = [
  { key: 'title', label: 'العنوان' },
  { key: 'body', label: 'النص' },
  { key: 'target', label: 'الجمهور' },
  { key: 'createdAt', label: 'التاريخ' },
  { key: 'status', label: 'الحالة' },
  { key: 'actions', label: '' },
]

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20

const targetType = ref<'all_customers' | 'all_businesses' | 'both'>('all_customers')
const title = ref('')
const body = ref('')
const sending = ref(false)

function targetLabel(row: Record<string, unknown>) {
  const t = row.type ?? row.targetType
  const m: Record<string, string> = {
    all_customers: 'الزبائن',
    all_businesses: 'المحلات',
    broadcast: 'عام',
  }
  return m[String(t)] ?? String(t ?? '—')
}

async function load() {
  loading.value = true
  try {
    const res = await getNotifications({ page: page.value, pageSize })
    const d = res.data as { items?: Record<string, unknown>[]; total?: number }
    rows.value = d.items ?? []
    total.value = d.total ?? 0
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    loading.value = false
  }
}

function onPage(p: number) {
  page.value = p
  load()
}

async function send() {
  sending.value = true
  try {
    if (targetType.value === 'both') {
      await sendNotification({
        targetType: 'all_customers',
        title: title.value,
        body: body.value,
      })
      await sendNotification({
        targetType: 'all_businesses',
        title: title.value,
        body: body.value,
      })
    } else {
      await sendNotification({
        targetType: targetType.value,
        title: title.value,
        body: body.value,
      })
    }
    toast.success('تم إرسال الإشعار')
    title.value = ''
    body.value = ''
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    sending.value = false
  }
}

async function markOne(row: Record<string, unknown>) {
  try {
    await markNotificationRead(String(row.id))
    toast.success('تم التحديث')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

async function markAllRead() {
  try {
    await markAllNotificationsRead()
    toast.success('تم تعيين الكل كمقروء')
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  }
}

onMounted(load)
</script>
