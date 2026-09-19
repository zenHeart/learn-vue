import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.mount('#app')

// 暴露 dispose 工具,方便 DevTools 里手动测试
;(window as any).__pinia__ = pinia
