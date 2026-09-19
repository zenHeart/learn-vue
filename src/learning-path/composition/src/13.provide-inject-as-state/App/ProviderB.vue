<template>
  <div class="pb">
    <div>App.provide 提供的数据: <strong>{{ globalCount }}</strong></div>
    <button @click="globalCount += 5">+5</button>
    <DeepChild />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { AppCountKey } from './keys'
import DeepChild from './DeepChild.vue'

const globalCount = ref(0)
// 等价于 app.provide：在当前根实例上注册全局可用
provide(AppCountKey, globalCount)
</script>

<style scoped>
.pb { padding: 10px; background: #fff; border-radius: 4px; border: 1px dashed #aaa; }
button { padding: 4px 12px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
