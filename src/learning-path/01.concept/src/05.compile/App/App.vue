<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <label>
      输入模板：
      <textarea v-model="source" rows="3"></textarea>
    </label>
    <button @click="runCompile">运行 compile()</button>
    <p class="meta">
      编译后 render 函数（节选）：
    </p>
    <pre>{{ output }}</pre>
    <p>渲染输出：</p>
    <div class="rendered" v-html="renderedHtml"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { compile } from '@vue/compiler-dom'

const title = ref('运行时 compile() 演示')
const source = ref('<div><span :id="id">{{ msg }}</span></div>')
const output = ref('点击按钮查看编译产物')
const renderedHtml = ref('')

function runCompile() {
  const { code } = compile(source.value, { mode: 'function' })
  output.value = code.length > 600 ? code.slice(0, 600) + '\n...' : code
  // 简易函数化渲染：将模板塞进临时 div
  renderedHtml.value = source.value
}
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
}
textarea {
  width: 100%;
  font-family: monospace;
  margin-top: 4px;
}
pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 6px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
.rendered {
  padding: 6px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #fff;
  margin-top: 4px;
}
button {
  margin: 8px 0;
  padding: 4px 12px;
}
.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>