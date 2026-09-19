<template>
  <div class="hcomp">
    <div>n: {{ n }}</div>
    <button @click="inc">+1</button>
    <button @click="dec">-1</button>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import HChild from './HChild.vue'

// 注意：HChild 与本文件都是 Vue SFC，演示使用 h() 写法
// 这里不使用 h()，直接用模板更易读；下面是等价的 h() 版本示例
const n = ref(0)
const inc = () => n.value++
const dec = () => n.value--

// 实际生产中可以将 export default 替换为：
// export default defineComponent({
//   setup() {
//     const n = ref(0)
//     return () =>
//       h('div', { class: 'hcomp' }, [
//         h('div', null, `n: ${n.value}`),
//         h('button', { onClick: () => n.value++ }, '+1'),
//       ])
//   },
// })
void h
</script>

<style scoped>
.hcomp { display: inline-flex; gap: 6px; padding: 8px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
button { padding: 2px 8px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
