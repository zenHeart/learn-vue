<template>
  <article class="card">
    <h4>{{ title }}</h4>
    <p>{{ body }}</p>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  body: string
}>()
</script>

<style scoped>
/* shadowRoot: false 时这里其实是 light DOM，
   所以这些类样式会"暴露"到全局，可以被外层影响 */
.card {
  border: 2px dashed #d946ef;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: system-ui, sans-serif;
}
.card h4 { margin: 0 0 4px; color: #d946ef; font-size: 14px; }
.card p { margin: 0; color: #475569; font-size: 13px; }
</style>