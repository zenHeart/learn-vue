import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// Options Store
export const useTasksOptions = defineStore('tasks', {
  state: () => ({ items: [] as { id: number; text: string; done: boolean }[] }),
  getters: {
    remaining: (state) => state.items.filter((i) => !i.done).length,
    finished: (state) => state.items.filter((i) => i.done).length,
  },
  actions: {
    add(text: string) {
      this.items.push({ id: Date.now(), text, done: false })
    },
    toggle(id: number) {
      const t = this.items.find((i) => i.id === id)
      if (t) t.done = !t.done
    },
  },
})

// Setup Store（推荐写法）
export const useTasksSetup = defineStore('tasks-setup', () => {
  const items = ref<{ id: number; text: string; done: boolean }[]>([])

  // 直接用 composable：抽离通用逻辑
  const remaining = computed(() => items.value.filter((i) => !i.done).length)
  const finished = computed(() => items.value.filter((i) => i.done).length)

  function add(text: string) {
    items.value.push({ id: Date.now(), text, done: false })
  }
  function toggle(id: number) {
    const t = items.value.find((i) => i.id === id)
    if (t) t.done = !t.done
  }

  // Setup Store 没有默认 $reset，需要手动实现
  function $reset() {
    items.value = []
  }

  return { items, remaining, finished, add, toggle, $reset }
})