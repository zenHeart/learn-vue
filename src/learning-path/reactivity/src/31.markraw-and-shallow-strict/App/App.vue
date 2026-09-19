<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 第三方实例：markRaw + shallowRef</h4>
      <p>counter: <strong>{{ store.count }}</strong></p>
      <p>render 次数: <strong>{{ renderCount }}</strong></p>
      <button @click="store.increment()">+1</button>
      <button @click="forceRerender">手动触发渲染</button>
      <p class="hint">markRaw 后 store 内部 count++ 不会触发响应式更新</p>
    </section>

    <section class="card">
      <h4>② 大数据：markRaw 避免深代理</h4>
      <button @click="updateBigData">整体替换（响应）</button>
      <button @click="mutateBigDataField">修改字段（不响应）</button>
      <p>first item: <strong>{{ bigData.items[0].name }}</strong></p>
      <p class="hint">markRaw 后改字段不响应；shallowRef 整体替换才响应</p>
    </section>

    <section class="card">
      <h4>③ 循环引用：markRaw 切断追踪</h4>
      <button @click="addChildNode">添加子节点</button>
      <p>根节点子节点数: <strong>{{ rootNode?.children.length ?? 0 }}</strong></p>
      <p class="hint">Node 类有循环引用（child.parent = parent）；markRaw 后不会被代理炸栈</p>
    </section>

    <section class="card">
      <h4>④ shallowReactive：仅代理顶层</h4>
      <input v-model="shallowForm.name" placeholder="顶层属性" />
      <input v-model="shallowForm.nested.value" placeholder="嵌套属性" />
      <p>name: <strong>{{ shallowForm.name }}</strong></p>
      <p>nested.value: <strong>{{ shallowForm.nested.value }}</strong></p>
      <p class="hint">name 是响应式的；nested.value 修改要整体替换才触发</p>
    </section>

    <section class="card">
      <h4>⑤ 对照：proxyRefs 边界</h4>
      <pre>{{ proxyRefsLog }}</pre>
      <p class="hint">proxyRefs 让你用 store.x 而非 store.x.value；深嵌套不自动展开</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, markRaw, shallowRef, shallowReactive, proxyRefs, triggerRef, onUpdated } from 'vue'

const title = ref('markRaw + shallowRef/Reactive')

/* === ① 第三方实例 === */
class FakeThirdParty {
  count = 0
  increment() { this.count++ }
}

const store = markRaw(new FakeThirdParty())
const renderCount = ref(0)
onUpdated(() => { renderCount.value++ })

function forceRerender() {
  // triggerRef + 整体替换都不会影响 markRaw 的非响应式
  // 这里只是简单修改 ref.value 但 store 是 markRaw 的
  renderCount.value++  // 让外部模板重新渲染
}

/* === ② 大数据 === */
const bigData = shallowRef(markRaw({
  items: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `item-${i}` })),
}))

function updateBigData() {
  // 整体替换：触发响应
  bigData.value = {
    items: bigData.value.items.map((it) =>
      it.id === 0 ? { ...it, name: 'replaced-' + Date.now() } : it,
    ),
  }
}

function mutateBigDataField() {
  // markRaw + shallowRef：直接改字段不响应
  bigData.value.items[0].name = 'mutated-no-render'
  // 强制触发（仅为了让 Vue 重新评估依赖，但 markRaw 的非代理对象改字段本身不该响应）
  triggerRef(bigData)
}

/* === ③ 循环引用 === */
class TreeNode {
  value: number
  children: TreeNode[] = []
  constructor(v: number) { this.value = v }
}

// 普通 reactive 会因循环引用炸栈；markRaw 切断追踪
const rootNode = markRaw(new TreeNode(0))

function addChildNode() {
  const child = new TreeNode(rootNode.children.length + 1)
  rootNode.children.push(child)
}

/* === ④ shallowReactive === */
const shallowForm = shallowReactive({
  name: 'init-name',
  nested: { value: 'init-nested' },
})

/* === ⑤ proxyRefs === */
const proxyRefsLog = ref('')
function proxyRefsDemo() {
  const refs = proxyRefs({ x: ref(1), y: ref(2), nested: { z: ref(3) } })
  proxyRefsLog.value += `refs.x = ${refs.x}  // 直接读，不需要 .value\n`
  proxyRefsLog.value += `refs.y = ${refs.y}\n`
  refs.x = 10
  proxyRefsLog.value += `refs.x = ${refs.x}  // 直接赋值，自动 .value 写入\n`
  proxyRefsLog.value += `refs.nested.z = ${refs.nested.z}  // 深嵌套不自动展开\n`
  proxyRefsLog.value += `必须 refs.nested.z.value 访问：${refs.nested.z.value}\n`
  proxyRefsLog.value += '--- 注意 proxyRefs 是浅展开 ---'
}

proxyRefsDemo()
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 6px;
  margin-bottom: 4px;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin-right: 6px;
}
pre {
  margin-top: 6px;
  padding: 8px;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>
