import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

const messages = {
  'zh-CN': {
    cart: '购物车 | {count} 件商品',
    apple: '没有苹果 | 1 个苹果 | {count} 个苹果',
    lastSeen: '上次登录：{date}',
  },
  en: {
    cart: '{count} item |||| {count} items',
    apple: 'no apples | 1 apple | {count} apples',
    lastSeen: 'Last seen: {date}',
    missing: {
      only_in_en: 'This key only exists in en, fallback chain kicks in',
    },
  },
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages,
  datetimeFormats: {
    'zh-CN': {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' },
    },
    en: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' },
    },
  },
  numberFormats: {
    'zh-CN': {
      currency: { style: 'currency', currency: 'CNY' },
      percent: { style: 'percent' },
    },
    en: {
      currency: { style: 'currency', currency: 'USD' },
      percent: { style: 'percent' },
    },
  },
})

createApp(App).use(i18n).mount('#app')
