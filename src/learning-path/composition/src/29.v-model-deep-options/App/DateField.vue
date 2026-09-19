<template>
  <div class="df">
    <input type="date" :value="formattedDate" @input="onInput" />
    <p>子组件内部 ref: <code>{{ String(dateValue) }}</code></p>
    <p class="hint">父组件传 ISO 字符串，子组件 get 转 Date 对象</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// get：父组件传 ISO 字符串 → 子组件拿到 Date 对象
const dateValue = defineModel<Date | string>({
  default: () => new Date(),
  get(v) {
    if (typeof v === 'string') return new Date(v)
    return v
  },
})

const formattedDate = ref(toDateInput(dateValue.value))
function toDateInput(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toISOString().slice(0, 10)
}

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  dateValue.value = new Date(v)
}
</script>

<style scoped>
.df {
  padding: 8px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
}
input {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
code {
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: #fef9c3;
  padding: 1px 4px;
  border-radius: 3px;
}
.hint {
  font-size: 12px;
  color: #92400e;
  margin-top: 4px;
}
</style>
