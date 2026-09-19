import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import User from './User.vue'

// typed-routes unplugin 在构建时扫描这个数组,生成 RouteMap 类型
// 这里手写一份类型用于演示,实际项目里由 unplugin 注入
interface RouteMap {
  '/': { params: Record<string, never>; query?: Record<string, never> }
  '/users/:id': { params: { id: string } }
}

declare module 'vue-router' {
  interface _RouteMap extends RouteMap {}
}

const routes = [
  { path: '/', name: 'home', component: User },
  { path: '/users/:id', name: 'user', component: User },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

;(window as any).__router__ = router

const app = createApp(App)
app.use(router)
app.mount('#app')
