<template>
  <div class="fancy">
    <span class="prefix">🔍</span>
    <!-- 透传所有 attrs 到真正的 input -->
    <input v-bind="$attrs" />
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
</script>

<style scoped>
.fancy { display: inline-flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; background: #fff; }
.prefix { margin-right: 4px; }
input { border: none; outline: none; }
</style>
