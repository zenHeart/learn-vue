<template>
  <div class="greeting">
    <span class="ico">★</span>
    <span class="text">Hello, <b>{{ name }}</b>!</span>
    <span class="lvl">L{{ level }}</span>
  </div>
</template>

<script setup lang="ts">
// 注意：defineCustomElement 的 prop 类型会自动推导
defineProps<{
  name: string
  level?: number
}>()
</script>

<style scoped>
.greeting {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #42b883, #35495e);
  color: #fff;
  border-radius: 999px;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.ico { font-size: 16px; }
.text b { font-weight: 600; }
.lvl {
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 8px;
  border-radius: 8px;
  font-size: 12px;
}
</style>