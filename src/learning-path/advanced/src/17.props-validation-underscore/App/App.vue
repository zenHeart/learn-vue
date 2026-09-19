<template>
  <div class="demo">
    <h2>17 · props 校验顺序与保留名</h2>

    <section class="card">
      <h3>① 正常 prop：visible / label 生效</h3>
      <PropSandbox :visible="true" label="ok" />
    </section>

    <section class="card">
      <h3>② 保留名 prop：$secret / _private / __v_isRef <span class="bad">(dev 警告 / prod 静默丢弃)</span></h3>
      <PropSandbox
        :visible="true"
        label="trying reserved"
        :$secret="'I want to leak data'"
        :_private="123"
        :__v_isRef="true"
      />
      <p class="hint">打开 console 会看到 <code>Invalid prop name</code> 警告；这些 prop 在子组件中读不到。</p>
    </section>

    <section class="card">
      <h3>③ 类型校验 + 必填 + validator 三段</h3>
      <PropTyped :count="42" mode="auto" />
      <PropTyped :count="42" mode="weird" />
      <p class="hint">mode='weird' 触发 validator 失败警告，但子组件仍能拿到值（仅警告，不阻断）。</p>
    </section>

    <section class="card">
      <h3>④ 默认值：对象 / 数组用工厂函数</h3>
      <PropDefault />
      <p class="hint">连续挂载两次 PropDefault 时，items 应该是不同引用（工厂模式）。下方显示两次实例的 items === 比较。</p>
      <pre>{{ sameRef }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PropSandbox from './PropSandbox.vue'
import PropTyped from './PropTyped.vue'
import PropDefault from './PropDefault.vue'

const sameRef = ref<string>('')
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.bad { color: #d4380d; font-weight: normal; font-size: 12px; }
.hint { color: #888; font-size: 12px; margin-top: 4px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 8px; font-size: 12px; border-radius: 4px; }
</style>
