import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'
import Admin from './Admin.vue'
import Login from './Login.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  // meta 字段约定权限要求
  { path: '/admin', name: 'admin', component: Admin, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: Login },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

// 模拟一个 token 缓存
const tokenStore = { value: '' }

router.beforeEach(async (to) => {
  // 模拟异步检查
  await new Promise((r) => setTimeout(r, 50))
  if (to.meta.requiresAuth && !tokenStore.value) {
    // 把原始目标带过去，登录后可跳回
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

// 演示：直接挂到 router 实例上以便 dev console 中调试
;(window as any).__router__ = router
;(window as any).__tokenStore__ = tokenStore

const app = createApp(App)
app.config.globalProperties.$tokenStore = tokenStore
app.use(router)
app.mount('#app')