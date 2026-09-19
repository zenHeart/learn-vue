import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useDraftStore, installDraftPersistence } from './store'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.mount('#app')

// 注册订阅：组件外启动也要先 pinia 已经激活
installDraftPersistence(useDraftStore(pinia))