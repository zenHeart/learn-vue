import { createApp } from 'vue'
import {
  createRouter,
  createMemoryHistory,
} from 'vue-router/experimental'
import { loadersPlugin } from 'vue-router/experimental/data-loaders'
import App from './App.vue'
import Orders from './Orders.vue'
import OrderDetail from './OrderDetail.vue'
import { orderListLoader, orderLoader } from './loaders'

const routes = [
  {
    path: '/',
    name: 'orders',
    component: Orders,
    // 注册在路由上的 loader:进入 / 之前并行执行
    loaders: [orderListLoader],
  },
  {
    path: '/orders/:id',
    name: 'order-detail',
    component: OrderDetail,
    loaders: [orderLoader],
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

router.addRouteMatcher && router.addRouteMatcher

// 启用实验性加载器插件(挂在 navigation-guard 上收集 loaders)
router._installPlugins?.([loadersPlugin])
// 兼容性写法:大多数版本会把 plugins 暴露到 installPlugins;若不存在则忽略
// 真实项目中此插件由 createRouter 的 plugins 选项自动启用
;(window as any).__router__ = router

const app = createApp(App)
app.use(router)
app.mount('#app')
