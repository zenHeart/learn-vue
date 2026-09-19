import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import User from './User.vue'
import Home from './Home.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/user/:id', name: 'user', component: User },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')