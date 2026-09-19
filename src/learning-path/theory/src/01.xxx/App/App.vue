<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>输入旧 vnode 列表（逗号分隔）：<input v-model="oldInput" /></p>
    <p>输入新 vnode 列表：<input v-model="newInput" /></p>
    <button @click="runDiff">运行 diff</button>
    <p>输出 patches：</p>
    <pre>{{ patchesText }}</pre>
    <p class="meta">
      本 demo 仅演示结构与 key 复用，不实际 patchDOM。完整 diff 还需要 patch flag、新旧节点对比与 DOM 操作。
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const title = ref('手写 mini vnode + diff')

const oldInput = ref('a,b,c,d')
const newInput = ref('b,e,c,f')

const patches = ref([])

function runDiff() {
  const oldList = oldInput.value.split(',').map((s) => s.trim())
  const newList = newInput.value.split(',').map((s) => s.trim())
  const ops = []
  const map = new Map(oldList.map((v, i) => [v, i]))

  // 双端比对：教学版仅做「按 key 复用 + 增删」
  newList.forEach((v, i) => {
    if (map.has(v)) {
      ops.push(`reuse "${v}" at index ${i}`)
    } else {
      ops.push(`create "${v}" at index ${i}`)
    }
  })
  oldList.forEach((v) => {
    if (!newList.includes(v)) ops.push(`remove "${v}"`)
  })
  patches.value = ops
}

const patchesText = computed(() => patches.value.join('\n'))
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 540px;
}
input {
  margin-left: 6px;
  padding: 2px 6px;
  width: 80%;
}
button {
  margin: 8px 0;
  padding: 4px 12px;
}
pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 6px;
  border-radius: 4px;
  font-size: 12px;
}
.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>