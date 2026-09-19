<script setup>
import { ref, useTemplateRef } from 'vue'

// 错误：变量名 myRef 与模板 ref="box" 不一致
const myRef = ref(null)
function readBroken() {
  return myRef.value === null ? 'null (ref="box" 不匹配变量名 myRef)' : '找到元素'
}

// 修复 1：变量名 boxRef 与 ref="box" 一致
const boxRef = ref(null)
function readFixedName() {
  return boxRef.value ? '找到元素' : 'null'
}

// 修复 2：useTemplateRef('box')
const boxRef2 = useTemplateRef('box')
function readUseTemplate() {
  return boxRef2.value ? '找到元素（useTemplateRef）' : 'null'
}
</script>

<template>
  <div class="demo">
    <p class="badge">模板 ref undefined</p>

    <div class="card bad">
      <h3>① 错误：变量名不匹配</h3>
      <pre>const myRef = ref(); &lt;div ref="box"&gt;</pre>
      <div ref="box" class="target">目标元素</div>
      <button @click="alert(readBroken())">读 myRef.value</button>
    </div>

    <div class="card good">
      <h3>② 修复：变量名一致</h3>
      <pre>const boxRef = ref(); &lt;div ref="box"&gt;</pre>
      <button @click="alert(readFixedName())">读 boxRef.value</button>
    </div>

    <div class="card good">
      <h3>③ 修复：useTemplateRef</h3>
      <pre>const boxRef2 = useTemplateRef('box')</pre>
      <button @click="alert(readUseTemplate())">读 boxRef2.value</button>
    </div>
  </div>
</template>

<style scoped>
.demo { font-family: system-ui, sans-serif; padding: 8px; color: #213547; max-width: 460px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #fdecea; color: #c0392b; font-weight: 600; font-size: 0.82rem; margin: 0 0 10px; }
.card { padding: 10px; border-radius: 8px; margin-bottom: 8px; }
.card.bad { background: #fff5f5; border: 1px solid #f5c6c6; }
.card.good { background: #f0fff4; border: 1px solid #c6e8d4; }
h3 { font-size: 0.85rem; margin: 0 0 4px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 6px 8px; border-radius: 4px; font-size: 0.72rem; font-family: ui-monospace, monospace; margin: 4px 0; }
.target { background: #fff8e1; padding: 8px; border-radius: 4px; text-align: center; color: #b78103; font-weight: 600; margin: 4px 0; }
button { padding: 5px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-size: 0.78rem; }
</style>
