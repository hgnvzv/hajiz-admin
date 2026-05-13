# 🖥️ Admin Dashboard — Add Coupons Page + Updates

> **Project: `~/hajiz/hajiz-admin/` (Vue 3 + Tailwind)**
> Implement everything. No placeholders.

---

## 📋 CHANGE 1: Add Coupons Page

### Sidebar — Add New Item

In `AdminLayout.vue`, add to navItems array:
```javascript
{ to: '/coupons', icon: '🎟️', label: 'الكوبونات' },
```

Place it after "العمولات" and before "العروض والخصومات".

### Router — Add Route

```javascript
{ path: 'coupons', component: () => import('@/views/admin/CouponsView.vue') },
```

### CouponsView.vue — Full Page

**API Endpoints:**
```
GET    /api/admin/coupons              → List all coupons
POST   /api/admin/coupons              → Create coupon
PUT    /api/admin/coupons/{id}/toggle  → Toggle active/inactive
DELETE /api/admin/coupons/{id}         → Soft delete
```

**Page Layout:**

```
┌──────────────────────────────────────────────────┐
│  🎟️ الكوبونات                    [+ كوبون جديد]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────────┐│
│  │ الرمز  │ الخصم │ الحد  │ مستخدم │ من   │ إلى  ││
│  │        │   %   │ الأقصى│  /كل   │      │      ││
│  ├────────┼───────┼───────┼────────┼──────┼──────┤│
│  │WELCOME │  20%  │10,000 │  3/100 │05/13 │06/13 ││
│  │  20    │       │ د.ع   │        │      │      ││
│  │        │       │       │        │ [تفعيل][حذف]││
│  ├────────┼───────┼───────┼────────┼──────┼──────┤│
│  │SUMMER  │  15%  │  —    │  0/50  │05/15 │07/15 ││
│  │  15    │       │       │        │      │      ││
│  │        │       │       │        │ [إيقاف][حذف]││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

**Create Vue Component:**

```vue
<!-- src/views/admin/CouponsView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const coupons = ref([])
const loading = ref(true)
const showModal = ref(false)
const form = ref({
  code: '',
  discountPercent: 10,
  maxDiscountAmount: null,
  maxUses: 100,
  startDate: '',
  endDate: '',
  businessId: null,
  categoryId: null,
})

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/coupons')
    coupons.value = data
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

async function create() {
  try {
    await api.post('/admin/coupons', form.value)
    showModal.value = false
    form.value = { code: '', discountPercent: 10, maxDiscountAmount: null, maxUses: 100, startDate: '', endDate: '', businessId: null, categoryId: null }
    load()
  } catch (e) {
    alert(e.response?.data?.message || 'حدث خطأ')
  }
}

async function toggle(id) {
  await api.put(`/admin/coupons/${id}/toggle`)
  load()
}

