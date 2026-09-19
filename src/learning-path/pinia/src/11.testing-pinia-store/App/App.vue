<template>
  <div class="app">
    <h2>测试 Pinia store</h2>
    <p class="hint">本 demo 提供测试样例源码（store.test.ts / component.test.ts），可在你的项目中直接复用。</p>

    <h4>核心 API</h4>
    <ul>
      <li><code>setActivePinia(createPinia())</code> —— 每个用例前建立独立实例</li>
      <li><code>useStore()</code> —— 拿到当前活动的 store</li>
      <li><code>store.fetch = vi.fn()</code> —— 替换 action 为 mock</li>
      <li><code>store.$reset()</code> —— 清空 state</li>
    </ul>

    <h4>最小测试样例</h4>
    <pre>{{ example }}</pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const example = computed(
  () => `import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, expect, it } from 'vitest'
import { useTodosStore } from './store'

beforeEach(() => setActivePinia(createPinia()))

it('adds an item', () => {
  const store = useTodosStore()
  store.add('hello')
  expect(store.items).toHaveLength(1)
})`,
)
</script>

<style scoped>
.app { font-family: system-ui, sans-serif; padding: 1rem; max-width: 720px; }
.app :deep(.hint) { color: #57606a; font-size: .9em; }
.app ul { padding-left: 1.25rem; }
.app pre { background: #f6f8fa; padding: .75rem; border-radius: 6px; font-size: .85em; overflow-x: auto; }
.app code { background: #eef1f4; padding: 1px 4px; border-radius: 3px; }
</style>