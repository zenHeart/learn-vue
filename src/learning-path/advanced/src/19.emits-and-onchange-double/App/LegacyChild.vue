<template>
  <div class="child">
    <p>🟦 Vue 2 兼容写法</p>
    <button @click="fire('legacy')">触发</button>
  </div>
</template>

<script setup lang="ts">
// Vue 2 兼容写法：父级传 :on-change 当 prop
// 注意：没有声明 emits，emit 会落到 fallback 或不触发
const props = defineProps<{ onChange?: (v: string) => void }>()

function fire(v: string) {
  // 直接调用 props.onChange，不走 emit
  props.onChange?.(v)
}
</script>

<style scoped>
.child { padding: 10px; background: #e6f4ff; border-radius: 4px; border: 1px solid #91d5ff; }
button { margin-right: 6px; padding: 4px 12px; }
</style>
