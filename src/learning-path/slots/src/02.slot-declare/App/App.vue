<template>
  <div class="demo">
    <h3>{{ title }}</h3>
    <Wrapper>
      <strong>这是父组件传给子组件的默认插槽内容</strong>
      <template #footer>
        <em>这是 footer 具名插槽的内容</em>
      </template>
    </Wrapper>
    <p class="meta">
      父组件用 <code>&lt;Comp&gt;内容&lt;/Comp&gt;</code> 传入，子组件用 <code>&lt;slot /&gt;</code> 在模板里渲染；具名插槽使用 <code>#name</code> 简写。
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Wrapper from './Wrapper.vue'

const title = ref('slot 声明与作用域')
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
code {
  background: #e2e8f0;
  padding: 0 4px;
  border-radius: 3px;
}
.meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}
</style>