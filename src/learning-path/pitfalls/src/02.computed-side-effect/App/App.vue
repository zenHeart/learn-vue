<script setup>
import { ref, computed } from 'vue'

const a = ref(0)
const observation = ref('先预测：读取派生值会改变 a 吗？')
const goodB = computed(() => a.value * 2)
function bump() {
  if (a.value < 10) a.value++
  observation.value = '事件修改了 a，模板随后读取派生值。'
}
function readOnly() {
  const before = a.value
  const value = goodB.value
  observation.value = `读取结果=${value}；a 保持不变：${before === a.value}`
}
</script>

<template>
  <div class="demo">
    <p class="badge">computed 副作用</p>

    <div class="card bad">
      <h3>① 预测副作用风险</h3>
      <p>如果读取 getter 会修改它自己的依赖，读取结果就不再是纯推导。是否形成循环取决于消费者与调度，不能承诺固定警告。</p>
      <button @click="readOnly">读取修复后的派生值</button>
      <p role="status">{{ observation }}</p>
    </div>

    <div class="card good">
      <h3>② 修复版本</h3>
      <pre>function bump() { a.value++ }</pre>
      <p>a = {{ a }}</p>
      <p>goodB = {{ goodB }}</p>
      <button class="primary" @click="bump">bump a</button>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 480px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.card { padding: 10px; border-radius: 8px; margin-bottom: 8px; }
.card.bad { background: #fff5f5; border: 1px solid #f5c6c6; }
.card.good { background: #f0fff4; border: 1px solid #c6e8d4; }
h3 { font-size: 0.85rem; margin: 0 0 4px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 6px 8px; border-radius: 4px; font-size: 0.72rem; font-family: ui-monospace, monospace; margin: 4px 0; }
button { padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; margin-top: 4px; }
button.primary { background: #42b883; color: #fff; border-color: #42b883; }
.err { font-size: 0.74rem; color: #c0392b; margin-top: 6px; }
</style>
