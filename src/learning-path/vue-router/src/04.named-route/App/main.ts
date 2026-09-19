import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import OrderList from './OrderList.vue'
import OrderDetail from './OrderDetail.vue'

const routes = [
  { path: '/', redirect: '/orders' },
  { path: '/orders', name: 'orders', component: OrderList },
  // 名字 + 必填 params 在路由表中显式声明
  {
    path: '/orders/:id',
    name: 'order-detail',
    component: OrderDetail,
    props: true,
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')