import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
        { path: 'applications', component: () => import('@/views/admin/ApplicationsView.vue') },
        { path: 'applications/:id', component: () => import('@/views/admin/ApplicationDetailView.vue') },
        { path: 'businesses', component: () => import('@/views/admin/BusinessesView.vue') },
        { path: 'businesses/:id', component: () => import('@/views/admin/BusinessDetailView.vue') },
        { path: 'users', component: () => import('@/views/admin/UsersView.vue') },
        { path: 'categories', component: () => import('@/views/admin/CategoriesView.vue') },
        { path: 'bookings', component: () => import('@/views/admin/BookingsView.vue') },
        { path: 'commissions', component: () => import('@/views/admin/CommissionsView.vue') },
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to, _, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.meta.guest && auth.isLoggedIn) return next('/')
  next()
})

export default router