async function remove(id) {
  if (!confirm('هل أنت متأكد من حذف الكوبون؟')) return
  await api.delete(`/admin/coupons/${id}`)
  load()
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(load)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-900">🎟️ الكوبونات</h1>
      <button @click="showModal = true"
        class="px-4 py-2.5 rounded-xl text-sm text-white font-bold"
        style="background: linear-gradient(135deg, #2563EB, #1D4ED8)">
        + كوبون جديد
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-2xl border border-slate-200 p-5">
        <p class="text-xs text-slate-500">إجمالي الكوبونات</p>
        <p class="text-3xl font-bold text-slate-900">{{ coupons.length }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 p-5">
        <p class="text-xs text-slate-500">نشطة</p>
        <p class="text-3xl font-bold" style="color: #059669">{{ coupons.filter(c => c.isActive).length }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 p-5">
        <p class="text-xs text-slate-500">إجمالي الاستخدامات</p>
        <p class="text-3xl font-bold" style="color: #2563EB">{{ coupons.reduce((s, c) => s + (c.currentUses || 0), 0) }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-10 text-center text-slate-400">جاري التحميل...</div>
      <div v-else-if="coupons.length === 0" class="p-10 text-center">
        <p class="text-4xl mb-2">🎟️</p>
        <p class="text-slate-500">لا توجد كوبونات بعد</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead style="background: #F8FAFC">
          <tr>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الرمز</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الخصم</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الحد الأقصى</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الاستخدام</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">من</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">إلى</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">الحالة</th>
            <th class="text-right px-5 py-3 text-xs font-bold text-slate-500">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="c in coupons" :key="c.id" class="hover:bg-slate-50 transition-all group">
            <td class="px-5 py-3.5">
              <span class="font-mono font-bold text-sm px-2 py-1 rounded"
                style="background: #EFF6FF; color: #2563EB">{{ c.code }}</span>
            </td>
            <td class="px-5 py-3.5 font-bold">{{ c.discountPercent }}%</td>
            <td class="px-5 py-3.5">{{ c.maxDiscountAmount ? `${c.maxDiscountAmount.toLocaleString()} د.ع` : '—' }}</td>
            <td class="px-5 py-3.5">
              <span class="font-bold">{{ c.currentUses }}</span>
              <span class="text-slate-400"> / {{ c.maxUses }}</span>
            </td>
            <td class="px-5 py-3.5 text-slate-500">{{ formatDate(c.startDate) }}</td>
            <td class="px-5 py-3.5 text-slate-500">{{ formatDate(c.endDate) }}</td>
            <td class="px-5 py-3.5">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                :style="c.isActive
                  ? 'background: #F0FDF4; color: #047857'
                  : 'background: #FEF2F2; color: #B91C1C'">
                {{ c.isActive ? 'نشط' : 'متوقف' }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="toggle(c.id)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  :style="c.isActive
                    ? 'background: #FFFBEB; color: #B45309'
                    : 'background: #F0FDF4; color: #047857'">
                  {{ c.isActive ? 'إيقاف' : 'تفعيل' }}
                </button>
                <button @click="remove(c.id)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style="background: #FEF2F2; color: #B91C1C">
                  حذف
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 p-4"
      style="background: rgba(0,0,0,0.5)" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl">
        <div class="flex justify-between mb-5">
          <h3 class="font-bold text-slate-900 text-lg">كوبون جديد</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-xs font-bold text-slate-600 mb-1 block">رمز الكوبون *</label>
            <input v-model="form.code" placeholder="مثال: WELCOME20"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase"
              style="letter-spacing: 2px" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-slate-600 mb-1 block">نسبة الخصم % *</label>
              <input v-model.number="form.discountPercent" type="number" min="1" max="100"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-600 mb-1 block">الحد الأقصى (د.ع)</label>
              <input v-model.number="form.maxDiscountAmount" type="number" placeholder="اختياري"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600 mb-1 block">عدد الاستخدامات الأقصى</label>
            <input v-model.number="form.maxUses" type="number" min="1"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-slate-600 mb-1 block">تاريخ البداية *</label>
              <input v-model="form.startDate" type="date"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-600 mb-1 block">تاريخ النهاية *</label>
              <input v-model="form.endDate" type="date"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button @click="showModal = false"
            class="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 hover:bg-slate-50">
            إلغاء
          </button>
          <button @click="create"
            class="flex-1 py-2.5 rounded-xl text-sm text-white font-bold"
            style="background: linear-gradient(135deg, #2563EB, #1D4ED8)">
            إنشاء الكوبون
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## 📋 CHANGE 2: Update Settings Page — Add New Fields

In `SettingsView.vue`, add these new fields if not already present:

```javascript
// New fields from the API:
{ label: 'نسبة غرامة عدم الحضور', key: 'noShowPenaltyRate', type: 'percentage', hint: '0.10 = 10%' },
{ label: 'مهلة عدم الحضور (دقائق)', key: 'noShowGracePeriodMinutes', type: 'number' },
{ label: 'سعر الإعلان اليومي (د.ع)', key: 'adPricePerDay', type: 'number' },
{ label: 'تذكير قبل الموعد (ساعات)', key: 'reminderHoursBeforeBooking', type: 'number' },
{ label: 'تذكير نهائي (ساعات)', key: 'finalReminderHoursBeforeBooking', type: 'number' },
```

Group them in sections:
```
┌─ رسوم وعمولات ──────────────┐
│ عمولة المحلات الخدمية: 5%    │
│ رسوم المطاعم/شخص: 5$        │
│ نسبة على الزبون: 10%         │
│ نسبة على الحرفي: 15%         │
├─ إعدادات الإلغاء وعدم الحضور ┤
│ نسبة غرامة الإلغاء: 5%       │
│ مهلة الإلغاء: 3 ساعات        │
│ نسبة غرامة عدم الحضور: 10%   │
│ مهلة عدم الحضور: 30 دقيقة    │
├─ التذكيرات ──────────────────┤
│ تذكير قبل الموعد: 6 ساعات    │
│ تذكير نهائي: 1 ساعة          │
├─ الإعلانات ──────────────────┤
│ سعر الإعلان اليومي: 20,000   │
└──────────────────────────────┘
```

---

## 📋 CHANGE 3: Update Sidebar Order

Final sidebar order:
```javascript
const navItems = [
  { to: '/dashboard',          icon: '📊', label: 'الرئيسية' },
  { to: '/applications',      icon: '📋', label: 'طلبات الانضمام' },
  { to: '/businesses',        icon: '🏪', label: 'المحلات' },
  { to: '/craftsmen',         icon: '🔧', label: 'الحرفيون' },
  { to: '/users',             icon: '👥', label: 'المستخدمين' },
  { to: '/categories',        icon: '🗂️', label: 'التصنيفات' },
  { to: '/professions',       icon: '🛠️', label: 'الحرف' },
  { to: '/occasions',         icon: '🎉', label: 'المناسبات' },
  { to: '/bookings',          icon: '📅', label: 'الحجوزات' },
  { to: '/service-requests',  icon: '📍', label: 'الخدمات الموقعية' },
  { to: '/commissions',       icon: '💰', label: 'العمولات' },
  { to: '/coupons',           icon: '🎟️', label: 'الكوبونات' },          // NEW
  { to: '/discounts',         icon: '🏷️', label: 'العروض والخصومات' },
  { to: '/advertisements',    icon: '📺', label: 'الإعلانات' },
  { to: '/complaints',        icon: '📢', label: 'الشكاوى' },
  { to: '/broadcast',         icon: '📣', label: 'الإشعارات الإعلانية' },
  { to: '/settings',          icon: '⚙️', label: 'الإعدادات' },
]
```

---

## ✅ CHECKLIST

- [ ] Coupons page accessible from sidebar
- [ ] Coupons table shows all columns
- [ ] Create coupon modal works
- [ ] Toggle active/inactive works
- [ ] Delete coupon works (with confirmation)
- [ ] Stats cards show correct numbers
- [ ] Settings page has all new fields (no-show, reminders, ad price)
- [ ] Settings save works
- [ ] Sidebar has correct order with 17 items
- [ ] All Arabic text, RTL layout
- [ ] Same design style as existing pages

**Implement everything.** 🚀