<template>
  <div ref="root" class="relative" dir="rtl">
    <label class="mb-1 block text-xs font-bold text-slate-700">{{ label }}</label>
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-right transition hover:border-emerald-300 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
      @click="open = !open"
    >
      <span class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8FBF4]">
          <i :class="['ti', selectedIcon]" style="color:#10B981; font-size:20px"></i>
        </span>
        <span>
          <span class="block text-sm font-bold text-slate-900">{{ selectedLabel }}</span>
          <span class="block text-xs text-slate-500">{{ selectedIcon || 'اختر أيقونة' }}</span>
        </span>
      </span>
      <span class="text-slate-400">⌄</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-[100] mt-2 w-full min-w-[360px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
      dir="rtl"
    >
      <input
        v-model="search"
        type="search"
        class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        placeholder="ابحث عن أيقونة..."
      />

      <div class="mt-3 flex flex-wrap gap-1.5">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="rounded-full px-3 py-1.5 text-xs font-bold transition"
          :class="activeCategory === category ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <div class="mt-3 grid max-h-[260px] grid-cols-6 gap-2 overflow-y-auto pr-1">
        <button
          v-for="icon in filteredIcons"
          :key="icon.className"
          type="button"
          class="rounded-xl border p-2 text-center transition hover:border-emerald-300 hover:bg-emerald-50"
          :class="modelValue === icon.className ? 'border-emerald-500 bg-[#A7F3D0]' : 'border-transparent bg-white'"
          @click="select(icon.className)"
        >
          <span class="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8FBF4]">
            <i :class="['ti', icon.className]" style="color:#10B981; font-size:18px"></i>
          </span>
          <span class="mt-1 block truncate text-[11px] font-bold text-slate-600">{{ icon.nameAr }}</span>
        </button>
        <p v-if="!filteredIcons.length" class="col-span-6 py-8 text-center text-sm text-slate-500">
          لا توجد نتائج
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
  }>(),
  {
    label: 'الأيقونة',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

interface IconItem {
  className: string
  nameAr: string
  category: string
}

const allCategory = 'الكل'
const categories = [allCategory, 'صالونات', 'صحة', 'سيارات', 'صيانة', 'رياضة', 'مطاعم', 'عقارات', 'تعليم', 'تقنية', 'أخرى']
const icons: IconItem[] = [
  { className: 'ti-scissors', nameAr: 'مقص', category: 'صالونات' },
  { className: 'ti-spa', nameAr: 'سبا', category: 'صالونات' },
  { className: 'ti-nail', nameAr: 'أظافر', category: 'صالونات' },
  { className: 'ti-hair-dryer', nameAr: 'مجفف شعر', category: 'صالونات' },
  { className: 'ti-stethoscope', nameAr: 'سماعة طبيب', category: 'صحة' },
  { className: 'ti-pill', nameAr: 'دواء', category: 'صحة' },
  { className: 'ti-dental', nameAr: 'أسنان', category: 'صحة' },
  { className: 'ti-eye', nameAr: 'عيون', category: 'صحة' },
  { className: 'ti-vaccine', nameAr: 'لقاح', category: 'صحة' },
  { className: 'ti-car', nameAr: 'سيارة', category: 'سيارات' },
  { className: 'ti-car-garage', nameAr: 'كراج', category: 'سيارات' },
  { className: 'ti-engine', nameAr: 'محرك', category: 'سيارات' },
  { className: 'ti-steering-wheel', nameAr: 'مقود', category: 'سيارات' },
  { className: 'ti-wash', nameAr: 'غسيل', category: 'سيارات' },
  { className: 'ti-tool', nameAr: 'أداة', category: 'صيانة' },
  { className: 'ti-hammer', nameAr: 'مطرقة', category: 'صيانة' },
  { className: 'ti-plug', nameAr: 'كهرباء', category: 'صيانة' },
  { className: 'ti-air-conditioning', nameAr: 'مكيف', category: 'صيانة' },
  { className: 'ti-droplet', nameAr: 'ماء', category: 'صيانة' },
  { className: 'ti-paint', nameAr: 'صبغ', category: 'صيانة' },
  { className: 'ti-dumbbell', nameAr: 'أوزان', category: 'رياضة' },
  { className: 'ti-yoga', nameAr: 'يوغا', category: 'رياضة' },
  { className: 'ti-swimming', nameAr: 'سباحة', category: 'رياضة' },
  { className: 'ti-run', nameAr: 'ركض', category: 'رياضة' },
  { className: 'ti-bike', nameAr: 'دراجة', category: 'رياضة' },
  { className: 'ti-coffee', nameAr: 'قهوة', category: 'مطاعم' },
  { className: 'ti-pizza', nameAr: 'بيتزا', category: 'مطاعم' },
  { className: 'ti-meat', nameAr: 'لحوم', category: 'مطاعم' },
  { className: 'ti-cake', nameAr: 'كيك', category: 'مطاعم' },
  { className: 'ti-home', nameAr: 'منزل', category: 'عقارات' },
  { className: 'ti-building', nameAr: 'بناية', category: 'عقارات' },
  { className: 'ti-building-store', nameAr: 'محل', category: 'عقارات' },
  { className: 'ti-key', nameAr: 'مفتاح', category: 'عقارات' },
  { className: 'ti-book', nameAr: 'كتاب', category: 'تعليم' },
  { className: 'ti-school', nameAr: 'مدرسة', category: 'تعليم' },
  { className: 'ti-pencil', nameAr: 'قلم', category: 'تعليم' },
  { className: 'ti-certificate', nameAr: 'شهادة', category: 'تعليم' },
  { className: 'ti-camera', nameAr: 'كاميرا', category: 'تقنية' },
  { className: 'ti-device-mobile', nameAr: 'موبايل', category: 'تقنية' },
  { className: 'ti-laptop', nameAr: 'حاسوب', category: 'تقنية' },
  { className: 'ti-wifi', nameAr: 'واي فاي', category: 'تقنية' },
  { className: 'ti-shirt', nameAr: 'ملابس', category: 'أخرى' },
  { className: 'ti-paw', nameAr: 'حيوانات', category: 'أخرى' },
  { className: 'ti-truck', nameAr: 'نقل', category: 'أخرى' },
  { className: 'ti-calendar', nameAr: 'تقويم', category: 'أخرى' },
  { className: 'ti-star', nameAr: 'نجمة', category: 'أخرى' },
]

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const search = ref('')
const activeCategory = ref(allCategory)
const selectedIcon = computed(() => props.modelValue || 'ti-category')
const selectedLabel = computed(() => icons.find((icon) => icon.className === props.modelValue)?.nameAr ?? 'اختر أيقونة')
const filteredIcons = computed(() => {
  const term = search.value.trim().toLowerCase()
  return icons.filter((icon) => {
    const inCategory = activeCategory.value === allCategory || icon.category === activeCategory.value
    const inSearch = !term || icon.nameAr.includes(term) || icon.className.toLowerCase().includes(term)
    return inCategory && inSearch
  })
})

function select(className: string) {
  emit('update:modelValue', className)
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>
