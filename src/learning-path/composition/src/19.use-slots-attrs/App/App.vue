<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① useSlots：JSX / 手动渲染</h4>
      <ManualSlot>
        <template #header>
          <strong>手写 header slot</strong>
        </template>
        <p>默认 slot 内容</p>
        <template #footer>
          <em>自定义 footer</em>
        </template>
      </ManualSlot>
    </section>

    <section class="card">
      <h4>② useAttrs：透传 + 包装</h4>
      <FancyInput placeholder="请输入" data-testid="fancy" @focus="onFocus" />
    </section>

    <section class="card">
      <h4>③ 多 root + inheritAttrs:false</h4>
      <MultiRoot
        class="from-parent"
        data-info="multi-root demo"
        @custom="onCustom"
      />
      <p class="hint">class / data-* / @custom 都透传到第一个 root</p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ManualSlot from './ManualSlot.vue'
import FancyInput from './FancyInput.vue'
import MultiRoot from './MultiRoot.vue'

const title = ref('useSlots / useAttrs：组合式访问')

const focusLog = ref('')
function onFocus() {
  focusLog.value += 'focus '
}
function onCustom() {
  alert('custom event from MultiRoot')
}
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 720px;
}
.card {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px;
  margin: 10px 0;
  background: #fff;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
.hint { font-size: 12px; color: #888; }
</style>
