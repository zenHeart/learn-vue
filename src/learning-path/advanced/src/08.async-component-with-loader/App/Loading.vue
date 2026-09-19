<template>
  <div class="chart">
    <h4>异步加载完成</h4>
    <p>这是一个由 defineAsyncComponent 动态加载的图表组件</p>
    <div class="bars">
      <div v-for="n in 5" :key="n" :style="{ height: `${n * 12}px` }" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.chart { padding: 10px; background: #fafafa; border-radius: 4px; }
.bars { display: flex; gap: 6px; align-items: end; height: 80px; padding-top: 8px; }
.bars > div { width: 16px; background: linear-gradient(180deg, #91caff, #1677ff); border-radius: 2px 2px 0 0; }
</style>
