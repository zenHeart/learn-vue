<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 生命周期 hook 抛错</h4>
      <BoomMounted />
      <p class="hint">子组件 mounted 后点「再次触发」会抛错</p>
    </section>

    <section class="card">
      <h4>② v-on 监听器抛错</h4>
      <button @click="boomVOn">v-on handler 抛错</button>
    </section>

    <section class="card">
      <h4>③ watcher callback 抛错</h4>
      <button @click="inc">src++ → 触发 watcher</button>
      <p>src = {{ src }}</p>
    </section>

    <section class="card">
      <h4>④ errorHandler 内部抛错（兜底）</h4>
      <button @click="boomInHandler">触发的 errorHandler 又抛错</button>
    </section>

    <section class="card">
      <h4>⑤ errorHandler 调用记录</h4>
      <pre>{{ errorLog }}</pre>
      <button @click="errorLog = ''">清空</button>
    </section>

    <section class="card">
      <h4>⑥ warnHandler 触发 mutate prop 警告</h4>
      <MutatePropChild ref="mutateRef" :msg="warnMsg" />
      <button @click="boomWarn">触发 mutate prop</button>
      <pre>{{ warnLog }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, getCurrentInstance, useTemplateRef } from 'vue'
import BoomMounted from './BoomMounted.vue'
import MutatePropChild from './MutatePropChild.vue'

const title = ref('app.config.errorHandler + warnHandler 完整配置')

const errorLog = ref('')
const warnLog = ref('')

const inst = getCurrentInstance()!
if (inst.appContext.config) {
  const cfg = inst.appContext.config
  cfg.errorHandler = (err, instance, info) => {
    errorLog.value += `[errorHandler] info="${info}" name="${(instance as any)?.type?.name ?? 'root'}" msg="${(err as Error).message ?? err}"\n`
    if ((err as Error).message === 'handler self') {
      throw new Error('errorHandler 自身抛错 → 会被吞掉')
    }
  }
  cfg.warnHandler = (msg, _instance, trace) => {
    warnLog.value += `[warnHandler] ${msg}\n`
  }
}

/* === ② v-on === */
function boomVOn() {
  throw new Error('v-on 监听器抛错')
}

/* === ③ watcher === */
const src = ref(0)
watch(src, () => {
  if (src.value === 2) throw new Error('watcher callback 抛错')
})
function inc() { src.value++ }

/* === ④ handler self === */
function boomInHandler() {
  throw new Error('handler self')
}

/* === ⑥ warnHandler：mutate prop === */
const warnMsg = ref('mutate me')
const mutateRef = useTemplateRef<InstanceType<typeof MutatePropChild>>('mutateRef')
function boomWarn() {
  mutateRef.value?.mutateProp?.()
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