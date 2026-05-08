<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main dir="rtl" class="p-8 space-y-8">
    <!-- Hero Section -->
    <div class="rounded-2xl p-12 text-center" style="background: linear-gradient(135deg, #257d75 0%, #1d6560 100%);">
      <h1 class="text-4xl font-bold text-white mb-3">🎯 مرحباً بك في نظام الحجوزات</h1>
      <p class="text-white text-lg opacity-90 mb-6">إدارة شاملة وسهلة لجميع عمليات الحجوزات والمحلات</p>
      <RouterLink to="/admin/dashboard" class="inline-block px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105" 
        :style="{ background: '#f2b415', color: '#1d6560' }">
        📊 الذهاب إلى لوحة التحكم
      </RouterLink>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Feature 1 -->
      <div class="card p-6 transform hover:scale-105 transition-all">
        <div class="text-4xl mb-4">📋</div>
        <h3 class="text-xl font-bold text-teal-700 mb-2">إدارة الطلبات</h3>
        <p class="text-gray-600 text-sm leading-relaxed">تتبع جميع طلبات انضمام المحلات الجديدة وإدارتها بسهولة</p>
        <RouterLink to="/admin/applications" class="inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors">
          عرض الطلبات →
        </RouterLink>
      </div>

      <!-- Feature 2 -->
      <div class="card p-6 transform hover:scale-105 transition-all">
        <div class="text-4xl mb-4">🏪</div>
        <h3 class="text-xl font-bold text-teal-700 mb-2">المحلات والخدمات</h3>
        <p class="text-gray-600 text-sm leading-relaxed">إدارة كاملة للمحلات المعتمدة والخدمات المقدمة منها</p>
        <RouterLink to="/admin/businesses" class="inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors">
          عرض المحلات →
        </RouterLink>
      </div>

      <!-- Feature 3 -->
      <div class="card p-6 transform hover:scale-105 transition-all">
        <div class="text-4xl mb-4">👥</div>
        <h3 class="text-xl font-bold text-teal-700 mb-2">إدارة المستخدمين</h3>
        <p class="text-gray-600 text-sm leading-relaxed">تحكم كامل في المستخدمين والعاملين والمسؤولين</p>
        <RouterLink to="/admin/users" class="inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors">
          عرض المستخدمين →
        </RouterLink>
      </div>

      <!-- Feature 4 -->
      <div class="card p-6 transform hover:scale-105 transition-all">
        <div class="text-4xl mb-4">📅</div>
        <h3 class="text-xl font-bold text-teal-700 mb-2">الحجوزات</h3>
        <p class="text-gray-600 text-sm leading-relaxed">تتبع جميع الحجوزات والتأكيدات والإلغاءات بفعالية</p>
        <RouterLink to="/admin/bookings" class="inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors">
          عرض الحجوزات →
        </RouterLink>
      </div>

      <!-- Feature 5 -->
      <div class="card p-6 transform hover:scale-105 transition-all">
        <div class="text-4xl mb-4">💰</div>
        <h3 class="text-xl font-bold text-teal-700 mb-2">العمولات والدفع</h3>
        <p class="text-gray-600 text-sm leading-relaxed">إدارة العمولات والمدفوعات والتقارير المالية</p>
        <RouterLink to="/admin/commissions" class="inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors">
          عرض العمولات →
        </RouterLink>
      </div>

      <!-- Feature 6 -->
      <div class="card p-6 transform hover:scale-105 transition-all">
        <div class="text-4xl mb-4">🎯</div>
        <h3 class="text-xl font-bold text-teal-700 mb-2">التصنيفات والخدمات</h3>
        <p class="text-gray-600 text-sm leading-relaxed">إدارة التصنيفات والخدمات المختلفة في النظام</p>
        <RouterLink to="/admin/categories" class="inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors">
          عرض التصنيفات →
        </RouterLink>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8" style="background: linear-gradient(135deg, rgba(37, 125, 117, 0.05) 0%, rgba(242, 180, 21, 0.03) 100%);">
      <h2 class="text-2xl font-bold text-teal-700 mb-6 text-center">📊 إحصائيات سريعة</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div class="p-4" style="background: linear-gradient(135deg, #d1f5ea, #f0faf8); border-radius: 12px;">
          <p class="text-3xl font-bold text-teal-700">∞</p>
          <p class="text-gray-600 text-sm mt-2">العاملون والموظفون</p>
        </div>
        <div class="p-4" style="background: linear-gradient(135deg, #fff9e6, #fffbf0); border-radius: 12px;">
          <p class="text-3xl font-bold text-gold-600">∞</p>
          <p class="text-gray-600 text-sm mt-2">المحلات المعتمدة</p>
        </div>
        <div class="p-4" style="background: linear-gradient(135deg, #d1f5ea, #f0faf8); border-radius: 12px;">
          <p class="text-3xl font-bold text-teal-700">∞</p>
          <p class="text-gray-600 text-sm mt-2">الحجوزات الموثقة</p>
        </div>
        <div class="p-4" style="background: linear-gradient(135deg, #fff9e6, #fffbf0); border-radius: 12px;">
          <p class="text-3xl font-bold text-gold-600">∞</p>
          <p class="text-gray-600 text-sm mt-2">العمولات المحققة</p>
        </div>
      </div>
    </div>
  </main>
