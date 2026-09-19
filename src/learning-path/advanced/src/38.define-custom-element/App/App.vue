<template>
  <div class="demo">
    <h2>defineCustomElement · Web Component</h2>
    <p class="hint">
      这个 demo 同时演示：(1) 用 <code>defineCustomElement</code> 写一个原生
      自定义元素并在 HTML 里直接用；(2) 通过 <code>useHost</code> /
      <code>useShadowRoot</code> 拿到宿主节点。
    </p>

    <section class="card">
      <h3>① 模板里直接使用自定义元素</h3>
      <my-greeting :name="userName" :level="level" />
      <my-counter :start="5" />
      <p class="hint">上面两个标签都不是浏览器内置，是 <code>customElements.define()</code> 注册的 Vue 组件。</p>
    </section>

    <section class="card">
      <h3>② useHost / useShadowRoot</h3>
      <my-clock />
      <p class="hint">clock 内部用 useHost() 拿到宿主 DOM 节点 id，用 useShadowRoot() 访问 ShadowRoot 内部结构。</p>
      <pre class="log">shadow children: {{ clockShadowInfo }}</pre>
    </section>

    <section class="card">
      <h3>③ light DOM（无 ShadowRoot）</h3>
      <my-light-card title="样式不隔离" body="这个元素 shadowRoot: false，全局样式可以进来" />
    </section>

    <section class="card">
      <h3>④ emit → CustomEvent</h3>
      <my-counter :start="10" @change="onCountChange" />
      <p class="hint">最近一次 increment 事件：{{ lastEvent }}</p>
    </section>

    <section class="card">
      <h3>⑤ 受控示例</h3>
      <label>
        名字:
        <input v-model="userName" />
      </label>
      <label>
        level:
        <select v-model.number="level">
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
        </select>
      </label>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MyClock from './MyClock.ce'
import MyGreeting from './MyGreeting.ce'
import MyCounter from './MyCounter.ce'
import MyLightCard from './MyLightCard.ce'

const userName = ref('Vue')
const level = ref(1)
const lastEvent = ref('尚未触发')
const clockShadowInfo = ref('查询 Shadow DOM 中...')

function onCountChange(e: Event) {
  // Vue 模板里 @change 直接拿原生 CustomEvent
  const detail = (e as CustomEvent<number>).detail
  lastEvent.value = `count 变为 ${detail}`
}

onMounted(() => {
  // 注册自定义元素（一次性）
  if (typeof window !== 'undefined' && !customElements.get('my-clock')) {
    customElements.define('my-clock', MyClock)
  }
  if (!customElements.get('my-greeting')) {
    customElements.define('my-greeting', MyGreeting)
  }
  if (!customElements.get('my-counter')) {
    customElements.define('my-counter', MyCounter)
  }
  if (!customElements.get('my-light-card')) {
    customElements.define('my-light-card', MyLightCard)
  }

  // 查询 ShadowRoot 内容
  const clockEl = document.querySelector('my-clock') as HTMLElement | null
  if (clockEl?.shadowRoot) {
    clockShadowInfo.value = Array.from(clockEl.shadowRoot.children)
      .map(n => `<${n.tagName.toLowerCase()}>`)
      .join(', ')
  } else {
    clockShadowInfo.value = 'shadowRoot 为 null（关闭模式）'
  }
})
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { margin: 6px 0; font-size: 12px; color: #666; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
.log { background: #1e1e1e; color: #d4d4d4; padding: 8px; border-radius: 4px; font-size: 12px; overflow-x: auto; }
label { display: block; margin: 6px 0; font-size: 13px; }
select, input { padding: 4px 8px; margin-left: 6px; border: 1px solid #cbd5e1; border-radius: 4px; }
</style>