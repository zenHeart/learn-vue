<script setup>
import { ref, onUnmounted } from 'vue'
import { createCacheDemo } from './model.js'

const { count, double, b, c, echo, stop } = createCacheDemo()
onUnmounted(stop)
const observation = ref('先读取两次，再修改依赖并比较对象身份。')
function readTwice() {
  const first = double.value
  const second = double.value
  observation.value = `两次读取同一个缓存对象：${first === second}；值为 ${second.value}`
}
function changeAndRead() {
  const previous = double.value
  count.value++
  const next = double.value
  observation.value = `依赖变化后仍是旧对象：${previous === next}；新值为 ${next.value}`
}
</script>

<template>
  <section class="cache-demo">
    <h2>computed 缓存与依赖变化</h2>
    <p>count = {{ count }}；b = {{ b }}；c = {{ c }}</p>
    <button @click="readTwice">连续读取两次</button>
    <button @click="changeAndRead">修改依赖后读取</button>
    <p role="status">{{ observation }}</p>
    <p>{{ echo }}</p>
    <p>getter 只推导结果；副作用放在 watch 回调中。本例的同步 watch 仅用于观察执行顺序。</p>
    <p>不要在 getter 中写其他 ref：这并不保证触发 readonly 警告，却会让读取产生状态变化。</p>
  </section>
</template>

<style scoped>
.cache-demo { font-family: system-ui; padding: 1rem; }
button { margin: 0 .5rem .5rem 0; }
</style>
