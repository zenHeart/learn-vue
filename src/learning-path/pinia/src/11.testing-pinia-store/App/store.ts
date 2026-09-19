import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTodosStore = defineStore('todos', () => {
  const items = ref<{ id: number; text: string; done: boolean }[]>([])
  const filter = ref<'all' | 'done' | 'todo'>('all')

  function add(text: string) {
    items.value.push({ id: Date.now() + Math.random(), text, done: false })
  }
  function toggle(id: number) {
    const t = items.value.find((i) => i.id === id)
    if (t) t.done = !t.done
  }
  function setFilter(f: typeof filter.value) {
    filter.value = f
  }
  function $reset() {
    items.value = []
    filter.value = 'all'
  }

  return { items, filter, add, toggle, setFilter, $reset }
})