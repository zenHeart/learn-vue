<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 父 provide 三个值</h4>
      <p>API_URL: {{ apiUrl }}</p>
      <p>theme: {{ theme }}</p>
      <p>user: {{ user.name }} / {{ user.role }}</p>
    </section>

    <section class="card">
      <h4>② 组件外工具函数通过 runWithContext 拿 provide</h4>
      <button @click="callExternal">调用外部 helper</button>
      <pre>{{ helperLog }}</pre>
    </section>

    <section class="card">
      <h4>③ 跨 await 边界失效演示</h4>
      <button @click="callAsync">async 内的 helper</button>
      <pre>{{ asyncLog }}</pre>
      <p class="hint">await 之后再 inject → 抛 "no current instance"</p>
    </section>
  </div>
</template>

<script setup>
import { ref, inject, provide, getCurrentInstance } from 'vue'

const title = ref('app.runWithContext：组件外执行 inject')

const apiUrl = ref('')
const theme = ref('')
const user = ref({ name: '', role: '' })

provide('API_URL', 'https://api.example.com')
provide('theme', 'dark')
provide('user', { name: 'cheng', role: 'admin' })

apiUrl.value = inject('API_URL')
theme.value = inject('theme')
user.value = inject('user')

const instance = getCurrentInstance()
const app = instance.appContext.app

/* === ② 外部 helper === */
function helper() {
  return app.runWithContext(() => {
    const url = inject('API_URL')
    const t = inject('theme')
    return { url, t }
  })
}
const helperLog = ref('')
function callExternal() {
  const r = helper()
  helperLog.value = JSON.stringify(r, null, 2)
}

/* === ③ 跨 await 失效 === */
const asyncLog = ref('')
async function callAsync() {
  asyncLog.value = ''
  // 同步内可以
  const syncRes = app.runWithContext(() => inject('API_URL'))
  asyncLog.value += `sync  ok: ${syncRes}\n`
  try {
    // await 之后再 inject → 抛错
    await Promise.resolve()
    const after = app.runWithContext(() => inject('API_URL'))
    asyncLog.value += `after await ok: ${after}\n`
  } catch (e) {
    asyncLog.value += `after await ERR: ${e.message}\n`
  }
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
button { padding: 4px 10px; }
pre { background: #f6f8fa; padding: 6px; font-size: 12px; }
.hint { font-size: 12px; color: #888; }
</style>
