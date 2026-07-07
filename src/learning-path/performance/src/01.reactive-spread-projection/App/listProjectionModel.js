/**
 * 虚拟列表分页场景 — spread reactive 投影模型
 */
import { computed, reactive, toRaw } from 'vue'

/** 200 条 × 120 字段：首次 loadMore 在 dev REPL 中可达 ~100ms+ */
export const INITIAL_PAGE_SIZE = 200
export const LOAD_MORE_PAGE_SIZE = 40
export const FIELD_COUNT = 120
export const MAX_ITEMS = 400
export const ITEM_HEIGHT = 48

export function createListStore() {
  return reactive({
    itemMap: new Map(),
    orderedIds: [],
  })
}

export function buildManyItems(count, fieldCount = FIELD_COUNT, startIndex = 0) {
  return Array.from({ length: count }, (_, i) => {
    const idx = startIndex + i
    const base = {
      id: 1000 + idx,
      title: `条目 #${idx}`,
      memberList: [{ userId: idx + 1, name: `用户${idx}` }],
      meta: { label: `组${idx}`, hint: `描述 ${idx}` },
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

/** ❌ computed 内 spread reactive */
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

/** ✅ toRaw 浅拷贝 + 保留 memberList 响应式引用 */
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

export function seedInitialPage(store) {
  store.itemMap.clear()
  store.orderedIds.length = 0
  mergeItems(store, buildManyItems(INITIAL_PAGE_SIZE, FIELD_COUNT, 0))
}

export function appendPage(store) {
  const start = store.orderedIds.length
  mergeItems(store, buildManyItems(LOAD_MORE_PAGE_SIZE, FIELD_COUNT, start))
}
