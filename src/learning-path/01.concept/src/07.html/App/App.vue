<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <label class="row">
      <span>用户输入：</span>
      <input v-model="userInput" placeholder="尝试输入 <script>alert(1)</script>" />
    </label>
    <p>文本插值（自动转义）：<strong>{{ userInput }}</strong></p>
    <p>v-html 渲染：</p>
    <div class="rendered" v-html="userInput"></div>
    <p class="meta">
      文本插值会把内容做 HTML 转义，避免 XSS；v-html 直接写入 DOM，<strong>只能用于可信内容</strong>。
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('v-html 安全对比')
const userInput = ref('<b style="color:#16a34a">来自后端的富文本</b>')
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
}
input {
  margin-left: 6px;
  padding: 2px 6px;
  width: 60%;
}
.rendered {
  padding: 6px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #fff;
  margin-top: 4px;
  min-height: 24px;
}
.row {
  display: block;
  margin-bottom: 8px;
}
.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>