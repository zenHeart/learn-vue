<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① stop：阻止冒泡</h4>
      <div class="outer" @click="logTo(stopLog, '外层点击')">
        外层
        <button class="inner" @click.stop="logTo(stopLog, '内层 stop')">
          点我（不会冒泡到外层）
        </button>
      </div>
      <pre>{{ stopLog }}</pre>
    </section>

    <section class="card">
      <h4>② prevent：阻止默认行为</h4>
      <a href="https://example.com" @click.prevent="logTo(preventLog, '阻止了链接跳转')" target="_blank">
        阻止跳转的链接
      </a>
      <pre>{{ preventLog }}</pre>
    </section>

    <section class="card">
      <h4>③ capture：在捕获阶段触发</h4>
      <div class="cap-outer" @click.capture="logTo(captureLog, 'capture-outer（捕获）')">
        捕获阶段监听
        <button @click="logTo(captureLog, '冒泡-button')">点击</button>
      </div>
      <pre>{{ captureLog }}</pre>
      <p class="hint">捕获阶段监听器先于冒泡阶段触发</p>
    </section>

    <section class="card">
      <h4>④ self：仅当 target 是当前元素自身</h4>
      <div class="self-box" @click.self="logTo(selfLog, '点击的是 self-box 自身')">
        <span>点击子节点不触发自身监听</span>
        <button @click="logTo(selfLog, 'button 正常冒泡到外层')">点 button</button>
      </div>
      <pre>{{ selfLog }}</pre>
    </section>

    <section class="card">
      <h4>⑤ once：只触发一次</h4>
      <button @click.once="onOnce">点我（仅第一次生效）</button>
      <p>实际点击次数: {{ onceCount }}</p>
      <pre>{{ onceLog }}</pre>
    </section>

    <section class="card">
      <h4>⑥ passive：滚动性能优化</h4>
      <div class="scroll-box" @scroll.passive="onScroll">
        <div class="tall">滚动内容 1</div>
        <div class="tall">滚动内容 2</div>
        <div class="tall">滚动内容 3</div>
      </div>
      <p>scroll 触发次数: {{ scrollCount }}</p>
      <p class="hint">.passive 告诉浏览器"不会 preventDefault"，浏览器可立即滚动无需等 JS</p>
    </section>

    <section class="card">
      <h4>⑦ exact：精确修饰键匹配</h4>
      <button @click.ctrl="logTo(exactLog, 'ctrl 普通：要求按住 Ctrl')">
        Ctrl+click（可同时按其他修饰键）
      </button>
      <button @click.ctrl.exact="logTo(exactLog, 'ctrl exact：仅按 Ctrl')">
        Ctrl+click（仅 Ctrl）
      </button>
      <pre>{{ exactLog }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('v-on 事件修饰符 7 个组合')

function logTo(target: { value: string }, msg: string) {
  target.value += msg + '\n'
}

const stopLog = ref('')
const preventLog = ref('')
const captureLog = ref('')
const selfLog = ref('')
const onceLog = ref('')
const onceCount = ref(0)

function onOnce() {
  onceCount.value++
  onceLog.value = `首次点击 ${onceCount.value}（之后 .once 解绑）\n`
}

const scrollCount = ref(0)
function onScroll() {
  scrollCount.value++
}

const exactLog = ref('')
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
.outer, .cap-outer, .self-box {
  padding: 12px;
  background: #fef3c7;
  border: 1px dashed #d97706;
  border-radius: 4px;
  margin-bottom: 6px;
}
.inner {
  margin-left: 8px;
}
.self-box > span {
  margin-right: 8px;
}
.scroll-box {
  height: 80px;
  overflow-y: scroll;
  border: 1px solid #94a3b8;
  border-radius: 4px;
  background: #f1f5f9;
}
.tall {
  height: 60px;
  background: linear-gradient(180deg, #fde68a, #fca5a5);
  border-bottom: 1px solid #cbd5e1;
}
a {
  color: #2563eb;
}
</style>
