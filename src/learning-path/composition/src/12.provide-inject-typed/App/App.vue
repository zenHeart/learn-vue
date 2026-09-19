<template>
  <div class="demo">
    <h2>Provide / Inject 强类型 + Symbol</h2>

    <section class="card">
      <h3>主题与用户信息（Symbol Key）</h3>
      <Root />
    </section>

    <section class="card">
      <h3>响应式 provide (ref)</h3>
      <RootReactive />
    </section>

    <section class="card">
      <h3>字符串 key 对比（无类型推断）</h3>
      <RootString />
    </section>
  </div>
</template>

<script setup lang="ts">
import Root from './Root.vue'
import RootReactive from './RootReactive.vue'
import RootString from './RootString.vue'
</script>

<style scoped>
.demo { max-width: 760px; margin: 16px auto; padding: 16px; }
.card { padding: 14px; margin-bottom: 12px; background: #fafafa; border-radius: 6px; border: 1px solid #e5e5e5; }
.card h3 { margin: 0 0 8px; font-size: 14px; color: #333; }
</style>
