<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>这是一个最基础的 Vue 3 应用挂载示例。</p>
    <p>当前时间：{{ now }}</p>
    <button @click="refresh">刷新时间</button>
    <p class="meta">挂载点：<code>#app</code> · 入口：<code>createApp(App).mount('#app')</code></p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const title = ref('Hello, Vue 3!')
const now = ref(new Date().toLocaleTimeString())

function refresh() {
  now.value = new Date().toLocaleTimeString()
}

onMounted(() => {
  console.log('[getting-started] mounted to #app')
})
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 480px;
}
button {
  margin-top: 8px;
  padding: 6px 12px;
  border: 1px solid #213547;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.meta {
  margin-top: 12px;
  font-size: 12px;
  color: #64748b;
}
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
</style>