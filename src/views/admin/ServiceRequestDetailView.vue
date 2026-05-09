<template>
  <div class="space-y-6" dir="rtl">
    <RouterLink to="/service-requests" class="inline-flex text-sm font-bold text-blue-600">← رجوع إلى الخدمات الموقعية</RouterLink>
    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white py-16"><LoadingSpinner /></div>
    <template v-else-if="item">
      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">معلومات الزبون</h3>
          <div class="mt-4 grid gap-3">
            <Info label="الاسم" :value="String(item.customerName ?? nested('customer', 'fullName') ?? '—')" />
            <Info label="الهاتف" :value="String(item.customerPhone ?? nested('customer', 'phone') ?? '—')" />
          </div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">معلومات الطلب</h3>
          <div class="mt-4 grid gap-3">
            <Info label="الحرفة" :value="String(item.professionName ?? nested('profession', 'nameAr') ?? '—')" />
            <Info label="المحافظة" :value="String(item.cityName ?? item.city ?? '—')" />
            <Info label="السعر المقترح" :value="formatMoney(item.proposedPrice ?? item.price)" />
            <Info label="التاريخ" :value="formatDate(item.createdAt as string)" />
          </div>
          <p class="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{{ item.description ?? 'لا يوجد وصف' }}</p>
          <span class="mt-4 inline-flex rounded-full px-3 py-1 text-sm font-bold" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
        </section>
      </div>

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-black text-slate-900">العروض</h3>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[600px] text-right text-sm">
            <thead class="bg-slate-50 text-slate-500">
              <tr><th class="px-4 py-3">الحرفي</th><th class="px-4 py-3">السعر</th><th class="px-4 py-3">الرسالة</th><th class="px-4 py-3">الحالة</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="offer in offers" :key="String(offer.id)" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-bold">{{ offer.craftsmanName ?? offer.providerName ?? '—' }}</td>
                <td class="px-4 py-3">{{ formatMoney(offer.offeredPrice ?? offer.price) }}</td>
                <td class="px-4 py-3">{{ offer.message ?? '—' }}</td>
                <td class="px-4 py-3"><span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClass(offer.status)">{{ statusLabel(offer.status) }}</span></td>
              </tr>
              <tr v-if="!offers.length"><td colspan="4" class="px-4 py-10 text-center text-slate-500">لا توجد عروض</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">الحرفي المقبول</h3>
          <div class="mt-4 grid gap-3">
            <Info label="الاسم" :value="String(item.acceptedCraftsmanName ?? nested('acceptedCraftsman', 'fullName') ?? '—')" />
            <Info label="الهاتف" :value="String(item.acceptedCraftsmanPhone ?? nested('acceptedCraftsman', 'phone') ?? '—')" />
            <Info label="التقييم" :value="String(item.acceptedCraftsmanRating ?? nested('acceptedCraftsman', 'avgRating') ?? '—')" />
          </div>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-black text-slate-900">الموقع</h3>
          <div class="mt-4 grid gap-3">
            <Info label="العنوان" :value="String(item.address ?? item.locationAddress ?? '—')" />
            <Info label="خط العرض" :value="String(item.latitude ?? nested('location', 'latitude') ?? '—')" />
            <Info label="خط الطول" :value="String(item.longitude ?? nested('location', 'longitude') ?? '—')" />
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getServiceRequestDetail } from '@/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { apiMessage } from '@/utils/error'
import { formatDate, formatMoney } from '@/utils/format'
import { statusClass, statusLabel } from '@/utils/admin'

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
const offers = computed(() => Array.isArray(item.value?.offers) ? item.value.offers as Record<string, unknown>[] : [])

function nested(parent: string, key: string) {
  const value = item.value?.[parent]
  return value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined
}

async function load() {
  loading.value = true
  try {
    const res = await getServiceRequestDetail(String(route.params.id))
    item.value = res.data as Record<string, unknown>
  } catch (e) {
    toast.error(apiMessage(e, 'تعذر تحميل تفاصيل الطلب'))
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
