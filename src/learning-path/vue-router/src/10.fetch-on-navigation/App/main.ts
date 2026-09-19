import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import ArticleAfter from './ArticleAfter.vue'
import ArticleBefore from './ArticleBefore.vue'
import ArticleSuspense from './ArticleSuspense.vue'

const routes = [
  { path: '/', redirect: '/articles/1/after' },
  // 导航后获取（最常见）
  { path: '/articles/:id/after', name: 'article-after', component: ArticleAfter },
  // 导航前获取（next(vm => ...) 模式）
  {
    path: '/articles/:id/before',
    name: 'article-before',
    component: ArticleBefore,
    beforeEnter: (to, _from, next) => {
      // next 是 4.x 中路由配置里 beforeEnter 的兼容写法；这里演示
      next()
    },
  },
  // Suspense + async setup（Vue 3 推荐）
  { path: '/articles/:id/suspense', name: 'article-suspense', component: ArticleSuspense },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')