import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Counter from './Counter.vue'
import Profile from './Profile.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'counter', component: Counter },
    { path: '/profile', name: 'profile', component: Profile },
  ],
})

;(window as any).__router__ = router

const app = createApp(App)
app.use(router)
app.mount('#app')

// 让路由文件改动也能热替换
if (import.meta.hot) {
  import.meta.hot.accept('./router-config', (mod) => {
    if (mod?.router) {
      // 简化演示:实际生产里用 router.replace 推回当前路径,触发重建
      console.log('[HMR] router config reloaded')
    }
  })
}
