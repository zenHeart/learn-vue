import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Orders from './Orders.vue'
import OrderSecret from './OrderSecret.vue'

const routes = [
  { path: '/', redirect: '/orders' },
  { path: '/orders', name: 'orders', component: Orders },
  {
    path: '/orders/:id/secret',
    name: 'order-secret',
    component: OrderSecret,
    meta: { roles: ['manager'] },
    // 路由独享守卫：只对当前路由生效
    beforeEnter: (to) => {
      const role = sessionStorage.getItem('role') || ''
      if (!to.meta.roles?.includes(role)) {
        return { name: 'orders', query: { denied: to.fullPath } }
      }
      return true
    },
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.config.globalProperties.$setRole = (r: string) => sessionStorage.setItem('role', r)
app.use(router)
app.mount('#app')