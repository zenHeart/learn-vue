<template>
  <section class="heavy">
    <h3>重型组件</h3>
    <p>通过 <code>defineAsyncComponent</code> 加载。Suspense 兜底显示加载态。</p>
    <pre>{{ config }}</pre>
  </section>
</template>

<script setup>
const config = {
  rows: Array.from({ length: 50 }, (_, i) => ({ id: i, label: `row-${i}` })),
  filter: { status: 'active', tags: ['urgent', 'beta', 'audit'] },
}
</script>