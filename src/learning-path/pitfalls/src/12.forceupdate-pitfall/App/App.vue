<template>
  <div class="demo">
    <h2>$forceUpdate 反模式 & triggerRef 正确写法</h2>

    <section class="card bad">
      <h3>① 反模式：滥用 $forceUpdate</h3>
      <p class="hint">
        子组件通过 getCurrentInstance 拿 $forceUpdate；点击触发 patch。
        <strong>这是反模式，仅在逃生口使用。</strong>
      </p>
      <ForceDemo />
      <p class="meta">
        按下「强制刷新」按钮，子组件会强制 patch 一次；
        即便没有响应式数据变更。
      </p>
    </section>

    <section class="card ok">
      <h3>② 正确：shallowRef + triggerRef</h3>
      <p class="hint">
        第三方大对象 / 类实例场景：<code>shallowRef</code> 避免深度代理，
        <code>triggerRef</code> 显式触发。
      </p>
      <p>当前 count: <strong>{{ count }}</strong></p>
      <p>render 触发次数：<strong>{{ renderCount }}</strong></p>
      <div class="row">
        <button @click="add">push（响应式，shallowRef 不深代理但 push 仍改 .value）</button>
        <button @click="trigger">triggerRef 显式触发</button>
      </div>
      <pre>{{ code }}</pre>
    </section>

    <section class="card ok">
      <h3>③ 反例 vs 正例对比</h3>
      <table class="t">
        <thead>
          <tr><th>场景</th><th>反例</th><th>正例</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>嵌套对象属性变更</td>
            <td>vm.forceUpdate()</td>
            <td>state.foo = bar（自动响应）</td>
          </tr>
          <tr>
            <td>第三方大对象</td>
            <td>forceUpdate 兜底</td>
            <td>shallowRef + triggerRef</td>
          </tr>
          <tr>
            <td>数组 push</td>
            <td>forceUpdate 刷新</td>
            <td>直接 push（ref 默认响应）</td>
          </tr>
          <tr>
            <td>子组件更新父状态</td>
            <td>parent.forceUpdate()</td>
            <td>lift to ref + 回调</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h3>④ 何时 $forceUpdate 真的「必要」</h3>
      <ul>
        <li>第三方库（ECharts / 地图）改了 DOM，Vue 不感知</li>
        <li>线上紧急 hotfix，事后改用响应式</li>
        <li>时间切片调试 / 测试</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, triggerRef, ref, onUpdated } from 'vue'
import ForceDemo from './ForceDemo.vue'

const code = `import { shallowRef, triggerRef } from 'vue'

const data = shallowRef({ items: [] as Item[] })

// 1. push：shallowRef 不深代理，但 .value 的引用变了 → 触发更新
data.value = { items: [...data.value.items, newItem] }

// 2. 直接 mutate + 手动触发：保留引用、节省 GC
data.value.items.push(newItem)
triggerRef(data)

// 3. 第三方对象（类实例 / markRaw）
import { markRaw } from 'vue'
const chart = shallowRef(markRaw(new ECharts(canvas)))
chart.value.setOption(opts)        // 库内部改 DOM
triggerRef(chart)                  // 让 Vue 知道「数据变了」`

const count = shallowRef(0)
const renderCount = ref(0)

onUpdated(() => { renderCount.value++ })

const add = () => {
  // 用「赋值整个对象」让 shallowRef 必然触发
  count.value = { ...count.value, items: undefined } as any
  count.value = (count.value as any).items || 0
  // 简化：直接累加
  count.value = ((count.value as any) + 1) as any
}

const trigger = () => {
  // 直接 mutate + triggerRef
  ;(count.value as any)++
  triggerRef(count)
}
</script>

<style scoped>
.demo { max-width: 820px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card.bad { border-left: 4px solid #c92a2a; }
.card.ok { border-left: 4px solid #18a058; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
.meta { font-size: 12px; color: #888; margin-top: 6px; }
.row { display: flex; gap: 6px; margin-bottom: 10px; }
button { padding: 5px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 11px; line-height: 1.5; overflow: auto; }
.t { width: 100%; border-collapse: collapse; font-size: 12px; }
.t th, .t td { padding: 6px 10px; border-bottom: 1px solid #e5e5e5; text-align: left; vertical-align: top; }
.t th { color: #666; font-weight: 500; }
ul { font-size: 13px; padding-left: 20px; line-height: 1.8; }
</style>