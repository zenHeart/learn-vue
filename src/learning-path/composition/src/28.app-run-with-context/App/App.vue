<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 组件外工具函数：通过 runWithContext 拿 provide</h4>
      <button @click="callExternal">调用外部 helper</button>
      <pre>{{ helperLog }}</pre>
    </section>

    <section class="card">
      <h4>② 跨 await 边界：currentApp 被还原</h4>
      <button @click="callAsync">async 内的 helper</button>
      <pre>{{ asyncLog }}</pre>
      <p class="hint">await 之后再 runWithContext 拿 inject —— ok；直接 inject 抛错</p>
    </section>

    <section class="card">
      <h4>③ 库作者场景：封装 useApi</h4>
      <button @click="callApi">调用 createApi()</button>
      <pre>{{ apiLog }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, provide, getCurrentInstance } from 'vue'

const title = ref('app.runWithContext：跨边界 inject 工具函数')

provide('API_URL', 'https://api.example.com')
provide('theme', 'dark')

const instance = getCurrentInstance()!
const app = instance.appContext.app

/* === ① 组件外 helper === */
function helper() {
  return app.runWithContext(() => ({
    url: inject('API_URL'),
    theme: inject('theme'),
  }))
}
function callExternal() {
  helperLog.value = JSON.stringify(helper(), null, 2)
}
const helperLog = ref('')

/* === ② 跨 await === */
const asyncLog = ref('')
async function callAsync() {
  asyncLog.value = ''
  const syncRes = app.runWithContext(() => inject('API_URL'))
  asyncLog.value += `sync  ok: ${syncRes}\n`

  await Promise.resolve()

  const afterRun = app.runWithContext(() => inject('API_URL'))
  asyncLog.value += `after await runWithContext: ${afterRun}\n`

  try {
    const naked = inject('API_URL')
    asyncLog.value += `naked inject: ${naked}\n`
  } catch (e: any) {
    asyncLog.value += `naked inject ERR: ${e.message}\n`
  }
}

/* === ③ 库作者场景 === */
function createApi() {
  return app.runWithContext(() => {
    const url = inject('API_URL') as string
    return {
      url,
      list: () => url + '/list',
      detail: (id: number) => `${url}/items/${id}`,
    }
  })
}
const apiLog = ref('')
function callApi() {
  const api = createApi()
  apiLog.value = `list endpoint: ${api.list()}\ndetail(42): ${api.detail(42)}\n`
}
</script>

<style scoped>
.demo {
  max-width: 820px;
  margin: 16px auto;
  padding: 16px;
  color: #213547;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.card {
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  font-size: 12px;
  color: #64748b;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 6px;
}
pre {
  margin-top: 6px;
  padding: 8px;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>