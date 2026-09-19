<script setup lang="ts">
import { ref, computed } from 'vue'

/* ============================================================
 * 极简 patchKeyedChildren + getSequence(LIS)
 * 仿 packages/runtime-core/src/patchKeyedChildren.ts
 * ============================================================ */

type VNode = { key: number; text: string }

interface Step {
  kind: string
  detail: string
  i?: number
  j?: number
}

function sameKey(a: VNode, b: VNode) { return a.key === b.key }

function patchKeyed(oldList: VNode[], newList: VNode[], log: Step[]) {
  const moves: { type: 'move' | 'insert' | 'remove' | 'reuse'; oldKey?: number; newKey?: number; index: number }[] = []
  let i = 0, e1 = oldList.length - 1, e2 = newList.length - 1
  const oldStart = oldList[i], newStart = newList[i]
  // 1. 头头
  while (i <= e1 && i <= e2 && sameKey(oldList[i], newList[i])) {
    log.push({ kind: 'HEAD-HEAD', detail: `${oldList[i].key}=${newList[i].key} 相同，i++`, i, j: i })
    moves.push({ type: 'reuse', oldKey: oldList[i].key, newKey: newList[i].key, index: i })
    i++
  }
  // 2. 尾尾
  while (i <= e1 && i <= e2 && sameKey(oldList[e1], newList[e2])) {
    log.push({ kind: 'TAIL-TAIL', detail: `${oldList[e1].key}=${newList[e2].key} 相同` })
    moves.push({ type: 'reuse', oldKey: oldList[e1].key, newKey: newList[e2].key, index: e2 })
    e1--; e2--
  }
  // 3 & 4. 头尾 / 尾头
  if (i > e1) {
    log.push({ kind: 'MOUNT', detail: `新增 ${e2 - i + 1} 个节点: ${newList.slice(i, e2 + 1).map(n => n.key).join(',')}` })
    for (let k = i; k <= e2; k++) moves.push({ type: 'insert', newKey: newList[k].key, index: k })
  } else if (i > e2) {
    log.push({ kind: 'UNMOUNT', detail: `删除 ${e1 - i + 1} 个节点: ${oldList.slice(i, e1 + 1).map(n => n.key).join(',')}` })
    for (let k = i; k <= e1; k++) moves.push({ type: 'remove', oldKey: oldList[k].key, index: k })
  } else {
    // 5. Map + LIS
    const keyToNew = new Map<number, number>()
    for (let k = i; k <= e2; k++) keyToNew.set(newList[k].key, k)
    const newIdxToOldIdx = new Array(e2 - i + 1).fill(0)
    let maxNewIndex = 0
    for (let k = i; k <= e1; k++) {
      const oldKey = oldList[k].key
      const newIdx = keyToNew.get(oldKey)
      if (newIdx === undefined) {
        log.push({ kind: 'UNMOUNT', detail: `old[${k}] key=${oldKey} 在 new 中不存在，删除` })
        moves.push({ type: 'remove', oldKey, index: k })
        continue
      }
      newIdxToOldIdx[newIdx - i] = k - i + 1
      maxNewIndex = Math.max(maxNewIndex, newIdx)
      log.push({ kind: 'MATCH', detail: `old[${k}] key=${oldKey} -> new[${newIdx}]` })
      moves.push({ type: 'reuse', oldKey, newKey: newList[newIdx].key, index: newIdx })
    }
    // LIS
    const lis = getSequence(newIdxToOldIdx)
    log.push({ kind: 'LIS', detail: `LIS 长度 ${lis.length}：保持不动的索引 [${lis.join(', ')}]` })
    // 其余移动 / 插入
    for (let k = e2 - i, j = lis.length - 1; k >= 0; k--) {
      if (k === lis[j]) { j--; continue }
      const newKey = newList[k + i].key
      if (newIdxToOldIdx[k] === 0) {
        log.push({ kind: 'INSERT', detail: `new[${k + i}] key=${newKey} 全新插入` })
        moves.push({ type: 'insert', newKey, index: k + i })
      } else {
        const anchor = k + i + 1 < newList.length ? newList[k + i + 1].key : null
        log.push({ kind: 'MOVE', detail: `new[${k + i}] key=${newKey} 移动到 ${anchor === null ? '末尾' : 'key=' + anchor + ' 之前'}` })
        moves.push({ type: 'move', newKey, index: k + i })
      }
    }
  }
  return moves
}

