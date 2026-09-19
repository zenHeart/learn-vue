<template>
  <!-- 子组件根元素自动继承父组件的 data-v，但 scoped 选择器不会作用在子组件内部 DOM -->
  <div class="child-root">
    <p>子组件的 p 标签</p>
  </div>
</template>

<script setup lang="ts">
// scoped CSS 是组件级隔离；子组件内部 DOM 不受父组件 scoped 选择器命中。
</script>

<style scoped>
.child-root {
  padding: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  font-size: 13px;
}
p { margin: 0; color: #0c4a6e; }
</style>