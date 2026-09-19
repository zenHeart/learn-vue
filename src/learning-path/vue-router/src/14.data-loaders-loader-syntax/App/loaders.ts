// 真实项目里通常这样写:
//   export const orderListLoader = defineBasicLoader('orders', async () => { ... })
// demo 里为了让 REPL 能直接跑,我们用一层薄封装,目标 API 形状与官方对齐
//
// 关键形状(对应 vue-router 源码 defineLoader.ts:45):
//   { __isUseDataLoader: true, data, error, pending, refresh }
import { ref } from 'vue'

export const orderListLoader = {
  __isUseDataLoader: true as const,
  async load() {
    // 模拟远端拉取,实际项目里这里写 fetch('/api/orders')
    await new Promise((r) => setTimeout(r, 250))
    return [
      { id: '1', customer: 'Ada', total: 199 },
      { id: '2', customer: 'Linus', total: 88 },
      { id: '3', customer: 'Grace', total: 320 },
    ]
  },
  data: ref(undefined as any),
  error: ref(null as Error | null),
  pending: ref(false),
  async refresh() {
    this.pending.value = true
    try {
      this.data.value = await this.load()
    } catch (e) {
      this.error.value = e as Error
    } finally {
      this.pending.value = false
    }
  },
}

export const orderLoader = {
  __isUseDataLoader: true as const,
  async load(to: any) {
    await new Promise((r) => setTimeout(r, 200))
    const id = to.params.id
    const all = await orderListLoader.load()
    const found = all.find((o) => o.id === id)
    if (!found) throw new Error('Order not found: ' + id)
    return found
  },
  data: ref(undefined as any),
  error: ref(null as Error | null),
  pending: ref(false),
  async refresh() {
    this.pending.value = true
    try {
      // 真实使用中由 navigation-guard 注入 to,这里退化为取最后一个路径段
      const id = location.pathname.split('/').pop() || ''
      this.data.value = await this.load({ params: { id } })
    } catch (e) {
      this.error.value = e as Error
    } finally {
      this.pending.value = false
    }
  },
}
