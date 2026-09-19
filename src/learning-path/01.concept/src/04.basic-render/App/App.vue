<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <p>文本插值 <code>{{ "{{" }} name {{ "}}" }}</code>：<strong>{{ name }}</strong></p>
    <p>v-html 输出（HTML 源码）：</p>
    <pre class="raw">{{ rawHtml }}</pre>
    <p>v-html 渲染结果：</p>
    <div class="rendered" v-html="rawHtml"></div>
    <p class="meta">
      模板编译产物（简化）：
      <code>{{ compiled }}</code>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const title = ref('基础渲染：mustache 与 v-html')
const name = ref('<b>Vue</b>')
const rawHtml = ref('<span style="color:#16a34a">富文本 <em>片段</em></span>')

// 模拟模板编译产物（运行时无法拿到完整 render 函数字符串）
const compiled = computed(
  () => '_ctx.name; _v("<span>v-html</span>"); return _h("div", _ctx.$slots.default)'
)
</script>

<style scoped>
.demo {
  padding: 12px;
  color: #213547;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  max-width: 520px;
}
pre.raw {
  background: #0f172a;
  color: #e2e8f0;
  padding: 6px;
  border-radius: 4px;
}
.rendered {
  padding: 6px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
  background: #fff;
}
.meta {
  margin-top: 10px;
  font-size: 12px;
  color: #64748b;
}
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
</style>