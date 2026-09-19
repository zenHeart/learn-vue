<template>
  <div class="demo">
    <h2>getCurrentInstance()</h2>

    <section class="card">
      <h3>① 同步 setup 中访问内部实例</h3>
      <p class="hint">
        setup 同步执行期间能拿到内部实例；展示 <code>inst.setupState</code>、
        <code>inst.props</code>、<code>inst.appContext.config</code> 等字段。
      </p>
      <DebugCard :count="42" label="演示" />
      <p class="meta">打开 DevTools console 查看输出。</p>
    </section>

    <section class="card">
      <h3>② 跨 await 边界：currentInstance 失效</h3>
      <p class="hint">
        微任务里调 <code>getCurrentInstance()</code> 拿到 <code>null</code>；
        <code>app.runWithContext()</code> 能恢复上下文。
      </p>
      <AsyncProbe />
    </section>

    <section class="card">
      <h3>③ 与 inject / useAttrs 的边界</h3>
      <p class="hint">
        同样在 setup 拿「父级提供的值」「未声明的属性」，推荐 <code>inject / useAttrs</code>；
        <code>getCurrentInstance</code> 是它们的底层实现。
      </p>
      <ProbeInject />
    </section>

    <section class="card">
      <h3>④ &lt;script setup&gt; vs Options API</h3>
      <p class="hint">
        Options API 中 this 已经是 instance proxy；
        setup 中通过 <code>getCurrentInstance()</code> 才能拿到内部实例。
      </p>
      <button @click="logSetupInstance">打印当前 setup 实例</button>
      <pre>{{ setupLog }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import DebugCard from './DebugCard.vue'
import AsyncProbe from './AsyncProbe.vue'
import ProbeInject from './ProbeInject.vue'

const setupLog = ref('')
const logSetupInstance = () => {
  const inst = getCurrentInstance()
  if (!inst) { setupLog.value = 'null (no current instance)'; return }
  setupLog.value = JSON.stringify({
    type: inst.type.name || '(anonymous)',
    setupKeys: Object.keys(inst.setupState),
    isMounted: inst.isMounted,
    appConfig: Object.keys(inst.appContext.config),
  }, null, 2)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 14px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
.hint { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.55; }
.meta { font-size: 12px; color: #888; margin-top: 8px; }
button { padding: 5px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; font-size: 11px; line-height: 1.5; max-height: 220px; overflow: auto; }
</style>