<template>
  <div class="space-y-6" :dir="dir">
    <PageHeader :title="t('apps.title')" :description="t('apps.desc')" :crumbs="[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('apps.title') }]" />

    <div class="page-card p-4">
      <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-[200px] flex-1">
          <label class="label-field">{{ t('common.search') }}</label>
          <input v-model="search" type="search" class="input-field" :placeholder="t('apps.search')" @keyup.enter="apply" />
        </div>
        <div>
          <label class="label-field">{{ t('common.status') }}</label>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="f in statusFilters"
              :key="f.value"
              type="button"
              class="rounded-xl px-3 py-2 text-xs font-bold"
              :class="status === f.value ? 'bg-brand text-white' : 'bg-slate-100 text-app-muted'"
              @click="setStatus(f.value)"
            >
              {{ f.label }}
            </button>
          </div>
        </div>
        <div>
          <label class="label-field">{{ t('common.domain') }}</label>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="f in domainFilters"
              :key="f.value"
              type="button"
              class="rounded-xl px-3 py-2 text-xs font-bold"
              :class="domainFilter === f.value ? 'bg-brand text-white' : 'bg-slate-100 text-app-muted'"
              @click="setDomain(f.value)"
            >
              {{ f.label }}
            </button>
          </div>
        </div>
        <button type="button" class="btn-secondary" @click="load">{{ t('common.refresh') }}</button>
      </div>
      <p v-if="domainFilter && !hasDomainField" class="mt-3 text-xs text-amber-800">
        {{ locale === 'ar'
          ? 'التصفية حسب المجال تعتمد على domainType من الخادم (مصدّر الآن في قائمة الطلبات).'
          : 'Domain filtering uses server domainType (now included on the applications list).' }}
      </p>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :error="error"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :empty-text="t('apps.empty')"
      show-index
      @page-change="onPage"
      @retry="load"
    >
      <template #cell-businessName="{ row }">
        <RouterLink :to="`/applications/${row.id}`" class="font-bold text-brand hover:underline">
          {{ row.businessName || '—' }}
        </RouterLink>
      </template>
      <template #cell-domainType="{ row }">
        <DomainBadge :domain-type="row.domainType ?? row.businessDomainType" />
      </template>
      <template #cell-status="{ row }">
        <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
      </template>
      <template #cell-createdAt="{ row }">{{ formatDateShort(row.createdAt as string) }}</template>
      <template #cell-actions="{ row }">
        <div class="flex flex-wrap gap-1.5">
          <RouterLink :to="`/applications/${row.id}`" class="rounded-lg bg-brand-light px-2.5 py-1.5 text-xs font-bold text-brand-dark">{{ t('common.details') }}</RouterLink>
          <button v-if="row.status === 'Pending'" type="button" class="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800" @click="askApprove(row)">{{ t('apps.approve') }}</button>
          <button v-if="row.status === 'Pending'" type="button" class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700" @click="openReject(row)">{{ t('apps.reject') }}</button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal v-model="approveOpen" :title="t('apps.approve')" :message="t('apps.approveConfirm')" :confirm-text="t('apps.approve')" :busy="busy" @confirm="confirmApprove" />
    <ConfirmModal v-model="rejectOpen" :title="t('apps.rejectTitle')" :message="t('apps.rejectHint')" :confirm-text="t('apps.reject')" confirm-color="danger" :busy="busy" @confirm="confirmReject">
      <textarea v-model="rejectReason" rows="3" class="input-field mt-2" :placeholder="t('apps.rejectReason')" />
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { approveApplication, getApplications, rejectApplication } from '@/api'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DomainBadge from '@/components/common/DomainBadge.vue'
import { apiMessage } from '@/utils/error'
import { formatDateShort } from '@/utils/format'
import { normalizePaged, statusClass, statusLabel } from '@/utils/admin'
import { welcomeCreditsApproveMessage } from '@/utils/settings'
import { LAUNCH_DOMAIN_FILTERS, readDomainType } from '@/utils/domain'
import { useI18n } from '@/composables/useI18n'

const { t, dir, locale } = useI18n()
const toast = useToast()
const route = useRoute()

const statusFilters = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'Pending', label: locale.value === 'ar' ? 'معلقة' : 'Pending' },
  { value: 'Approved', label: locale.value === 'ar' ? 'مقبولة' : 'Approved' },
  { value: 'Rejected', label: locale.value === 'ar' ? 'مرفوضة' : 'Rejected' },
])

const columns = computed<ColumnDef[]>(() => [
  { key: 'ownerName', label: t('common.owner') },
  { key: 'businessName', label: locale.value === 'ar' ? 'النشاط' : 'Business' },
  { key: 'domainType', label: t('common.domain') },
  { key: 'phone', label: t('common.phone') },
  { key: 'city', label: locale.value === 'ar' ? 'المحافظة' : 'City' },
  { key: 'categoryName', label: locale.value === 'ar' ? 'التصنيف' : 'Category' },
  { key: 'status', label: t('common.status') },
  { key: 'createdAt', label: locale.value === 'ar' ? 'تاريخ الطلب' : 'Submitted' },
  { key: 'actions', label: t('common.actions') },
])

const rows = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = 15
const search = ref('')
const status = ref(typeof route.query.status === 'string' ? route.query.status : '')
const domainFilter = ref(typeof route.query.domain === 'string' ? route.query.domain : '')
const domainFilters = LAUNCH_DOMAIN_FILTERS
const hasDomainField = ref(false)
const approveOpen = ref(false)
const rejectOpen = ref(false)
const rejectReason = ref('')
const target = ref<Record<string, unknown> | null>(null)
const busy = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    const wanted = domainFilter.value === '' ? null : Number(domainFilter.value)
    const res = await getApplications({
      status: status.value || undefined,
      domainType: wanted != null && !Number.isNaN(wanted) ? wanted : undefined,
      page: page.value,
      pageSize,
    })
    const d = normalizePaged(res.data)
    hasDomainField.value = d.items.some((row) => readDomainType(row) != null) || wanted != null
    const q = search.value.trim().toLowerCase()
    let items = d.items
    if (q) {
      items = items.filter((row) =>
        [row.businessName, row.ownerName, row.phone].some((v) => String(v ?? '').toLowerCase().includes(q)),
      )
    }
    rows.value = items
    total.value = q ? items.length : d.total
  } catch (e) {
    error.value = apiMessage(e, t('common.error'))
  } finally {
    loading.value = false
  }
}

function apply() {
  page.value = 1
  load()
}
function setStatus(v: string) {
  status.value = v
  apply()
}
function setDomain(v: string) {
  domainFilter.value = v
  apply()
}
function onPage(p: number) {
  page.value = p
  load()
}
function askApprove(row: Record<string, unknown>) {
  target.value = row
  approveOpen.value = true
}
function openReject(row: Record<string, unknown>) {
  target.value = row
  rejectReason.value = ''
  rejectOpen.value = true
}

async function confirmApprove() {
  if (!target.value?.id) return
  busy.value = true
  try {
    await approveApplication(String(target.value.id))
    toast.success(await welcomeCreditsApproveMessage(locale.value === 'ar' ? 'صاحب العمل' : 'business'))
    approveOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    busy.value = false
  }
}

async function confirmReject() {
  if (!target.value?.id) return
  if (!rejectReason.value.trim()) {
    toast.warning(t('apps.rejectReason'))
    return
  }
  busy.value = true
  try {
    await rejectApplication(String(target.value.id), rejectReason.value.trim())
    toast.success(t('apps.rejected'))
    rejectOpen.value = false
    load()
  } catch (e) {
    toast.error(apiMessage(e))
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
