<template>
  <div class="demo">
    <h3>{{ title }}</h3>

    <section class="card">
      <h4>① 默认：每次输入触发</h4>
      <input v-model="textDefault" placeholder="每次键入都更新" />
      <p>text: <code>{{ textDefault }}</code></p>
      <p class="hint">监听 input 事件</p>
    </section>

    <section class="card">
      <h4>② .lazy：失焦 / Enter 后才更新</h4>
      <input v-model.lazy="textLazy" placeholder="失焦后才更新 model" />
      <p>text: <code>{{ textLazy }}</code></p>
      <p class="hint">监听 change 事件 —— 输入过程 model 不变</p>
    </section>

    <section class="card">
      <h4>③ .number：尝试转 Number</h4>
      <input v-model.number="numValue" type="text" placeholder="输入数字" />
      <p>numValue: <code>{{ numValue }}</code> (typeof: <strong>{{ typeof numValue }}</strong>)</p>
      <p class="hint">成功 parseFloat 才转 number；输入 abc 时仍是字符串</p>
    </section>

    <section class="card">
      <h4>④ .trim：去掉首尾空格</h4>
      <input v-model.trim="trimValue" placeholder="前后空格会被去掉" />
      <p>value: <code>"{{ trimValue }}"</code> (length: {{ trimValue.length }})</p>
      <p class="hint">仅去首尾空格；中间多个空格保留</p>
    </section>

    <section class="card">
      <h4>⑤ 组合：.lazy + .trim</h4>
      <input v-model.lazy.trim="combo" placeholder="失焦才更新 + 去空格" />
      <p>value: <code>"{{ combo }}"</code></p>
      <p class="hint">事件用 change，值用 trim</p>
    </section>

    <section class="card">
      <h4>⑥ 对照实验：.number + 失败输入</h4>
      <input v-model.number="numValue" type="text" placeholder="试试输入 abc / 1.5 / 空" />
      <p>当前: <code>{{ numValue }}</code> (typeof: <strong>{{ typeof numValue }}</strong>)</p>
      <p class="hint">空输入仍是 ''（不是 0）；abc 也是字符串</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('v-model 修饰符：lazy / number / trim')

const textDefault = ref('')
const textLazy = ref('')
const numValue = ref<number | string>(0)
const trimValue = ref('')
const combo = ref('')
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
}
code {
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: #fef9c3;
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
