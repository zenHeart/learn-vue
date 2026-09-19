<template>
  <div class="demo">
    <h2>Transition 完整 API 演示</h2>

    <section class="card">
      <h4>① mode="out-in" + duration</h4>
      <button @click="showA = !showA">切换</button>
      <Transition name="fade" mode="out-in" :duration="300">
        <p v-if="showA" key="a" class="box box-a">A</p>
        <p v-else key="b" class="box box-b">B</p>
      </Transition>
      <p class="hint">先离开再进入；duration 强制 300ms</p>
    </section>

    <section class="card">
      <h4>② appear：首次挂载也播动画</h4>
      <button @click="showFirst = !showFirst">{{ showFirst ? '卸载' : '挂载' }}</button>
      <Transition name="rise" appear>
        <p v-if="showFirst" class="box box-r">首次挂载也会播</p>
      </Transition>
    </section>

    <section class="card">
      <h4>③ 8 个 JS 钩子：完整时序</h4>
      <button @click="showJs = !showJs">切换</button>
      <Transition
        :duration="{ enter: 200, leave: 200 }"
        mode="out-in"
        @before-enter="log('before-enter')"
        @enter="onEnter"
        @after-enter="log('after-enter')"
        @enter-cancelled="log('enter-cancelled')"
        @before-leave="log('before-leave')"
        @leave="onLeave"
        @after-leave="log('after-leave')"
        @leave-cancelled="log('leave-cancelled')"
      >
        <p v-if="showJs" key="x" class="box box-js">JS</p>
        <p v-else key="y" class="box box-js-2">Y</p>
      </Transition>
      <pre>{{ jsLog.join('\n') }}</pre>
    </section>

    <section class="card">
      <h4>④ type="animation"：监听 animationend</h4>
      <button @click="showAnim = !showAnim">切换</button>
      <Transition name="spin" type="animation" mode="out-in">
        <p v-if="showAnim" class="box box-spin">A</p>
        <p v-else class="box box-spin">B</p>
      </Transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showA = ref(true)
const showFirst = ref(true)
const showJs = ref(true)
const showAnim = ref(true)
const jsLog = ref<string[]>([])

function log(s: string) { jsLog.value.push(s) }
function onEnter(_el: Element, done: () => void) {
  log('enter (start)')
  setTimeout(() => { log('enter (done)'); done() }, 200)
}
function onLeave(_el: Element, done: () => void) {
  log('leave (start)')
  setTimeout(() => { log('leave (done)'); done() }, 200)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; color: #213547; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h4 { margin: 0 0 8px; font-size: 14px; }
button { padding: 4px 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 6px; }
.box { padding: 14px; border-radius: 6px; color: #fff; font-weight: bold; text-align: center; }
.box-a, .box-r { background: #6366f1; }
.box-b { background: #f59e0b; }
.box-js { background: #14b8a6; }
.box-js-2 { background: #db2777; }
.box-spin { background: #8b5cf6; }
.hint { font-size: 12px; color: #64748b; margin: 4px 0 0; }

.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }

.rise-enter-from { transform: translateY(20px); opacity: 0; }
.rise-enter-active { transition: all 0.4s; }
.rise-leave-to { transform: translateY(-20px); opacity: 0; }

.spin-enter-active { animation: spin 0.5s; }
.spin-leave-active { animation: spin 0.5s reverse; }
@keyframes spin {
  from { transform: rotate(0); opacity: 0; }
  to { transform: rotate(360deg); opacity: 1; }
}

pre {
  margin-top: 6px;
  padding: 8px;
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.55;
  max-height: 140px;
  overflow: auto;
}
</style>