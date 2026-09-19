<template>
  <ul class="list">
    <li v-for="(item, index) in items" :key="index">
      <slot :item="item" :index="index" :separator="separator" />
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ items: string[]; separator?: string }>()
</script>

<style scoped>
.list { list-style: none; padding: 0; margin: 0; }
.list li { padding: 6px 10px; background: #fff; border: 1px solid #eee; border-radius: 4px; margin-bottom: 4px; }
</style>
