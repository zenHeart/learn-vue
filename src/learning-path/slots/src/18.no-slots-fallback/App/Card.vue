<template>
  <div class="card">
    <header>卡片标题 (默认)</header>
    <slot>
      <p class="fallback">默认内容：父组件未传插槽时显示</p>
    </slot>
    <footer>卡片底部</footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.card { padding: 10px; background: #fff; border: 1px solid #ccc; border-radius: 4px; }
header { font-weight: 700; padding-bottom: 6px; border-bottom: 1px solid #eee; }
footer { font-size: 12px; color: #888; padding-top: 6px; border-top: 1px solid #eee; margin-top: 8px; }
.fallback { color: #999; font-style: italic; }
</style>
