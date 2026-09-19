<template>
  <div class="wrapper">
    <div class="body">
      <slot />
    </div>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup>
// 纯展示组件：父组件传入的默认/具名插槽由 <slot /> 渲染。
</script>

<style scoped>
.wrapper {
  border: 1px dashed #94a3b8;
  border-radius: 6px;
  background: #fff;
  padding: 8px;
  margin-bottom: 8px;
}
.body {
  margin-bottom: 6px;
}
footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 6px;
  font-size: 13px;
}
</style>