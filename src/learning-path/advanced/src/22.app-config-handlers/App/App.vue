<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① errorHandler 触发：渲染期 / 生命周期 / v-on</h4>
      <button @click="boomRender">触发渲染错误</button>
      <button @click="boomMounted">触发 mounted 钩子错误</button>
      <button @click="boomVOn">触发 v-on 错误</button>
      <button @click="boomWatcher">触发 watch 错误</button>
    </section>

    <section class="card">
      <h4>② errorHandler 调用栈</h4>
      <pre>{{ errorLog }}</pre>
      <button @click="errorLog = ''">清空</button>
    </section>

    <section class="card">
      <h4>③ warnHandler 拦截开发期 warning</h4>
      <pre>{{ warnLog }}</pre>
      <p class="hint">修改 props 而非 emit 触发警告；生产构建会静默</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, h } from 'vue'

const title = ref('app.config.errorHandler / warnHandler 全局兜底')

/* === errorHandler === */
const errorLog = ref('')
function logError(err, instance, info) {
  errorLog.value += `[errorHandler] info="${info}" message="${err.message || err}"\n`
}

// 通过 getCurrentInstance 不易暴露 config；这里用子组件演示
import { getCurrentInstance } from 'vue'
const inst = getCurrentInstance()
if (inst && inst.appContext && inst.appContext.config) {
  inst.appContext.config.errorHandler = logError
  inst.appContext.config.warnHandler = (msg) => {
    warnLog.value += `[warnHandler] ${msg}\n`
  }
}

/* === 制造错误 === */
const tick = ref(0)
function boomRender() {
  tick.value++
}
function boomMounted() {
  mountedBoom.value++
}
const mountedBoom = ref(0)
function boomVOn() {
  throw new Error('来自 v-on 监听器')
}
function boomWatcher() {
  watcherSrc.value = null
}
const watcherSrc = ref(1)
watch(watcherSrc, () => {
  throw new Error('来自 watcher 回调')
})

/* === warnHandler === */
const warnLog = ref('')

// 用 mutate prop 触发 warning：定义一个子组件 props 但手动改 prop
const PropsDemo = {
  props: ['count'],
  template: `<div>{{ count }}</div>`,
  mounted() { this.count = 999 }
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
button {
  margin-right: 6px;
  padding: 4px 10px;
}
pre {
  background: #f6f8fa;
  padding: 6px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
}
.hint {
  font-size: 12px;
  color: #888;
}
</style>
