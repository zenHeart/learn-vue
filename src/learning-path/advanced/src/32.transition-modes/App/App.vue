<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 默认 mode（同步）</h4>
      <button @click="showA = !showA">切换</button>
      <Transition name="fade">
        <div v-if="showA" key="a" class="box box-a">A</div>
        <div v-else key="b" class="box box-b">B</div>
      </Transition>
      <p class="hint">进入与离开同时进行</p>
    </section>

    <section class="card">
      <h4>② mode="out-in"：先离开再进入</h4>
      <button @click="showC = !showC">切换</button>
      <Transition name="fade" mode="out-in">
        <div v-if="showC" key="c" class="box box-c">C</div>
        <div v-else key="d" class="box box-d">D</div>
      </Transition>
      <p class="hint">旧元素离开动画结束才挂载新元素（最常用）</p>
    </section>

    <section class="card">
      <h4>③ mode="in-out"：先进入再离开</h4>
      <button @click="showE = !showE">切换</button>
      <Transition name="slide" mode="in-out">
        <div v-if="showE" key="e" class="box box-e">E</div>
        <div v-else key="f" class="box box-f">F</div>
      </Transition>
      <p class="hint">新元素先进入并抢占位置，再触发旧元素离开</p>
    </section>

    <section class="card">
      <h4>④ appear：首次挂载也跑动画</h4>
      <button @click="appearFlag = !appearFlag">切换</button>
      <Transition name="bounce" appear>
        <div v-if="appearFlag" class="box box-g">G（带 appear）</div>
      </Transition>
      <p class="hint">挂载瞬间会触发进入动画</p>
    </section>

    <section class="card">
      <h4>⑤ JS 钩子 + mode="out-in"</h4>
      <button @click="jsMode = !jsMode">切换</button>
      <Transition
        mode="out-in"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div v-if="jsMode" key="j" class="box box-js">JS</div>
        <div v-else key="k" class="box box-js">K</div>
      </Transition>
      <pre>{{ jsLog }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Transition mode / appear / JS 钩子')

const showA = ref(true)
const showC = ref(true)
const showE = ref(true)
const appearFlag = ref(true)
const jsMode = ref(true)

const jsLog = ref('')

function log(msg: string) {
  jsLog.value += msg + '\n'
}
function onBeforeEnter(el: Element) { log('before-enter: ' + (el as HTMLElement).textContent) }
function onEnter(el: Element, done: () => void) {
  log('enter: ' + (el as HTMLElement).textContent)
  setTimeout(done, 200)
}
function onAfterEnter(el: Element) { log('after-enter: ' + (el as HTMLElement).textContent) }
function onBeforeLeave(el: Element) { log('before-leave: ' + (el as HTMLElement).textContent) }
function onLeave(el: Element, done: () => void) {
  log('leave: ' + (el as HTMLElement).textContent)
  setTimeout(done, 200)
}
function onAfterLeave(el: Element) { log('after-leave: ' + (el as HTMLElement).textContent) }
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
  min-height: 120px;
}
.card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #1e293b;
}
.hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}
button {
  padding: 4px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 8px;
}
.box {
  padding: 16px;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
  color: #fff;
}
.box-a, .box-c { background: #6366f1; }
.box-b, .box-d { background: #f59e0b; }
.box-e { background: #10b981; }
.box-f { background: #ef4444; }
.box-g { background: #8b5cf6; }
.box-js { background: #475569; }

/* fade */
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }

/* slide */
.slide-enter-from { transform: translateX(20px); opacity: 0; }
.slide-leave-to { transform: translateX(-20px); opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: all 0.3s; }

/* bounce */
.bounce-enter-from { transform: scale(0.5); opacity: 0; }
.bounce-enter-active { animation: bounce 0.5s; }
@keyframes bounce {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
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
