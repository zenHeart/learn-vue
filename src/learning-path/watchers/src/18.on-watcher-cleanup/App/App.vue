<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① onWatcherCleanup 取消上一次 fetch</h4>
      <p>userId = {{ userId }}</p>
      <button @click="userId++">userId++</button>
      <pre>{{ fetchLog }}</pre>
      <p>当前 data: <code>{{ data }}</code></p>
    </section>

    <section class="card">
      <h4>② LIFO 顺序：先注册的后执行</h4>
      <p>看 cleanup 输出顺序</p>
      <button @click="triggerCleanup">++ 触发 cleanup</button>
      <pre>{{ cleanupLog }}</pre>
      <p class="hint">注册顺序：A → B → C；cleanup 顺序：C → B → A</p>
    </section>

    <section class="card">
      <h4>③ composable 内部 cleanup</h4>
      <p>composable 计数: {{ compositeCount }}</p>
      <button @click="compositeCount++">++</button>
    </section>

    <section class="card">
      <h4>④ 同步外调用 onWatcherCleanup（应给 warning）</h4>
      <button @click="callOutside">尝试在 watch 外调用</button>
      <pre>{{ outsideLog }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onWatcherCleanup, getCurrentScope } from 'vue'
import { useFakeFetch } from './useFakeFetch'

const title = ref('onWatcherCleanup：setup 中注册 watcher cleanup')

/* === ① fetch 取消 === */
const userId = ref(1)
const data = ref('—')
const fetchLog = ref('')

watch(userId, (id) => {
  const ctrl = new AbortController()
  fetchLog.value += `> start fetch /users/${id}\n`
  ;(async () => {
    try {
      // 模拟 fetch：用 setTimeout + 取消语义
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, 200)
        ctrl.signal.addEventListener('abort', () => {
          clearTimeout(t)
          reject(new Error('aborted'))
        })
      })
      data.value = `user-${id}-payload`
      fetchLog.value += `< done fetch /users/${id}\n`
    } catch (e: any) {
      fetchLog.value += `< aborted fetch /users/${id} (${e.message})\n`
    }
  })()
  onWatcherCleanup(() => {
    ctrl.abort()
    fetchLog.value += `× cleanup fetch /users/${id}\n`
  })
})

/* === ② LIFO 顺序 === */
const trigger = ref(0)
const cleanupLog = ref('')
watch(trigger, () => {
  onWatcherCleanup(() => cleanupLog.value += 'cleanup A\n')
  onWatcherCleanup(() => cleanupLog.value += 'cleanup B\n')
  onWatcherCleanup(() => cleanupLog.value += 'cleanup C\n')
})
function triggerCleanup() {
  trigger.value++
  // 同样手动 push 一次新值以让 onWatch 跑
}

/* === ③ composable 内部 cleanup === */
const compositeCount = ref(0)
useFakeFetch(compositeCount, (v) => {
  fetchLog.value += `< composable fetched: ${v}\n`
})

/* === ④ watch 外调用 === */
const outsideLog = ref('')
function callOutside() {
  outsideLog.value = ''
  // 调用前清空任何残留 watcher 的 effect 引用
  try {
    onWatcherCleanup(() => {}, false)
    outsideLog.value += 'did not warn\n'
  } catch (e: any) {
    outsideLog.value += `unexpected throw: ${e.message}\n`
  }
  outsideLog.value += '（开发模式下应看到一条 dev warning）\n'
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
  max-height: 220px;
  overflow-y: auto;
}
</style>