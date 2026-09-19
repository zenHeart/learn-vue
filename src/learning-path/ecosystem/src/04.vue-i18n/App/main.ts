import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

const messages = {
  'zh-CN': {
    hello: '你好，{name}',
    cart: '购物车 | {count} 件商品',
    saved: '已为你保存 {n} 项设置',
  },
  en: {
    hello: 'Hello, {name}',
    cart: 'no items | 1 item | {count} items',
    saved: 'Saved {n} settings',
  },
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages,
})

createApp(App).use(i18n).mount('#app')
