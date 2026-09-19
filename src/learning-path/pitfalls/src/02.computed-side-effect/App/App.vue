<script setup>
import { ref, computed } from 'vue'

const a = ref(0)
const error = ref(null)

// 错误版本：computed 内自增
const badB = computed(() => {
  try {
    // 制造死循环：用 setTimeout 隔一层防止同步栈爆炸，但仍会触发调度告警
    if (a.value < 5) {
      Promise.resolve().then(() => { a.value++ })
    }
    return a.value * 2
  } catch (e) {
    error.value = e.message
    return 0
  }
})

// 修复版本：副作用在事件
function bump() {
  if (a.value < 10) a.value++
}
const goodB = computed(() => a.value * 2)

function triggerBad() {
  a.value = 0
  error.value = null
  // 触发 getter
  void badB.value
  setTimeout(() => {
    error.value = `检测到循环调度：computed getter 内修改 a.value 导致 a 反复 invalidate（最终值=${a.value}）`
  }, 50)
}
</script>

<template>
  <div class="demo">
    <p class="badge">computed 副作用</p>

    <div class="card bad">
      <h3>① 错误版本</h3>
      <pre>computed(() => { a.value++; return a * 2 })</pre>
      <p>a = {{ a }} (被自激修改)</p>
      <button @click="triggerBad">触发 badB.value</button>
      <p v-if="error" class="err">{{ error }}</p>
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
