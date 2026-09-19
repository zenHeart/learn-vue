import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import SettingsLayout from './SettingsLayout.vue'
import Profile from './Profile.vue'
import Security from './Security.vue'
import Notifications from './Notifications.vue'
import HelpSidebar from './HelpSidebar.vue'

const routes = [
  { path: '/', redirect: '/settings/profile' },
  {
    path: '/settings',
    component: SettingsLayout,
    // 命名视图：default 给主区，sidebar 给右侧辅助区
    components: { default: SettingsLayout, sidebar: HelpSidebar },
    children: [
      // 子路由默认继承父路径，写成 '' 即可匹配 /settings
      { path: '', redirect: 'profile' },
      { path: 'profile', component: Profile },
      { path: 'security', component: Security },
      { path: 'notifications', component: Notifications },
    ],
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')