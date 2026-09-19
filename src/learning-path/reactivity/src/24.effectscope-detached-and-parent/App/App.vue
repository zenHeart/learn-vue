<template>
  <section class="r24">
    <h2>24 · effectScope(detached) / parent / onScopeDispose 二次参数</h2>

    <div class="card">
      <h3>① 普通 scope：parent 指向组件 scope，自动级联 stop</h3>
      <p>count: {{ count }}</p>
      <p>subCount (派生): {{ subCount }}</p>
      <p>child active? {{ String(childActive) }}</p>
      <button @click="count++">count++</button>
      <button @click="stopChild">stop 子 scope</button>
    </div>

    <div class="card">
      <h3>② detached scope：父 stop 不影响 detached</h3>
      <p>independent: {{ independent }}</p>
      <p>detached parent: {{ detachedParentInfo }}</p>
      <button @click="independent++">independent++</button>
    </div>

    <div class="card">
      <h3>③ onScopeDispose(fn, failSilently=true) — 异步分支静默</h3>
      <pre>{{ cleanupLog }}</pre>
      <button @click="runAsync">触发异步 setup</button>
      <button @click="reset">清空日志</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, effectScope, onScopeDispose, getCurrentScope, computed, watch } from 'vue'

const count = ref(0)

/* === ① 普通 scope：parent 是当前组件 scope === */
const child = effectScope()   // 默认 detached=false → 注册到组件 scope
let subCount = ref(0)
let childActive = ref(true)

child.run(() => {
  subCount = computed(() => count.value * 10)
  watch(count, () => {
    console.log('[child scope] count changed:', count.value)
  })
  onScopeDispose(() => {
    childActive.value = false
    console.log('[child scope] disposed')
  })
})

function stopChild() {
  child.stop()
  // 重建以便演示
  Object.assign(child, effectScope())
}

/* === ② detached scope：parent = undefined === */
const detached = effectScope(true)   // detached = true
const independent = ref(0)
let detachedParentInfo = '(尚未读取)'

detached.run(() => {
  // scope.parent 永远是 undefined
  detachedParentInfo = String(getCurrentScope()?.parent ?? 'undefined')
})

/* === ③ onScopeDispose(fn, failSilently=true) === */
const cleanupLog = ref<string>('')
let asyncScope: ReturnType<typeof effectScope> | null = null

async function runAsync() {
  // 在异步分支创建 scope → 模拟请求期间作用域
  asyncScope = effectScope()
  asyncScope.run(async () => {
    cleanupLog.value += '| 创建 scope'

    onScopeDispose(() => {
      cleanupLog.value += '| onScopeDispose (同步) 触发'
    })

    // 模拟异步 await 之后 scope 已 stop（罕见但可能）：failSilently=true 不报警
    await Promise.resolve()
    onScopeDispose(() => {
      cleanupLog.value += '| 异步 onScopeDispose 触发'
    }, true)
  })

  // 立刻 stop，验证两种 onScopeDispose 是否都触发
  asyncScope.stop()
  cleanupLog.value += '| scope.stop() 已调用'
}

function reset() {
  cleanupLog.value = ''
}
</script>

<style scoped>
.r24 { font-family: system-ui; padding: 1rem; max-width: 760px; margin: 0 auto; }
.r24 .card { border: 1px solid #ddd; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; }
.r24 button { margin-right: 0.4rem; padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.r24 pre { background: #1e1e1e; color: #d4d4d4; padding: 8px; font-size: 12px; border-radius: 4px; white-space: pre-wrap; }
</style>
