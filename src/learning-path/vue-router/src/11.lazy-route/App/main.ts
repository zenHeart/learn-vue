import { createApp, defineAsyncComponent } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'

// 异步加载：路由配置里直接用 import()
const Dashboard = () => import('./Dashboard.vue')
const Reports = () => import('./Reports.vue')
// 写法二：用 defineAsyncComponent 包裹
const Heavy = defineAsyncComponent(() => import('./Heavy.vue'))

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/reports', name: 'reports', component: Reports },
  { path: '/heavy', name: 'heavy', component: Heavy },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')