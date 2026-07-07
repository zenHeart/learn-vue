/**
 * MVP：虚拟列表 + 分页场景下的列表投影模型
 */
import { computed, reactive, toRaw } from 'vue'

export function createListStore() {
  return reactive({
    itemMap: new Map(),
    orderedIds: [],
  })
}

export function buildManyItems(count, fieldCount = 40) {
  return Array.from({ length: count }, (_, i) => {
    const base = {
      id: 1000 + i,
      type: 'group',
      title: `条目 #${i}`,
      memberList: [{ userId: i + 1, name: `用户${i}` }],
      meta: {
        label: `组${i}`,
        hint: `描述 ${i}`,
      },
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

export function applyItemUpdate(store, patch) {
  const key = String(patch.id)
  const existing = store.itemMap.get(key)
  if (!existing) return
  const raw = toRaw(existing)
  store.itemMap.set(key, {
    ...raw,
    ...patch,
    memberList: existing.memberList,
  })
}

export function updateMembers(store, { id, memberList }) {
  const item = store.itemMap.get(String(id))
  if (!item) return
  item.memberList.splice(0, item.memberList.length, ...memberList)
}

export function buildProjectionBad(store) {
  return Object.freeze(
    store.orderedIds
      .map((id) => store.itemMap.get(id))
      .filter(Boolean)
      .map((item) =>
        Object.freeze({
          ...item,
          ...(item.meta || {}),
          type: 'group',
          userList: item.memberList,
        }),
      ),
  )
}

export function buildProjectionOptimized(store) {
  return Object.freeze(
    store.orderedIds
      .map((id) => store.itemMap.get(id))
      .filter(Boolean)
      .map((item) => {
        const raw = toRaw(item)
        return Object.freeze({
          ...raw,
          ...(raw.meta || {}),
          type: 'group',
          memberList: item.memberList,
          userList: item.memberList,
        })
      }),
  )
}

export function benchmarkProjection(buildFn, store, rounds = 30) {
  const start = performance.now()
  let last
  for (let i = 0; i < rounds; i++) {
    last = buildFn(store)
  }
  const elapsed = performance.now() - start
  return {
    rows: last?.length ?? 0,
    rounds,
    totalMs: elapsed,
    avgMs: elapsed / rounds,
  }
}

export function countProjectionDeps(buildFn, store) {
  let tracked = 0
  const probe = computed(() => buildFn(store), {
    onTrack: () => { tracked++ },
  })
  void probe.value
  return tracked
}
