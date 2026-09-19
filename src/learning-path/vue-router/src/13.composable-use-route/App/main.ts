import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Search from './Search.vue'

const routes = [
  { path: '/', redirect: '/search?q=vue&page=1' },
  { path: '/search', name: 'search', component: Search },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')