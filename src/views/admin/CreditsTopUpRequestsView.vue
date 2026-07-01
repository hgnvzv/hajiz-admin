<template>
  <div class="space-y-6" dir="rtl">
    <div class="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
      <strong>ملاحظة:</strong> شحن الزبون معطّل في وضع الإطلاق — تتوقع طلبات من <strong>المحلات</strong> و<strong>الحرفيين</strong> فقط.
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="rounded-xl px-4 py-2 text-sm font-bold transition"
          :class="status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="setStatus(f.value)"
        >
          {{ f.label }}
        </button>
        <button type="button" class="mr-auto rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600" @click="load">
          تحديث
        </button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      empty-text="لا توجد طلبات شحن"
      show-index
      @page-change="onPage"
    >
      <template #cell-createdAt="{ row }">
        <span :class="row.status === 'Pending' ? 'font-bold text-amber-800' : ''">
          {{ formatDateShort(row.createdAt as string) }}
        </span>
      </template>
      <template #cell-userName="{ row }">
        <div>
          <p class="font-bold" :class="row.status === 'Pending' ? 'text-amber-900' : 'text-slate-900'">
            {{ row.userName ?? '—' }}
          </p>
          <p class="text-xs text-slate-500">{{ row.userPhone ?? '—' }}</p>
        </div>
      </template>
      <template #cell-userType="{ row }">
        {{ userTypeLabel(row.userType) }}
      </template>
      <template #cell-packageAmount="{ row }">
        <div>
          <p class="font-bold text-slate-900">{{ formatMoneyIQD(row.packageAmount) }}</p>
          <p
            v-if="row.approvedCreditsAmount != null && ['Approved', 'Redeemed'].includes(String(row.status))"
            class="text-xs font-bold text-emerald-700"
          >
            معتمد: {{ formatMoneyIQD(row.approvedCreditsAmount) }}
          </p>
        </div>
      </template>
      <template #cell-referenceNumber="{ row }">
        <span class="font-mono text-sm font-bold text-slate-800">{{ row.referenceNumber ?? '—' }}</span>
      </template>
      <template #cell-status="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(row.status)">
          {{ statusLabel(row.status) }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <button
          type="button"
          class="rounded-lg px-2.5 py-1.5 text-xs font-bold"
          :class="row.status === 'Pending' ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300' : 'bg-blue-50 text-blue-700'"
          @click="openDetail(row)"
        >
          {{ row.status === 'Pending' ? 'مراجعة' : 'تفاصيل' }}
        </button>
      </template>
    </DataTable>

    <!-- Detail modal -->
    <div
      v-if="detailOpen"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      @click.self="closeDetail"
    >
      <div class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
        <div v-if="detailLoading" class="py-16"><LoadingSpinner /></div>
        <template v-else-if="detail">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-black text-slate-900">تفاصيل طلب شحن Credits</h3>
              <p class="mt-1 text-xs text-slate-500">{{ formatDate(detail.createdAt as string) }}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-bold" :class="statusClass(detail.status)">
              {{ statusLabel(detail.status) }}
            </span>
          </div>

          <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-xs font-bold text-slate-500">المستخدم</dt>
              <dd class="mt-1 font-black text-slate-900">{{ detail.userName ?? '—' }}</dd>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-xs font-bold text-slate-500">الهاتف</dt>
              <dd class="mt-1 font-bold text-slate-900">{{ detail.userPhone ?? '—' }}</dd>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-xs font-bold text-slate-500">نوع الحساب</dt>
              <dd class="mt-1 font-bold text-slate-900">{{ userTypeLabel(detail.userType) }}</dd>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <dt class="text-xs font-bold text-slate-500">مبلغ الباقة المطلوبة</dt>
              <dd class="mt-1 text-lg font-black text-emerald-700">{{ formatMoneyIQD(detail.packageAmount) }}</dd>
            </div>
            <div
              v-if="detail.approvedCreditsAmount != null"
              class="rounded-xl bg-emerald-50 p-3 sm:col-span-2"
            >
              <dt class="text-xs font-bold text-emerald-700">المبلغ المعتمد</dt>
              <dd class="mt-1 text-lg font-black text-emerald-900">{{ formatMoneyIQD(detail.approvedCreditsAmount) }}</dd>
            </div>
          </dl>

          <div class="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-500">رقم المرجع</span>
              <button
                type="button"
                class="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200"
                @click="copyText(String(detail.referenceNumber ?? ''))"
              >
                نسخ
              </button>
            </div>
            <p class="mt-2 break-all font-mono text-xl font-black tracking-wide text-blue-900">
              {{ detail.referenceNumber ?? '—' }}
            </p>
          </div>

          <div v-if="detail.screenshotUrl" class="mt-4">
            <p class="mb-2 text-sm font-bold text-slate-700">صورة إثبات التحويل</p>
            <button type="button" class="block w-full overflow-hidden rounded-xl ring-1 ring-slate-200" @click="zoomOpen = true">
              <img
                :src="String(detail.screenshotUrl)"
                alt="سكرين شوت التحويل"
                class="max-h-80 w-full cursor-zoom-in object-contain bg-slate-100"
              />
            </button>
          </div>

          <dl v-if="detail.reviewedAt || detail.rejectionReason" class="mt-4 space-y-2 text-sm">
            <div v-if="detail.reviewedAt" class="flex justify-between gap-2">
              <dt class="text-slate-500">تاريخ المراجعة</dt>
              <dd class="font-bold">{{ formatDate(detail.reviewedAt as string) }}</dd>
            </div>
            <div v-if="detail.rejectionReason" class="rounded-xl bg-red-50 p-3">
              <dt class="text-xs font-bold text-red-700">سبب الرفض</dt>
              <dd class="mt-1 text-red-900">{{ detail.rejectionReason }}</dd>
            </div>
          </dl>

          <div v-if="detail.status === 'Pending'" class="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              class="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              :disabled="actionLoading"
              @click="openApproveConfirm"
            >
              موافقة
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-red-50 px-4 py-3 font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100 disabled:opacity-50"
              :disabled="actionLoading"
              @click="openReject"
            >
              رفض
            </button>
          </div>

          <button type="button" class="mt-4 w-full rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600" @click="closeDetail">
            إغلاق
          </button>
        </template>
      </div>
    </div>

    <!-- Screenshot zoom -->
    <div
      v-if="zoomOpen && detail?.screenshotUrl"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
      @click="zoomOpen = false"
    >
      <img :src="String(detail.screenshotUrl)" alt="تكبير السكرين شوت" class="max-h-full max-w-full object-contain" />
    </div>

    <div
      v-if="approveOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      @click.self="approveOpen = false"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
        <h3 class="text-lg font-black text-slate-900">تأكيد الموافقة</h3>
        <p class="mt-2 text-sm text-slate-600">
          هل تأكدت من التحويل ورقم المرجع؟ سيتم إنشاء كود شحن وإرسال إشعار للمستخدم.
        </p>

        <div class="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          <p class="text-xs font-bold text-slate-500">مبلغ الباقة المطلوبة</p>
          <p class="mt-1 font-black text-slate-900">{{ formatMoneyIQD(approvePackageAmount) }}</p>
        </div>

        <label class="mt-4 block">
          <span class="mb-1 block text-sm font-bold text-slate-700">المبلغ الفعلي المُمنوح (Credits)</span>
          <input
            v-model.number="actualCreditsAmount"
            type="number"
            min="1"
            :max="approvePackageAmount"
            step="1"
            class="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
          <span class="mt-1 block text-xs text-slate-500">أدخل المبلغ الذي حوّله المستخدم فعلياً</span>
        </label>

        <p
          v-if="isPartialApproval"
          class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900"
        >
          تنبيه: المبلغ الفعلي ({{ formatMoneyIQD(actualCreditsAmount) }}) أقل من الباقة المختارة ({{ formatMoneyIQD(approvePackageAmount) }}).
        </p>
        <p v-if="approveError" class="mt-3 text-sm font-bold text-red-600">{{ approveError }}</p>

        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold" @click="approveOpen = false">
            إلغاء
          </button>
          <button
            type="button"
            class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            :disabled="actionLoading"
            @click="confirmApprove"
          >
            {{ actionLoading ? 'جاري الموافقة…' : 'موافقة وإنشاء الكود' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-model="rejectOpen"
      title="رفض طلب الشحن"
      message="اكتب سبب الرفض ليتم إرساله للمستخدم"
      confirm-text="رفض الطلب"
      confirm-color="danger"
      @confirm="confirmReject"
    >
      <textarea v-model="rejectReason" rows="3" class="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="مثال: المبلغ غير مطابق / السكرين شوت غير واضح" />
    </ConfirmModal>

    <!-- Approval code modal -->
    <div
      v-if="codeModalOpen && approvalResult"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      @click.self="codeModalOpen = false"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
        <h3 class="text-lg font-black text-emerald-800">تمت الموافقة بنجاح</h3>
        <p class="mt-2 text-sm text-slate-600">{{ approvalResult.message ?? 'تم إنشاء كود الشحن' }}</p>
        <p
          v-if="approvalResult.requestedPackageAmount != null && approvalResult.creditsAmount != null && approvalResult.requestedPackageAmount !== approvalResult.creditsAmount"
          class="mt-1 text-xs text-amber-700"
        >
          الباقة المطلوبة: {{ formatMoneyIQD(approvalResult.requestedPackageAmount) }}
        </p>
        <div class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p class="text-xs font-bold text-emerald-700">كود الشحن</p>
          <p class="mt-2 font-mono text-2xl font-black tracking-widest text-emerald-900">{{ approvalResult.topUpCode }}</p>
          <p class="mt-2 text-sm font-bold text-slate-600">{{ formatMoneyIQD(approvalResult.creditsAmount) }}</p>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            type="button"
            class="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white"
            @click="copyText(String(approvalResult.topUpCode ?? ''))"
          >
            نسخ الكود
          </button>
          <button type="button" class="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600" @click="codeModalOpen = false">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import {
  approveCreditTopUpRequest,
  getCreditTopUpRequestDetail,
  getCreditTopUpRequests,
  rejectCreditTopUpRequest,
} from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { apiMessage } from '@/utils/error'
import { formatDate, formatDateShort, formatMoneyIQD } from '@/utils/format'
import { normalizePaged, statusClass, statusLabel, userTypeLabel } from '@/utils/admin'
import { useUiStore } from '@/stores/ui'
import { useNotificationsStore } from '@/stores/notifications'

const toast = useToast()
const route = useRoute()
const ui = useUiStore()
const notifications = useNotificationsStore()

const filters = [
  { value: '', label: 'الكل' },
  { value: 'Pending', label: 'معلقة' },
  { value: 'Approved', label: 'مقبولة' },
  { value: 'Rejected', label: 'مرفوضة' },
  { value: 'Redeemed', label: 'مُستبدَل' },
]

const columns: ColumnDef[] = [
  { key: 'createdAt', label: 'التاريخ' },
  { key: 'userName', label: 'المستخدم' },
  { key: 'userType', label: 'النوع' },
  { key: 'packageAmount', label: 'الباقة' },
  { key: 'referenceNumber', label: 'رقم المرجع' },
  { key: 'status', label: 'الحالة' },
  { key: 'actions', label: 'إجراءات' },
]

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const status = ref(typeof route.query.status === 'string' ? route.query.status : '')

const detailOpen = ref(false)
const detailLoading = ref(false)
const detail = ref<Record<string, unknown> | null>(null)
const detailId = ref('')
const zoomOpen = ref(false)

const approveOpen = ref(false)
const approvePackageAmount = ref(0)
const actualCreditsAmount = ref(0)
const approveError = ref('')
const rejectOpen = ref(false)
const rejectReason = ref('')
const actionLoading = ref(false)

const codeModalOpen = ref(false)
const approvalResult = ref<{
  topUpCode?: string
  creditsAmount?: number
  requestedPackageAmount?: number
  message?: string
} | null>(null)

const isPartialApproval = computed(() => {
  const pkg = Number(approvePackageAmount.value)
  const actual = Number(actualCreditsAmount.value)
  return pkg > 0 && actual > 0 && actual < pkg
})

async function load() {
  loading.value = true
  try {
    const res = await getCreditTopUpRequests({
      status: status.value || undefined,
      page: page.value,
      pageSize,
    })
    const d = normalizePaged(res.data)
    rows.value = d.items
    total.value = d.total
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل طلبات الشحن'))
  } finally {
    loading.value = false
  }
}

function setStatus(v: string) {
  status.value = v
  page.value = 1
  load()
}

function onPage(p: number) {
  page.value = p
  load()
}

async function openDetail(row: Record<string, unknown>) {
  detailId.value = String(row.id)
  detailOpen.value = true
  detailLoading.value = true
  detail.value = null
  zoomOpen.value = false
  try {
    const res = await getCreditTopUpRequestDetail(detailId.value)
    detail.value = (res.data ?? row) as Record<string, unknown>
  } catch {
    detail.value = row
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  detailOpen.value = false
  zoomOpen.value = false
}

function openApproveConfirm() {
  const pkg = Number(detail.value?.packageAmount ?? 0)
  approvePackageAmount.value = pkg
  actualCreditsAmount.value = pkg
  approveError.value = ''
  approveOpen.value = true
}

function openReject() {
  rejectReason.value = ''
  rejectOpen.value = true
}

async function confirmApprove() {
  if (!detailId.value) return
  const pkg = Number(approvePackageAmount.value)
  const actual = Math.floor(Number(actualCreditsAmount.value))
  if (!actual || actual <= 0) {
    approveError.value = 'يجب أن يكون المبلغ الفعلي أكبر من صفر'
    return
  }
  if (actual > pkg) {
    approveError.value = `لا يمكن أن يتجاوز المبلغ الفعلي مبلغ الباقة (${formatMoneyIQD(pkg)})`
    return
  }
  approveError.value = ''
  actionLoading.value = true
  try {
    const body = actual < pkg ? { actualCreditsAmount: actual } : {}
    const res = await approveCreditTopUpRequest(detailId.value, body)
    const data = res.data as {
      topUpCode?: string
      creditsAmount?: number
      requestedPackageAmount?: number
      message?: string
    }
    approvalResult.value = data
    approveOpen.value = false
    codeModalOpen.value = true
    toast.success(data.message ?? 'تمت الموافقة على الطلب')
    closeDetail()
    load()
    void ui.refreshHeaderStats()
    void notifications.fetchNotifications()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر الموافقة على الطلب'))
  } finally {
    actionLoading.value = false
  }
}

async function confirmReject() {
  if (!detailId.value) return
  if (!rejectReason.value.trim()) {
    toast.warning('يرجى كتابة سبب الرفض')
    rejectOpen.value = true
    return
  }
  actionLoading.value = true
  try {
    await rejectCreditTopUpRequest(detailId.value, rejectReason.value.trim())
    toast.success('تم رفض الطلب')
    closeDetail()
    load()
    void ui.refreshHeaderStats()
    void notifications.fetchNotifications()
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر رفض الطلب'))
  } finally {
    actionLoading.value = false
  }
}

async function copyText(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.success('تم النسخ')
  } catch {
    toast.error('تعذر النسخ')
  }
}

onMounted(load)

watch(
  () => route.query.status,
  (v) => {
    if (typeof v === 'string' && v !== status.value) {
      status.value = v
      page.value = 1
      load()
    }
  },
)
</script>
