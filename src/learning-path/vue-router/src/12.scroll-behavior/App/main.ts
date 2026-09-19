import { createApp } from 'vue'
import { createRouter, createMemoryHistory, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Doc from './Doc.vue'
import List from './List.vue'

// 沙箱里用 hash 模拟真实路径便于看到 savedPosition 行为
const routes = [
  { path: '/', redirect: '/list' },
  { path: '/list', name: 'list', component: List },
  // meta.scrollTop 让页面返回列表时滚动到自定义位置
  { path: '/doc/:id', name: 'doc', component: Doc, meta: { scrollTop: 0 } },
]

const router = createRouter({
  // 用 hash history 便于在同一 origin 内测试
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 1. 后退/前进：vue-router 自动恢复
    if (savedPosition) return savedPosition
    // 2. hash 锚点：滚到对应 id
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'smooth' }
    }
    // 3. 进入 doc 页：滚到顶部（meta.scrollTop）
    if (to.name === 'doc') {
      return { top: to.meta.scrollTop as number, behavior: 'smooth' }
    }
    // 4. 其它情况：保持在原位
    return false
  },
})

const app = createApp(App)
app.use(router)
app.mount('#app')