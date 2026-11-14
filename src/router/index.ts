import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/privacy',
      component: PublicLayout,
      meta: { public: true },
      children: [
        {
          path: '',
          name: 'privacy',
          meta: { title: 'سياسة الخصوصية' },
          component: () => import('@/views/public/PrivacyView.vue'),
        },
      ],
    },
    {
      path: '/terms',
      component: PublicLayout,
      meta: { public: true },
      children: [
        {
          path: '',
          name: 'terms',
          meta: { title: 'الشروط والأحكام' },
          component: () => import('@/views/public/TermsView.vue'),
        },
      ],
    },
    {
      path: '/delete-account',
      component: PublicLayout,
      meta: { public: true },
      children: [
        {
          path: '',
          name: 'delete-account',
          meta: { title: 'حذف الحساب' },
          component: () => import('@/views/public/DeleteAccountView.vue'),
        },
      ],
    },
    {
      path: '/login',
      component: AuthLayout,
      meta: { guest: true },
      children: [
        {
          path: '',
          name: 'login',
          meta: { title: 'تسجيل الدخول' },
          component: () => import('@/views/auth/LoginView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        {
          path: 'dashboard',
          name: 'dashboard',
          meta: { title: 'لوحة التحكم' },
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'applications',
          name: 'applications',
          meta: { title: 'طلبات الانضمام' },
          component: () => import('@/views/admin/ApplicationsView.vue'),
        },
        {
          path: 'applications/:id',
          name: 'application-detail',
          meta: { title: 'تفاصيل طلب الانضمام' },
          component: () => import('@/views/admin/ApplicationDetailView.vue'),
        },
        {
          path: 'businesses',
          name: 'businesses',
          meta: { title: 'المحلات' },
          component: () => import('@/views/businesses/BusinessesListView.vue'),
        },
        {
          path: 'businesses/:id',
          name: 'business-detail',
          meta: { title: 'تفاصيل المحل' },
          component: () => import('@/views/businesses/BusinessDetailView.vue'),
        },
        {
          path: 'customers',
          name: 'customers',
          meta: { title: 'الزبائن' },
          component: () => import('@/views/customers/CustomersListView.vue'),
        },
        {
          path: 'customers/:id',
          name: 'customer-detail',
          meta: { title: 'تفاصيل الزبون' },
          component: () => import('@/views/customers/CustomerDetailView.vue'),
        },
        {
          path: 'users',
          name: 'users',
          meta: { title: 'المستخدمين' },
          component: () => import('@/views/admin/UsersView.vue'),
        },
        {
          path: 'craftsmen',
          name: 'craftsmen',
          meta: { title: 'الحرفيون' },
          component: () => import('@/views/admin/CraftsmenView.vue'),
        },
        {
          path: 'craftsmen/:id',
          name: 'craftsman-detail',
          meta: { title: 'تفاصيل الحرفي' },
          component: () => import('@/views/admin/CraftsmanDetailView.vue'),
        },
        {
          path: 'bookings',
          name: 'bookings',
          meta: { title: 'الحجوزات' },
          component: () => import('@/views/bookings/BookingsView.vue'),
        },
        {
          path: 'credits/top-up-requests',
          name: 'credits-top-up-requests',
          meta: { title: 'طلبات شحن Credits' },
          component: () => import('@/views/admin/CreditsTopUpRequestsView.vue'),
        },
        {
          path: 'categories',
          name: 'categories',
          meta: { title: 'التصنيفات' },
          component: () => import('@/views/categories/CategoriesView.vue'),
        },
        {
          path: 'professions',
          name: 'professions',
          meta: { title: 'الحرف' },
          component: () => import('@/views/admin/ProfessionsView.vue'),
        },
        {
          path: 'occasions',
          name: 'occasions',
          meta: { title: 'المناسبات' },
          component: () => import('@/views/admin/OccasionsView.vue'),
        },
        {
          path: 'service-requests',
          name: 'service-requests',
          meta: { title: 'الخدمات الموقعية' },
          component: () => import('@/views/admin/ServiceRequestsView.vue'),
        },
        {
          path: 'service-requests/:id',
          name: 'service-request-detail',
          meta: { title: 'تفاصيل الخدمة الموقعية' },
          component: () => import('@/views/admin/ServiceRequestDetailView.vue'),
        },
        {
          path: 'commissions',
          name: 'commissions',
          meta: { title: 'العمولات' },
          component: () => import('@/views/admin/CommissionsView.vue'),
        },
        {
          path: 'coupons',
          name: 'coupons',
          meta: { title: 'الكوبونات' },
          component: () => import('@/views/admin/CouponsView.vue'),
        },
        {
          path: 'discounts',
          name: 'discounts',
          meta: { title: 'العروض والخصومات' },
          component: () => import('@/views/admin/DiscountsView.vue'),
        },
        {
          path: 'advertisements',
          name: 'advertisements',
          meta: { title: 'الإعلانات' },
          component: () => import('@/views/admin/AdvertisementsView.vue'),
        },
        {
          path: 'complaints',
          name: 'complaints',
          meta: { title: 'الشكاوى' },
          component: () => import('@/views/admin/ComplaintsView.vue'),
        },
        {
          path: 'complaints/:id',
          name: 'complaint-detail',
          meta: { title: 'تفاصيل الشكوى' },
          component: () => import('@/views/admin/ComplaintDetailView.vue'),
        },
        {
          path: 'broadcast',
          name: 'broadcast',
          meta: { title: 'الإشعارات الإعلانية' },
          component: () => import('@/views/admin/BroadcastView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          meta: { title: 'الإعدادات' },
          component: () => import('@/views/admin/SettingsView.vue'),
        },
        {
          path: 'ai',
          name: 'ai-settings',
          meta: { title: 'المساعد الذكي' },
          component: () => import('@/views/admin/AiSettingsView.vue'),
        },
        {
          path: 'revenue',
          name: 'revenue',
          meta: { title: 'الإيرادات' },
          component: () => import('@/views/revenue/RevenueView.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          meta: { title: 'الإشعارات' },
          component: () => import('@/views/notifications/NotificationsView.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          meta: { title: 'التقارير' },
          component: () => import('@/views/reports/ReportsView.vue'),
        },
        {
          path: 'geography',
          name: 'geography',
          meta: { title: 'المحافظات والمناطق' },
          component: () => import('@/views/admin/GeographyView.vue'),
        },
        {
          path: 'medical/specialties',
          name: 'medical-specialties',
          meta: { title: 'التخصصات الطبية' },
          component: () => import('@/views/medical/MedicalSpecialtiesView.vue'),
        },
        {
          path: 'medical/clinics',
          name: 'medical-clinics',
          meta: { title: 'العيادات' },
          component: () => import('@/views/medical/MedicalClinicsView.vue'),
        },
        {
          path: 'medical/clinics/:id',
          name: 'medical-clinic-detail',
          meta: { title: 'تفاصيل العيادة' },
          component: () => import('@/views/medical/MedicalClinicDetailView.vue'),
        },
        {
          path: 'medical/doctors',
          name: 'medical-doctors',
          meta: { title: 'الأطباء المستقلون' },
          component: () => import('@/views/medical/MedicalDoctorsView.vue'),
        },
        {
          path: 'medical/doctors/:id',
          name: 'medical-doctor-detail',
          meta: { title: 'تفاصيل الطبيب' },
          component: () => import('@/views/medical/MedicalDoctorDetailView.vue'),
        },
        {
          path: 'medical/appointments',
          name: 'medical-appointments',
          meta: { title: 'المواعيد الطبية' },
          component: () => import('@/views/medical/MedicalAppointmentsView.vue'),
        },
        {
          path: 'restaurants',
          name: 'restaurants',
          meta: { title: 'المطاعم' },
          component: () => import('@/views/restaurant/RestaurantsView.vue'),
        },
        {
          path: 'restaurants/:id',
          name: 'restaurant-detail',
          meta: { title: 'تفاصيل المطعم' },
          component: () => import('@/views/restaurant/RestaurantDetailView.vue'),
        },
        {
          path: 'restaurants/:id/menu',
          name: 'restaurant-menu',
          meta: { title: 'قائمة المطعم' },
          component: () => import('@/views/restaurant/RestaurantMenuView.vue'),
        },
        {
          path: 'restaurant/menus',
          name: 'restaurant-menus',
          meta: { title: 'قوائم المطاعم' },
          component: () => import('@/views/restaurant/RestaurantMenuView.vue'),
        },
        {
          path: 'restaurants/:id/floors',
          name: 'restaurant-floors',
          meta: { title: 'الطوابق والطاولات' },
          component: () => import('@/views/restaurant/RestaurantFloorsView.vue'),
        },
        {
          path: 'restaurant/floors',
          name: 'restaurant-floors-index',
          meta: { title: 'الطوابق والطاولات' },
          component: () => import('@/views/restaurant/RestaurantFloorsView.vue'),
        },
        {
          path: 'restaurant/cuisines',
          name: 'restaurant-cuisines',
          meta: { title: 'أنواع المطبخ' },
          component: () => import('@/views/restaurant/RestaurantCuisinesView.vue'),
        },
        {
          path: 'restaurant/reservations',
          name: 'restaurant-reservations',
          meta: { title: 'حجوزات الطاولات' },
          component: () => import('@/views/restaurant/RestaurantReservationsView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '404', public: true },
    },
  ],
})

router.beforeEach((to, _, next) => {
  const { locale } = useLocaleStore()
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'

  if (to.meta.public) return next()

  const auth = useAuthStore()
  const token = localStorage.getItem('admin_token') || localStorage.getItem('hajiz_admin_token')
  if (to.meta.requiresAuth && !token) return next('/login')
  if (to.meta.guest && token) return next('/dashboard')
  if (to.meta.requiresAuth && !auth.isLoggedIn && token) {
    /* token exists but store empty — allow navigation */
  }
  next()
})

export default router
