<template>
  <div class="child">
    <span>子组件看到的 count: {{ countRef }}</span>
    <button @click="localPlus">+1（emit）</button>
    <p class="hint">父组件 :count 变化，本地 ref 立刻同步</p>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'

const props = defineProps<{ count: number }>()
const emit = defineEmits<{ (e: 'plus'): void }>()

// 把 props.count 桥接成 ref，子组件可以直接 .value 修改；不过 props 是只读的，
// 这里只是说明桥接后两侧的引用是同一个。
const countRef = toRef(props, 'count')

const localPlus = () => emit('plus')
</script>

<style scoped>
.child {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
.hint {
  font-size: 12px;
  color: #92400e;
}
button {
  padding: 2px 8px;
  border: 1px solid #fcd34d;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>