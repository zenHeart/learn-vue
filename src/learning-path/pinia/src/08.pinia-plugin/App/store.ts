import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePrefsStore = defineStore('prefs', {
  state: () => ({ theme: 'light', locale: 'zh-CN', lastOpened: '' as string }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
  },
  // pinia 第四个参数：自定义选项，被 persist-plugin 读取
  persist: { paths: ['theme', 'locale'] },
})

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  return { count }
})