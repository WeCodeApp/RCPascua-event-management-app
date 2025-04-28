import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import EventListView from '@/views/EventListView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/events',
      name: 'events',
      component: EventListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/:catchAll(.*)', // Catch-all route for 404
      name: 'not-found',
      component: NotFoundView
    }
  ]
})

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const user = localStorage.getItem('user')
  if (to.meta.requiresAuth && !user) {
    next({ name: 'login' })
  } else if (to.name === 'login' && user) {
    // Redirect to events if the user is already logged in and tries to access the login page
    next({ name: 'events' })
  } else {
    next()
  }
})

export default router