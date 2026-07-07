/**
 * 最小列表投影模型 — 用于演示 spread reactive 的依赖开销
 */
import { computed, reactive, toRaw } from 'vue'

export const DEMO_ITEM_COUNT = 10
export const DEMO_FIELD_COUNT = 15

export function createListStore() {
  return reactive({
    itemMap: new Map(),
    orderedIds: [],
  })
}

export function buildManyItems(count = DEMO_ITEM_COUNT, fieldCount = DEMO_FIELD_COUNT) {
  return Array.from({ length: count }, (_, i) => {
    const base = {
      id: 1000 + i,
      title: `条目 #${i}`,
      memberList: [{ userId: i + 1, name: `用户${i}` }],
      meta: { label: `组${i}` },
    }
    for (let f = 0; f < fieldCount; f++) {
      base[`field${f}`] = f
    }
    return base
  })
}

export function mergeItems(store, items) {
  for (const item of items) {
    const key = String(item.id)
    store.itemMap.set(key, {
      ...item,
      memberList: item.memberList ? [...item.memberList] : [],
    })
    if (!store.orderedIds.includes(key)) {
      store.orderedIds.push(key)
    }
  }
}

/** ❌ 在 computed 内 spread reactive 实体 */
export function buildProjectionBad(store) {
  return store.orderedIds
    .map((id) => store.itemMap.get(id))
    .filter(Boolean)
    .map((item) => ({
      ...item,
      ...(item.meta || {}),
      userList: item.memberList,
    }))
}

/** ✅ toRaw 浅拷贝，保留 memberList 响应式引用 */
export function buildProjectionOptimized(store) {
  return store.orderedIds
    .map((id) => store.itemMap.get(id))
    .filter(Boolean)
    .map((item) => {
      const raw = toRaw(item)
      return {
        ...raw,
        ...(raw.meta || {}),
        memberList: item.memberList,
        userList: item.memberList,
      }
    })
}

export function countProjectionDeps(buildFn, store) {
  let tracked = 0
  const probe = computed(() => buildFn(store), {
    onTrack: () => { tracked++ },
  })
  void probe.value
  return tracked
}

export function measureOnce(buildFn, store) {
  const start = performance.now()
  buildFn(store)
  return performance.now() - start
}
