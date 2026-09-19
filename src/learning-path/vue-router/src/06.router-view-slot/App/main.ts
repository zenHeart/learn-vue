import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import ProductList from './ProductList.vue'
import ProductDetail from './ProductDetail.vue'

const routes = [
  { path: '/', redirect: '/products' },
  { path: '/products', name: 'products', component: ProductList },
  // key 用作 KeepAlive 的缓存键，可让组件按 productId 单独缓存
  { path: '/products/:id', name: 'product-detail', component: ProductDetail },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')