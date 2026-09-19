<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 切页：观察激活/失活日志</h4>
      <div class="tabs">
        <button v-for="t in tabs" :key="t" :class="{ active: current === t }" @click="current = t">
          {{ t }}
        </button>
      </div>
      <KeepAlive :include="['PageA','PageB']">
        <component :is="current" />
      </KeepAlive>
      <pre>{{ log }}</pre>
      <button @click="log = ''">清空日志</button>
    </section>

    <section class="card">
      <h4>② 说明</h4>
      <ul class="hint">
        <li>首次进入：触发 <code>mounted</code> + <code>activated</code></li>
        <li>切走：触发 <code>deactivated</code>（不卸载，状态保留）</li>
        <li>切回：仅触发 <code>activated</code>（不再 mounted）</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import PageA from './PageA.vue'
import PageB from './PageB.vue'

const title = ref('onActivated / onDeactivated（KeepAlive 钩子）')

const tabs = ['PageA', 'PageB']
const current = ref('PageA')
const log = ref('')

function appendLog(e) {
  log.value += e.detail + '\n'
}
onMounted(() => window.addEventListener('demo-log', appendLog))
onBeforeUnmount(() => window.removeEventListener('demo-log', appendLog))
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
.tabs { display: flex; gap: 4px; margin-bottom: 8px; }
.tabs button.active { background: #3b82f6; color: #fff; }
pre {
  background: #f6f8fa;
  padding: 6px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
}
button { padding: 4px 10px; }
.hint { font-size: 12px; color: #475569; line-height: 1.7; }
.hint code { background: #e2e8f0; padding: 1px 4px; border-radius: 3px; }
</style>
