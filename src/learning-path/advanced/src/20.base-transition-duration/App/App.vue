<template>
  <div class="demo">
    <h2>20 · &lt;Transition :duration&gt; 数字 / 对象</h2>

    <section class="card">
      <h3>① 数字形式：duration=1000（enter / leave 同值）</h3>
      <button @click="show1 = !show1">toggle (数字)</button>
      <Transition :duration="1000" name="fade">
        <p v-if="show1" class="box">数字 1000ms 动画</p>
      </Transition>
    </section>

    <section class="card">
      <h3>② 对象形式：{ enter: 500, leave: 1500 }</h3>
      <button @click="show2 = !show2">toggle (对象)</button>
      <Transition :duration="{ enter: 500, leave: 1500 }" name="slide">
        <p v-if="show2" class="box alt">对象 enter=500 / leave=1500</p>
      </Transition>
    </section>

    <section class="card">
      <h3>③ JS 钩子 + CSS hook 触发顺序</h3>
      <button @click="show3 = !show3">toggle (JS 钩子)</button>
      <Transition
        :duration="800"
        name="js"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <p v-if="show3" class="box js">JS 钩子演示</p>
      </Transition>
      <p class="hint">观察 before-* → * → after-* 顺序；duration 超时后即使 transitionend 没触发也会强制结束。</p>
    </section>

    <section class="card">
      <h3>trace 日志</h3>
      <pre>{{ log }}</pre>
      <button @click="log = ''">清空</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show1 = ref(true)
const show2 = ref(true)
const show3 = ref(true)
const log = ref('')

function append(msg: string) {
  log.value = `[${new Date().toLocaleTimeString()}.${String(Date.now() % 1000).padStart(3, '0')}] ${msg}\n` + log.value
}

function onBeforeEnter(el: Element) {
  append(`before-enter (target=${(el as HTMLElement).tagName})`)
}
function onEnter(el: Element, done: () => void) {
  append(`enter (signature: ${arguments.length} args)`)
  // 签名长度 = 1 表示同步结束；长度 = 2 表示需要主动调 done
  if (arguments.length >= 2) {
    setTimeout(done, 800)
  }
}
function onAfterEnter(el: Element) {
  append(`after-enter`)
}
function onBeforeLeave(el: Element) {
  append(`before-leave`)
}
function onLeave(el: Element, done: () => void) {
  append(`leave`)
  if (arguments.length >= 2) {
    setTimeout(done, 800)
  }
}
function onAfterLeave(el: Element) {
  append(`after-leave`)
}
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
button { padding: 4px 12px; margin-right: 6px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
.box { padding: 12px; margin-top: 8px; background: #e6f4ff; border-radius: 4px; border: 1px solid #91d5ff; }
.box.alt { background: #fff7e6; border-color: #ffd591; }
.box.js { background: #f6ffed; border-color: #b7eb8f; }
.hint { font-size: 12px; color: #888; margin-top: 4px; }
pre { background: #1e1e1e; color: #d4d4d4; padding: 8px; font-size: 12px; max-height: 220px; overflow: auto; border-radius: 4px; }

/* 数字 1000 */
.fade-enter-active, .fade-leave-active { transition: opacity 1s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 对象 {enter:500, leave:1500} */
.slide-enter-active { transition: transform 500ms ease, opacity 500ms ease; }
.slide-leave-active { transition: transform 1.5s ease, opacity 1.5s ease; }
.slide-enter-from { transform: translateX(-20px); opacity: 0; }
.slide-leave-to { transform: translateX(20px); opacity: 0; }

/* JS 钩子 */
.js-enter-active, .js-leave-active { transition: transform 0.8s ease, opacity 0.8s ease; }
.js-enter-from { transform: scale(0.6); opacity: 0; }
.js-leave-to { transform: scale(1.4); opacity: 0; }
</style>
