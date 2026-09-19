<template>
  <div class="child">
    <div>msg: <strong>{{ msg }}</strong></div>
    <div>count: <strong>{{ count }}</strong></div>
    <div>tags: <strong>{{ tags.join(', ') }}</strong></div>
    <div>show (可选带默认值): <strong>{{ show }}</strong></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  msg: string
  count: number
  tags: string[]
  show?: boolean
}

const {
  msg,
  count,
  tags,
  show = false, // 解构默认值的写法：保留响应性
} = defineProps<Props>()
</script>

<style scoped>
.child { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; font-size: 13px; }
.child > div { padding: 2px 0; }
</style>
