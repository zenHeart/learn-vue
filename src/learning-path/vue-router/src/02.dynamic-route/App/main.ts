import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import User from './User.vue'
import NotFound from './NotFound.vue'

const routes = [
  // 路径冒号段会作为 params 暴露
  { path: '/', redirect: '/user/1' },
  { path: '/user/:id', component: User },
  // 嵌套动态段以多键形式落到 params
  { path: '/user/:id/post/:postId', component: User },
  { path: '/:pathMatch(.*)*', component: NotFound },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')