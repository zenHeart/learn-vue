import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'
import Editor from './Editor.vue'
import Preview from './Preview.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  // beforeEnter 仅允许同源跳到 /editor；见 Editor 组件的 beforeRouteLeave
  { path: '/editor', name: 'editor', component: Editor },
  { path: '/preview/:draftId', name: 'preview', component: Preview },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')