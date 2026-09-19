<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① is / &lt;component :is&gt;：动态组件</h4>
      <button v-for="opt in compOptions" :key="opt"
              :class="{ active: currentComp === opt }"
              @click="currentComp = opt">
        {{ opt }}
      </button>
      <component :is="compMap[currentComp]" />
      <p class="hint">动态切换组件：&lt;component :is&gt; 渲染对应组件</p>
    </section>

    <section class="card">
      <h4>② :key 强制重建：组件状态重置</h4>
      <div class="row">
        <button @click="formKey++">重建表单（key++）</button>
        <span>当前 key = {{ formKey }}</span>
      </div>
      <KeepAlive>
        <FormPanel :key="formKey" />
      </KeepAlive>
      <p class="hint">改 key 后即使 KeepAlive 缓存中也会被认为是新组件 —— 注意：KeepAlive 与 :key 配合时，:key 直接绕过缓存</p>
    </section>

    <section class="card">
      <h4>③ :key 在 v-for 中：强制不复用（避免状态错乱）</h4>
      <input v-model="newLabel" placeholder="新标签" @keydown.enter="addItem" />
      <button @click="addItem">添加</button>
      <ul>
        <li v-for="item in items" :key="item.id">
          <input v-model="item.text" />
        </li>
      </ul>
      <p class="hint">每项独立的 input，加 :key 后 DOM 不被复用 —— 输入框状态正确</p>
    </section>

    <section class="card">
      <h4>④ ref 字符串 vs 函数</h4>
      <input ref="myInputRef" placeholder="字符串 ref" />
      <button @click="logInput">读取字符串 ref</button>
      <pre>{{ refStringLog }}</pre>

      <div class="sep"></div>
      <input :ref="(el) => onFnRef(el as HTMLInputElement | null)" placeholder="函数 ref" />
      <button @click="logFnRef">读取函数 ref</button>
      <pre>{{ refFnLog }}</pre>
    </section>

    <section class="card">
      <h4>⑤ ref 卸载时回调</h4>
      <button @click="showFnTarget = !showFnTarget">切换显示</button>
      <input v-if="showFnTarget" :ref="(el) => onMountFnRef(el as HTMLInputElement | null)" placeholder="会卸载" />
      <pre>{{ fnUnmountLog }}</pre>
      <p class="hint">组件卸载时函数 ref 会被调用一次（el=null）</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, useTemplateRef } from 'vue'
import FormPanel from './FormPanel.vue'
import AlertBox from './AlertBox.vue'
import InfoBox from './InfoBox.vue'
import CardBox from './CardBox.vue'

const title = ref('特殊属性：is / key / ref')

/* === ① is === */
const compOptions = ['Alert', 'Info', 'Card'] as const
type CompKey = (typeof compOptions)[number]
const currentComp = ref<CompKey>('Alert')
const compMap = {
  Alert: markRaw(AlertBox),
  Info: markRaw(InfoBox),
  Card: markRaw(CardBox),
} as const

/* === ② key === */
const formKey = ref(0)

/* === ③ key in v-for === */
interface Item { id: number; text: string }
const items = ref<Item[]>([
  { id: 1, text: 'a' },
  { id: 2, text: 'b' },
  { id: 3, text: 'c' },
])
const newLabel = ref('')
function addItem() {
  if (!newLabel.value) return
  items.value.push({ id: Date.now(), text: newLabel.value })
  newLabel.value = ''
}

/* === ④ ref 字符串 === */
const myInputRef = useTemplateRef<HTMLInputElement>('myInputRef')
const refStringLog = ref('')
function logInput() {
  if (myInputRef.value) {
    refStringLog.value = `tagName: ${myInputRef.value.tagName}\nvalue: "${myInputRef.value.value}"`
  }
}

/* === ⑤ ref 函数 === */
const fnRef = ref<HTMLInputElement | null>(null)
const refFnLog = ref('')
function onFnRef(el: HTMLInputElement | null) {
  fnRef.value = el
}
function logFnRef() {
  if (fnRef.value) {
    refFnLog.value = `tagName: ${fnRef.value.tagName}\nvalue: "${fnRef.value.value}"`
  }
}

const showFnTarget = ref(true)
const fnUnmountLog = ref('')
function onMountFnRef(el: HTMLInputElement | null) {
  if (el) {
    fnUnmountLog.value = `[mount] ref attached (tag: ${el.tagName})`
  } else {
    fnUnmountLog.value += `\n[unmount] ref called with null`
  }
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
  margin-bottom: 6px;
}
button.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}
.row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  align-items: center;
}
input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
ul {
  margin: 6px 0;
  padding-left: 0;
  list-style: none;
}
li {
  padding: 4px 0;
}
.sep {
  height: 1px;
  background: #e2e8f0;
  margin: 12px 0;
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
