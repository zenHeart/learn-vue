<template>
  <div class="buggy">
    <p>这是一个会抛错的子组件</p>
    <button @click="boom">点我抛错</button>
    <button @click="asyncBoom">异步抛错（不会被 onErrorCaptured）</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'rendered'): void }>()
emit('rendered')

function boom() {
  throw new Error('Buggy synchronous error')
}

function asyncBoom() {
  // 异步错误不会进入 onErrorCaptured
  setTimeout(() => { throw new Error('async error') }, 0)
}
</script>

<style scoped>
.buggy {
  padding: 10px 12px;
  background: #fee2e2;
  border-radius: 6px;
  font-size: 13px;
}
button {
  margin-right: 6px;
  padding: 4px 12px;
  border: 1px solid #fca5a5;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>