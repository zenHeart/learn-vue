<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 键盘单键：enter / esc / tab / 方向键</h4>
      <input
        v-model="text"
        @keydown.enter="logTo(keyLog, 'enter: 提交')"
        @keyup.esc="logTo(keyLog, 'esc: 清空')"
        @keydown.up="logTo(keyLog, 'up: 上移')"
        @keydown.down="logTo(keyLog, 'down: 下移')"
        placeholder="试试 enter / esc / 方向键"
      />
      <button @click="text = ''">清空输入</button>
      <pre>{{ keyLog }}</pre>
    </section>

    <section class="card">
      <h4>② 修饰键组合：Ctrl+S / Ctrl+Shift+A</h4>
      <input
        v-model="combo"
        @keydown.ctrl.s.prevent="logTo(comboLog, 'Ctrl+S：保存')"
        @keydown.ctrl.shift.a="logTo(comboLog, 'Ctrl+Shift+A：高级动作')"
        @keydown.alt.enter="logTo(comboLog, 'Alt+Enter：换行')"
        placeholder="试试 Ctrl+S / Ctrl+Shift+A / Alt+Enter"
      />
      <pre>{{ comboLog }}</pre>
      <p class="hint">.prevent 会阻止浏览器默认的"保存网页"行为</p>
    </section>

    <section class="card">
      <h4>③ 鼠标键修饰符：left / right / middle</h4>
      <div class="mouse-area" @click.left="logTo(mouseLog, '左键')"
           @click.right.prevent="logTo(mouseLog, '右键（菜单已阻止）')"
           @click.middle="logTo(mouseLog, '中键')">
        在这里点击（左/右/中）
      </div>
      <pre>{{ mouseLog }}</pre>
      <p class="hint">.right.prevent 阻止系统右键菜单，自定义逻辑接管</p>
    </section>

    <section class="card">
      <h4>④ 任意键名 + 自定义键</h4>
      <input
        v-model="anyKey"
        @keydown.f1="logTo(anyLog, 'F1 帮助')"
        @keydown.page-down="logTo(anyLog, 'PageDown 翻页')"
        @keydown.1="logTo(anyLog, '数字 1')"
        placeholder="试试 F1 / PageDown / 数字 1"
      />
      <pre>{{ anyLog }}</pre>
      <p class="hint">支持任意 key 名（kebab-case → event.key）</p>
    </section>

    <section class="card">
      <h4>⑤ 与 .exact 组合：精确匹配修饰键</h4>
      <button @click.ctrl.exact="logTo(exactLog, 'Ctrl+click（仅 Ctrl）')">
        Ctrl+click（精确）
      </button>
      <button @click.ctrl="logTo(exactLog, 'Ctrl+click（任意修饰）')">
        Ctrl+click（任意）
      </button>
      <pre>{{ exactLog }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const title = ref('v-on 鼠标键修饰符 + 键盘修饰符')

function logTo(target: { value: string }, msg: string) {
  target.value += msg + '\n'
}

const text = ref('')
const keyLog = ref('')
// 输入框清空时同步清日志
watch(text, (v) => {
  if (v === '') keyLog.value = ''
})

const combo = ref('')
const comboLog = ref('')

const mouseLog = ref('')

const anyKey = ref('')
const anyLog = ref('')

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
input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  width: 60%;
  margin-right: 6px;
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
  max-height: 180px;
  overflow-y: auto;
}
.mouse-area {
  padding: 24px;
  background: #ddd6fe;
  border: 1px dashed #7c3aed;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 6px;
}
</style>
