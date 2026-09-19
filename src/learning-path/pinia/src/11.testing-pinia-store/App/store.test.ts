// 复制以下代码到项目的 tests/ 目录，配合 vitest 即可运行
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTodosStore } from './store'

describe('todos store', () => {
  beforeEach(() => {
    // 每个用例前建立独立 Pinia 实例
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds an item', () => {
    const store = useTodosStore()
    store.add('写测试')
    expect(store.items).toHaveLength(1)
    expect(store.items[0].text).toBe('写测试')
    expect(store.items[0].done).toBe(false)
  })

  it('toggles done', () => {
    const store = useTodosStore()
    store.add('任务')
    const id = store.items[0].id
    store.toggle(id)
    expect(store.items[0].done).toBe(true)
  })

  it('mocks async action', async () => {
    const store = useTodosStore()
    // mock 一个原本不存在的远程拉取
    ;(store as any).fetch = vi.fn().mockResolvedValue(undefined)
    await store.fetch()
    expect((store as any).fetch).toHaveBeenCalledTimes(1)
  })

  it('$reset restores initial state', () => {
    const store = useTodosStore()
    store.add('临时')
    store.setFilter('done')
    store.$reset()
    expect(store.items).toHaveLength(0)
    expect(store.filter).toBe('all')
  })
})