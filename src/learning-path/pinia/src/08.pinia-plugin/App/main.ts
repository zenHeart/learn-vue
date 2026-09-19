import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { persistencePlugin } from './persist-plugin'

const pinia = createPinia()
pinia.use(persistencePlugin)

const app = createApp(App)
app.use(pinia)
app.mount('#app')