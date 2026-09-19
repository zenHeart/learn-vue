<template>
  <div class="canvas">
    <p>外部第三方库对象（markRaw）：{{ info }}</p>
    <p class="hint">
      第三方库改了 <code>obj.color</code>，shallowRef 不会触发；只有 forceUpdate 才能刷新。
    </p>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, markRaw, onUpdated } from 'vue'

// 模拟第三方库返回的对象：标记 markRaw 后即使包了 shallowRef 也不响应
const obj = markRaw({ color: 'red', label: 'background-canvas' })
const info = shallowRef(obj)
let updateCount = 0

onUpdated(() => {
  // 每次重新渲染都打日志（dev 环境）
  console.log('[ExternalCanvas] patch #' + (++updateCount))
})

// 通过模板 ref 暴露给父组件
defineExpose({
  tick() {
    // 正常响应式路径：shallowRef.value = newObj 才会触发
    info.value = { ...obj, color: nextColor(obj.color) }
  },
  forceUpdate() {
    // 不改 info.value，但调用 $forceUpdate 触发 patch
    // 父组件拿到的 ref 上调用 forceUpdate() —— Vue 3 通过 setup 暴露方法不会自动挂到实例，
    // 这里改用 getCurrentInstance 调用组件实例方法
    const inst = (window as any).__currentInstanceForDemo
    // 演示目的：直接重新赋值 info（同样能触发 patch，但体现"绕过响应式" 概念）
    // 真实代码应调 inst.forceUpdate()
    obj.label = obj.label + '!' // 直接 mutate，shallowRef 不响应
    info.value = obj             // 重新赋同一个 obj 引用，但 Vue 仍会 diff
  },
})

function nextColor(c: string) {
  return c === 'red' ? 'blue' : 'red'
}
</script>

<style scoped>
.canvas { padding: 10px; background: #fff; border: 1px dashed #ccc; border-radius: 4px; margin-bottom: 8px; }
.hint { font-size: 12px; color: #888; margin: 4px 0 0; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
</style>