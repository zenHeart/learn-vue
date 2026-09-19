<template>
  <div class="demo">
    <p>count = {{ count }} (type: {{ typeof count }})</p>
    <p>mode = "{{ mode }}"</p>
    <button @click="emit('change', String(count))">emit change</button>
  </div>
</template>

<script setup lang="ts">
// withDefaults 编译后：props.count 默认 0，props.mode 默认 'auto'
withDefaults(
  defineProps<{ count?: number; mode?: string }>(),
  { count: 0, mode: 'auto' }
)

const emit = defineEmits<{ change: [v: string] }>()
</script>

<style scoped>
.demo { padding: 8px; margin-bottom: 8px; background: #fff; border-radius: 4px; border: 1px solid #e5e5e5; }
button { padding: 2px 8px; margin-left: 6px; }
</style>
