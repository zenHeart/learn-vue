<template>
  <div class="demo">
    <h2>Provide 注入 store</h2>

    <section class="card">
      <h3>在 App 内 provide</h3>
      <ProviderA />
    </section>

    <section class="card">
      <h3>使用 app.provide (模拟根应用注入)</h3>
      <ProviderB />
    </section>

    <section class="card">
      <h3>提供方法给后代（action pattern）</h3>
      <ProviderC />
    </section>
  </div>
</template>

<script setup lang="ts">
import ProviderA from './ProviderA.vue'
import ProviderB from './ProviderB.vue'
import ProviderC from './ProviderC.vue'
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
</style>
