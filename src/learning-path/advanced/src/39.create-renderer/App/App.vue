<template>
  <div class="demo">
    <h2>createRenderer · 内存渲染器（nodeOps 抽象演示）</h2>
    <p class="hint">
      这个 demo 不写真正的 Canvas / WebGL，而是构造一个<strong>最小化的内存渲染器</strong>：
      把 9 个 nodeOps 操作映射到 JS 对象，渲染产物是一棵
      <code>MemNode</code> 树，可以序列化成 JSON 调试。
      这正是单测场景下 stub renderer 的写法。
    </p>

    <section class="card">
      <h3>① 输入</h3>
      <button @click="inc">count++</button>
      <button @click="reset">reset</button>
      <button @click="randomize">随机 props</button>
      <p class="hint">点击按钮会触发 patchProp → 整个链路都在 nodeOps 里走</p>
    </section>

    <section class="card">
      <h3>② 渲染产物（MemNode 树）</h3>
      <pre class="log">{{ memTreeJson }}</pre>
      <p class="hint">每次更新后整棵 MemNode 树被 patchProp 重写；下面是序列化结果</p>
    </section>

    <section class="card">
      <h3>③ nodeOps 调用日志</h3>
      <pre class="log">{{ opsLog }}</pre>
      <p class="hint">
        9 个 nodeOps 调用按时间顺序记录。注意 <code>createElement</code> 一次，
        <code>insert</code> 一次，<code>patchProp</code> 多次（每次 props 变更）
      </p>
    </section>

    <section class="card">
      <h3>④ 与 SSR hydrate 协作</h3>
      <p class="hint">
        同样这 9 个方法可以传入 <code>createHydrationRenderer</code>。
        hydrate 流程多一组 <code>createComment</code> / <code>parentNode</code> / <code>nextSibling</code> 等辅助方法。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createRenderer, createVNode } from 'vue'
import { createMemNodeOps, type MemNode } from './memNodeOps'
import DemoCounter from './DemoCounter.vue'

const memTreeJson = ref('(尚未渲染)')
const opsLog = ref<string[]>([])

const counterValue = ref(0)
const labelValue = ref('未点击')
const rootNode = ref<MemNode | null>(null)

function rerender() {
  if (!rootNode.value) return
  // 用 createVNode 把组件 + props 编译成 VNode，再喂给 render
  const vnode = createVNode(DemoCounter, {
    count: counterValue.value,
    label: labelValue.value,
  })
  // 复用同一棵 rootMemNode，render 会触发 patchProp 增量更新
  renderFn!(vnode, rootNode.value)
}

function inc() {
  counterValue.value++
  labelValue.value = '已点击'
  rerender()
  updateTreeJson()
}

function reset() {
  counterValue.value = 0
  labelValue.value = '未点击'
  rerender()
  updateTreeJson()
}

function randomize() {
  counterValue.value = Math.floor(Math.random() * 100)
  labelValue.value = `随机 ${counterValue.value}`
  rerender()
  updateTreeJson()
}

function updateTreeJson() {
  if (rootNode.value) {
    memTreeJson.value = JSON.stringify(rootNode.value, null, 2)
  }
}

let renderFn: ReturnType<typeof createRenderer>['render'] | null = null

onMounted(() => {
  const { ops, nodeOps } = createMemNodeOps((line) => {
    opsLog.value = [...opsLog.value.slice(-19), line]
  })

  const renderer = createRenderer<MemNode, MemNode>({
    // 必须传入 patchProp，否则 props 更新不会反映到宿主节点
    patchProp(node, key, prevVal, nextVal) {
      node.props[key] = nextVal
      ops.patchProp(node, key, prevVal, nextVal)
    },
    ...nodeOps,
  })

  // root 是 MemNode 容器
  const root: MemNode = {
    tag: 'root',
    type: 'Fragment',
    props: {},
    children: [],
    text: null,
  }
  rootNode.value = root

  renderFn = renderer.render
  // 第一次渲染：渲染 DemoCounter 组件到 root
  rerender()
  updateTreeJson()
})
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0; font-size: 12px; color: #666; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.log {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  overflow-x: auto;
  max-height: 240px;
  overflow-y: auto;
}
button {
  padding: 6px 14px;
  margin-right: 8px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
button:hover { background: #35495e; }
</style>