</template>

    <!-- Features Grid -->
    <div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
      <!-- Feature 1 -->
      <div class=\"card p-6 transform hover:scale-105 transition-all\">
        <div class=\"text-4xl mb-4\">📋</div>
        <h3 class=\"text-xl font-bold text-teal-700 mb-2\">إدارة الطلبات</h3>
        <p class=\"text-gray-600 text-sm leading-relaxed\">تتبع جميع طلبات انضمام المحلات الجديدة وإدارتها بسهولة</p>
        <RouterLink to=\"/admin/applications\" class=\"inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors\">
          عرض الطلبات →
        </RouterLink>
      </div>

      <!-- Feature 2 -->
      <div class=\"card p-6 transform hover:scale-105 transition-all\">
        <div class=\"text-4xl mb-4\">🏪</div>
        <h3 class=\"text-xl font-bold text-teal-700 mb-2\">المحلات والخدمات</h3>
        <p class=\"text-gray-600 text-sm leading-relaxed\">إدارة كاملة للمحلات المعتمدة والخدمات المقدمة منها</p>
        <RouterLink to=\"/admin/businesses\" class=\"inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors\">
          عرض المحلات →
        </RouterLink>
      </div>

      <!-- Feature 3 -->
      <div class=\"card p-6 transform hover:scale-105 transition-all\">
        <div class=\"text-4xl mb-4\">👥</div>
        <h3 class=\"text-xl font-bold text-teal-700 mb-2\">إدارة المستخدمين</h3>
        <p class=\"text-gray-600 text-sm leading-relaxed\">تحكم كامل في المستخدمين والعاملين والمسؤولين</p>
        <RouterLink to=\"/admin/users\" class=\"inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors\">
          عرض المستخدمين →
        </RouterLink>
      </div>

      <!-- Feature 4 -->
      <div class=\"card p-6 transform hover:scale-105 transition-all\">
        <div class=\"text-4xl mb-4\">📅</div>
        <h3 class=\"text-xl font-bold text-teal-700 mb-2\">الحجوزات</h3>
        <p class=\"text-gray-600 text-sm leading-relaxed\">تتبع جميع الحجوزات والتأكيدات والإلغاءات بفعالية</p>
        <RouterLink to=\"/admin/bookings\" class=\"inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors\">
          عرض الحجوزات →
        </RouterLink>
      </div>

      <!-- Feature 5 -->
      <div class=\"card p-6 transform hover:scale-105 transition-all\">
        <div class=\"text-4xl mb-4\">💰</div>
        <h3 class=\"text-xl font-bold text-teal-700 mb-2\">العمولات والدفع</h3>
        <p class=\"text-gray-600 text-sm leading-relaxed\">إدارة العمولات والمدفوعات والتقارير المالية</p>
        <RouterLink to=\"/admin/commissions\" class=\"inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors\">
          عرض العمولات →
        </RouterLink>
      </div>

      <!-- Feature 6 -->
      <div class=\"card p-6 transform hover:scale-105 transition-all\">
        <div class=\"text-4xl mb-4\">🎯</div>
        <h3 class=\"text-xl font-bold text-teal-700 mb-2\">التصنيفات والخدمات</h3>
        <p class=\"text-gray-600 text-sm leading-relaxed\">إدارة التصنيفات والخدمات المختلفة في النظام</p>
        <RouterLink to=\"/admin/categories\" class=\"inline-block mt-4 text-teal-600 hover:text-gold-600 font-semibold transition-colors\">
          عرض التصنيفات →
        </RouterLink>
      </div>
    </div>

    <!-- Stats Section -->
    <div class=\"bg-white rounded-2xl border border-gray-200 p-8\" style=\"background: linear-gradient(135deg, rgba(37, 125, 117, 0.05) 0%, rgba(242, 180, 21, 0.03) 100%);\">
      <h2 class=\"text-2xl font-bold text-teal-700 mb-6 text-center\">📊 إحصائيات سريعة</h2>
      <div class=\"grid grid-cols-1 md:grid-cols-4 gap-4 text-center\">
        <div class=\"p-4\" style=\"background: linear-gradient(135deg, #d1f5ea, #f0faf8); border-radius: 12px;\">
          <p class=\"text-3xl font-bold text-teal-700\">∞</p>
          <p class=\"text-gray-600 text-sm mt-2\">العاملون والموظفون</p>
        </div>
        <div class=\"p-4\" style=\"background: linear-gradient(135deg, #fff9e6, #fffbf0); border-radius: 12px;\">
          <p class=\"text-3xl font-bold text-gold-600\">∞</p>
          <p class=\"text-gray-600 text-sm mt-2\">المحلات المعتمدة</p>
        </div>
        <div class=\"p-4\" style=\"background: linear-gradient(135deg, #d1f5ea, #f0faf8); border-radius: 12px;\">
          <p class=\"text-3xl font-bold text-teal-700\">∞</p>
          <p class=\"text-gray-600 text-sm mt-2\">الحجوزات الموثقة</p>
        </div>\n        <div class=\"p-4\" style=\"background: linear-gradient(135deg, #fff9e6, #fffbf0); border-radius: 12px;\">
          <p class=\"text-3xl font-bold text-gold-600\">∞</p>
          <p class=\"text-gray-600 text-sm mt-2\">العمولات المحققة</p>
        </div>
      </div>
    </div>
  </main>
</template>
