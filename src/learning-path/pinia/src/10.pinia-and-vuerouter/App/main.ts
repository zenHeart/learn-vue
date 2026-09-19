import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'
import Login from './Login.vue'
import Admin from './Admin.vue'
import { useAuthStore } from './store'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login },
  { path: '/admin', name: 'admin', component: Admin, meta: { requiresAdmin: true } },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)

// 在 pinia 激活之后再注册守卫
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

app.mount('#app')