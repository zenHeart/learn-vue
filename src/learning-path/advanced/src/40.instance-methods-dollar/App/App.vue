<template>
  <div class="demo">
    <h3>组件实例属性表：$root / $parent / $refs / $slots / $options / $forceUpdate</h3>
    <p class="hint">
      本 demo 在 <code>&lt;script setup&gt;</code> 下通过 <code>getCurrentInstance()</code>
      反查实例上的 <code>$</code> 属性。
    </p>

    <section class="card">
      <h4>① $root / $parent：实例链</h4>
      <p>当前组件名: <strong>{{ selfName }}</strong></p>
      <p>$root 类型: <code>{{ rootInfo }}</code></p>
      <p>$parent 类型: <code>{{ parentInfo }}</code></p>
      <p>父组件的 $root === 自己的 $root:
        <strong :class="{ ok: sameRoot, err: !sameRoot }">{{ sameRoot }}</strong>
      </p>
    </section>

    <section class="card">
      <h4>② $refs：模板 ref 收集</h4>
      <input ref="emailInput" placeholder="点下面按钮聚焦我" />
      <button @click="focusEmail">通过 useTemplateRef 聚焦</button>
      <button @click="useRefsFallback">通过 $refs 聚焦（fallback）</button>
      <p>emailInput 类型: <code>{{ refInfo }}</code></p>
    </section>

    <section class="card">
      <h4>③ $slots：通过 useSlots() 取父组件插槽</h4>
      <ChildSlot>
        <template #header>
          <strong>父组件传入的 header</strong>
        </template>
        <p>父组件默认插槽内容</p>
      </ChildSlot>
      <p>useSlots().default 存在: <strong>{{ hasDefault }}</strong></p>
      <p>useSlots().header 存在: <strong>{{ hasHeader }}</strong></p>
    </section>

    <section class="card">
      <h4>④ $options：当前组件选项</h4>
      <p>name: <code>{{ optionsInfo.name }}</code></p>
      <p>__file: <code>{{ optionsInfo.file }}</code></p>
      <p class="hint">__file 由 Vite/@vitejs/plugin-vue 在编译时注入</p>
    </section>

    <section class="card">
      <h4>⑤ $forceUpdate：强制重渲染（不推荐）</h4>
      <p>外部 ref 与渲染同步：
        外部值 = <code>{{ externalValue }}</code>，渲染值 = <code>{{ renderValue }}</code>
      </p>
      <button @click="changeExternalWithoutReactive">改外部值（无响应式）</button>
      <button @click="forceUpdateDemo">点 $forceUpdate 同步</button>
      <p class="hint">第二次点 forceUpdate 后，DOM 才与外部值一致 —— 这就是为什么不应该用 $forceUpdate</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, getCurrentInstance, useTemplateRef } from 'vue'
import ChildSlot from './ChildSlot.vue'

const selfName = 'App (demo)'

/* === ① root / parent === */
const inst = getCurrentInstance()
const rootInfo = computed(() => inst?.proxy?.$root ? 'ComponentInternalInstance' : 'null')
const parentInfo = computed(() => inst?.proxy?.$parent ? 'ComponentInternalInstance' : 'null')
const sameRoot = computed(() => {
  const r = inst?.proxy?.$root
  // 在 REPL 中 root === self（顶层 mount）
  return r === inst?.proxy
})

/* === ② $refs === */
const emailInput = useTemplateRef<HTMLInputElement>('emailInput')
const refInfo = computed(() => emailInput.value ? emailInput.value.constructor.name : 'null')
const focusEmail = () => emailInput.value?.focus()

const useRefsFallback = () => {
  const refs = inst?.refs as any
  refs?.emailInput?.focus?.()
}

/* === ③ slots（演示通过子组件） === */
const slotsCheck = ref<{ hasDefault: boolean; hasHeader: boolean }>({
  hasDefault: false,
  hasHeader: false,
})
onMounted(() => {
  // 这里 slots 在 App 自己的模板里通常为空（slots 是子传父的概念）；
  // 但 ChildSlot 组件内部会取到我们传入的插槽
  setTimeout(() => {
    // 通过 DOM 节点读取由 ChildSlot 显示的标记
    const el = document.querySelector('[data-slots-check]') as HTMLElement
    if (el) {
      slotsCheck.value = {
        hasDefault: el.dataset.default === '1',
        hasHeader: el.dataset.header === '1',
      }
    }
  }, 50)
})
const hasDefault = computed(() => slotsCheck.value.hasDefault)
const hasHeader = computed(() => slotsCheck.value.hasHeader)

/* === ④ $options === */
const optionsInfo = computed(() => {
  const opts = (inst?.proxy?.$options ?? {}) as Record<string, any>
  return {
    name: opts.name ?? '—',
    file: opts.__file ?? '—',
  }
})

/* === ⑤ $forceUpdate === */
const externalValue = '外部原始值'
let renderValue = ref('外部原始值')
function changeExternalWithoutReactive() {
  // 直接修改外部变量 —— 不走响应式
  ;(externalValue as any) = '外部修改-' + Date.now()
  // 同步 renderValue 但保留旧值（模拟「不响应式」的场景）
  renderValue.value = renderValue.value // 故意不变
}
function forceUpdateDemo() {
  // 强制重渲染 —— 渲染函数重新执行，但读到的 renderValue 不变
  inst?.proxy?.$forceUpdate?.()
  // 然后人为同步
  renderValue.value = (externalValue as any)
}
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
  margin: 6px 0;
}
code {
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.82rem;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  margin-right: 6px;
  font-size: 13px;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 6px;
}
.ok { color: #16a34a; }
.err { color: #dc2626; }
p { margin: 4px 0; font-size: 13px; }
</style>