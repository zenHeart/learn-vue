<template>
  <section class="card">
    <h3>仪表盘</h3>
    <p v-for="i in 4" :key="i" class="bar" :style="{ width: 50 + i * 10 + '%' }"></p>
    <p class="hint">本组件由 <code>() =&gt; import('./Dashboard.vue')</code> 拆分。</p>
  </section>
</template>