// LIS 二分贪心 O(n log n)
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0; v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) u = c + 1
        else v = c
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) p[i] = result[u - 1]
        result[u] = i
      }
    }
  }
  u = result.length; v = result[u - 1]
  while (u-- > 0) { result[u] = v; v = p[v]; set ? set : null }
  return result
}

/* ============================================================
 * 演示场景
 * ============================================================ */

const scenarios: { name: string; old: VNode[]; new: VNode[] }[] = [
  {
    name: 'A · 头头命中 + 尾部新增',
    old: [{ key: 1, text: 'a' }, { key: 2, text: 'b' }],
    new: [{ key: 1, text: 'a' }, { key: 2, text: 'b' }, { key: 3, text: 'c' }, { key: 4, text: 'd' }]
  },
  {
    name: 'B · 头部删除',
    old: [{ key: 1, text: 'a' }, { key: 2, text: 'b' }, { key: 3, text: 'c' }],
    new: [{ key: 2, text: 'b' }, { key: 3, text: 'c' }]
  },
  {
    name: 'C · 列表逆序（LIS 大显身手）',
    old: [{ key: 1, text: 'a' }, { key: 2, text: 'b' }, { key: 3, text: 'c' }, { key: 4, text: 'd' }, { key: 5, text: 'e' }],
    new: [{ key: 5, text: 'e' }, { key: 4, text: 'd' }, { key: 3, text: 'c' }, { key: 2, text: 'b' }, { key: 1, text: 'a' }]
  },
  {
    name: 'D · 中间插入',
    old: [{ key: 1, text: 'a' }, { key: 3, text: 'c' }, { key: 5, text: 'e' }],
    new: [{ key: 1, text: 'a' }, { key: 2, text: 'b' }, { key: 3, text: 'c' }, { key: 4, text: 'd' }, { key: 5, text: 'e' }]
  }
]

const idx = ref(0)
const current = computed(() => scenarios[idx.value])
const steps = computed(() => {
  const log: Step[] = []
  patchKeyed(current.value.old, current.value.new, log)
  return log
})
</script>

<template>
  <div class="diff-demo">
    <h3>05 · patchKeyedChildren（双端 + LIS）</h3>

    <div class="row">
      <span v-for="(s, i) in scenarios" :key="i"
            :class="['pill', { active: idx === i }]" @click="idx = i">{{ s.name }}</span>
    </div>

    <div class="row">
      <div class="col">
        <h4>old</h4>
        <ol>
          <li v-for="n in current.old" :key="`o-${n.key}`">[{{ n.key }}] {{ n.text }}</li>
        </ol>
      </div>
      <div class="col">
        <h4>new</h4>
        <ol>
          <li v-for="n in current.new" :key="`n-${n.key}`">[{{ n.key }}] {{ n.text }}</li>
        </ol>
      </div>
    </div>

    <div class="trace">
      <h4>逐步 trace</h4>
      <ol>
        <li v-for="(s, i) in steps" :key="i">
          <span class="kind">{{ s.kind }}</span> — {{ s.detail }}
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.diff-demo { padding: 1rem; font-family: 'JetBrains Mono', monospace; }
.row { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.col { flex: 1; min-width: 200px; }
.pill { padding: .3rem .7rem; border: 1px solid #aaa; border-radius: 999px; cursor: pointer; font-size: .8rem; }
.pill.active { background: #333; color: #fff; border-color: #333; }
ol { padding-left: 1.5rem; }
.trace { background: #fafafa; padding: .75rem; border-radius: 6px; }
.trace .kind { display: inline-block; min-width: 90px; font-weight: bold; color: #1976d2; }
</style>
