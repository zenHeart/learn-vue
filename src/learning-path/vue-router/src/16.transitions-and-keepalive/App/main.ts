import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Posts from './Posts.vue'
import PostDetail from './PostDetail.vue'
import About from './About.vue'

const routes = [
  { path: '/', name: 'posts', component: Posts },
  { path: '/posts/:id', name: 'post', component: PostDetail },
  { path: '/about', name: 'about', component: About, meta: { keepAlive: false } },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

;(window as any).__router__ = router

const app = createApp(App)
app.use(router)
app.mount('#app')
