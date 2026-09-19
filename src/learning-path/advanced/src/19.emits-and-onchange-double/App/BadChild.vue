<template>
  <div class="child">
    <p>❌ 错误写法子组件</p>
    <button @click="fire('hello')">触发 change</button>
  </div>
</template>

<script setup lang="ts">
// ❌ 同时声明 emits + 主动调用 props.onChange → 双触发
const props = defineProps<{ onChange?: (v: string) => void }>()
const emit = defineEmits<{ change: [v: string] }>()

function fire(v: string) {
  emit('change', v)         // 走 emits，调用 props.onChange 一次
  props.onChange?.(v)        // 又主动调一次 → 双触发
}
</script>

<style scoped>
.child { padding: 10px; background: #fff1f0; border-radius: 4px; border: 1px solid #ffa39e; }
button { margin-right: 6px; padding: 4px 12px; }
</style>
