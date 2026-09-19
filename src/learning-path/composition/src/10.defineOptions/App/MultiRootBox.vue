<template>
  <!-- 多根节点模板，class 自动 fallthrough，但 data-* 默认不会 -->
  <header>header 节点 (自动接收 class)</header>
  <main>main 节点</main>
  <footer v-bind="extraAttrs" class="explicit">footer 节点 (显式展开)</footer>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({
  name: 'MultiRootBox',
  inheritAttrs: false,
})

const extraAttrs = useAttrs()
</script>

<style scoped>
header, main, footer { padding: 6px 10px; }
header { background: #fffbe6; }
main { background: #f6ffed; }
footer { background: #e6f4ff; }
.explicit { border: 1px dashed #1890ff; }
</style>
