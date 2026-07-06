<template>
  <div class="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-sm font-black text-slate-900">إعدادات الحجز</h4>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="(preset, key) in CATEGORY_PRESETS"
          :key="key"
          type="button"
          class="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-primary ring-1 ring-primary/20 hover:bg-primary-light"
          @click="applyPreset(preset.state)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block">
        <span class="mb-1 block text-xs font-bold text-slate-700">نوع الحجز (قديم — للتوافق)</span>
        <select v-model.number="model.bookingType" class="w-full rounded-xl border border-border px-3 py-2.5 text-sm">
          <option v-for="opt in BOOKING_TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>
      <label class="block">
        <span class="mb-1 block text-xs font-bold text-slate-700">مسار الحجز (Booking flow)</span>
        <select v-model="model.bookingFlow" class="w-full rounded-xl border border-border px-3 py-2.5 text-sm">
          <option v-for="opt in BOOKING_FLOW_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>
    </div>

    <div class="grid gap-2 sm:grid-cols-2">
      <label class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
        <input v-model="model.requiresServices" type="checkbox" class="size-4 accent-primary" />
        <span class="text-sm font-bold">يتطلب خدمات</span>
      </label>
      <label class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
        <input v-model="model.requiresStaffSelection" type="checkbox" class="size-4 accent-primary" />
        <span class="text-sm font-bold">يتطلب اختيار موظف</span>
      </label>
      <label class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
        <input v-model="model.requiresGuestCount" type="checkbox" class="size-4 accent-primary" />
        <span class="text-sm font-bold">يتطلب عدد الضيوف</span>
      </label>
      <label class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
        <input v-model="model.supportsOccasionSelection" type="checkbox" class="size-4 accent-primary" />
        <span class="text-sm font-bold">يدعم اختيار المناسبة</span>
      </label>
      <label class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200 sm:col-span-2">
        <input v-model="model.requiresOccasionSelection" type="checkbox" class="size-4 accent-primary" />
        <span class="text-sm font-bold">اختيار المناسبة إلزامي</span>
      </label>
    </div>

    <ul v-if="hints.length" class="space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
      <li v-for="(hint, i) in hints" :key="i">• {{ hint }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryBookingFormState } from '@/types/category'
import {
  BOOKING_FLOW_OPTIONS,
  BOOKING_TYPE_OPTIONS,
  CATEGORY_PRESETS,
  getBookingHints,
} from '@/utils/categoryBooking'

const model = defineModel<CategoryBookingFormState>({ required: true })

const hints = computed(() => getBookingHints(model.value))

function applyPreset(state: CategoryBookingFormState) {
  model.value = { ...state }
}
</script>
