import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pinia-demo-draft'

interface DraftState {
  title: string
  body: string
}

const initial: DraftState = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { title: '', body: '' }
  } catch {
    return { title: '', body: '' }
  }
})()

export const useDraftStore = defineStore('draft', () => {
  const title = ref(initial.title)
  const body = ref(initial.body)

  // 字段级 watch：常用于联动 UI（如剩余字数）
  watch([title, body], () => {
    // 演示用：实时计算 title + body 的字符数
  })

  return { title, body }
})

// 模拟插件式订阅：在 main.ts 中手动注册即可
export function installDraftPersistence(store: ReturnType<typeof useDraftStore>) {
  store.$subscribe((_mutation, state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: state.title, body: state.body }))
    } catch {
      /* quota exceeded */
    }
  })
}